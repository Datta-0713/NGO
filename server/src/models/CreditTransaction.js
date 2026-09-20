'use strict';
const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  relatedNews: { type: mongoose.Schema.Types.ObjectId, ref: 'News', default: null },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dedupeKey: { type: String, unique: true, sparse: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

creditTransactionSchema.index({ user: 1, createdAt: -1 });
creditTransactionSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
