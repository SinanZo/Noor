const Stripe = require('stripe');
const DonationProject = require('../models/DonationProject');
const DonationPayment = require('../models/DonationPayment');
const { sendDonationReceipt } = require('../utils/email');

// Initialize Stripe - will gracefully fail if no secret key
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Stripe initialization failed:', error.message);
}

/**
 * @desc    Get all active donation projects
 * @route   GET /api/donations/projects
 * @access  Public
 */
exports.getProjects = async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    const query = { active: true };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const projects = await DonationProject.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation projects',
      error: error.message
    });
  }
};

/**
 * @desc    Get single donation project by slug
 * @route   GET /api/donations/projects/:slug
 * @access  Public
 */
exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await DonationProject.findOne({ 
      slug: req.params.slug,
      active: true 
    }).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Donation project not found'
      });
    }

    // Get recent donations (anonymized)
    const recentDonations = await DonationPayment.find({
      projectId: project._id,
      status: 'succeeded'
    })
      .select('amountCents currency donorInfo.name donorInfo.anonymous createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        ...project,
        recentDonations: recentDonations.map(d => ({
          amount: (d.amountCents / 100).toFixed(2),
          currency: d.currency,
          donorName: d.donorInfo?.anonymous ? 'Anonymous' : (d.donorInfo?.name || 'Anonymous'),
          date: d.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation project',
      error: error.message
    });
  }
};

/**
 * @desc    Create Stripe payment intent for donation
 * @route   POST /api/donations/intent
 * @access  Public
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { projectId, amountCents, currency = 'usd', donorInfo } = req.body;

    // Validate input
    if (!projectId || !amountCents || amountCents < 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation amount (minimum $1.00)'
      });
    }

    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.',
        mock: true,
        // Return mock data for development
        data: {
          clientSecret: 'mock_client_secret_' + Date.now(),
          paymentIntentId: 'mock_pi_' + Date.now(),
          amount: amountCents,
          currency: currency.toLowerCase()
        }
      });
    }

    // Verify project exists
    const project = await DonationProject.findById(projectId);
    if (!project || !project.active) {
      return res.status(404).json({
        success: false,
        message: 'Donation project not found or inactive'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata: {
        projectId: projectId.toString(),
        projectSlug: project.slug,
        donorName: donorInfo?.name || 'Anonymous',
        donorEmail: donorInfo?.email || ''
      },
      receipt_email: donorInfo?.email || null,
      description: `Donation to ${project.title.en}`
    });

    // Create payment record in pending state
    const payment = await DonationPayment.create({
      projectId,
      amountCents,
      currency: currency.toUpperCase(),
      method: 'stripe',
      providerRef: paymentIntent.id,
      status: 'pending',
      donorInfo: {
        name: donorInfo?.name || 'Anonymous',
        email: donorInfo?.email || '',
        anonymous: donorInfo?.anonymous || false
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment._id,
        amount: amountCents,
        currency: currency.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/donations/stripe/webhook
 * @access  Public (Stripe only)
 */
exports.handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).send('Webhook handler not available');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper function to handle successful payments
async function handlePaymentSuccess(paymentIntent) {
  const payment = await DonationPayment.findOne({ 
    providerRef: paymentIntent.id 
  });

  if (!payment) {
    console.error('Payment record not found:', paymentIntent.id);
    return;
  }

  // Update payment status
  payment.status = 'succeeded';
  payment.completedAt = new Date();
  payment.receiptUrl = paymentIntent.charges?.data?.[0]?.receipt_url || null;
  await payment.save();

  // Update project collected amount
  const project = await DonationProject.findById(payment.projectId);
  if (project) {
    project.collectedAmount += payment.amountCents / 100;
    project.donorCount += 1;
    await project.save();
  }

  console.log(`Payment succeeded: ${paymentIntent.id}, Amount: $${payment.amount}`);

  // Send email receipt if donor email exists
  if (payment.email) {
    try {
      await sendDonationReceipt({
        to: payment.email,
        name: payment.name || 'Donor',
        amountCents: payment.amountCents,
        currency: payment.currency || 'usd',
        projectTitleEn: project?.title?.en,
        projectTitleAr: project?.title?.ar,
        paymentId: payment._id.toString(),
      });
      console.log('✅ Receipt email sent to:', payment.email);
    } catch (emailErr) {
      console.error('❌ Failed to send receipt email:', emailErr);
    }
  }
}

// Helper function to handle failed payments
async function handlePaymentFailure(paymentIntent) {
  const payment = await DonationPayment.findOne({ 
    providerRef: paymentIntent.id 
  });

  if (payment) {
    payment.status = 'failed';
    payment.errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
    await payment.save();
  }

  console.log(`Payment failed: ${paymentIntent.id}`);
}

// Helper function to handle refunds
async function handleRefund(charge) {
  const payment = await DonationPayment.findOne({ 
    providerRef: charge.payment_intent 
  });

  if (payment && payment.status === 'succeeded') {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    // Subtract from project collected amount
    const project = await DonationProject.findById(payment.projectId);
    if (project) {
      project.collectedAmount -= payment.amountCents / 100;
      project.donorCount = Math.max(0, project.donorCount - 1);
      await project.save();
    }
  }

  console.log(`Payment refunded: ${charge.payment_intent}`);
}

/**
 * @desc    Get user's donation history
 * @route   GET /api/donations/history
 * @access  Private (requires auth)
 */
exports.getDonationHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const donations = await DonationPayment.find({ 
      userId: req.user.id,
      status: { $in: ['succeeded', 'refunded'] }
    })
      .populate('projectId', 'title slug coverImage')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation history',
      error: error.message
    });
  }
};

module.exports = exports;
