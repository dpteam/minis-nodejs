const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Получить профиль пользователя
router.get('/', auth, profileController.getProfile);

// Обновить профиль
router.put('/', auth, profileController.updateProfile);

module.exports = router;