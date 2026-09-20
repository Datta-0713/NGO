'use strict';
const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { writeAuditLog } = require('../utils/audit');
const notificationService = require('../services/notificationService');
const { escapeRegex } = require('../utils/security');
const { getCreditPerApproval } = require('../services/settingsService');

const startOfMonth = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const startOfPreviousMonth = (date = new Date()) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
const clampPagination = (page, limit, fallback = 20) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || fallback)),
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfPreviousMonth(now);
  const previousMonthEnd = currentMonthStart;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    publishedNewsCount,
    pendingCount,
    underReviewCount,
    totalContributors,
    totalUsers,
    creditAgg,
    recentSubmissions,
    currentMonthSubmissions,
    previousMonthSubmissions,
    current30,
    previous30,
    contributorsThisMonth,
    publishedLast30,
    publishedPrev30,
  ] = await Promise.all([
    News.countDocuments({ status: 'published', deletedAt: null }),
    News.countDocuments({ status: 'pending', deletedAt: null }),
    News.countDocuments({ status: 'under_review', deletedAt: null }),
    User.countDocuments({ storiesCount: { $gt: 0 }, isActive: true }),
    User.countDocuments({ isActive: true }),
    CreditTransaction.aggregate([{ $match: { type: 'credit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    News.find({ status: { $in: ['pending', 'under_review'] }, deletedAt: null })
      .sort({ createdAt: -1 }).limit(5).populate('submittedBy', 'name email profilePhoto'),
    News.countDocuments({ createdAt: { $gte: currentMonthStart }, createdByAdmin: false }),
    News.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: previousMonthEnd }, createdByAdmin: false }),
    News.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    News.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    User.countDocuments({ storiesCount: { $gt: 0 }, createdAt: { $gte: currentMonthStart } }),
    News.countDocuments({ status: 'published', publishedAt: { $gte: thirtyDaysAgo } }),
    News.countDocuments({ status: 'published', publishedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
  ]);

  const submissionsLast30Days = await News.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, deletedAt: null } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const percentChange = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  const totalCreditsAwarded = creditAgg[0]?.total || 0;
  const creditPerApproval = await getCreditPerApproval();
  sendSuccess(res, 200, {
    publishedNewsCount,
    pendingCount,
    underReviewCount,
    totalContributors,
    totalUsers,
    totalCreditsAwarded,
    creditPerApproval,
    recentSubmissions,
    submissionsLast30Days,
    currentMonthSubmissions,
    previousMonthSubmissions,
    metricsChange: {
      publishedNews: percentChange(publishedLast30, publishedPrev30),
      submissions: percentChange(current30, previous30),
      contributors: contributorsThisMonth,
      monthOverMonthSubmissions: percentChange(currentMonthSubmissions, previousMonthSubmissions),
    },
    needsAttentionData: {
      pendingSubmissions: pendingCount + underReviewCount,
      newContributorsThisMonth: contributorsThisMonth,
      creditsToBeAwarded: pendingCount * creditPerApproval,
    },
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit } = clampPagination(req.query.page, req.query.limit, 20);
  const query = {};
  if (req.query.search?.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim().slice(0, 100)), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }
  if (req.query.role && ['user', 'admin'].includes(req.query.role)) query.role = req.query.role;
  if (req.query.status === 'active') query.isActive = true;
  if (req.query.status === 'inactive') query.isActive = false;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query),
  ]);
  sendSuccess(res, 200, { users, total, page, limit, totalPages: Math.ceil(total / limit) });
});

const getUserById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid user id', 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, 200, { user });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) throw new AppError('You cannot deactivate your own admin account.', 400);
  if (typeof req.body.isActive !== 'boolean') throw new AppError('isActive must be boolean', 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  const before = { isActive: user.isActive };
  user.isActive = req.body.isActive;
  await user.save({ validateBeforeSave: false });
  const Session = require('../models/Session');
  if (!user.isActive) await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  await writeAuditLog({ admin: req.user._id, action: user.isActive ? 'user_activated' : 'user_deactivated', entityType: 'User', entityId: user._id, before, after: { isActive: user.isActive }, req });
  sendSuccess(res, 200, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

const broadcastNotification = asyncHandler(async (req, res) => {
  const title = String(req.body.title || '').trim();
  const message = String(req.body.message || '').trim();
  if (!title || title.length > 120) throw new AppError('Title must be between 1 and 120 characters', 400);
  if (!message || message.length > 1000) throw new AppError('Message must be between 1 and 1000 characters', 400);

  const users = await User.find({ isActive: true }).select('_id');
  const notifications = users.map((user) => ({
    user: user._id,
    type: 'system',
    title,
    message,
  }));

  if (notifications.length) {
    const inserted = await Notification.insertMany(notifications, { ordered: false });
    await notificationService.sendPushForNotifications(inserted);
  }

  await writeAuditLog({ admin: req.user._id, action: 'notification_broadcast', entityType: 'Notification', reason: title, after: { recipients: users.length, title, message }, req });
  sendSuccess(res, 200, { recipients: users.length }, `Notification sent to ${users.length} active users`);
});

module.exports = { getDashboardStats, getAllUsers, getUserById, updateUserStatus, broadcastNotification };
