'use strict';
const mongoose = require('mongoose');

const contributorHighlightSchema = new mongoose.Schema({
  period: { type: String, required: true, enum: ['weekly', 'monthly'] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  shownToUsers: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const ContributorHighlight = mongoose.model('ContributorHighlight', contributorHighlightSchema);
module.exports = ContributorHighlight;
