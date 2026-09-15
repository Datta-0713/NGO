'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = require('../config/env');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route. Token missing.', 401);
  }

  const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }
  if (!user.isActive) {
    throw new AppError('User account is deactivated.', 401);
  }

  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this route. Admin only.', 403);
  }
  next();
};

module.exports = { protect, requireAdmin, generateTokens, verifyRefreshToken };
