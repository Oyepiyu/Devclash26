require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testDistance() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trustlink');
  const user = await User.findOne().sort({ createdAt: -1 });
  if (!user) {
    console.log("No user found.");
    process.exit(0);
  }
  console.log('Latest User:', user.name);
  console.log('FaceVerified:', user.faceVerified);
  console.log('DocVerified:', user.documentVerified);
  console.log('IsVerified:', user.isVerified);
  console.log('TrustScore:', user.trustScore);
  if (user.faceEmbedding && user.faceEmbedding.length > 0) {
    console.log('Face Embedding length:', user.faceEmbedding.length);
    console.log('Sample of Face Embedding:', user.faceEmbedding.slice(0, 5));
  } else {
    console.log('Face Embedding is EMPTY!');
  }
  process.exit(0);
}

testDistance();
