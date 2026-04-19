const express = require('express');
const authMiddleware = require('../middleware/auth');
const Job = require('../models/Job');
const Organisation = require('../models/Organisation');

const router = express.Router();

// Post a job (Organisation only)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (req.user.intent !== 'organisation') {
      return res.status(403).json({ message: 'Only organisations can post jobs' });
    }
    
    // Find the organisation document for this user
    const org = await Organisation.findOne({ ownerId: req.user._id });
    if (!org) return res.status(404).json({ message: 'Organisation profile not found' });

    const { title, description, requirements, salary, location, jobType } = req.body;
    
    const job = new Job({
      title,
      description,
      organisationId: org._id,
      requirements,
      salary,
      location,
      jobType
    });
    
    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Error posting job' });
  }
});

// Browse jobs (Professional users)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' })
      .populate('organisationId', 'name city state verificationStatus')
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Apply to a job
router.post('/apply/:jobId', authMiddleware, async (req, res) => {
  try {
    if (req.user.intent !== 'professional') {
      return res.status(403).json({ message: 'Only professionals can apply to jobs' });
    }
    
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Check if already applied
    const alreadyApplied = job.applications.some(app => app.userId.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });
    
    job.applications.push({ userId: req.user._id });
    await job.save();
    
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application' });
  }
});

module.exports = router;
