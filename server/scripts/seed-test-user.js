const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');

const seed = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trustlink';
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        const email = 'test@gmail.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User test@gmail.com already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingUser.password = await bcrypt.hash('test123', salt);
            await existingUser.save();
            console.log('Password updated successfully.');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('test123', salt);

            const newUser = new User({
                name: 'Test Administrator',
                email: email,
                password: hashedPassword,
                trustScore: 40,
                isVerified: false
            });

            await newUser.save();
            console.log('Test user created successfully: test@gmail.com / test123');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
