// server.js – Ekthaa Express app
require('dotenv').config();

const path           = require('path');
const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const cookieParser   = require('cookie-parser');
const rateLimit      = require('express-rate-limit');
const { connectDB }        = require('./config/db');
const authRoutes           = require('./routes/authRoutes');
const postRoutes           = require('./routes/postRoutes');
const notificationRoutes   = require('./routes/notificationRoutes');
const userRoutes           = require('./routes/userRoutes');

const app = express();

// ── Security middleware ──
app.use(helmet());

// ── CORS – allow dev server (same origin in production) ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false                          // same-origin: no CORS header needed
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// ── Body parsers ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Global rate limiter (100 req / 15 min) ──
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
}));

// ── Stricter rate limit for auth endpoints ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// ── Routes ──
app.use('/api/auth',          authRoutes);
app.use('/api/posts',         postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users',         userRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Serve React frontend (production) ──
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// ── Catch-all: send index.html for React Router routes ──
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});


// ── Global error handler ──
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
  });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Ekthaa server running on port ${PORT}`);
    console.log(`   Client URL: ${process.env.CLIENT_URL}`);
  });
});
