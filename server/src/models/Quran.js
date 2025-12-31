const mongoose = require('mongoose');

const QuranSchema = new mongoose.Schema({
  surah: {
    type: Number,
    required: true,
    min: 1,
    max: 114,
    index: true,
  },
  ayah: {
    type: Number,
    required: true,
    min: 1,
    index: true,
  },
  arabicText: {
    type: String,
    required: true,
  },
  translations: {
    en: { type: String },
    ar: { type: String },
    ur: { type: String },
    fr: { type: String },
  },
  tafsir: {
    en: { type: String },
    ar: { type: String },
    ur: { type: String },
    fr: { type: String },
  },
  recitationAudio: {
    type: String, // URL to audio file
  },
  recitationVideo: {
    type: String, // URL to video file
  },
  topics: [{
    type: String,
  }],
  revelationType: {
    type: String,
    enum: ['Meccan', 'Medinan'],
  },
  juz: {
    type: Number,
    min: 1,
    max: 30,
  },
  page: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Compound index for efficient querying
QuranSchema.index({ surah: 1, ayah: 1 });

// Static method to get surah info
QuranSchema.statics.getSurahInfo = async function(surahNumber) {
  const verses = await this.find({ surah: surahNumber });
  return {
    surahNumber,
    totalVerses: verses.length,
    revelationType: verses[0]?.revelationType,
  };
};

module.exports = mongoose.model('Quran', QuranSchema);
