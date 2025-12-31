const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
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
      min: 1,
      index: true
    },
    note: {
      type: String,
      default: '',
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one bookmark per user per ayah
BookmarkSchema.index({ userId: 1, surah: 1, ayah: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
