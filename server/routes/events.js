const express = require('express');
const authMiddleware = require('../middleware/auth');
const Event = require('../models/Event');
const Organisation = require('../models/Organisation');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

const router = express.Router();

function computeTrust(eventData, orgData) {
  let score = 50;
  if(eventData.location && eventData.location.length > 5) score += 10;
  if(eventData.description && eventData.description.length > 50) score += 10;
  
  const daysUntil = (new Date(eventData.date) - new Date()) / (1000 * 60 * 60 * 24);
  if(daysUntil > 14) score += 15;
  else if(daysUntil < 2) score -= 20;

  if(!orgData.isFirstPaidEvent) {
    if(orgData.eventsHosted > 5) score += 20;
    if(orgData.eventsCancelled > 0) score -= (orgData.eventsCancelled * 10);
  }

  return score;
}

// Helper for backward compatibility (Free event)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    if (req.user.intent !== 'organisation') return res.status(403).json({ message: 'Only organisations can create events' });
    const org = await Organisation.findOne({ ownerId: req.user._id });
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    const event = new Event({ ...req.body, organisationId: org._id });
    await event.save();
    res.status(201).json({ message: 'Event created', event });
  } catch (error) { res.status(500).json({ message: 'Error creating event' }); }
});

// Advanced Event Creation with Trust Bounds
router.post('/create-paid', authMiddleware, async (req, res) => {
  try {
    if (req.user.intent !== 'organisation') return res.status(403).json({ message: 'Only organisations can create events' });
    const org = await Organisation.findOne({ ownerId: req.user._id });
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    const { title, description, date, location, type, price, totalCapacity } = req.body;
    
    // Evaluate trust
    const trustScore = computeTrust({title, description, date, location}, org);
    let trustBand = 'Auto-list';
    if (org.isFirstPaidEvent || trustScore < 40) trustBand = 'Admin Review';
    if (trustScore < 20) trustBand = 'Reject';

    if (trustBand === 'Reject') return res.status(400).json({ message: 'Event rejected by trust algorithm.'});

    const event = new Event({
      title, description, organisationId: org._id, date, location, type,
      price: price || 0,
      totalCapacity: totalCapacity || 100,
      trustScore,
      trustBand,
      escrowStatus: price > 0 ? 'Holding' : 'N/A'
    });
    
    await event.save();
    
    if (org.isFirstPaidEvent && price > 0) {
      org.isFirstPaidEvent = false;
      await org.save();
    }

    res.status(201).json({ message: 'Event created', event, trustBand });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Error creating event' }); }
});

// Browse events (Professionals)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Allow Admin Review events to be seen but marked as such
    const events = await Event.find({ trustBand: { $in: ['Auto-list', 'Admin Review'] }, status: 'Upcoming' })
      .populate('organisationId', 'name state verificationStatus trustScore')
      .sort({ date: 1 });
    res.json({ events });
  } catch (error) { res.status(500).json({ message: 'Error fetching events' }); }
});

// My Events (Organisations)
router.get('/my-events', authMiddleware, async (req, res) => {
  try {
    const org = await Organisation.findOne({ ownerId: req.user._id });
    if (!org) return res.status(404).json({ message: 'Not found' });
    
    const events = await Event.find({ organisationId: org._id }).sort({ date: -1 });
    res.json({ events });
  } catch (error) { res.status(500).json({ message: 'Error fetching my events' }); }
});

// My Tickets (Professionals)
router.get('/my-tickets', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id })
      .populate('eventId', 'title date location status escrowStatus')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) { res.status(500).json({ message: 'Error fetching tickets' }); }
});

// Simulated Ticket Purchase & Escrow Holding
router.post('/buy/:eventId', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.ticketsSold >= event.totalCapacity) return res.status(400).json({ message: 'Sold out' });

    const user = await User.findById(req.user._id);
    if (user.walletBalance < event.price) {
      return res.status(400).json({ message: 'Insufficient Wallet balance. Please add funds.' });
    }

    user.walletBalance -= event.price;
    await user.save();

    // Mock payment successful
    const ticket = new Ticket({
      eventId: event._id,
      userId: req.user._id,
      amountPaid: event.price,
      transactionId: `TXN-${Math.floor(Math.random() * 1000000)}`
    });
    await ticket.save();

    event.ticketsSold += 1;
    event.attendees.push(req.user._id);
    await event.save();

    res.json({ message: `Ticket purchased! ₹${event.price} deducted from Wallet.`, ticket });
  } catch (error) { res.status(500).json({ message: 'Error buying ticket' }); }
});

// Cancel Event (From Organiser)
router.post('/cancel/:eventId', authMiddleware, async (req, res) => {
  try {
    const org = await Organisation.findOne({ ownerId: req.user._id });
    if (!org) return res.status(403).json({ message: 'Not an org' });

    const event = await Event.findById(req.params.eventId);
    if (event.organisationId.toString() !== org._id.toString()) return res.status(403).json({ message: 'Unauthorized' });

    // Force 100% refund if Organiser cancels (Attendee protection)
    let refundPct = 100;

    event.status = 'Cancelled';
    event.escrowStatus = 'Refunding';
    await event.save();

    // Issue refunds to Wallets
    const tickets = await Ticket.find({ eventId: event._id });
    for (const ticket of tickets) {
      const user = await User.findById(ticket.userId);
      if (user) {
        const refundAmt = Math.floor(ticket.amountPaid * (refundPct / 100));
        user.walletBalance += refundAmt;
        await user.save();
        ticket.refundStatus = refundPct === 100 ? 'Full' : 'Partial';
        await ticket.save();
      }
    }

    org.eventsCancelled += 1;
    org.trustScore -= 10; // Penalize
    await org.save();

    res.json({ message: `Event Cancelled. Attendees refunded ${refundPct}%.` });
  } catch (error) { res.status(500).json({ message: 'Error cancelling event' }); }
});

// Attendee Dispute
router.post('/dispute/:eventId', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ticket = await Ticket.findOne({ eventId: event._id, userId: req.user._id });
    if (!ticket) return res.status(403).json({ message: 'No ticket found' });

    ticket.disputeRaised = true;
    await ticket.save();

    event.escrowStatus = 'Frozen';
    event.disputes.push({ userId: req.user._id, reason: req.body.reason || 'Event misrepresented' });
    await event.save();

    res.json({ message: 'Dispute raised. Escrow frozen for admin review.' });
  } catch (error) { res.status(500).json({ message: 'Error raising dispute' }); }
});

// Backward compatible join
router.post('/join/:eventId', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      await event.save();
    }
    res.json({ message: 'RSVP confirmed' });
  } catch (error) { res.status(500).json({ message: 'Error joining event' }); }
});

// ============== ADMIN ROUTES ==============

// Get flagged/review-required events
router.get('/flagged', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'priyanshu.s.rathi@gmail.com') return res.status(403).json({ message: 'Forbidden' });
    const events = await Event.find({
      $or: [
        { trustBand: 'Admin Review' },
        { escrowStatus: 'Frozen' },
        { status: 'Upcoming', trustScore: { $lt: 30 } }
      ]
    }).populate('organisationId', 'name trustScore');
    res.json({ events });
  } catch (error) { res.status(500).json({ message: 'Error fetching flagged events' }); }
});

// Admin Action on Event
router.post('/admin-action', authMiddleware, async (req, res) => {
  try {
    if (req.user.email !== 'priyanshu.s.rathi@gmail.com') return res.status(403).json({ message: 'Forbidden' });
    const { eventId, action, reason } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (action === 'APPROVE') {
      event.trustBand = 'Auto-list';
    } else if (action === 'REJECT') {
      event.status = 'Cancelled';
      event.trustBand = 'Reject';
    } else if (action === 'RELEASE_FUNDS') {
      // Release escrow to Org Wallet
      const org = await Organisation.findById(event.organisationId);
      if (org) {
        const totalRelease = event.ticketsSold * event.price;
        org.walletBalance += totalRelease;
        await org.save();
        event.escrowStatus = 'Released';
      }
    } else if (action === 'REFUND_DISPUTE') {
      // Force refund to all ticket holders
      const tickets = await Ticket.find({ eventId: event._id });
      for (const t of tickets) {
        const u = await User.findById(t.userId);
        if (u) {
          u.walletBalance += t.amountPaid;
          await u.save();
          t.refundStatus = 'Full (Admin)';
          await t.save();
        }
      }
      event.status = 'Cancelled';
      event.escrowStatus = 'Refunding';
    }

    await event.save();
    res.json({ message: `Admin action ${action} performed successfully`, event });
  } catch (error) { res.status(500).json({ message: 'Admin action failed' }); }
});

module.exports = router;
