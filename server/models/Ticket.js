const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  refundStatus: {
    type: String,
    enum: ['None', 'Requested', 'Partial', 'Full', 'Rejected'],
    default: 'None'
  },
  disputeRaised: {
    type: Boolean,
    default: false
  },
  transactionId: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
