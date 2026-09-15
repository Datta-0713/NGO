'use strict';
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const notificationService = require('../services/notificationService');
const contributorService = require('../services/contributorService');

const getMyNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const result = await notificationService.getUserNotifications(req.user._id, page, limit);
  sendSuccess(res, 200, result);
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  sendSuccess(res, 200, { notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendSuccess(res, 200, null, 'All notifications marked as read');
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  sendSuccess(res, 200, { count });
});

const getContributorHighlight = asyncHandler(async (req, res) => {
  const highlight = await contributorService.getUnshownHighlight();
  if (highlight) {
    await contributorService.markHighlightShown(highlight._id);
  }
  sendSuccess(res, 200, { highlight });
});

module.exports = {
  getMyNotifications, markRead, markAllRead, getUnreadCount, getContributorHighlight
};
