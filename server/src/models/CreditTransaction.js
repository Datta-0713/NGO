'use strict';
const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reason: { type: String, required: true },
  relatedNews: { type: mongoose.Schema.Types.ObjectId, ref: 'News' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
module.exports = CreditTransaction;
