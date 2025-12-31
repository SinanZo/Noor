const mongoose = require('mongoose');

const TafsirSchema = new mongoose.Schema({
  surah: {
    type: Number,
    required: true,
    index: true,
    min: 1,
    max: 114,
  },
  ayah: {
    type: Number,
    required: true,
    index: true,
    min: 1,
  },
  ar: {
    type: String,
    default: '',
  },
  en: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound unique index
TafsirSchema.index({ surah: 1, ayah: 1 }, { unique: true });

module.exports = mongoose.model('Tafsir', TafsirSchema);
