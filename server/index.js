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
const { MongoMemoryServer } = require('mongodb-memory-server');
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB successfully');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB', err);
    });
} else {
  console.log('No MONGODB_URI detected. Starting an In-Memory MongoDB... (Data will be lost on restart)');
  MongoMemoryServer.create().then((mongoServer) => {
    mongoose.connect(mongoServer.getUri(), { dbName: 'trustlink' })
      .then(() => {
        console.log(`Connected to In-Memory MongoDB at ${mongoServer.getUri()} successfully`);
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      })
      .catch((err) => {
        console.error('Failed to connect to In-Memory MongoDB', err);
      });
  });
}
