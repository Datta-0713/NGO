'use strict';
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

const createNotification = async (userId, { type, title, message, relatedEntity }) => {
  return await Notification.create({
    user: userId,
    type,
    title,
    message,
    relatedEntity
  });
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
