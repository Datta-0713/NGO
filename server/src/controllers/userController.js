'use strict';
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location } = req.body;
  
  if (name !== undefined && name.trim()) req.user.name = name.trim();
  if (bio !== undefined) req.user.bio = bio.trim();
  if (location !== undefined) req.user.location = location.trim();
  
  if (req.uploadedPhotoUrl) {
    req.user.profilePhoto = req.uploadedPhotoUrl;
  }
  
  await req.user.save();
  sendSuccess(res, 200, { user: req.user }, 'Profile updated successfully');
});

const getUserStats = asyncHandler(async (req, res) => {
  const { storiesCount, likesReceived, credits } = req.user;
  sendSuccess(res, 200, { storiesCount, likesReceived, credits });
});

module.exports = { getProfile, updateProfile, getUserStats };
