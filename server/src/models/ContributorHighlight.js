'use strict';
const mongoose = require('mongoose');

const contributorHighlightSchema = new mongoose.Schema({
  period: { type: String, required: true, enum: ['weekly', 'monthly'] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  count: { type: Number, required: true, min: 1 },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

contributorHighlightSchema.index({ period: 1, periodStart: 1 }, { unique: true });
contributorHighlightSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContributorHighlight', contributorHighlightSchema);
