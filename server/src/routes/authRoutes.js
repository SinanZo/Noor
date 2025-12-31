const express = require('express');
const { register, login, getMe, me, updateProfile, updateMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Phase 1 & 2 routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.patch('/me', protect, updateMe);

module.exports = router;
