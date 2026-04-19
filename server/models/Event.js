const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Virtual', 'On-site'], default: 'Virtual' },
  
  // Financial & Ticketing
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  totalCapacity: { type: Number, default: 100 },
  ticketsSold: { type: Number, default: 0 },
  
  // Trust & Moderation
  trustScore: { type: Number, default: 0 },
  trustBand: { type: String, enum: ['Auto-list', 'Admin Review', 'Reject', 'Pending'], default: 'Pending' },
  escrowStatus: { type: String, enum: ['Holding', 'Partial Released', 'Released', 'Frozen', 'Refunding', 'N/A'], default: 'N/A' },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' },
  
  // Disputes
  disputes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    status: { type: String, enum: ['Open', 'Resolved', 'Refunded'], default: 'Open' },
    createdAt: { type: Date, default: Date.now }
  }],
  
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
