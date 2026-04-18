const express = require('express');
const AuditLog = require('../models/AuditLog');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Log legal acceptance or other forensic actions
router.post('/log-acceptance', authMiddleware, async (req, res) => {
  try {
    const { orgId, action, details } = req.body;

    // Robust IP detection (supporting Ngrok/proxies)
    const ipAddress = req.headers['x-forwarded-for'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress || 
                      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const userAgent = req.headers['user-agent'];

    const logEntry = new AuditLog({
      orgId,
      userId: req.user._id,
      action: action || 'LEGAL_ACCEPTANCE',
      ipAddress,
      userAgent,
      details: details || {}
    });

    await logEntry.save();
    console.log(`[TrustLink AUDIT] Forensic log created for user ${req.user._id} at IP ${ipAddress}`);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Audit Log Error:', error);
    res.status(500).json({ message: 'Internal server error while logging forensic data' });
  }
});

module.exports = router;
