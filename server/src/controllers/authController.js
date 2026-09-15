'use strict';
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { generateTokens, verifyRefreshToken } = require('../middlewares/auth');
const creditService = require('../services/creditService');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create({ name, email, passwordHash: password });

  // Award welcome bonus and get the updated user with correct credit balance
  const updatedUser = await creditService.awardWelcomeBonus(user._id);

  const { accessToken, refreshToken } = generateTokens(user._id);
  sendSuccess(res, 201, { user: updatedUser.toJSON(), accessToken, refreshToken }, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  const userResponse = user.toJSON();
  sendSuccess(res, 200, { user: userResponse, accessToken, refreshToken }, 'Login successful');
});

const refreshToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new AppError('Refresh token required', 400);

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new AppError('Invalid or expired refresh token', 401);

  const tokens = generateTokens(user._id);
  sendSuccess(res, 200, tokens, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user });
});

module.exports = { register, login, refreshToken, logout, getMe };
