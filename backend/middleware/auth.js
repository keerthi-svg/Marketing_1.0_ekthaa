// middleware/auth.js – JWT route protection
const jwt  = require('jsonwebtoken');
const { getSupabase } = require('../config/db');

/**
 * Protect private routes.
 * Reads the JWT from the HTTP-only cookie 'ekthaa_token'.
 * Attaches the user data to req.user.
 */
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.ekthaa_token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, username, avatar, level, xp, xpmax, badges, isverified, created_at')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user) {
      console.error('protectRoute error:', error);
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = { protectRoute };
