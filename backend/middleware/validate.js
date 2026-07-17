// middleware/validate.js – express-validator result handler
const { validationResult } = require('express-validator');

/**
 * Run after express-validator chains.
 * Returns 400 with the first validation error if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return res.status(400).json({ success: false, message: first.msg });
  }
  next();
};

module.exports = { validate };
