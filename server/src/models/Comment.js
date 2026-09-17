'use strict';
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

commentSchema.index({ news: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
