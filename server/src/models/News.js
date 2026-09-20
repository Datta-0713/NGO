'use strict';
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  publicId: { type: String, required: true },
  thumbnailUrl: { type: String },
}, { _id: false });

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 10, maxlength: 200 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 5000 },
  media: { type: [mediaSchema], default: [] },
  location: { type: String, required: true, trim: true, maxlength: 150 },
  date: { type: Date, required: true },
  category: { type: String, required: true, enum: ['Community', 'Education', 'Environment', 'Health', 'Events'] },
  status: { type: String, enum: ['pending', 'under_review', 'needs_changes', 'published', 'rejected', 'archived'], default: 'pending', index: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  createdByAdmin: { type: Boolean, default: false, index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  claimedAt: { type: Date, default: null },
  adminNotes: { type: String, select: false, maxlength: 5000, default: '' },
  rejectionMessage: { type: String, default: '', maxlength: 1000 },
  sourceUrl: { type: String, default: '', maxlength: 1000, trim: true },
  evidenceNotes: { type: String, default: '', maxlength: 2000, select: false },
  geo: {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
  views: { type: Number, default: 0, min: 0 },
  publishedAt: { type: Date },
  deletedAt: { type: Date, default: null, index: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  archivedFromStatus: { type: String, enum: ['pending', 'under_review', 'needs_changes', 'published', 'rejected'], default: 'published' },
  // Legacy embedded social data. Kept for one-time migration only and never returned by normal API responses.
  likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], select: false, default: undefined },
  comments: { type: [mongoose.Schema.Types.Mixed], select: false, default: undefined },
  reports: { type: [mongoose.Schema.Types.Mixed], select: false, default: undefined },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.likes;
      delete ret.comments;
      delete ret.reports;
      delete ret.adminNotes;
      delete ret.evidenceNotes;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

newsSchema.index({ status: 1, deletedAt: 1, publishedAt: -1 });
newsSchema.index({ submittedBy: 1, createdAt: -1 });
newsSchema.index({ title: 'text', description: 'text', location: 'text' });
newsSchema.index({ category: 1, status: 1, publishedAt: -1 });
newsSchema.index({ status: 1, createdAt: -1 });
newsSchema.index({ submittedBy: 1, status: 1 });
newsSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('News', newsSchema);
