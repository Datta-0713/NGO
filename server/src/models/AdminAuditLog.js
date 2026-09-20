'use strict';
const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null },
  reason: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } });

adminAuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
adminAuditLogSchema.index({ admin: 1, createdAt: -1 });
adminAuditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
