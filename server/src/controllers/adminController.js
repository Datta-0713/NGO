'use strict';
const News = require('../models/News');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { DEFAULT_CREDIT_AMOUNT } = require('../config/env');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [publishedNewsCount, pendingCount, totalContributors, creditAgg, recentSubmissions] = await Promise.all([
    News.countDocuments({ status: 'published' }),
    News.countDocuments({ status: 'pending' }),
    User.countDocuments({ storiesCount: { $gt: 0 } }),
    CreditTransaction.aggregate([{ $match: { type: 'credit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    News.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).populate('submittedBy', 'name email profilePhoto')
  ]);

  const totalCreditsAwarded = creditAgg.length ? creditAgg[0].total : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const submissionsLast30Days = await News.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const needsAttentionData = {
    pendingSubmissions: pendingCount,
    newContributorsThisMonth: await User.countDocuments({ storiesCount: { $gt: 0 }, createdAt: { $gte: thirtyDaysAgo } }),
    creditsToBeAwarded: pendingCount * DEFAULT_CREDIT_AMOUNT,
  };

  sendSuccess(res, 200, {
    publishedNewsCount,
    pendingCount,
    totalContributors,
    totalCreditsAwarded,
    recentSubmissions,
    submissionsLast30Days,
    needsAttentionData
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { search } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query),
  ]);

  sendSuccess(res, 200, { users, total, page, totalPages: Math.ceil(total / limit) });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, { user });
});

const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const users = await User.find({ isActive: true }).select('_id');
  
  const notifications = users.map(u => ({
    user: u._id,
    type: 'system',
    title,
    message
  }));

  await Notification.insertMany(notifications);
  sendSuccess(res, 200, null, `Broadcasted to ${users.length} users`);
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  broadcastNotification
};
