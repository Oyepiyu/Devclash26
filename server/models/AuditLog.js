const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'LEGAL_ACCEPTANCE', 'FINAL_SUBMISSION'
  ipAddress: { type: String },
  userAgent: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }, // Arbitrary metadata
  timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
