'use strict';
const PlatformSetting = require('../models/PlatformSetting');
const { DEFAULT_CREDIT_AMOUNT, WELCOME_BONUS_CREDITS } = require('../config/env');

const FALLBACKS = Object.freeze({
  ngoName: 'Asian News Bureau',
  tagline: 'Building stronger communities together',
  creditPerApproval: DEFAULT_CREDIT_AMOUNT,
  welcomeBonus: WELCOME_BONUS_CREDITS,
});

const getSettings = async (session = null) => {
  const query = PlatformSetting.findById('global');
  if (session) query.session(session);
  const settings = await query.lean();
  return settings || { _id: 'global', ...FALLBACKS };
};

const getCreditPerApproval = async (session = null) => (await getSettings(session)).creditPerApproval;
const getWelcomeBonus = async (session = null) => (await getSettings(session)).welcomeBonus;

module.exports = { FALLBACKS, getSettings, getCreditPerApproval, getWelcomeBonus };
