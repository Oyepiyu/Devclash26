const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Euclidean distance between two embedding arrays (pure math, no ML library needed)
function euclideanDistance(a, b) {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// POST /api/verify-face
// The client extracts the 128-dim face embedding using face-api.js in the browser
// and sends it here. The server only does comparison math + storage.
router.post('/verify-face', authMiddleware, async (req, res) => {
  try {
    const { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      return res.status(400).json({ message: 'No face embedding received' });
    }

    // Validate embedding is an array of numbers
    if (!embedding.every(v => typeof v === 'number' && isFinite(v))) {
      return res.status(400).json({ message: 'Invalid face embedding data' });
    }

    // Fetch all verified users to check for duplicates
    const verifiedUsers = await User.find({ isVerified: true, _id: { $ne: req.user._id } });

    // Threshold for duplicate detection
    // Face embeddings can vary between sessions due to lighting/angle
    // 0.6-0.65 is a good balance: catches same person, doesn't false-positive different people
    const THRESHOLD = 0.65;

    for (let u of verifiedUsers) {
      if (u.faceEmbedding && u.faceEmbedding.length > 0) {
        const distance = euclideanDistance(u.faceEmbedding, embedding);
        if (distance < THRESHOLD) {
          return res.status(403).json({
            message: 'An account already exists with this identity'
          });
        }
      }
    }

    // If no duplicate found, mark face as verified (step 1 complete)
    req.user.faceVerified = true;
    req.user.trustScore = 40;
    req.user.faceEmbedding = embedding;
    await req.user.save();

    res.status(200).json({
      message: 'Face verified successfully',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified,
        faceVerified: req.user.faceVerified,
        documentVerified: req.user.documentVerified,
        trustScore: req.user.trustScore
      }
    });

  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Server error during face verification' });
  }
});

module.exports = router;
