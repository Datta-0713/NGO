'use strict';
const express = require('express');
const { getMyNotifications, markRead, markAllRead, getUnreadCount, getContributorHighlight } = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');
const { mutationLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/mine', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.get('/highlight', protect, getContributorHighlight);
router.patch('/:id/read', protect, mutationLimiter, markRead);
router.patch('/read-all', protect, mutationLimiter, markAllRead);

module.exports = router;
