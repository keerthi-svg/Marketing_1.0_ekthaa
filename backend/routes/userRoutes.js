// routes/userRoutes.js
const express = require('express');
const router  = express.Router();
const { getLeaderboard } = require('../controllers/notificationController');
const { protectRoute }   = require('../middleware/auth');

router.get('/leaderboard', protectRoute, getLeaderboard);

module.exports = router;
