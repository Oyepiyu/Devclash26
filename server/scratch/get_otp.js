const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlink';

async function getLatestOtp() {
  try {
    await mongoose.connect(uri);
    const orgSchema = new mongoose.Schema({
      otp: String,
      domainEmail: String,
      otpExpires: Date
    });
    const Org = mongoose.models.Organisation || mongoose.model('Organisation', orgSchema, 'organisations');
    
    const latest = await Org.findOne({ otp: { $exists: true } }).sort({ _id: -1 });
    if (latest) {
      console.log('--- OTP FOUND ---');
      console.log('Email:', latest.domainEmail);
      console.log('OTP:', latest.otp);
      console.log('Expires:', latest.otpExpires);
      console.log('-----------------');
    } else {
      console.log('No active OTP found in database.');
    }
  } catch (err) {
    console.error('Error fetching OTP:', err);
  } finally {
    await mongoose.disconnect();
  }
}

getLatestOtp();
