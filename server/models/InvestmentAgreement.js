const mongoose = require('mongoose');

const investmentAgreementSchema = new mongoose.Schema({
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'owner_signed', 'investor_signed', 'completed', 'rejected'], 
    default: 'pending' 
  },
  escrowStatus: { 
    type: String, 
    enum: ['holding', 'released', 'refunded'], 
    default: 'holding' 
  },
  ownerVideoUrl: { type: String }, // Stores base64 or storage URL
  investorVideoUrl: { type: String },
  ownerSignatureTimestamp: { type: Date },
  investorSignatureTimestamp: { type: Date },
}, { timestamps: true });

const InvestmentAgreement = mongoose.model('InvestmentAgreement', investmentAgreementSchema);

module.exports = InvestmentAgreement;
