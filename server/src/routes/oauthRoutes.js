const express = require('express');
const { googleOAuth, appleOAuth } = require('../controllers/oauthController');

const router = express.Router();

router.post('/google', googleOAuth);
router.post('/apple', appleOAuth);

module.exports = router;
