'use strict';
const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  revisionNumber: { type: Number, required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  media: [{ url: String, type: String, publicId: String }],
  changeNote: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } });

revisionSchema.index({ submission: 1, revisionNumber: -1 }, { unique: true });
revisionSchema.index({ submission: 1, revisionNumber: 1 });

module.exports = mongoose.model('SubmissionRevision', revisionSchema);
