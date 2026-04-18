const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Multer config for org documents
const orgDocsDir = path.join(__dirname, '../uploads/org_docs');
if (!fs.existsSync(orgDocsDir)) {
  fs.mkdirSync(orgDocsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, orgDocsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}_${Date.now()}_${file.fieldname}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper: Normalize text for comparison
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

// Helper: Calculate Trust Score
function calculateTrustScore(org, user) {
  let score = 10; // Basic details (+10)
  
  // Documents
  org.documents.forEach(doc => {
    if (doc.docType === 'GST') score += 20;
    if (doc.docType === 'COI') {
      score += 20;
      if (doc.nameMatch) score += 10; // Extra 10 for name match (+30 total for COI)
    }
    if (doc.docType === 'PAN') score += 10;
    if (doc.docType === 'Authorization Letter') score += 15;
  });

  // Domain
  if (org.domainVerified) score += 20;
  
  // Role
  if (['Founder', 'Director'].some(r => user.orgRole.includes(r))) score += 10;

  return score;
}

// STAGE 1: Basic Company Details
router.post('/stage1', authMiddleware, async (req, res) => {
  try {
    const {
      name, type, industry, foundedYear, size, description,
      address, city, state, pinCode, country,
      website, linkedin, email
    } = req.body;

    // Check if user already created an org
    if (req.user.organisationId) {
      return res.status(400).json({ message: 'Organisation already exists for this user' });
    }

    const newOrg = new Organisation({
      name, type, industry, foundedYear, size, description,
      address, city, state, pinCode, country,
      website, linkedin, email,
      ownerId: req.user._id
    });

    await newOrg.save();

    // Update user
    req.user.organisationId = newOrg._id;
    req.user.orgOnboardingStage = 2;
    await req.user.save();

    res.status(200).json({
      message: 'Stage 1 completed successfully',
      user: {
        ...req.user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Stage 1 Error:', error);
    res.status(500).json({ message: 'Server error processing Stage 1' });
  }
});

// STAGE 2: Role Claim Verification
router.post('/stage2', authMiddleware, async (req, res) => {
  try {
    const { role, proofText } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    if (role === 'Employee') {
      return res.status(403).json({ message: 'Employees cannot register a company. Please ask your admin.' });
    }

    req.user.orgRole = role;
    req.user.orgProof = proofText || '';
    req.user.orgOnboardingStage = 3;
    await req.user.save();

    res.status(200).json({
      message: 'Stage 2 completed successfully',
      user: {
        ...req.user.toObject(),
        password: undefined
      }
    });

  } catch (error) {
    console.error('Stage 2 Error:', error);
    res.status(500).json({ message: 'Server error processing Stage 2' });
  }
});

// STAGE 3: Document Uploads
router.post('/stage3', authMiddleware, upload.any(), async (req, res) => {
  try {
    const org = await Organisation.findById(req.user.organisationId);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one primary document' });
    }

    const docEntries = [];
    
    for (const file of files) {
      const docType = file.fieldname;
      let nameMatch = false;
      let ocrText = '';

      // Run OCR for COI/GST to attempt name match with user.fullName
      // For hackathon, we only run it on COI if it is provided
      if (docType === 'COI' && req.user.fullName) {
        try {
          const { data: { text } } = await Tesseract.recognize(file.path, 'eng');
          ocrText = text;
          const normalizedOCR = normalize(ocrText);
          const normalizedUser = normalize(req.user.fullName);
          if (normalizedOCR.includes(normalizedUser)) {
            nameMatch = true;
          }
        } catch (ocrErr) {
          console.error('OCR Error in Stage 3:', ocrErr);
        }
      }

      docEntries.push({
        docType,
        fileUrl: file.path,
        status: 'Verified', // Auto-approving for hackathon
        ocrResult: ocrText.substring(0, 500),
        nameMatch
      });
    }

    org.documents = docEntries;
    org.trustScore = calculateTrustScore(org, req.user);
    await org.save();

    req.user.orgOnboardingStage = 4;
    await req.user.save();

    res.status(200).json({
      message: 'Stage 3 completed',
      user: {
        ...req.user.toObject(),
        password: undefined
      },
      trustScore: org.trustScore
    });

  } catch (error) {
    console.error('Stage 3 Error:', error);
    res.status(500).json({ message: 'Server error in Stage 3' });
  }
});

// STAGE 4: Domain Email OTP
router.post('/stage4/send-otp', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const org = await Organisation.findById(req.user.organisationId);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    // Basic domain check
    const emailDomain = email.split('@')[1];
    const websiteDomain = org.website ? org.website.replace(/https?:\/\/|www\./g, '').split('/')[0] : '';
    
    if (websiteDomain && !emailDomain.includes(websiteDomain)) {
      console.warn(`Email domain ${emailDomain} might not match website ${websiteDomain}`);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    org.otp = otp;
    org.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    org.domainEmail = email;
    await org.save();

    // MOCK EMAIL LOG
    console.log('\n=========================================');
    console.log(`VERIFICATION OTP FOR ${email}: ${otp}`);
    console.log('=========================================\n');

    res.status(200).json({ message: 'OTP sent to your email (Check console for demo)' });

  } catch (error) {
    console.error('Stage 4 Send Error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
});

router.post('/stage4/verify-otp', authMiddleware, async (req, res) => {
  try {
    const { otp } = req.body;
    const org = await Organisation.findById(req.user.organisationId);
    
    if (!org || org.otp !== otp || Date.now() > org.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    org.domainVerified = true;
    org.otp = undefined;
    org.otpExpires = undefined;
    org.trustScore = calculateTrustScore(org, req.user);

    // STAGE 5: FINAL APPROVAL LOGIC
    if (org.trustScore > 80) {
      org.verificationStatus = 'Fully Verified';
    } else if (org.trustScore > 30) {
      org.verificationStatus = 'Verified';
    } else {
      org.verificationStatus = 'Pending';
    }

    await org.save();

    req.user.orgOnboardingStage = 5; // Dashboard unlocked
    req.user.isVerified = true; 
    await req.user.save();

    res.status(200).json({
      message: 'Email verified successfully! Profile approved.',
      user: {
        ...req.user.toObject(),
        password: undefined
      },
      verificationStatus: org.verificationStatus,
      trustScore: org.trustScore
    });

  } catch (error) {
    console.error('Stage 4 Verify Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
});

module.exports = router;
