'use strict';
const mongoose = require('mongoose');
const AdminAuditLog = require('../models/AdminAuditLog');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { escapeRegex } = require('../utils/security');

const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  const filter = {};
  if (req.query.action?.trim()) filter.action = new RegExp(`^${escapeRegex(req.query.action.trim().slice(0, 100))}$`, 'i');
  if (req.query.entityType?.trim()) filter.entityType = new RegExp(`^${escapeRegex(req.query.entityType.trim().slice(0, 50))}$`, 'i');
  if (req.query.entityId && mongoose.isValidObjectId(req.query.entityId)) filter.entityId = req.query.entityId;
  if (req.query.adminId && mongoose.isValidObjectId(req.query.adminId)) filter.admin = req.query.adminId;

  const [logs, total] = await Promise.all([
    AdminAuditLog.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('admin', 'name email profilePhoto'),
    AdminAuditLog.countDocuments(filter),
  ]);

  sendSuccess(res, 200, { logs, total, page, limit, totalPages: Math.ceil(total / limit) });
});

module.exports = { getAuditLogs };
