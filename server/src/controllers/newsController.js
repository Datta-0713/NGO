'use strict';
const News = require('../models/News');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { category, search } = req.query;

  const query = { status: 'published' };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const news = await News.find(query)
    .populate('submittedBy', 'name profilePhoto')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await News.countDocuments(query);
  sendSuccess(res, 200, { news, total, page, totalPages: Math.ceil(total / limit) });
});

const getNewsById = asyncHandler(async (req, res) => {
  // Atomically increment views and return the updated document
  const news = await News.findOneAndUpdate(
    { _id: req.params.id, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('submittedBy', 'name profilePhoto credits');

  if (!news) {
    throw new AppError('News not found', 404);
  }

  sendSuccess(res, 200, { news });
});

const createAdminNews = asyncHandler(async (req, res) => {
  const { title, description, location, date, category } = req.body;
  const news = await News.create({
    title,
    description,
    location,
    date,
    category,
    media: req.uploadedMedia || [],
    status: 'published',
    createdByAdmin: true,
    publishedAt: new Date(),
    reviewedBy: req.user._id
  });

  sendSuccess(res, 201, { news }, 'News created successfully');
});

const likeNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news || news.status !== 'published') throw new AppError('News not found', 404);

  const userId = req.user._id;
  const hasLiked = news.likes.some(id => id.toString() === userId.toString());

  if (hasLiked) {
    news.likes.pull(userId);
    // Decrement author's likesReceived
    if (news.submittedBy) {
      await User.findByIdAndUpdate(news.submittedBy, { $inc: { likesReceived: -1 } });
    }
  } else {
    news.likes.push(userId);
    // Increment author's likesReceived
    if (news.submittedBy) {
      await User.findByIdAndUpdate(news.submittedBy, { $inc: { likesReceived: 1 } });
    }
  }

  await news.save();
  sendSuccess(res, 200, { likesCount: news.likes.length, liked: !hasLiked });
});

const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) throw new AppError('News not found', 404);
  await news.deleteOne();
  sendSuccess(res, 200, null, 'News deleted successfully');
});

/** GET /api/news/:id/comments - get all comments for a news item */
const getComments = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id)
    .select('comments status')
    .populate('comments.user', 'name profilePhoto');
  if (!news) throw new AppError('News not found', 404);
  sendSuccess(res, 200, { comments: news.comments, total: news.comments.length });
});

/** POST /api/news/:id/comments - add a comment (authenticated) */
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) throw new AppError('Comment text is required', 400);

  const news = await News.findById(req.params.id);
  if (!news || news.status !== 'published') throw new AppError('News not found', 404);

  news.comments.push({ user: req.user._id, text: text.trim() });
  await news.save();

  // Populate just the newly added comment
  await news.populate('comments.user', 'name profilePhoto');
  const newComment = news.comments[news.comments.length - 1];

  sendSuccess(res, 201, { comment: newComment, commentsCount: news.comments.length }, 'Comment added');
});

/** DELETE /api/news/:id/comments/:commentId - delete own comment */
const deleteComment = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) throw new AppError('News not found', 404);

  const comment = news.comments.id(req.params.commentId);
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorised to delete this comment', 403);
  }

  comment.deleteOne();
  await news.save();
  sendSuccess(res, 200, { commentsCount: news.comments.length }, 'Comment deleted');
});

module.exports = { getFeed, getNewsById, createAdminNews, likeNews, deleteNews, getComments, addComment, deleteComment };
