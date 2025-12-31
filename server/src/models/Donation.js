const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  txId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  type: {
    type: String,
    enum: ['sadaqah', 'zakat', 'fidyah', 'kaffarah', 'general'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'hyperpay', 'crypto'],
    required: true,
  },
  splitAdmin: {
    type: Number,
    default: 0,
  },
  splitProject: {
    type: Number,
    default: 0,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  receipt: {
    type: String, // URL to receipt
  },
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Calculate splits before saving
DonationSchema.pre('save', function(next) {
  if (this.isNew) {
    // 50/50 split between admin and project
    this.splitAdmin = this.amount * 0.5;
    this.splitProject = this.amount * 0.5;
  }
  next();
});

// Static method to get donation statistics
DonationSchema.statics.getStatistics = async function(projectId) {
  const stats = await this.aggregate([
    {
      $match: {
        projectId: mongoose.Types.ObjectId(projectId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        avgDonation: { $avg: '$amount' },
      }
    }
  ]);
  
  return stats[0] || { totalAmount: 0, totalDonations: 0, avgDonation: 0 };
};

module.exports = mongoose.model('Donation', DonationSchema);
