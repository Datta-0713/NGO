'use strict';
const mongoose = require('mongoose');

const newsLikeSchema = new mongoose.Schema({
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

newsLikeSchema.index({ news: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('NewsLike', newsLikeSchema);
