const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// High-Profile Impersonation Watchlist
const HIGH_PROFILE_WATCHLIST = [
  'elon musk', 'sundar pichai', 'narendra modi', 
  'mark zuckerberg', 'ratan tata', 'mukesh ambani', 'jeff bezos'
];

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doc_${req.user._id}_${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tiff', '.heic'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowed.includes(ext) || (file.mimetype && file.mimetype.startsWith('image/'))) {
      cb(null, true);
    } else {
      req.fileValidationError = 'Only image files (JPG, PNG) are allowed. PDFs are not supported.';
      cb(null, false);
    }
  }
});

// Helper: Normalize text for comparison
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s\/\-\.]/g, '').replace(/\s+/g, ' ').trim();
}

// Helper: Euclidean Distance for Face Embeddings
function euclideanDistance(emb1, emb2) {
  let sum = 0;
  for (let i = 0; i < emb1.length; i++) {
    sum += Math.pow(emb1[i] - emb2[i], 2);
  }
  return Math.sqrt(sum);
}

// Helper: Simple Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Helper: Check if a name appears in OCR text
function nameMatchesOCR(userName, ocrText) {
  const normalizedOCR = normalize(ocrText);
  const normalizedName = normalize(userName);
  
  if (normalizedOCR.includes(normalizedName)) return { matched: true, confidence: 'high' };

  const nameParts = normalizedName.split(' ').filter(p => p.length > 1);
  if (nameParts.length === 0) return { matched: false, confidence: 'none' };

  let matchedParts = 0;
  for (const part of nameParts) {
    const words = normalizedOCR.split(' ');
    for (const word of words) {
      if (word === part || levenshtein(word, part) <= 1) {
        matchedParts++;
        break;
      }
    }
  }

  const ratio = matchedParts / nameParts.length;
  if (ratio >= 0.8) return { matched: true, confidence: 'high' };
  if (ratio >= 0.6) return { matched: true, confidence: 'medium' };
  return { matched: false, confidence: 'low', matchRatio: ratio };
}

// Helper: Check if DOB appears in OCR text
function dobMatchesOCR(dob, ocrText) {
  const normalizedOCR = normalize(ocrText);
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dayPad = String(day).padStart(2, '0');
  const monthPad = String(month).padStart(2, '0');
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthName = monthNames[month - 1];
  
  const formats = [
    `${dayPad}/${monthPad}/${year}`, `${dayPad}-${monthPad}-${year}`, `${dayPad}.${monthPad}.${year}`,
    `${monthPad}/${dayPad}/${year}`, `${year}-${monthPad}-${dayPad}`, `${day}/${month}/${year}`,
    `${dayPad} ${monthName} ${year}`, `${day} ${monthName} ${year}`, `${dayPad}/${monthPad}/${String(year).slice(2)}`,
    `${dayPad}-${monthPad}-${String(year).slice(2)}`, `${year}`,
  ];
  
  for (const fmt of formats) {
    if (normalizedOCR.includes(fmt)) return true;
  }
  return false;
}

// Helper: Check if age is consistent with DOB
function ageMatchesDOB(age, dob) {
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return false;
  
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }
  return Math.abs(calculatedAge - age) <= 1;
}

// POST /api/verify-document
router.post('/verify-document', authMiddleware, upload.single('document'), async (req, res) => {
  console.log(`[TrustLink v3] Verification Request Received for User: ${req.user.name}`);
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    const { fullName, dob, age, documentFaceEmbedding } = req.body;
    const file = req.file;

    console.log(`[TrustLink v3] Incoming Fields: ${JSON.stringify({ fullName, dob, age, hasEmbedding: !!documentFaceEmbedding })}`);


    if (!fullName || !dob || !age) {
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Please provide full name, date of birth, and age' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Please upload an identity document image' });
    }

    if (!req.user.faceVerified) {
      fs.unlinkSync(file.path);
      return res.status(403).json({ message: 'Please complete face verification first' });
    }

    if (!ageMatchesDOB(parseInt(age), dob)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Age does not match the date of birth provided' });
    }

    // --- 1. FACE TO ID MATCHING ---
    if (!documentFaceEmbedding || documentFaceEmbedding === 'null') {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Face matching failed: No clear face detected on the ID document.' });
    }

    const docEmbedding = JSON.parse(documentFaceEmbedding);
    if (!docEmbedding || docEmbedding.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Face matching failed: Invalid face embedding array.' });
    }

    // --- REFRESH USER STATE TO PREVENT CACHING LEAKS ---
    const freshUser = await User.findById(req.user._id);
    if (!freshUser || !freshUser.faceEmbedding || freshUser.faceEmbedding.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(403).json({ message: 'Security check failed: No valid live biometric signature found for this account. Re-verify your face.' });
    }

    const distance = euclideanDistance(freshUser.faceEmbedding, docEmbedding);
    
    // --- DEEP IDENTITY LOGGING ---
    console.log(`[TrustLink SECURITY v4.5] User ID: ${freshUser._id}`);
    console.log(`[TrustLink SECURITY v4.5] Live Vector Sample: ${freshUser.faceEmbedding.slice(0, 3)}...`);
    console.log(`[TrustLink SECURITY v4.5] Doc Vector Sample: ${docEmbedding.slice(0, 3)}...`);
    console.log(`[TrustLink SECURITY v4.5] Calculated Distance: ${distance.toFixed(3)} | Threshold: 0.80`);

    // --- SECURITY CHECKS ---
    // 1. Data Integrity: Both must be 128-dim vectors
    if (freshUser.faceEmbedding.length !== 128 || docEmbedding.length !== 128) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Security check failed: Corrupted facial biometric data structure.' });
    }

    // 2. Anti-Bypass: Exactly 0 distance is mathematically impossible for separate sessions
    if (distance === 0) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Security check failed: Invalid identical embedding bypass detected.' });
    }

    // 3. Mathematical Result: Recalibrated for extreme document variance (0.80)
    if (distance > 0.80) {
      fs.unlinkSync(file.path);
      console.log(`❌ BLOCKING ID MATCH: Distance ${distance.toFixed(3)} exceeds 0.80 safety margin.`);
      
      // Calculate a more intuitive human percentage (0.80 dist = 0%, 0.0 dist = 100%)
      const matchPercent = Math.max(0, Math.min(100, Math.round((1 - (distance / 0.80)) * 100)));
      
      return res.status(400).json({ 
        message: `[v4.5] Identity Mismatch: The face on the document does not biologically match (Match Quality: ${matchPercent}%).` 
      });
    }

    // --- 2. DOCUMENT OCR PROCESSING ---
    console.log(`Starting OCR for user ${req.user._id}...`);
    const { data: { text: ocrText } } = await Tesseract.recognize(file.path, 'eng');
    fs.unlinkSync(file.path); // Cleanup

    if (!ocrText || ocrText.trim().length < 5) {
      return res.status(400).json({ message: 'Could not read text from the document. Please upload a clearer image.' });
    }

    const nameResult = nameMatchesOCR(fullName, ocrText);
    const dobResult = dobMatchesOCR(dob, ocrText);

    if (!nameResult.matched) {
      return res.status(400).json({ message: 'Name does not match the uploaded document.' });
    }

    if (!dobResult) {
      return res.status(400).json({ message: 'Date of birth not found in the uploaded document.' });
    }

    // --- 3. HIGH PROFILE WATCHLIST IMPERSONATION CHECK ---
    let finalVerified = true;
    let finalScore = 60;
    
    const matchedNameNorm = normalize(fullName);
    const isHighProfile = HIGH_PROFILE_WATCHLIST.some(name => matchedNameNorm.includes(name) || levenshtein(matchedNameNorm, name) <= 2);

    if (isHighProfile) {
      console.log(`⚠️ HIGH PROFILE IMPERSONATION FLAG DETECTED for user ${req.user._id} (${fullName}). Routing to Manual Review.`);
      finalVerified = false; // Flag account, do not grant dashboard access
      finalScore = 50; // "Pending Manual Review" score tier
    }

    // --- 4. UPDATE USER ---
    req.user.documentVerified = true;
    req.user.isVerified = finalVerified;
    req.user.trustScore = finalScore;
    req.user.fullName = fullName;
    req.user.dob = dob;
    req.user.age = parseInt(age);
    await req.user.save();

    res.status(200).json({
      message: isHighProfile ? 'Identity requires manual review by administration.' : 'Document verified successfully',
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
    console.error('Document Verification Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error during document verification' });
  }
});

module.exports = router;
