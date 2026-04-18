const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  industry: { type: String, required: true },
  foundedYear: { type: Number, required: true },
  size: { type: String, required: true },
  description: { type: String, maxlength: 1000 },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, required: true },
  website: { type: String },
  linkedin: { type: String },
  email: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trustScore: { type: Number, default: 0 },
  verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Fully Verified', 'Rejected'], default: 'Pending' },
  documents: [{
    docType: { type: String },
    fileUrl: { type: String },
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    ocrResult: { type: String },
    nameMatch: { type: Boolean, default: false }
  }],
  domainEmail: { type: String },
  domainVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

const Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;
