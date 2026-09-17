'use strict';
const News = require('../models/News');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const creditService = require('../services/creditService');
const notificationService = require('../services/notificationService');
const { DEFAULT_CREDIT_AMOUNT } = require('../config/env');

const submitNews = asyncHandler(async (req, res) => {
  const { title, description, location, date, category } = req.body;
  const news = await News.create({
    title,
    description,
    location,
    date,
    category,
    media: req.uploadedMedia || [],
    status: 'pending',
    submittedBy: req.user._id
  });

  sendSuccess(res, 201, { news }, 'News submitted successfully for review');
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const submissions = await News.find({ submittedBy: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await News.countDocuments({ submittedBy: req.user._id });
  sendSuccess(res, 200, { submissions, total, page, totalPages: Math.ceil(total / limit) });
});

const getAdminSubmissionsQueue = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { status, search } = req.query;

  const query = { createdByAdmin: false };
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const submissions = await News.find(query)
    .populate('submittedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await News.countDocuments(query);
  sendSuccess(res, 200, { submissions, total, page, totalPages: Math.ceil(total / limit) });
});

const approveSubmission = asyncHandler(async (req, res) => {
  // Atomic update: only succeeds if current status is 'pending'.
  // This prevents race conditions where two admins approve the same submission simultaneously.
  const news = await News.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    { status: 'published', publishedAt: new Date(), reviewedBy: req.user._id },
    { new: true }
  );

  if (!news) {
    throw new AppError('Submission not found or has already been reviewed.', 404);
  }

  if (news.submittedBy) {
    await Promise.all([
      creditService.awardCredits(news.submittedBy, DEFAULT_CREDIT_AMOUNT, 'Story published', news._id),
      User.findByIdAndUpdate(news.submittedBy, { $inc: { storiesCount: 1 } }),
      notificationService.createNotification(news.submittedBy, {
        type: 'news_approved',
        title: '🎉 Your Story is Live!',
        message: `Your story "${news.title}" has been published to the community. You've earned ${DEFAULT_CREDIT_AMOUNT} credits!`,
        relatedEntity: { entityId: news._id, entityType: 'News' },
      }),
    ]);
  }

  sendSuccess(res, 200, { news }, 'Submission approved and published');
});

const rejectSubmission = asyncHandler(async (req, res) => {
  const { rejectionMessage } = req.body;

  // Atomic update — only fires if submission is still pending
  const news = await News.findOneAndUpdate(
    { _id: req.params.id, status: 'pending' },
    {
      status: 'rejected',
      rejectionMessage: rejectionMessage || 'Your story needs a few improvements before it can go live.',
      reviewedBy: req.user._id,
    },
    { new: true }
  );

  if (!news) {
    throw new AppError('Submission not found or has already been reviewed.', 404);
  }

  if (news.submittedBy) {
    const adminMsg = news.rejectionMessage && news.rejectionMessage !== 'Your story needs a few improvements before it can go live.'
      ? ` Reason: "${news.rejectionMessage}"`
      : '';
    await notificationService.createNotification(news.submittedBy, {
      type: 'news_rejected',
      title: '⚠️ Story Needs Changes',
      message: `Your story "${news.title}" was not approved.${adminMsg} Feel free to revise and resubmit!`,
      relatedEntity: { entityId: news._id, entityType: 'News' },
    });
  }

  sendSuccess(res, 200, { news }, 'Submission rejected');
});

const getSubmissionById = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id)
    .select('+adminNotes')
    .populate('submittedBy', 'name email profilePhoto');
    
  if (!news) throw new AppError('Submission not found', 404);
  sendSuccess(res, 200, { news });
});

module.exports = {
  submitNews, getMySubmissions, getAdminSubmissionsQueue, 
  approveSubmission, rejectSubmission, getSubmissionById
};
