const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { authenticateApp } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting для API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
  message: 'Too many API requests, please try again later.'
});

// Применяем rate limiting ко всем API маршрутам
router.use(apiLimiter);

// Публичные API endpoints
router.get('/status', apiController.getStatus);
router.get('/users/:id', apiController.getUser);
router.get('/messages/public', apiController.getPublicMessages);

// Защищенные API endpoints (требуют аутентификации приложения)
router.use(authenticateApp);

// Пользовательские данные
router.get('/me', apiController.getCurrentUser);
router.put('/me', apiController.updateCurrentUser);

// Сообщения
router.get('/messages', apiController.getMessages);
router.post('/messages', apiController.createMessage);
router.delete('/messages/:id', apiController.deleteMessage);

// Друзья
router.get('/friends', apiController.getFriends);
router.post('/friends/:id', apiController.addFriend);
router.delete('/friends/:id', apiController.removeFriend);

// Уведомления
router.get('/notifications', apiController.getNotifications);
router.put('/notifications/:id/read', apiController.markNotificationRead);

// Mini-apps endpoints
router.get('/apps', apiController.getApps);
router.post('/apps', apiController.createApp);
router.delete('/apps/:id', apiController.deleteApp);

module.exports = router;