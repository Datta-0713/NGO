'use strict';
const cron = require('node-cron');
const PushDelivery = require('../models/PushDelivery');
const PushToken = require('../models/PushToken');

const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const MAX_RECEIPTS = 1000;

const fetchReceipts = async (ids) => {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (process.env.EXPO_ACCESS_TOKEN) headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  const response = await fetch(EXPO_RECEIPTS_URL, {
    method: 'POST', headers, body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error(`Expo receipt request failed with HTTP ${response.status}`);
  const payload = await response.json();
  return payload.data || {};
};

const processReceipts = async () => {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const deliveries = await PushDelivery.find({ status: 'pending', sentAt: { $lte: cutoff } })
    .sort({ sentAt: 1 }).limit(MAX_RECEIPTS).select('_id ticketId pushToken');
  if (!deliveries.length) return;

  const receiptMap = await fetchReceipts(deliveries.map((d) => d.ticketId));
  const checkedAt = new Date();
  const invalidTokenIds = [];
  const resolvedIds = [];

  for (const delivery of deliveries) {
    const receipt = receiptMap[delivery.ticketId];
    if (!receipt) continue;
    const errorCode = receipt.details?.error || '';
    await PushDelivery.updateOne(
      { _id: delivery._id, status: 'pending' },
      {
        $set: {
          status: receipt.status === 'ok' ? 'ok' : 'error',
          checkedAt,
          errorCode,
          message: String(receipt.message || '').slice(0, 1000),
        },
      }
    );
    resolvedIds.push(delivery._id);
    if (errorCode === 'DeviceNotRegistered') invalidTokenIds.push(delivery.pushToken);
  }

  if (invalidTokenIds.length) {
    await PushToken.updateMany({ _id: { $in: invalidTokenIds } }, { $set: { isActive: false } });
  }

  // Receipts missing after 24h are cleaned by the TTL index; this avoids retrying forever.
  return resolvedIds.length;
};

const schedulePushReceiptJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try { await processReceipts(); }
    catch (error) { console.warn('[Push] Receipt processing failed:', error.message); }
  });
};

module.exports = { schedulePushReceiptJob, processReceipts };
