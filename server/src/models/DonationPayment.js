const mongoose = require('mongoose');

const donationPaymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonationProject',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous donations
  },
  amountCents: {
    type: Number,
    required: true,
    min: 100 // Minimum $1.00 or equivalent
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'SAR', 'AED']
  },
  method: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'bank_transfer', 'cash'],
    default: 'stripe'
  },
  providerRef: {
    type: String, // Stripe payment intent ID, PayPal transaction ID, etc.
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'canceled'],
    default: 'pending'
  },
  donorInfo: {
    name: { type: String },
    email: { type: String },
    anonymous: { type: Boolean, default: false }
  },
  receiptUrl: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  errorMessage: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
donationPaymentSchema.index({ projectId: 1, status: 1 });
donationPaymentSchema.index({ userId: 1 });
donationPaymentSchema.index({ providerRef: 1 });
donationPaymentSchema.index({ status: 1, createdAt: -1 });

// Helper method to get amount in dollars/main currency unit
donationPaymentSchema.virtual('amount').get(function() {
  return (this.amountCents / 100).toFixed(2);
});

donationPaymentSchema.set('toJSON', { virtuals: true });
donationPaymentSchema.set('toObject', { virtuals: true });

const DonationPayment = mongoose.model('DonationPayment', donationPaymentSchema);

module.exports = DonationPayment;
