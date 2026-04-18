const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlink';

async function fixSuperuser() {
  try {
    await mongoose.connect(uri);
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'priyanshu.s.rathi@gmail.com' },
      { 
        $set: { 
          faceVerified: true, 
          documentVerified: true, 
          orgOnboardingStage: 5, 
          trustScore: 100 
        } 
      }
    );
    console.log(`Matched ${result.matchedCount} and modified ${result.modifiedCount} accounts.`);
  } catch (err) {
    console.error('Fix failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

fixSuperuser();
