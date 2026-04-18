const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Organisation = require('../models/Organisation');
const router = express.Router();

// Define a Report schema inline
const reportSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

// TASK 3: Submit a Community Report
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { orgId, reason, details } = req.body;

    // Validate orgId and reason exist
    if (!orgId || !reason) {
      return res.status(400).json({ message: 'Organisation ID and reason are required' });
    }

    // Save new Report
    const newReport = new Report({
      orgId,
      reporterId: req.user._id,
      reason,
      details: details || ''
    });

    await newReport.save();

    // Count all pending reports for this org
    const pendingReportsCount = await Report.countDocuments({ 
      orgId, 
      status: 'pending' 
    });

    // If count >= 3: update Organisation to Rejected
    if (pendingReportsCount >= 3) {
      await Organisation.findByIdAndUpdate(orgId, {
        verificationStatus: 'Rejected',
        suspendedReason: 'Multiple community reports received'
      });
      console.log(`[TrustLink SECURITY] Organisation ${orgId} auto-rejected due to ${pendingReportsCount} community reports.`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Report submitted successfully' 
    });

  } catch (error) {
    console.error('Report Submit Error:', error);
    res.status(500).json({ message: 'Internal server error while submitting report' });
  }
});

module.exports = router;
