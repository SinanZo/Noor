const mongoose = require('mongoose');

const donationProjectSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    ur: { type: String },
    fr: { type: String }
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    ur: { type: String },
    fr: { type: String }
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  goalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  collectedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED']
  },
  coverImage: {
    type: String,
    default: '/images/donation-placeholder.jpg'
  },
  category: {
    type: String,
    enum: ['emergency', 'education', 'healthcare', 'water', 'food', 'orphans', 'masjid', 'general'],
    default: 'general'
  },
  active: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  },
  beneficiaries: {
    type: Number,
    default: 0
  },
  donorCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
donationProjectSchema.virtual('progress').get(function() {
  if (this.goalAmount === 0) return 0;
  return Math.min(100, Math.round((this.collectedAmount / this.goalAmount) * 100));
});

// Ensure virtuals are included when converting to JSON
donationProjectSchema.set('toJSON', { virtuals: true });
donationProjectSchema.set('toObject', { virtuals: true });

// Index for faster queries
donationProjectSchema.index({ active: 1, featured: -1, createdAt: -1 });
donationProjectSchema.index({ slug: 1 }, { unique: true }); // Unique index for slug
donationProjectSchema.index({ category: 1 });

const DonationProject = mongoose.model('DonationProject', donationProjectSchema);

module.exports = DonationProject;
