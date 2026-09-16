'use strict';
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Send an Expo push notification to a user.
 * Uses Expo's free push service — no paid plan needed.
 * Silently fails if the user has no push token (non-blocking).
 */
const sendExpoPush = async (pushToken, title, body) => {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken')) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: {},
      }),
    });
  } catch (err) {
    // Push delivery is best-effort — never crash the main flow
    console.warn('Push notification failed (non-fatal):', err.message);
  }
};

const createNotification = async (userId, { type, title, message, relatedEntity }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    relatedEntity
  });

  // Fire-and-forget push notification
  try {
    const user = await User.findById(userId).select('pushToken');
    if (user?.pushToken) {
      await sendExpoPush(user.pushToken, title, message);
    }
  } catch (err) {
    console.warn('Push lookup failed (non-fatal):', err.message);
  }

  return notification;
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Notification.countDocuments({ user: userId });
  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
  if (!notification) {
    throw new AppError('Notification not found or unauthorized', 404);
  }
  return notification;
};

const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ user: userId, read: false }, { read: true });
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, read: false });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
