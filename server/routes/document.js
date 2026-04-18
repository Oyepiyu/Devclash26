const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

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
    
    // Some phones upload without extension but image mimetype
    if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      req.fileValidationError = 'Only image files (JPG, PNG) are allowed. PDFs are not supported.';
      cb(null, false);
    }
  }
});

// Helper: Normalize text for comparison (remove extra spaces, lowercase)
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s\/\-\.]/g, '').replace(/\s+/g, ' ').trim();
}

// Helper: Check if a name appears in OCR text
// Strategy: Split name into parts, check if enough parts match
function nameMatchesOCR(userName, ocrText) {
  const normalizedOCR = normalize(ocrText);
  const normalizedName = normalize(userName);
  
  // Direct full-name match
  if (normalizedOCR.includes(normalizedName)) {
    return { matched: true, confidence: 'high' };
  }

  // Split into parts and check individual words
  const nameParts = normalizedName.split(' ').filter(p => p.length > 1);
  if (nameParts.length === 0) return { matched: false, confidence: 'none' };

  let matchedParts = 0;
  for (const part of nameParts) {
    // Check if this name part exists as a word in the OCR text
    // Use word boundary-like matching
    const words = normalizedOCR.split(' ');
    for (const word of words) {
      // Fuzzy: allow 1 character difference for OCR errors
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

// Helper: Check if DOB appears in OCR text in any common format
function dobMatchesOCR(dob, ocrText) {
  const normalizedOCR = normalize(ocrText);
  
  // Parse the input DOB (expecting YYYY-MM-DD from date input)
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const dayPad = String(day).padStart(2, '0');
  const monthPad = String(month).padStart(2, '0');
  
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthName = monthNames[month - 1];
  
  // Generate all common date formats to search for
  const formats = [
    `${dayPad}/${monthPad}/${year}`,       // DD/MM/YYYY
    `${dayPad}-${monthPad}-${year}`,       // DD-MM-YYYY
    `${dayPad}.${monthPad}.${year}`,       // DD.MM.YYYY
    `${monthPad}/${dayPad}/${year}`,       // MM/DD/YYYY
    `${year}-${monthPad}-${dayPad}`,       // YYYY-MM-DD
    `${day}/${month}/${year}`,             // D/M/YYYY
    `${dayPad} ${monthName} ${year}`,      // DD Mon YYYY
    `${day} ${monthName} ${year}`,         // D Mon YYYY
    `${dayPad}/${monthPad}/${String(year).slice(2)}`, // DD/MM/YY
    `${dayPad}-${monthPad}-${String(year).slice(2)}`, // DD-MM-YY
    `${year}`,                             // Just year (fallback)
  ];
  
  for (const fmt of formats) {
    if (normalizedOCR.includes(fmt)) {
      return true;
    }
  }
  
  // Also check if year exists in text (weak but useful for partial matches)  
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
  
  // Allow ±1 year difference
  return Math.abs(calculatedAge - age) <= 1;
}

// Simple Levenshtein distance for fuzzy matching (handles OCR typos)
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

// POST /api/verify-document
router.post('/verify-document', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    const { fullName, dob, age } = req.body;
    const file = req.file;

    if (!fullName || !dob || !age) {
      return res.status(400).json({ message: 'Please provide full name, date of birth, and age' });
    }

    if (!file) {
      return res.status(400).json({ message: 'Please upload an identity document image' });
    }

    // Check that face verification was done first
    if (!req.user.faceVerified) {
      return res.status(403).json({ message: 'Please complete face verification first' });
    }

    // Check age/DOB consistency
    if (!ageMatchesDOB(parseInt(age), dob)) {
      // Cleanup uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Age does not match the date of birth provided' });
    }

    console.log(`Starting OCR for user ${req.user._id}...`);
    
    // Run OCR on the uploaded document
    const { data: { text: ocrText } } = await Tesseract.recognize(file.path, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });

    console.log('OCR Text extracted:', ocrText.substring(0, 200) + '...');

    // Cleanup uploaded file after OCR
    fs.unlinkSync(file.path);

    if (!ocrText || ocrText.trim().length < 5) {
      return res.status(400).json({ 
        message: 'Could not read text from the uploaded document. Please upload a clearer image.' 
      });
    }

    // Check name match
    const nameResult = nameMatchesOCR(fullName, ocrText);
    
    // Check DOB match
    const dobResult = dobMatchesOCR(dob, ocrText);

    console.log(`Name match: ${JSON.stringify(nameResult)}, DOB match: ${dobResult}`);

    if (!nameResult.matched) {
      return res.status(400).json({ 
        message: 'Name does not match the uploaded document. Please ensure you enter your name exactly as it appears on the document.' 
      });
    }

    if (!dobResult) {
      return res.status(400).json({ 
        message: 'Date of birth not found in the uploaded document. Please upload a document that contains your DOB.' 
      });
    }

    // Both matched! Update user
    req.user.documentVerified = true;
    req.user.isVerified = true; // Now fully verified
    req.user.trustScore = 60;
    req.user.fullName = fullName;
    req.user.dob = dob;
    req.user.age = parseInt(age);
    await req.user.save();

    res.status(200).json({
      message: 'Document verified successfully',
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
    // Cleanup file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error during document verification' });
  }
});

module.exports = router;
