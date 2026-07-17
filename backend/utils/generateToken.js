// utils/generateToken.js – JWT creation + HTTP-only cookie
const jwt = require('jsonwebtoken');

/**
 * Sign a JWT and attach it as an HTTP-only cookie.
 * @param {object} res - Express response object
 * @param {string} userId - MongoDB user _id
 * @returns {string} signed JWT token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRES_DAYS || '7', 10);

  res.cookie('ekthaa_token', token, {
    httpOnly: true,                                   // inaccessible to JS
    secure: process.env.NODE_ENV === 'production',    // HTTPS in prod
    sameSite: 'lax',
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,  // ms
  });

  return token;
};

module.exports = generateToken;
