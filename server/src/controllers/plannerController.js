const Habit = require('../models/Habit');
const IbadahLog = require('../models/IbadahLog');

// Helper to get userId from JWT token
const getUserId = (req) => {
  return req.user?.id || req.user?._id?.toString() || 'anon';
};

/**
 * @desc    Get user's habits
 * @route   GET /api/planner/habits OR /api/v1/planner/habits
 * @access  Private (JWT required)
 */
exports.listHabits = async (req, res) => {
  try {
    const userId = getUserId(req);
    const habits = await Habit.find({ userId }).lean();
    
    res.json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    console.error('List habits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch habits',
      error: error.message
    });
  }
};

/**
 * @desc    Create or update a habit
 * @route   POST /api/planner/habits OR /api/v1/planner/habits
 * @access  Private (JWT required)
 */
exports.upsertHabit = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { key, targetPerDay } = req.body;

    if (!key || !['salah', 'quran', 'dhikr', 'charity', 'fasting'].includes(key)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid habit key'
      });
    }

    const doc = await Habit.findOneAndUpdate(
      { userId, key },
      { $set: { targetPerDay: targetPerDay || 1 } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    console.error('Upsert habit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save habit',
      error: error.message
    });
  }
};

/**
 * @desc    Log an ibadah activity
 * @route   POST /api/planner/log OR /api/v1/planner/log
 * @access  Private (JWT required)
 */
exports.logIbadah = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { key, value = 1, date } = req.body;

    if (!key || !['salah', 'quran', 'dhikr', 'charity', 'fasting'].includes(key)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ibadah key'
      });
    }

    // Default to today if no date provided
    const logDate = date || new Date().toISOString().split('T')[0];

    const doc = await IbadahLog.findOneAndUpdate(
      { userId, key, date: logDate },
      { $inc: { value: value } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    console.error('Log ibadah error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's ibadah statistics
 * @route   GET /api/planner/stats OR /api/v1/planner/stats
 * @access  Private (JWT required)
 */
exports.getStats = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from and to dates (YYYY-MM-DD)'
      });
    }

    const docs = await IbadahLog.find({
      userId,
      date: { $gte: from, $lte: to }
    })
    .sort({ date: -1 })
    .lean();

    // Calculate streak for salah
    const salahDates = new Set(
      docs.filter(d => d.key === 'salah' && d.value > 0).map(d => d.date)
    );
    
    let streak = 0;
    let currentDate = new Date(to);
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (salahDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Group logs by key for summary
    const summary = {};
    docs.forEach(log => {
      if (!summary[log.key]) {
        summary[log.key] = { total: 0, days: 0 };
      }
      summary[log.key].total += log.value;
      summary[log.key].days += 1;
    });

    res.json({
      success: true,
      data: {
        logs: docs,
        streak,
        summary,
        period: { from, to }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = exports;
