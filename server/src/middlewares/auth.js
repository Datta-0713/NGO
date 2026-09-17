'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN } = require('../config/env');

const generateAccessToken = (userId) => jwt.sign(
  { id: userId.toString() },
  JWT_ACCESS_SECRET,
  { expiresIn: JWT_ACCESS_EXPIRES_IN }
);

const generateTokens = (userId, refreshToken) => ({
  accessToken: generateAccessToken(userId),
  refreshToken,
});

const verifyAccessToken = (token) => jwt.verify(token, JWT_ACCESS_SECRET);

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

const loadUserFromRequest = async (req, token) => {
  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('The user belonging to this token no longer exists.', 401);
  if (!user.isActive) throw new AppError('User account is deactivated.', 401);
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new AppError('Your password was changed. Please log in again.', 401);
  }
  req.user = user;
  return user;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new AppError('Not authorized to access this route. Token missing.', 401);
  await loadUserFromRequest(req, token);
  next();
});

const optionalProtect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    await loadUserFromRequest(req, token);
  } catch (error) {
    if (error.statusCode === 401) return next();
    throw error;
  }
  next();
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError('Not authorized to access this route. Admin only.', 403);
  }
  next();
};

module.exports = { protect, optionalProtect, requireAdmin, generateAccessToken, generateTokens };
