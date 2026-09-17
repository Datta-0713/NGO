'use strict';
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const PushToken = require('../models/PushToken');
const User = require('../models/User');
const { deleteCloudinaryAssets } = require('../middlewares/upload');
const AppError = require('../utils/AppError');

const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location } = req.body;
  if (name !== undefined && (!String(name).trim() || String(name).trim().length > 80)) {
    throw new AppError('Name must be between 1 and 80 characters', 400);
  }
  if (bio !== undefined && String(bio).length > 500) throw new AppError('Bio must be 500 characters or fewer', 400);
  if (location !== undefined && String(location).length > 160) throw new AppError('Location must be 160 characters or fewer', 400);

  const oldPhotoId = req.user.profilePhotoPublicId;
  try {
    if (name !== undefined) req.user.name = String(name).trim();
    if (bio !== undefined) req.user.bio = String(bio).trim();
    if (location !== undefined) req.user.location = String(location).trim();
    if (req.uploadedPhoto) {
      req.user.profilePhoto = req.uploadedPhoto.url;
      req.user.profilePhotoPublicId = req.uploadedPhoto.publicId;
    }
    await req.user.save();
  } catch (error) {
    if (req.uploadedPhoto) await deleteCloudinaryAssets([req.uploadedPhoto]);
    throw error;
  }

  if (req.uploadedPhoto && oldPhotoId && oldPhotoId !== req.uploadedPhoto.publicId) {
    await deleteCloudinaryAssets([{ publicId: oldPhotoId, resourceType: 'image' }]);
  }
  sendSuccess(res, 200, { user: req.user.toJSON() }, 'Profile updated successfully');
});

const registerPushToken = asyncHandler(async (req, res) => {
  const { pushToken, platform = 'unknown', deviceId = '', appVersion = '' } = req.body;
  const token = String(pushToken || '').trim();
  if (!token || token.length > 512 || !/^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/.test(token)) {
    throw new AppError('A valid Expo push token is required', 400);
  }
  if (!['ios', 'android', 'web', 'unknown'].includes(platform)) throw new AppError('Invalid push platform', 400);
  const record = await PushToken.findOneAndUpdate(
    { token },
    { $set: { user: req.user._id, platform, deviceId: String(deviceId).slice(0, 200), appVersion: String(appVersion).slice(0, 100), lastSeenAt: new Date(), isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await User.updateOne({ _id: req.user._id }, { $set: { pushToken: token } });
  sendSuccess(res, 200, { registered: true, id: record._id }, 'Push token registered');
});

const unregisterPushToken = asyncHandler(async (req, res) => {
  const token = String(req.body.pushToken || '').trim();
  const deviceId = String(req.body.deviceId || '').trim();
  if (token) await PushToken.updateMany({ user: req.user._id, token }, { $set: { isActive: false } });
  else if (deviceId) await PushToken.updateMany({ user: req.user._id, deviceId }, { $set: { isActive: false } });
  if (token) await User.updateOne({ _id: req.user._id, pushToken: token }, { $unset: { pushToken: 1 } });
  sendSuccess(res, 200, null, 'Push token unregistered');
});

const getUserStats = asyncHandler(async (req, res) => {
  const { storiesCount, likesReceived, credits } = req.user;
  sendSuccess(res, 200, { storiesCount, likesReceived, credits });
});

module.exports = { getProfile, updateProfile, registerPushToken, unregisterPushToken, getUserStats };
