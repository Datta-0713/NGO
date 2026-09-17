'use strict';
const mongoose = require('mongoose');

const highlightSeenSchema = new mongoose.Schema({
  highlight: { type: mongoose.Schema.Types.ObjectId, ref: 'ContributorHighlight', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  seenAt: { type: Date, default: Date.now },
}, { timestamps: false });

highlightSeenSchema.index({ highlight: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('HighlightSeen', highlightSeenSchema);
