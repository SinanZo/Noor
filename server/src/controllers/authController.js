const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { signToken } = require('../middlewares/auth');

// Generate JWT Token (legacy)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register OR /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, language, locale } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name: name || username,
      username,
      email,
      password,
      language: language || locale || 'en',
      locale: locale || language || 'en',
      role: 'user',
    });

    // Generate token with Phase 3 format
    const token = signToken({ 
      id: user._id.toString(), 
      role: user.role || 'user' 
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        language: user.language,
        locale: user.locale || user.language,
        role: user.role,
        roles: user.roles,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login OR /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password using comparePassword (Phase 3 compatible)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token with Phase 3 format
    const token = signToken({ 
      id: user._id.toString(), 
      role: user.role || 'user' 
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        language: user.language,
        locale: user.locale || user.language,
        role: user.role,
        roles: user.roles,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me OR /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        language: user.language,
        locale: user.locale || user.language,
        role: user.role,
        roles: user.roles,
        subscriptionTier: user.subscriptionTier,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alias for Phase 3 compatibility
exports.me = exports.getMe;

// @desc    Update user profile
// @route   PUT /api/auth/me OR PATCH /api/v1/auth/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      username: req.body.username,
      language: req.body.language,
      locale: req.body.locale,
      country: req.body.country,
      city: req.body.city,
      preferences: req.body.preferences,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        language: user.language,
        locale: user.locale || user.language,
        role: user.role,
        roles: user.roles,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alias for Phase 3 compatibility
exports.updateMe = exports.updateProfile;
