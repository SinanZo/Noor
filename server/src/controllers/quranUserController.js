const SurahProgress = require('../models/SurahProgress');
const Bookmark = require('../models/Bookmark');
const { isValidAyah } = require('../utils/quranHelpers');

/**
 * @desc    Get user's progress for a specific surah
 * @route   GET /api/v1/quran/user/progress/:surah
 * @access  Private
 */
exports.getProgress = async (req, res) => {
  try {
    const surah = Number(req.params.surah);
    
    if (!surah || surah < 1 || surah > 114) {
      return res.status(400).json({ error: 'Invalid surah number' });
    }
    
    const progress = await SurahProgress.findOne({
      userId: req.user._id,
      surah
    }).lean();
    
    res.json(progress || { surah, ayah: 1 });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @desc    Set/update user's progress for a surah
 * @route   POST /api/v1/quran/user/progress
 * @access  Private
 */
exports.setProgress = async (req, res) => {
  try {
    const { surah, ayah } = req.body;
    
    if (!surah || !ayah) {
      return res.status(400).json({ error: 'Surah and ayah are required' });
    }
    
    if (!isValidAyah(surah, ayah)) {
      return res.status(400).json({ error: 'Invalid surah or ayah number' });
    }
    
    const progress = await SurahProgress.findOneAndUpdate(
      { userId: req.user._id, surah },
      {
        $set: {
          ayah,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    
    res.json(progress);
  } catch (error) {
    console.error('Set progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @desc    Get all progress records for user
 * @route   GET /api/v1/quran/user/progress
 * @access  Private
 */
exports.getAllProgress = async (req, res) => {
  try {
    const progress = await SurahProgress.find({
      userId: req.user._id
    })
      .sort({ surah: 1 })
      .lean();
    
    res.json(progress);
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @desc    Get user's bookmarks (optionally filtered by surah)
 * @route   GET /api/v1/quran/user/bookmarks
 * @access  Private
 */
exports.listBookmarks = async (req, res) => {
  try {
    const surah = req.query.surah ? Number(req.query.surah) : null;
    
    const query = { userId: req.user._id };
    if (surah) {
      if (surah < 1 || surah > 114) {
        return res.status(400).json({ error: 'Invalid surah number' });
      }
      query.surah = surah;
    }
    
    const bookmarks = await Bookmark.find(query)
      .sort({ surah: 1, ayah: 1 })
      .lean();
    
    res.json(bookmarks);
  } catch (error) {
    console.error('List bookmarks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @desc    Add or update a bookmark
 * @route   POST /api/v1/quran/user/bookmarks
 * @access  Private
 */
exports.addBookmark = async (req, res) => {
  try {
    const { surah, ayah, note = '' } = req.body;
    
    if (!surah || !ayah) {
      return res.status(400).json({ error: 'Surah and ayah are required' });
    }
    
    if (!isValidAyah(surah, ayah)) {
      return res.status(400).json({ error: 'Invalid surah or ayah number' });
    }
    
    const bookmark = await Bookmark.findOneAndUpdate(
      { userId: req.user._id, surah, ayah },
      { $set: { note } },
      { upsert: true, new: true }
    );
    
    res.json(bookmark);
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @desc    Delete a bookmark
 * @route   DELETE /api/v1/quran/user/bookmarks/:id
 * @access  Private
 */
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmarkId = req.params.id;
    
    const result = await Bookmark.deleteOne({
      _id: bookmarkId,
      userId: req.user._id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    res.json({ success: true, message: 'Bookmark deleted' });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @desc    Get user's latest progress across all surahs
 * @route   GET /api/v1/quran/user/progress/latest
 * @access  Private
 */
exports.getLatestProgress = async (req, res) => {
  try {
    const progress = await SurahProgress.findOne({
      userId: req.user._id
    })
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json(progress || {});
  } catch (error) {
    console.error('Get latest progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
