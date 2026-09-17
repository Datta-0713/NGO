'use strict';
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, enum: ['news_approved', 'news_rejected', 'news_needs_changes', 'credit_received', 'news_liked', 'system', 'top_contributor'] },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  relatedEntity: {
    entityId: mongoose.Schema.Types.ObjectId,
    entityType: { type: String, enum: ['News', 'Submission', 'CreditTransaction', 'ContributorHighlight'] }
  },
  read: { type: Boolean, default: false, index: true },
  dedupeKey: { type: String, unique: true, sparse: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
