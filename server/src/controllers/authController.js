'use strict';
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { generateTokens, verifyRefreshToken } = require('../middlewares/auth');
const creditService = require('../services/creditService');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

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

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Return success even if user not found to prevent email enumeration
    return sendSuccess(res, 200, null, 'If that email is registered, we have sent a reset link.');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Mobile apps will intercept a deep link like nexyfoundation://reset-password?token=...
  // but since we are doing a generic approach, we'll construct a mock reset URL or deep link
  const resetUrl = `asiannewsbureau://reset-password/${resetToken}`;

  const message = `Forgot your password? Click here to reset it:\n${resetUrl}\nIf you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      text: message
    });

    sendSuccess(res, 200, null, 'If that email is registered, we have sent a reset link.');
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('[ForgotPassword] Email send failed:', err.message);
    throw new AppError('Could not send the reset email. Please check your email address and try again.', 500);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.passwordHash = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendSuccess(res, 200, null, 'Password reset successful');
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('Google ID token is required', 400);

  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_FOR_NOW');

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_FOR_NOW',
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findByEmail(email);
    
    if (!user) {
      user = await User.create({
        name,
        email,
        passwordHash: crypto.randomBytes(16).toString('hex'),
        profilePhoto: picture,
        isActive: true
      });
      // Award welcome bonus for new google users
      user = await creditService.awardWelcomeBonus(user._id);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    sendSuccess(res, 200, { user: user.toJSON(), accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    console.error('Google auth error:', err);
    throw new AppError('Invalid Google token', 401);
  }
});

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, googleLogin };
