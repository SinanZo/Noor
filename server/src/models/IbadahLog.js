const mongoose = require('mongoose');

const ibadahLogSchema = new mongoose.Schema({
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
  value: {
    type: Number,
    default: 1,
    min: 0
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound unique index - one log per user per key per day
ibadahLogSchema.index({ userId: 1, key: 1, date: 1 }, { unique: true });

// Query optimization indexes
ibadahLogSchema.index({ userId: 1, date: 1 });
ibadahLogSchema.index({ userId: 1, key: 1, date: -1 });

const IbadahLog = mongoose.model('IbadahLog', ibadahLogSchema);

module.exports = IbadahLog;
