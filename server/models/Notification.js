const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['ConnectionRequest', 'ConnectionAccepted', 'NewMessage', 'JobApplication', 'Like', 'Comment'],
    required: true
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organisationSender: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' },
  data: {
    postId: mongoose.Schema.Types.ObjectId,
    jobId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId,
    messageId: mongoose.Schema.Types.ObjectId
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
