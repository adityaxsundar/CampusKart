const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const Notification = require('../models/notification.model');
const { uploadToImageKit } = require('../middleware/upload');

exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided.' });
    const url = await uploadToImageKit(req.file);
    res.status(200).json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed.' });
  }
};

// Initialize or get a chat for a specific product
exports.getOrCreateChat = async (req, res) => {
  try {
    const { productId, sellerId } = req.body;
    const buyerId = req.user._id;

    if (buyerId.toString() === sellerId) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself.' });
    }

    let chat = await Chat.findOne({
      product: productId,
      participants: { $all: [buyerId, sellerId] }
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [buyerId, sellerId],
        product: productId
      });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not create chat session.', error: error.message });
  }
};

// Fetch all chats for current user
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email profilePic')
    .populate('product', 'title productPic askingPrice price')
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch chats.', error: error.message });
  }
};

// Fetch messages for a specific chat and clear unread count for the current user
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // SECURITY CHECK: Verify user is a participant of this chat
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this conversation.' });
    }

    // Fetch messages
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    
    // Clear unread counts for this chat
    await Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });

    // Mark notifications as read for this chat
    await Notification.updateMany({ chat: chatId, recipient: userId }, { isRead: true });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch history.', error: error.message });
  }
};

// Fetch real-time notifications for the user
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id, isRead: false })
      .populate('sender', 'name profilePic')
      .populate('product', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch notifications.', error: error.message });
  }
};
