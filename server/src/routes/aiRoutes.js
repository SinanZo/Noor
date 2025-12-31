const express = require('express');
const { protect } = require('../middlewares/auth');
const router = express.Router();

// Placeholder routes - implement OpenAI integration
router.post('/query', protect, (req, res) => {
  res.json({ message: 'AI Query endpoint' });
});

router.get('/history', protect, (req, res) => {
  res.json({ message: 'Get AI query history' });
});

module.exports = router;
