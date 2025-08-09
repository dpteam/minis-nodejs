const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Получить профиль пользователя
router.get('/', auth.ensureAuthenticated, profileController.getProfile);

// Обновить профиль
router.put('/', auth.ensureAuthenticated, profileController.updateProfile);

module.exports = router;