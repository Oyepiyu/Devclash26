const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlink';

async function resetSuperuser() {
  try {
    await mongoose.connect(uri);
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'priyanshu.s.rathi@gmail.com' },
      { 
        $set: { 
          intent: 'professional',
          profOnboardingStage: 1,
          faceVerified: true, 
          documentVerified: true 
        } 
      }
    );
    console.log(`Matched ${result.matchedCount} and updated superuser to Professional Onboarding Stage 1.`);
  } catch (err) {
    console.error('Reset failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

resetSuperuser();
