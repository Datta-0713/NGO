'use strict';
const express = require('express');
const { getProfile, updateProfile, getUserStats, registerPushToken, unregisterPushToken } = require('../controllers/userController');
const { updateProfileValidation, pushTokenValidation } = require('../validators/userValidators');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const { mutationLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/me', protect, getProfile);
router.patch('/me', protect, mutationLimiter, uploadSingle, updateProfileValidation, validate, updateProfile);
router.get('/me/stats', protect, getUserStats);
router.patch('/me/push-token', protect, mutationLimiter, pushTokenValidation, validate, registerPushToken);
router.delete('/me/push-token', protect, mutationLimiter, unregisterPushToken);

module.exports = router;
