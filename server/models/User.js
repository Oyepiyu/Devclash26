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
  intent: {
    type: String,
    enum: ['professional', 'organisation'],
    default: null,
  },
  orgOnboardingStage: {
    type: Number,
    default: 1,
  },
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    default: null,
  },
  orgRole: {
    type: String,
    default: '',
  },
  orgProof: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
