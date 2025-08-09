const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middleware/auth');

// Профиль пользователя
router.get('/profile/:id', userController.getProfile);

// Редактирование профиля
router.get('/edit-profile', ensureAuthenticated, userController.showEditProfile);
router.post('/edit-profile', ensureAuthenticated, userController.updateProfile);

// Друзья
router.get('/friends', ensureAuthenticated, userController.getFriends);
router.post('/friends/add/:id', ensureAuthenticated, userController.addFriend);
router.post('/friends/remove/:id', ensureAuthenticated, userController.removeFriend);
router.post('/friends/accept/:id', ensureAuthenticated, userController.acceptFriend);
router.post('/friends/reject/:id', ensureAuthenticated, userController.rejectFriend);

// Группы
router.get('/groups', ensureAuthenticated, userController.getGroups);
router.get('/groups/create', ensureAuthenticated, userController.showCreateGroup);
router.post('/groups/create', ensureAuthenticated, userController.createGroup);

// Уведомления
router.get('/notifications', ensureAuthenticated, userController.getNotifications);
router.post('/notifications/read/:id', ensureAuthenticated, userController.markNotificationRead);
router.post('/notifications/read-all', ensureAuthenticated, userController.markAllNotificationsRead);

module.exports = router;