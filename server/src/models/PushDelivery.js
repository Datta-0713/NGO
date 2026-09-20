'use strict';
const mongoose = require('mongoose');

const pushDeliverySchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  pushToken: { type: mongoose.Schema.Types.ObjectId, ref: 'PushToken', required: true, index: true },
  notification: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', default: null, index: true },
  sentAt: { type: Date, default: Date.now },
  checkedAt: { type: Date, default: null },
  status: { type: String, enum: ['pending', 'ok', 'error', 'expired'], default: 'pending', index: true },
  errorCode: { type: String, default: '' },
  message: { type: String, default: '' },
}, { timestamps: true });

pushDeliverySchema.index({ sentAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });
pushDeliverySchema.index({ status: 1, sentAt: 1 });

module.exports = mongoose.model('PushDelivery', pushDeliverySchema);
