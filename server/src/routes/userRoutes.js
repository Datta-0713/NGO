'use strict';
const express = require('express');
const { getProfile, updateProfile, getUserStats } = require('../controllers/userController');
const { updateProfileValidation } = require('../validators/userValidators');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

const router = express.Router();

router.get('/me', protect, getProfile);
router.patch('/me', protect, uploadSingle, updateProfileValidation, validate, updateProfile);
router.get('/me/stats', protect, getUserStats);
router.patch('/me/push-token', protect, async (req, res) => {
  const { pushToken } = req.body;
  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user._id, { pushToken: pushToken || '' });
  res.json({ success: true, message: 'Push token registered' });
});

module.exports = router;
