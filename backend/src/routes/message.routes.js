const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Message = require('../models/message.model');
const router = express.Router();

// Fetch message history globally or for specific context easily
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find().populate('sender', 'name').sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch history.', error: error.message });
  }
});

module.exports = router;
