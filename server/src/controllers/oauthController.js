const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const User = require('../models/User');
const { signToken } = require('../middlewares/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Google OAuth - Verify ID token from web client
 * @route   POST /api/v1/oauth/google
 * @access  Public
 */
exports.googleOAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    if (!payload?.email) {
      return res.status(400).json({ error: 'No email in token' });
    }
    
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const avatar = payload.picture;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        avatar,
        locale: 'en',
        role: 'user',
      });
    }
    
    const token = signToken({
      id: user._id.toString(),
      role: user.role || 'user',
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        locale: user.locale || 'en',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Apple OAuth - Verify ID token from web client
 * @route   POST /api/v1/oauth/apple
 * @access  Public
 */
exports.appleOAuth = async (req, res) => {
  try {
    const { id_token } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ error: 'Missing id_token' });
    }
    
    const data = await appleSignin.verifyIdToken(id_token, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });
    
    const email = (data.email || '').toLowerCase();
    const sub = data.sub; // unique Apple ID
    const identifier = email || `apple:${sub}`;
    
    let user = await User.findOne({ email: identifier });
    
    if (!user) {
      user = await User.findOne({ avatar: `apple:${sub}` });
    }
    
    if (!user) {
      user = await User.create({
        email: identifier,
        name: 'Apple User',
        avatar: `apple:${sub}`,
        locale: 'en',
        role: 'user',
      });
    }
    
    const token = signToken({
      id: user._id.toString(),
      role: user.role || 'user',
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        locale: user.locale || 'en',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
};
