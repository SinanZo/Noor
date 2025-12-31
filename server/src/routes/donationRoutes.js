const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectBySlug,
  createPaymentIntent,
  handleStripeWebhook,
  getDonationHistory
} = require('../controllers/donationController');
const { protect } = require('../middlewares/auth');

// Public routes
router.get('/projects', getProjects);
router.get('/projects/:slug', getProjectBySlug);
router.post('/intent', createPaymentIntent);

// Stripe webhook (needs raw body, handled in server.js)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.get('/history', protect, getDonationHistory);

module.exports = router;

