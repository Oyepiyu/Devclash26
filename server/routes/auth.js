const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        faceVerified: newUser.faceVerified,
        documentVerified: newUser.documentVerified,
        trustScore: newUser.trustScore,
        walletBalance: newUser.walletBalance,
        intent: newUser.intent,
        orgOnboardingStage: newUser.orgOnboardingStage
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        faceVerified: user.faceVerified,
        documentVerified: user.documentVerified,
        trustScore: user.trustScore,
        walletBalance: user.walletBalance,
        intent: user.intent,
        orgOnboardingStage: user.orgOnboardingStage
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Current User
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      faceVerified: req.user.faceVerified,
      documentVerified: req.user.documentVerified,
      trustScore: req.user.trustScore,
      walletBalance: req.user.walletBalance,
      intent: req.user.intent,
      orgOnboardingStage: req.user.orgOnboardingStage
    }
  });
});

// Update User Intent
router.put('/intent', authMiddleware, async (req, res) => {
  try {
    const { intent } = req.body;
    if (!['professional', 'organisation'].includes(intent)) {
      return res.status(400).json({ message: 'Invalid intent selection' });
    }
    
    req.user.intent = intent;
    await req.user.save();
    
    res.json({
      message: 'Intent updated successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified,
        faceVerified: req.user.faceVerified,
        documentVerified: req.user.documentVerified,
        trustScore: req.user.trustScore,
        walletBalance: req.user.walletBalance,
        intent: req.user.intent,
        orgOnboardingStage: req.user.orgOnboardingStage
      }
    });
  } catch (error) {
    console.error('Update Intent Error:', error);
    res.status(500).json({ message: 'Server error updating intent' });
  }
});

// 5. Update role (For Dev/Testing)
router.patch('/update-role', authMiddleware, async (req, res) => {
  console.log(`[DEV] Attempting role switch for user: ${req.user.email} to role: ${req.body.role}`);
  try {
    const { role } = req.body;
    if (!['professional', 'organisation_owner', 'investor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.user._id);
    user.role = role;
    
    // Sync intent for correct routing in App.jsx
    if (role === 'organisation_owner') {
      user.intent = 'organisation';
      if (user.orgOnboardingStage < 5) user.orgOnboardingStage = 5; // Skip onboarding for dev
    } else {
      user.intent = 'professional';
      if (user.profOnboardingStage < 4) user.profOnboardingStage = 4; // Skip onboarding for dev
    }
    
    await user.save();
    res.json({ message: `Role updated to ${role} successfully.`, user });
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
