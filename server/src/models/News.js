'use strict';
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video'] },
    publicId: String
  }],
  location: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true, enum: ['Community', 'Education', 'Environment', 'Health', 'Events'] },
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdByAdmin: { type: Boolean, default: false },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String, select: false },
  rejectionMessage: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 1000, trim: true },
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  publishedAt: { type: Date },
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, default: 'Inappropriate content' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

newsSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

newsSchema.index({ status: 1, category: 1, publishedAt: -1 });
newsSchema.index({ title: 'text', description: 'text' });

const News = mongoose.model('News', newsSchema);
module.exports = News;
