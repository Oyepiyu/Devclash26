const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/document');
const auditRoutes = require('./routes/audit');
const reportRoutes = require('./routes/report');
const professionalRoutes = require('./routes/professional');
const organisationRoutes = require('./routes/organisation');
const feedRoutes = require('./routes/feed');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const networkRoutes = require('./routes/network');
const investmentRoutes = require('./routes/investment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/professional', professionalRoutes);
app.use('/api/organisation', organisationRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/investment', investmentRoutes);

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
