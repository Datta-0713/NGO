'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  profilePhoto: { type: String, default: '' },
  profilePhotoPublicId: { type: String, default: '', select: false },
  bio: { type: String, default: '', maxlength: 300 },
  location: { type: String, default: '', maxlength: 150 },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  credits: { type: Number, default: 0, min: 0 },
  storiesCount: { type: Number, default: 0, min: 0 },
  likesReceived: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true, index: true },
  passwordChangedAt: { type: Date },
  // Legacy field kept only for migration compatibility. New push registration uses PushToken.
  pushToken: { type: String, default: '', select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.passwordHash;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.pushToken;
      return ret;
    }
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
};

userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
