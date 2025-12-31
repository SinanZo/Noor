const mongoose = require('mongoose');

const quranAyahSchema = new mongoose.Schema({
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
  text_ar: {
    type: String,
    required: true,
    index: 'text'
  },
  text_en: {
    type: String,
    index: 'text'
  },
  juz: {
    type: Number,
    min: 1,
    max: 30
  },
  page: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
});

// Compound unique index
quranAyahSchema.index({ surah: 1, ayah: 1 }, { unique: true });

// Text search indexes
quranAyahSchema.index({ text_ar: 'text', text_en: 'text' });

const QuranAyah = mongoose.model('QuranAyah', quranAyahSchema);

module.exports = QuranAyah;
