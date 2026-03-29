const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null for a global chat, or specify for DMs
  content: { type: String, required: true },
  isAudio: { type: Boolean, default: false }, // To support the mic feature later
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
