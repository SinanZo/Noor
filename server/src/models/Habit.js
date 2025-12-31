const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  key: {
    type: String,
    enum: ['salah', 'quran', 'dhikr', 'charity', 'fasting'],
    required: true
  },
  targetPerDay: {
    type: Number,
    default: 1,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index for quick lookups
habitSchema.index({ userId: 1, key: 1 }, { unique: true });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
