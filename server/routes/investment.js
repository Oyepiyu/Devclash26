const express = require('express');
const authMiddleware = require('../middleware/auth');
const InvestmentAgreement = require('../models/InvestmentAgreement');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

const router = express.Router();

// Middleware: Check if user owns the organisation
const checkOwnerAccess = async (req, res, next) => {
  try {
    const org = await Organisation.findById(req.params.organisationId || req.body.organisationId);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });
    if (org.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. Only the owner can perform this action.' });
    }
    req.organisation = org;
    next();
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
};

// 1. Initiate Investment (Investor Starts)
router.post('/initiate/:organisationId', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid investment amount' });

    const org = await Organisation.findById(req.params.organisationId);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    const investor = await User.findById(req.user._id);
    if (investor.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance for investment' });
    }

    // Deduct and hold in escrow
    investor.walletBalance -= amount;
    await investor.save();

    const agreement = new InvestmentAgreement({
      organisationId: org._id,
      ownerId: org.ownerId,
      investorId: investor._id,
      amount,
      status: 'pending',
      escrowStatus: 'holding'
    });

    await agreement.save();
    res.status(201).json({ message: 'Investment initiated and funds held in escrow.', agreement });
  } catch (error) { res.status(500).json({ message: 'Error initiating investment' }); }
});

// 2. Sign as Owner (with Video & Fingerprint Verification)
router.post('/sign-owner/:agreementId', authMiddleware, async (req, res) => {
  try {
    const { videoData } = req.body; // base64 video string
    const agreement = await InvestmentAgreement.findById(req.params.agreementId);
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

    const org = await Organisation.findById(agreement.organisationId);
    if (org.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organisation owner can sign this agreement' });
    }

    const user = await User.findById(req.user._id);
    if (!user.faceVerified) return res.status(400).json({ message: 'Face verification required before signing' });

    // Mock Face Embedding Comparison (In prod, we'd extract from videoData frame)
    // For now, we assume the frontend sends the frame that matched.
    
    agreement.status = 'owner_signed';
    agreement.ownerVideoUrl = videoData; // Storing as base64 for now
    agreement.ownerSignatureTimestamp = new Date();
    await agreement.save();

    res.json({ message: 'Owner signature recorded successfully.', agreement });
  } catch (error) { res.status(500).json({ message: 'Error signing agreement' }); }
});

// 3. Sign as Investor
router.post('/sign-investor/:agreementId', authMiddleware, async (req, res) => {
  try {
    const agreement = await InvestmentAgreement.findById(req.params.agreementId);
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

    if (agreement.investorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the designated investor can sign' });
    }

    agreement.investorSignatureTimestamp = new Date();
    
    if (agreement.status === 'owner_signed') {
      agreement.status = 'completed';
    } else {
      agreement.status = 'investor_signed';
    }
    
    await agreement.save();

    // If both signed, trigger trust score update
    if (agreement.status === 'completed') {
      const org = await Organisation.findById(agreement.organisationId);
      org.trustScore += 5;
      await org.save();

      const investor = await User.findById(agreement.investorId);
      investor.successfulInvestments += 1;
      await investor.save();
    }

    res.json({ message: 'Investor signature recorded.', agreement });
  } catch (error) { res.status(500).json({ message: 'Error signing agreement' }); }
});

// 4. Get My Agreements (For Dashboards)
router.get('/my-agreements', authMiddleware, async (req, res) => {
  try {
    const agreements = await InvestmentAgreement.find({
      $or: [
        { ownerId: req.user._id },
        { investorId: req.user._id }
      ]
    })
    .populate('organisationId', 'name website verifiedOwnerStatus')
    .populate('ownerId', 'name email')
    .populate('investorId', 'name email')
    .sort({ createdAt: -1 });

    res.json({ agreements });
  } catch (error) { res.status(500).json({ message: 'Error fetching agreements' }); }
});

// 5. Admin Routes for Investment
router.get('/flagged', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'priyanshu.s.rathi@gmail.com') return res.status(403).json({ message: 'Forbidden' });
    const agreements = await InvestmentAgreement.find({ escrowStatus: 'holding' })
      .populate('organisationId', 'name')
      .populate('ownerId', 'name')
      .populate('investorId', 'name');
    res.json({ agreements });
  } catch (error) { res.status(500).json({ message: 'Error fetching agreements' }); }
});

router.post('/admin-action', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'priyanshu.s.rathi@gmail.com') return res.status(403).json({ message: 'Forbidden' });
    const { agreementId, action } = req.body;
    const agreement = await InvestmentAgreement.findById(agreementId);
    
    if (action === 'RELEASE') {
      const org = await Organisation.findById(agreement.organisationId);
      org.walletBalance += agreement.amount;
      agreement.escrowStatus = 'released';
      await org.save();
    } else if (action === 'REFUND') {
      const u = await User.findById(agreement.investorId);
      u.walletBalance += agreement.amount;
      agreement.escrowStatus = 'refunded';
      agreement.status = 'rejected';
      await u.save();
    }
    
    await agreement.save();
    res.json({ message: `Investment ${action}ed successfully.` });
  } catch (error) { res.status(500).json({ message: 'Action failed' }); }
});

module.exports = router;
