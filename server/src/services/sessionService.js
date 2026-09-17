'use strict';
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Session = require('../models/Session');
const AppError = require('../utils/AppError');
const { hashToken } = require('../utils/security');
const { JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = require('../config/env');

const parseDurationMs = (value) => {
  const match = String(value).match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2].toLowerCase()];
  return amount * multiplier;
};
const refreshTtlMs = parseDurationMs(JWT_REFRESH_EXPIRES_IN);

const createSession = async (userId, metadata = {}, session = null) => {
  const sessionId = crypto.randomUUID();
  const refreshToken = jwt.sign(
    { id: userId.toString(), sid: sessionId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN, jwtid: sessionId }
  );
  const payload = {
    user: userId,
    tokenHash: hashToken(refreshToken),
    sessionId,
    userAgent: String(metadata.userAgent || '').slice(0, 500),
    deviceId: String(metadata.deviceId || '').slice(0, 200),
    expiresAt: new Date(Date.now() + refreshTtlMs),
  };
  if (session) await Session.create([payload], { session });
  else await Session.create(payload);
  return { refreshToken, sessionId };
};

const validateRefreshSession = async (refreshToken) => {
  let decoded;
  try { decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET); }
  catch (_) { throw new AppError('Invalid or expired refresh token', 401); }
  if (!decoded?.sid || !decoded?.id) throw new AppError('Invalid or expired refresh token', 401);
  const record = await Session.findOne({
    sessionId: decoded.sid,
    tokenHash: hashToken(refreshToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).select('+tokenHash');
  if (!record) throw new AppError('Invalid or expired refresh token', 401);
  return { decoded, record };
};

const rotateSession = async (refreshToken, metadata = {}) => {
  const { record } = await validateRefreshSession(refreshToken);
  const revoked = await Session.findOneAndUpdate(
    { _id: record._id, revokedAt: null, tokenHash: hashToken(refreshToken) },
    { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
    { new: true }
  ).select('+tokenHash');
  if (!revoked) throw new AppError('Refresh token was already used', 401);
  const mergedMetadata = {
    userAgent: metadata.userAgent || record.userAgent,
    deviceId: metadata.deviceId || record.deviceId,
  };
  return { userId: record.user, ...(await createSession(record.user, mergedMetadata)) };
};

const revokeSession = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const { decoded } = await validateRefreshSession(refreshToken);
    await Session.updateOne({ sessionId: decoded.sid, revokedAt: null }, { $set: { revokedAt: new Date(), lastUsedAt: new Date() } });
  } catch (_) { /* idempotent logout */ }
};

const revokeAllUserSessions = async (userId, session = null) => {
  await Session.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    session ? { session } : undefined
  );
};

module.exports = { createSession, validateRefreshSession, rotateSession, revokeSession, revokeAllUserSessions };
