'use strict';
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { generateAccessToken } = require('../middlewares/auth');
const creditService = require('../services/creditService');
const sessionService = require('../services/sessionService');
const { withTransaction } = require('../utils/dbTransaction');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const sessionMetadata = (req) => ({
  userAgent: req.get('user-agent') || '',
  deviceId: req.get('x-device-id') || '',
});

const issueAuthResponse = async (res, user, sessionInfo, statusCode = 200, message = 'Login successful') => {
  const accessToken = generateAccessToken(user._id);
  const userResponse = user.toJSON();
  return sendSuccess(res, statusCode, {
    user: userResponse,
    accessToken,
    refreshToken: sessionInfo.refreshToken,
  }, message);
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const result = await withTransaction(async (session) => {
    const existing = await User.findOne({ email: normalizedEmail }).session(session);
    if (existing) throw new AppError('Email already in use', 409);

    const docs = await User.create([{ name: name.trim(), email: normalizedEmail, passwordHash: password }], { session });
    const user = docs[0];
    await creditService.awardWelcomeBonus(user._id, { session });
    const sessionInfo = await sessionService.createSession(user._id, sessionMetadata(req), session);
    const refreshedUser = await User.findById(user._id).session(session);
    return { user: refreshedUser, sessionInfo };
  });

  return issueAuthResponse(res, result.user, result.sessionInfo, 201, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('Account is deactivated', 401);

  const sessionInfo = await sessionService.createSession(user._id, sessionMetadata(req));
  return issueAuthResponse(res, user, sessionInfo);
});

const refreshToken = asyncHandler(async (req, res) => {
  const refreshTokenValue = req.body.refreshToken || req.body.token;
  if (!refreshTokenValue) throw new AppError('Refresh token required', 400);

  const rotated = await sessionService.rotateSession(refreshTokenValue, sessionMetadata(req));
  const user = await User.findById(rotated.userId);
  if (!user || !user.isActive) {
    await sessionService.revokeAllUserSessions(rotated.userId);
    throw new AppError('Invalid or expired refresh token', 401);
  }

  return issueAuthResponse(res, user, { refreshToken: rotated.refreshToken }, 200, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const refreshTokenValue = req.body.refreshToken || req.body.token || null;
  await sessionService.revokeSession(refreshTokenValue);
  sendSuccess(res, 200, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toJSON() });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+resetPasswordToken +resetPasswordExpires');
  const generic = 'If that email is registered, we have sent a reset link.';
  if (!user) return sendSuccess(res, 200, null, generic);

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Build a reset link that works everywhere:
  //  - deep link for the mobile app (asiannewsbureau://reset-password/...)
  //  - web fallback so the link also opens in a desktop/browser context
  const mobileResetLink = `asiannewsbureau://reset-password/${resetToken}`;
  const webOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const webResetLink = `${webOrigin}/reset-password/${resetToken}`;

  const text = `Forgot your password?

Open this link in the Asian News Bureau app to reset it:
${mobileResetLink}

Or open this link in your web browser:
${webResetLink}

This link expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.`;

  const html = `
  <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
    <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">Reset your password</h2>
    <p style="color: #6B7280; margin-bottom: 24px;">We received a request to reset the password for your Asian News Bureau account.</p>
    <p style="margin-bottom: 24px;">Click the button below to choose a new password:</p>
    <a href="${webResetLink}" style="display: inline-block; background-color: #2D6A4F; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Reset Password</a>
    <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">This link expires in 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
    <p style="color: #9CA3AF; font-size: 12px; margin-top: 8px;">Can't open the button? Copy and paste this link into your browser:<br><a href="${webResetLink}" style="color: #2D6A4F;">${webResetLink}</a></p>
  </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Asian News Bureau password',
      text,
      html,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Could not send the reset email. Please try again later.', 500);
  }

  return sendSuccess(res, 200, null, generic);
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires +passwordHash');
  if (!user) throw new AppError('Token is invalid or has expired', 400);

  await withTransaction(async (session) => {
    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ session });
    await sessionService.revokeAllUserSessions(user._id, session);
  });

  sendSuccess(res, 200, null, 'Password reset successful. Please log in again.');
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('Google ID token is required', 400);
  if (!process.env.GOOGLE_CLIENT_ID) throw new AppError('Google sign-in is not configured on this server', 503);

  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch (_) {
    throw new AppError('Invalid Google token', 401);
  }

  if (!payload?.email || payload.email_verified !== true) throw new AppError('Google account email is not verified', 401);
  const email = payload.email.toLowerCase().trim();
  let user = await User.findOne({ email });

  if (!user) {
    const result = await withTransaction(async (session) => {
      const docs = await User.create([{
        name: payload.name || email.split('@')[0],
        email,
        passwordHash: crypto.randomBytes(32).toString('hex'),
        profilePhoto: payload.picture || '',
      }], { session });
      const createdUser = docs[0];
      await creditService.awardWelcomeBonus(createdUser._id, { session });
      const refreshedUser = await User.findById(createdUser._id).session(session);
      return refreshedUser;
    });
    user = result;
  }
  if (!user.isActive) throw new AppError('Account is deactivated', 401);

  const sessionInfo = await sessionService.createSession(user._id, sessionMetadata(req));
  return issueAuthResponse(res, user, sessionInfo);
});

module.exports = { register, login, refreshToken, logout, getMe, forgotPassword, resetPassword, googleLogin };
