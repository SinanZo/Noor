const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProgress,
  setProgress,
  getAllProgress,
  listBookmarks,
  addBookmark,
  deleteBookmark,
  getLatestProgress
} = require('../controllers/quranUserController');

// All routes require authentication
router.use(protect);

// Progress routes
router.get('/progress/latest', getLatestProgress);
router.get('/progress', getAllProgress);
router.get('/progress/:surah', getProgress);
router.post('/progress', setProgress);

// Bookmark routes
router.get('/bookmarks', listBookmarks);
router.post('/bookmarks', addBookmark);
router.delete('/bookmarks/:id', deleteBookmark);

module.exports = router;
