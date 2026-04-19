const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

const router = express.Router();

// Search people and orgs
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ people: [], organisations: [] });

    const regex = new RegExp(q, 'i');
    
    const people = await User.find({ 
      $or: [{ name: regex }, { 'profProfile.title': regex }, { 'profProfile.skills': regex }],
      _id: { $ne: req.user._id }
    }).select('name email profProfile trustScore faceVerified isVerified');
    
    const organisations = await Organisation.find({
      $or: [{ name: regex }, { industry: regex }, { city: regex }]
    }).select('name industry city state verificationStatus');
    
    res.json({ people, organisations });
  } catch (error) {
    res.status(500).json({ message: 'Error performing search' });
  }
});

// Send connection request
router.post('/connect/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: targetUserId },
        { requester: targetUserId, recipient: req.user._id }
      ]
    });

    if (existing) return res.status(400).json({ message: 'Connection already exists or pending' });

    const conn = new Connection({ requester: req.user._id, recipient: targetUserId });
    await conn.save();

    // Notify recipient
    const notif = new Notification({
      recipient: targetUserId,
      type: 'ConnectionRequest',
      sender: req.user._id
    });
    await notif.save();

    res.json({ message: 'Connection request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending request' });
  }
});

// Accept connection
router.post('/accept/:connectionId', authMiddleware, async (req, res) => {
  try {
    const conn = await Connection.findById(req.params.connectionId);
    if (!conn) return res.status(404).json({ message: 'Connection not found' });
    if (conn.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    conn.status = 'Accepted';
    await conn.save();

    // Notify requester
    const notif = new Notification({
      recipient: conn.requester,
      type: 'ConnectionAccepted',
      sender: req.user._id
    });
    await notif.save();

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting connection' });
  }
});

// My Network (Accepted connections)
router.get('/my-network', authMiddleware, async (req, res) => {
  try {
    const conns = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'Accepted'
    }).populate('requester recipient', 'name email profProfile trustScore');
    
    // Flatten to list of users excluding self
    const network = conns.map(c => {
      return c.requester._id.toString() === req.user._id.toString() ? c.recipient : c.requester;
    });
    
    res.json({ network });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching network' });
  }
});

// Notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark all as read
router.put('/notifications/read', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

module.exports = router;
