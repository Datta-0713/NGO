'use strict';
const express = require('express');
const { getDashboardStats, getAllUsers, getUserById, updateUserStatus, broadcastNotification } = require('../controllers/adminController');
const { getAdminSubmissionsQueue, getSubmissionById, getSubmissionHistory, claimSubmission, approveSubmission, rejectSubmission, requestChanges, updateSubmissionNotes } = require('../controllers/submissionController');
const { adminAdjustCredits } = require('../controllers/creditController');
const { getReports, resolveReport } = require('../controllers/reportController');
const { getAuditLogs } = require('../controllers/auditController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { updateSettingsValidation } = require('../validators/settingsValidators');
const { protect, requireAdmin } = require('../middlewares/auth');
const { mutationLimiter } = require('../middlewares/rateLimiter');
const { moderationMessageValidation } = require('../validators/newsValidators');
const validate = require('../middlewares/validate');

const router = express.Router();
const adminOnly = [protect, requireAdmin];

router.get('/dashboard/stats', ...adminOnly, getDashboardStats);
router.get('/submissions', ...adminOnly, getAdminSubmissionsQueue);
router.get('/submissions/:id', ...adminOnly, getSubmissionById);
router.get('/submissions/:id/history', ...adminOnly, getSubmissionHistory);
router.patch('/submissions/:id/claim', ...adminOnly, mutationLimiter, claimSubmission);
router.patch('/submissions/:id/approve', ...adminOnly, mutationLimiter, approveSubmission);
router.patch('/submissions/:id/request-changes', ...adminOnly, mutationLimiter, moderationMessageValidation, validate, requestChanges);
router.patch('/submissions/:id/reject', ...adminOnly, mutationLimiter, moderationMessageValidation, validate, rejectSubmission);
router.patch('/submissions/:id/notes', ...adminOnly, mutationLimiter, updateSubmissionNotes);
router.get('/users', ...adminOnly, getAllUsers);
router.get('/users/:id', ...adminOnly, getUserById);
router.patch('/users/:id/status', ...adminOnly, mutationLimiter, updateUserStatus);
router.patch('/credits/adjust', ...adminOnly, mutationLimiter, adminAdjustCredits);
router.post('/users/:userId/credits', ...adminOnly, mutationLimiter, adminAdjustCredits);
router.get('/reports', ...adminOnly, getReports);
router.patch('/reports/:id', ...adminOnly, mutationLimiter, resolveReport);
router.post('/notifications/broadcast', ...adminOnly, mutationLimiter, broadcastNotification);
router.get('/audit-logs', ...adminOnly, getAuditLogs);
router.get('/settings', ...adminOnly, getSettings);
router.patch('/settings', ...adminOnly, mutationLimiter, updateSettingsValidation, validate, updateSettings);

module.exports = router;
