'use strict';
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const notificationService = require('../services/notificationService');
const contributorService = require('../services/contributorService');

const getMyNotifications = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, await notificationService.getUserNotifications(req.user._id, req.query.page, req.query.limit));
});

const markRead = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { notification: await notificationService.markAsRead(req.params.id, req.user._id) });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendSuccess(res, 200, null, 'All notifications marked as read');
});

const getUnreadCount = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { count: await notificationService.getUnreadCount(req.user._id) });
});

const getContributorHighlight = asyncHandler(async (req, res) => {
  const highlight = await contributorService.getUnseenHighlightForUser(req.user._id);
  sendSuccess(res, 200, { highlight });
});

module.exports = { getMyNotifications, markRead, markAllRead, getUnreadCount, getContributorHighlight };
