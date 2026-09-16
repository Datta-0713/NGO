'use strict';
const express = require('express');
const { 
  getDashboardStats, 
  getAllUsers, 
  getUserById, 
  broadcastNotification 
} = require('../controllers/adminController');
const { 
  getAdminSubmissionsQueue, 
  getSubmissionById, 
  approveSubmission, 
  rejectSubmission 
} = require('../controllers/submissionController');
const { adminAdjustCredits } = require('../controllers/creditController');
const { protect, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard/stats', protect, requireAdmin, getDashboardStats);
router.get('/submissions', protect, requireAdmin, getAdminSubmissionsQueue);
router.get('/submissions/:id', protect, requireAdmin, getSubmissionById);
router.patch('/submissions/:id/approve', protect, requireAdmin, approveSubmission);
router.patch('/submissions/:id/reject', protect, requireAdmin, rejectSubmission);
router.get('/users', protect, requireAdmin, getAllUsers);
router.get('/users/:id', protect, requireAdmin, getUserById);
router.patch('/credits/adjust', protect, requireAdmin, adminAdjustCredits);
router.post('/users/:userId/credits', protect, requireAdmin, adminAdjustCredits);
router.post('/notifications/broadcast', protect, requireAdmin, broadcastNotification);

module.exports = router;
