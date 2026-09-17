'use strict';
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const PlatformSetting = require('../models/PlatformSetting');
const settingsService = require('../services/settingsService');
const { writeAuditLog } = require('../utils/audit');

const getSettings = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, { settings: await settingsService.getSettings() });
});

const updateSettings = asyncHandler(async (req, res) => {
  const current = await settingsService.getSettings();
  const next = {
    ngoName: req.body.ngoName !== undefined ? String(req.body.ngoName).trim() : current.ngoName,
    tagline: req.body.tagline !== undefined ? String(req.body.tagline).trim() : current.tagline,
    creditPerApproval: req.body.creditPerApproval !== undefined ? Number(req.body.creditPerApproval) : current.creditPerApproval,
    welcomeBonus: req.body.welcomeBonus !== undefined ? Number(req.body.welcomeBonus) : current.welcomeBonus,
  };
  if (!next.ngoName || next.ngoName.length > 120) throw new AppError('NGO name must be between 1 and 120 characters', 400);
  if (next.tagline.length > 240) throw new AppError('Tagline must be 240 characters or fewer', 400);
  if (!Number.isInteger(next.creditPerApproval) || next.creditPerApproval < 1 || next.creditPerApproval > 10000) throw new AppError('Credits per approved story must be a whole number from 1 to 10000', 400);
  if (!Number.isInteger(next.welcomeBonus) || next.welcomeBonus < 0 || next.welcomeBonus > 10000) throw new AppError('Welcome bonus must be a whole number from 0 to 10000', 400);

  const settings = await PlatformSetting.findByIdAndUpdate(
    'global',
    { ...next, updatedBy: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  await writeAuditLog({
    admin: req.user._id,
    action: 'platform_settings_updated',
    entityType: 'PlatformSetting',
    entityId: null,
    before: current,
    after: settings.toJSON(),
    req,
  });
  sendSuccess(res, 200, { settings }, 'Platform settings updated');
});

module.exports = { getSettings, updateSettings };
