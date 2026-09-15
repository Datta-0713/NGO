'use strict';
const express = require('express');
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidators');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
