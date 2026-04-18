const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  faceVerified: {
    type: Boolean,
    default: false,
  },
  documentVerified: {
    type: Boolean,
    default: false,
  },
  trustScore: {
    type: Number,
    default: 0,
  },
  faceEmbedding: {
    type: [Number],
    default: [],
  },
  fullName: {
    type: String,
    default: '',
  },
  dob: {
    type: String,
    default: '',
  },
  age: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
