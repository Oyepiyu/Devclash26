const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlink';

async function setupSuperuser() {
  try {
    await mongoose.connect(uri);
    
    // Using the schema fields present in User.js
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      intent: String,
      isVerified: Boolean
    });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
    
    const email = 'priyanshu.s.rathi@gmail.com';
    const password = 'superuser123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists. Updating password...');
      existing.password = hashedPassword;
      await existing.save();
    } else {
      console.log('Creating new superuser...');
      const superuser = new User({
        name: 'Priyanshu Rathi',
        email,
        password: hashedPassword,
        intent: 'professional',
        isVerified: true
      });
      await superuser.save();
    }
    
    console.log('--- SUPERUSER CREATED ---');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('-------------------------');
    
  } catch (err) {
    console.error('Setup failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

setupSuperuser();
