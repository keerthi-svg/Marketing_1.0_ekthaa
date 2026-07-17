// routes/authRoutes.js
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const {
  register, login, verifyOtp, resendOtp,
  forgotPassword, resetPassword, getMe, logout,
} = require('../controllers/authController');
const { protectRoute } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

// Validation chains
const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be ≥ 3 characters')
    .matches(/^[a-z0-9_.]+$/i).withMessage('Username can only contain letters, numbers, _ and .'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register',         registerRules, validate, register);
router.post('/login',            loginRules,    validate, login);
router.post('/verify-otp',       verifyOtp);
router.post('/resend-otp',       resendOtp);
router.post('/forgot-password',  forgotPassword);
router.post('/reset-password',   resetPassword);
router.get('/me',                protectRoute,  getMe);
router.post('/logout',           logout);

module.exports = router;
