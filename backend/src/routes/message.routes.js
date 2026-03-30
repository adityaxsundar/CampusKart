const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getUserChats, getChatMessages, getOrCreateChat, getUserNotifications, uploadAttachment } = require('../controllers/message.controller');
const router = express.Router();

router.get('/chats', verifyToken, getUserChats);
router.get('/notifications', verifyToken, getUserNotifications);
router.get('/:chatId/messages', verifyToken, getChatMessages);
router.post('/init', verifyToken, getOrCreateChat);
router.post('/upload', verifyToken, upload.single('file'), uploadAttachment);

module.exports = router;
