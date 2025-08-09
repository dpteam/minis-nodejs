const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { ensureAuthenticated } = require('../middleware/auth');

// Публичные сообщения
router.get('/messages', messageController.getMessages);
router.post('/messages', ensureAuthenticated, messageController.createMessage);
router.delete('/messages/:id', ensureAuthenticated, messageController.deleteMessage);

// Ответы на сообщения
router.post('/messages/:id/reply', ensureAuthenticated, messageController.replyToMessage);

// Лайки/дизлайки
router.post('/messages/:id/like', ensureAuthenticated, messageController.likeMessage);
router.post('/messages/:id/dislike', ensureAuthenticated, messageController.dislikeMessage);

// Приватные сообщения
router.get('/messages/private', ensureAuthenticated, messageController.getPrivateMessages);
router.get('/messages/private/:userId', ensureAuthenticated, messageController.getPrivateConversation);
router.post('/messages/private/:userId', ensureAuthenticated, messageController.sendPrivateMessage);

module.exports = router;