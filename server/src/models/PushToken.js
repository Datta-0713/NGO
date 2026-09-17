'use strict';
const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, required: true },
  platform: { type: String, enum: ['ios', 'android', 'web', 'unknown'], default: 'unknown' },
  deviceId: { type: String, default: '' },
  appVersion: { type: String, default: '' },
  lastSeenAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

pushTokenSchema.index({ token: 1 }, { unique: true });
pushTokenSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('PushToken', pushTokenSchema);
