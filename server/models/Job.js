const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
  requirements: [{ type: String }],
  salary: { type: String },
  location: { type: String },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Freelance', 'Contract'], default: 'Full-time' },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  applications: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    appliedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
