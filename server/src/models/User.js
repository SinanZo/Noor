const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
  },
  email: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  locale: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en',
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'ur', 'fr'],
    default: 'en',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  roles: [{
    type: String,
    enum: ['user', 'admin', 'scholar'],
    default: 'user',
  }],
  avatar: {
    type: String,
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'gold', 'scholar', 'family'],
    default: 'free',
  },
  subscriptionExpiry: {
    type: Date,
  },
  profilePicture: {
    type: String,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  preferences: {
    prayerCalculationMethod: {
      type: String,
      default: 'ISNA',
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
    notifications: {
      prayer: { type: Boolean, default: true },
      quran: { type: Boolean, default: true },
      community: { type: Boolean, default: true },
    },
  },
  lastLogin: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Alias method for Phase 3 compatibility
UserSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if subscription is active
UserSchema.methods.hasActiveSubscription = function() {
  if (this.subscriptionTier === 'free') return false;
  return this.subscriptionExpiry && this.subscriptionExpiry > new Date();
};

module.exports = mongoose.model('User', UserSchema);
