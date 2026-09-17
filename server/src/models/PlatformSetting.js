'use strict';
const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  ngoName: { type: String, required: true, trim: true, minlength: 1, maxlength: 120, default: 'Asian News Bureau' },
  tagline: { type: String, required: true, trim: true, maxlength: 240, default: 'Building stronger communities together' },
  creditPerApproval: { type: Number, required: true, min: 1, max: 10000, default: 10 },
  welcomeBonus: { type: Number, required: true, min: 0, max: 10000, default: 5 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
