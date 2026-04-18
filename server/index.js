const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const verifyRoutes = require('./routes/verify');
const documentRoutes = require('./routes/document');
const organisationRoutes = require('./routes/organisation');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', verifyRoutes);
app.use('/api', documentRoutes);
app.use('/api/organisation', organisationRoutes);
const reportRoutes = require('./routes/report');
app.use('/api/report', reportRoutes);
const auditRoutes = require('./routes/audit');
app.use('/api/audit', auditRoutes);

// Global Error Handler (catches Multer filter errors)
app.use((err, req, res, next) => {
  if (err) {
    console.error('Express Error:', err.message);
    res.status(400).json({ message: err.message });
  } else {
    next();
  }
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trustlink';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
