'use strict';
const mongoose = require('mongoose');

const savedStorySchema = new mongoose.Schema({
  news: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

savedStorySchema.index({ news: 1, user: 1 }, { unique: true });
savedStorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SavedStory', savedStorySchema);
