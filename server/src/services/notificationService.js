'use strict';
const Notification = require('../models/Notification');
const PushToken = require('../models/PushToken');
const PushDelivery = require('../models/PushDelivery');
const AppError = require('../utils/AppError');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const MAX_BATCH = 100;

const createNotification = async (userId, { type, title, message, relatedEntity, dedupeKey }, options = {}) => {
  const { session = null } = options;
  if (dedupeKey) {
    const query = Notification.findOneAndUpdate(
      { dedupeKey },
      { $setOnInsert: { user: userId, type, title, message, relatedEntity, dedupeKey } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    if (session) query.session(session);
    return query;
  }
  const docs = await Notification.create([{ user: userId, type, title, message, relatedEntity }], session ? { session } : undefined);
  return docs[0];
};

const getPushTokensForUser = async (userId) => {
  const records = await PushToken.find({ user: userId, isActive: true }).select('token');
  return records.map((record) => record.token).filter(Boolean);
};

const sendPushBatch = async (messages) => {
  if (!messages.length) return [];
  const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
  if (process.env.EXPO_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(messages),
      });
      if (response.ok) {
        const payload = await response.json();
        return payload.data || [];
      }
      if (response.status !== 429 && response.status < 500) {
        console.warn('[Push] Expo rejected request:', response.status, await response.text());
        return [];
      }
    } catch (error) {
      if (attempt === 3) {
        console.warn('[Push] Expo request failed:', error.message);
        return [];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  return [];
};

const recordPushTickets = async (tickets, records, notificationId = null) => {
  const rows = tickets.map((ticket, index) => {
    if (ticket?.status !== 'ok' || !ticket.id || !records[index]?._id) return null;
    return { ticketId: ticket.id, pushToken: records[index]._id, notification: notificationId || null };
  }).filter(Boolean);
  if (rows.length) await PushDelivery.bulkWrite(rows.map((row) => ({ updateOne: { filter: { ticketId: row.ticketId }, update: { $setOnInsert: row }, upsert: true } })), { ordered: false });
};

const sendPushNotifications = async (userIds, payload) => {
  const uniqueIds = [...new Set(userIds.map(String))];
  if (!uniqueIds.length) return { sent: 0, invalid: 0 };
  const records = await PushToken.find({ user: { $in: uniqueIds }, isActive: true }).select('_id token user');
  if (!records.length) return { sent: 0, invalid: 0 };

  const messages = records.map((record) => ({
    to: record.token,
    sound: 'default',
    title: payload.title,
    body: payload.message,
    data: {
      notificationId: payload.notificationId || null,
      type: payload.type || 'system',
      relatedEntity: payload.relatedEntity || null,
    },
    priority: 'high',
    channelId: 'default',
  }));

  let sent = 0;
  let invalid = 0;
  const invalidTokenIds = [];

  for (let start = 0; start < messages.length; start += MAX_BATCH) {
    const messageBatch = messages.slice(start, start + MAX_BATCH);
    const recordBatch = records.slice(start, start + MAX_BATCH);
    const tickets = await sendPushBatch(messageBatch);
    await recordPushTickets(tickets, recordBatch, payload.notificationId || null);
    sent += tickets.filter((ticket) => ticket?.status === 'ok').length;
    tickets.forEach((ticket, index) => {
      if (ticket?.status === 'error' && (ticket.details?.error === 'DeviceNotRegistered' || ticket.message === 'The recipient device is not registered')) {
        invalidTokenIds.push(recordBatch[index]._id);
        invalid += 1;
      }
    });
  }

  if (invalidTokenIds.length) {
    await PushToken.updateMany({ _id: { $in: invalidTokenIds } }, { $set: { isActive: false } });
  }

  return { sent, invalid };
};

const sendPushForNotification = async (notification) => {
  const result = await sendPushNotifications([notification.user], {
    title: notification.title,
    message: notification.message,
    notificationId: notification._id,
    type: notification.type,
    relatedEntity: notification.relatedEntity,
  });
  return result;
};

const sendPushForNotifications = async (notifications = []) => {
  const valid = notifications.filter((notification) => notification?.user && notification?.title && notification?.message);
  if (!valid.length) return { sent: 0, invalid: 0 };
  const userIds = [...new Set(valid.map((notification) => String(notification.user)))];
  const records = await PushToken.find({ user: { $in: userIds }, isActive: true }).select('_id token user');
  if (!records.length) return { sent: 0, invalid: 0 };
  const byUser = new Map();
  valid.forEach((notification) => byUser.set(String(notification.user), notification));
  const messages = [];
  const messageRecords = [];
  const messageNotifications = [];
  for (const record of records) {
    const notification = byUser.get(String(record.user));
    if (!notification) continue;
    messages.push({
      to: record.token,
      sound: 'default',
      title: notification.title,
      body: notification.message,
      data: {
        notificationId: String(notification._id),
        type: notification.type || 'system',
        relatedEntity: notification.relatedEntity || null,
      },
      priority: 'high',
      channelId: 'default',
    });
    messageRecords.push(record);
    messageNotifications.push(notification);
  }
  let sent = 0;
  let invalid = 0;
  const invalidTokenIds = [];
  for (let start = 0; start < messages.length; start += MAX_BATCH) {
    const batch = messages.slice(start, start + MAX_BATCH);
    const batchRecords = messageRecords.slice(start, start + MAX_BATCH);
    const tickets = await sendPushBatch(batch);
    const notificationIds = batchRecords.map((_record, index) => messageNotifications[start + index]?._id || null);
    const successfulRows = tickets.map((ticket, index) => {
      if (ticket?.status !== 'ok' || !ticket.id || !batchRecords[index]?._id) return null;
      return { ticketId: ticket.id, pushToken: batchRecords[index]._id, notification: notificationIds[index] || null };
    }).filter(Boolean);
    if (successfulRows.length) await PushDelivery.bulkWrite(successfulRows.map((row) => ({ updateOne: { filter: { ticketId: row.ticketId }, update: { $setOnInsert: row }, upsert: true } })), { ordered: false });
    sent += tickets.filter((ticket) => ticket?.status === 'ok').length;
    tickets.forEach((ticket, index) => {
      if (ticket?.status === 'error' && (ticket.details?.error === 'DeviceNotRegistered' || ticket.message === 'The recipient device is not registered')) {
        invalidTokenIds.push(batchRecords[index]._id);
        invalid += 1;
      }
    });
  }
  if (invalidTokenIds.length) {
    await PushToken.updateMany({ _id: { $in: invalidTokenIds } }, { $set: { isActive: false } });
  }
  return { sent, invalid };
};

const createNotificationAndPush = async (userId, payload, options = {}) => {
  const notification = await createNotification(userId, payload, options);
  try {
    await sendPushForNotification(notification);
  } catch (error) {
    console.warn('[Push] Non-fatal notification delivery failure:', error.message);
  }
  return notification;
};

const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const filter = { user: userId };
  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Notification.countDocuments(filter),
  ]);
  return { notifications, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found or unauthorized', 404);
  return notification;
};

const markAllAsRead = async (userId) => Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
const getUnreadCount = async (userId) => Notification.countDocuments({ user: userId, read: false });

module.exports = {
  createNotification,
  createNotificationAndPush,
  sendPushNotifications,
  sendPushForNotification,
  sendPushForNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
