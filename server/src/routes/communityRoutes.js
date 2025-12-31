const express = require('express');
const { protect } = require('../middlewares/auth');
const router = express.Router();

// Placeholder routes
router.get('/jobs', (req, res) => {
  res.json({ message: 'Get job listings' });
});

router.post('/jobs', protect, (req, res) => {
  res.json({ message: 'Post a new job' });
});

router.get('/forums', (req, res) => {
  res.json({ message: 'Get forum topics' });
});

module.exports = router;
