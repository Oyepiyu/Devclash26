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
  walletBalance: {
    type: Number,
    default: 10000 // Give new users fake money to test the platform
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
  role: {
    type: String,
    enum: ['professional', 'organisation_owner', 'investor'],
    default: 'professional'
  },
  successfulInvestments: { type: Number, default: 0 },
  failedInvestments: { type: Number, default: 0 },
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
  // Professional Onboarding Support
  profOnboardingStage: {
    type: Number,
    default: 1, // 1 to 3 stages, 4 is completed
  },
  profProfile: {
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    industry: { type: String, default: '' },
    experience: { type: String, default: '' },
    location: {
      city: String,
      state: String,
      country: String
    },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    openTo: { type: [String], default: [] },
    pastExperience: [{
      company: String,
      role: String,
      duration: String, // from year -> to year
      description: String
    }],
    projects: [{
      name: String,
      description: String,
      techStack: String
    }],
    socialLinks: {
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      others: [{
        label: String,
        url: String
      }]
    },
    resumeUrl: { type: String, default: '' }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
