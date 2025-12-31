const mongoose = require('mongoose');

const SurahProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    surah: {
      type: Number,
      required: true,
      min: 1,
      max: 114,
      index: true
    },
    ayah: {
      type: Number,
      required: true,
      min: 1
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one progress record per user per surah
SurahProgressSchema.index({ userId: 1, surah: 1 }, { unique: true });

module.exports = mongoose.model('SurahProgress', SurahProgressSchema);
