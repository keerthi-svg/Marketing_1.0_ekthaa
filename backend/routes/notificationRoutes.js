// routes/notificationRoutes.js
const express = require('express');
const router  = express.Router();
const {
  getNotifications, markRead, markAllRead, getLeaderboard,
} = require('../controllers/notificationController');
const { protectRoute } = require('../middleware/auth');

router.get('/',                  protectRoute, getNotifications);
router.patch('/read-all',        protectRoute, markAllRead);
router.patch('/:id/read',        protectRoute, markRead);

module.exports = router;
