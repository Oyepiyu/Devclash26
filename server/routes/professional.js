const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Resume upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/resumes/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Stage 1: Personal & Work Details
router.put('/stage1', authMiddleware, async (req, res) => {
  try {
    const { title, company, employmentType, industry, experience, location, bio } = req.body;
    
    req.user.profProfile.title = title;
    req.user.profProfile.company = company;
    req.user.profProfile.employmentType = employmentType;
    req.user.profProfile.industry = industry;
    req.user.profProfile.experience = experience;
    req.user.profProfile.location = location;
    req.user.profProfile.bio = bio;
    
    req.user.profOnboardingStage = 2;
    await req.user.save();
    
    res.json({ message: 'Stage 1 complete', user: req.user });
  } catch (error) {
    console.error('Prof Stage 1 Error:', error);
    res.status(500).json({ message: 'Error saving personal details' });
  }
});

// Stage 2: Skills, Experience & Projects
router.put('/stage2', authMiddleware, async (req, res) => {
  try {
    const { skills, openTo, pastExperience, projects } = req.body;
    
    req.user.profProfile.skills = skills;
    req.user.profProfile.openTo = openTo;
    req.user.profProfile.pastExperience = pastExperience;
    req.user.profProfile.projects = projects;
    
    req.user.profOnboardingStage = 3;
    await req.user.save();
    
    res.json({ message: 'Stage 2 complete', user: req.user });
  } catch (error) {
    console.error('Prof Stage 2 Error:', error);
    res.status(500).json({ message: 'Error saving skills and experience' });
  }
});

// Stage 3: Links & Social presence (Includes Resume Upload)
router.put('/stage3', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const { socialLinks } = req.body;
    
    // socialLinks might be stringified if sent with FormData for file upload
    const parsedLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    
    req.user.profProfile.socialLinks = parsedLinks;
    
    if (req.file) {
      req.user.profProfile.resumeUrl = req.file.path.replace(/\\/g, '/');
    }
    
    req.user.profOnboardingStage = 4; // Completed
    await req.user.save();
    
    res.json({ message: 'Onboarding complete', user: req.user });
  } catch (error) {
    console.error('Prof Stage 3 Error:', error);
    res.status(500).json({ message: 'Error saving social links and resume' });
  }
});

module.exports = router;
