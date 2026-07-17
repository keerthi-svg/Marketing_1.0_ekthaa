// controllers/authController.js – Supabase authentication logic
const { getSupabase } = require('../config/db');
const bcrypt          = require('bcryptjs');
const generateToken   = require('../utils/generateToken');
const generateOTP     = require('../utils/generateOTP');
const { sendEmail, buildOtpEmail } = require('../utils/sendEmail');

// ── Helper: strip sensitive fields ──
function sanitizeUser(user) {
  const obj = { ...user };
  delete obj.password;
  delete obj.otp;
  delete obj.otpexpires;
  delete obj.otpexpires;
  return obj;
}

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const emailLower = email.toLowerCase().trim();
    const usernameLower = username.toLowerCase().trim();

    // Check duplicates
    const { data: existingUser } = await supabase
      .from('users')
      .select('email, username')
      .or(`email.eq.${emailLower},username.eq.${usernameLower}`)
      .limit(1)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.email === emailLower) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
      return res.status(409).json({ success: false, message: 'Username already taken.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP
    const { otp, otpExpires } = generateOTP();

    // Insert user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([{
        name: `${firstName.trim()} ${lastName.trim()}`,
        username: usernameLower,
        email: emailLower,
        password: hashedPassword,
        otp,
        otpexpires: otpExpires,
        isverified: false,
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Send email
    try {
      await sendEmail({
        to: emailLower,
        subject: '✦ Verify your Ekthaa account',
        html: buildOtpEmail(otp, 'email verification'),
      });
      console.log(`✅ OTP email sent to ${emailLower}`);
    } catch (emailErr) {
      console.warn('⚠️  Email service unavailable – OTP not sent via email.');
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 DEV MODE – OTP for ${emailLower}: ${otp}\n`);
      }
    }

    return res.status(201).json({
      success: true,
      message: process.env.NODE_ENV === 'development'
        ? 'Account created. Check server terminal for OTP.'
        : 'OTP sent to your email. Please verify your account.',
      email: emailLower,
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, password } = req.body;
    const emailLower = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isverified) {
      const { otp, otpExpires } = generateOTP();
      await supabase
        .from('users')
        .update({ otp, otpexpires: otpExpires })
        .eq('id', user.id);

      try {
        await sendEmail({
          to: emailLower,
          subject: '✦ Verify your Ekthaa account',
          html: buildOtpEmail(otp, 'email verification'),
        });
      } catch (emailErr) {
        console.warn('⚠️  Email unavailable:', emailErr.message);
        if (process.env.NODE_ENV === 'development') {
          console.log(`\n🔑 DEV MODE – OTP for ${emailLower}: ${otp}\n`);
        }
      }

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email: emailLower,
        message: 'Please verify your email. OTP resent.',
      });
    }

    generateToken(res, user.id);

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/verify-otp
// ─────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, otp } = req.body;
    const emailLower = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (new Date(user.otpexpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    // Mark verified
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ isverified: true, otp: null, otpexpires: null })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    generateToken(res, user.id);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error('VerifyOtp error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/resend-otp
// ─────────────────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email } = req.body;
    const emailLower = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { otp, otpExpires } = generateOTP();
    await supabase
      .from('users')
      .update({ otp, otpexpires: otpExpires })
      .eq('id', user.id);

    try {
      await sendEmail({
        to: emailLower,
        subject: '✦ Your new Ekthaa OTP',
        html: buildOtpEmail(otp, 'verification'),
      });
    } catch (emailErr) {
      console.warn('⚠️  Email unavailable:', emailErr.message);
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 DEV MODE – OTP for ${emailLower}: ${otp}\n`);
      }
    }

    res.json({
      success: true,
      message: process.env.NODE_ENV === 'development'
        ? 'OTP generated. Check server terminal.'
        : 'New OTP sent to your email.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (err) {
    console.error('ResendOtp error:', err);
    res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email } = req.body;
    const emailLower = email.toLowerCase().trim();

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (!user) return res.json({ success: true, message: 'If that email exists, an OTP was sent.' });

    const { otp, otpExpires } = generateOTP();
    await supabase
      .from('users')
      .update({ otp, otpexpires: otpExpires })
      .eq('id', user.id);

    try {
      await sendEmail({
        to: emailLower,
        subject: '✦ Reset your Ekthaa password',
        html: buildOtpEmail(otp, 'password reset'),
      });
    } catch (emailErr) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔑 DEV MODE – Password reset OTP for ${emailLower}: ${otp}\n`);
      }
    }

    res.json({
      success: true,
      message: 'If that email exists, an OTP was sent.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    res.status(500).json({ success: false, message: 'Failed to send reset OTP.' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, otp, newPassword } = req.body;
    const emailLower = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (new Date(user.otpexpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await supabase
      .from('users')
      .update({ password: hashedPassword, otp: null, otpexpires: null })
      .eq('id', user.id);

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
};

// ─────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // req.user is attached by protectRoute middleware
    const userId = req.user.id || req.user._id;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

// ─────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────
exports.logout = (req, res) => {
  res.cookie('ekthaa_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
};


