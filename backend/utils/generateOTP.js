// utils/generateOTP.js – secure 6-digit OTP
const crypto = require('crypto');

/**
 * Generate a cryptographically secure 6-digit OTP
 * and its expiry timestamp (5 minutes from now).
 */
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { otp, otpExpires };
};

module.exports = generateOTP;
