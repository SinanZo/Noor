const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const quranRoutes = require('./routes/quranRoutes');
const hadithRoutes = require('./routes/hadithRoutes');
const prayerRoutes = require('./routes/prayerRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const donationRoutes = require('./routes/donationRoutes');
const halalRoutes = require('./routes/halalRoutes');
const communityRoutes = require('./routes/communityRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const audioRoutes = require('./routes/audioRoutes');
const quranUserRoutes = require('./routes/quranUserRoutes');

// Initialize app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes (Phase 1 & 2)
app.use('/api/auth', authRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/hadith', hadithRoutes);
app.use('/api/prayer', prayerRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/halal', halalRoutes);
app.use('/api/community', communityRoutes);

// Phase 3 v1 routes (backward compatible)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/quran', quranRoutes);
app.use('/api/v1/hadith', hadithRoutes);
app.use('/api/v1/prayer', prayerRoutes);
app.use('/api/v1/planner', plannerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/halal', halalRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/oauth', oauthRoutes);
app.use('/api/v1/audio', audioRoutes);
app.use('/api/v1/quran/user', quranUserRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Noor SuperApp API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Database connection (non-blocking for development)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB Connected');
    })
    .catch((err) => {
      console.error('⚠️  MongoDB connection error:', err.message);
      console.log('⚠️  Server will run without database. Some features may not work.');
    });
} else {
  console.log('⚠️  No MONGO_URI found. Running without database.');
}

// Start server regardless of database connection
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

module.exports = app;
