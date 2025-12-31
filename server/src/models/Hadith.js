const mongoose = require('mongoose');

const HadithSchema = new mongoose.Schema({
  book: {
    type: String,
    required: true,
    enum: ['Bukhari', 'Muslim', 'Abu Dawud', 'Tirmidhi', 'Nasa\'i', 'Ibn Majah'],
    index: true,
  },
  number: {
    type: Number,
    required: true,
  },
  text: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    ur: { type: String },
    fr: { type: String },
  },
  source: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    enum: ['Sahih', 'Hasan', 'Daif', 'Maudu'],
    required: true,
  },
  narrator: {
    type: String,
    required: true,
  },
  topics: [{
    type: String,
    index: true,
  }],
  quranReferences: [{
    surah: Number,
    ayah: Number,
  }],
  chapter: {
    type: String,
  },
  chapterNumber: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Text index for search functionality
HadithSchema.index({ 
  'text.en': 'text', 
  'text.ar': 'text',
  narrator: 'text',
  topics: 'text'
});

module.exports = mongoose.model('Hadith', HadithSchema);
