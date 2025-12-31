const express = require('express');
const { protect } = require('../middlewares/auth');
const { listHabits, upsertHabit, logIbadah, getStats } = require('../controllers/plannerController');
const router = express.Router();

// All planner routes require authentication
router.use(protect);

// Habits routes
router.get('/habits', listHabits);
router.post('/habits', upsertHabit);

// Logging route
router.post('/log', logIbadah);

// Statistics route
router.get('/stats', getStats);

// Legacy route for Iman Score (placeholder)
router.get('/iman-score', (req, res) => {
  res.json({ message: 'Get Iman Score', userId: req.user?.id });
});

module.exports = router;
