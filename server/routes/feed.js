const express = require('express');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Simple storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/posts/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Create a post
router.post('/create', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { content } = req.body;
    const authorType = req.user.intent === 'organisation' ? 'Organisation' : 'User';
    
    const post = new Post({
      content,
      authorId: req.user._id,
      authorType,
      images: req.files ? req.files.map(f => f.path.replace(/\\/g, '/')) : []
    });
    
    await post.save();
    res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Get all posts (Global Feed)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('authorId', 'name email profProfile organisationName')
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

module.exports = router;
