const mongoose = require('mongoose');

const SurahMetaSchema = new mongoose.Schema({
  surah: {
    type: Number,
    required: true,
    unique: true,
    index: true,
    min: 1,
    max: 114,
  },
  nameAr: {
    type: String,
    required: true,
  },
  nameEn: {
    type: String,
    required: true,
  },
  revelationPlace: {
    type: String,
    enum: ['Meccan', 'Medinan'],
    required: true,
  },
  ayahCount: {
    type: Number,
    required: true,
    min: 1,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SurahMeta', SurahMetaSchema);
