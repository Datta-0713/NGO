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
router.get('/me/stats', protect, getUserStats); // not explicitly in exact list, but logical

module.exports = router;
