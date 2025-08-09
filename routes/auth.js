const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Восстановление пароля
router.post('/forgot', authController.forgotPassword);

// Сброс пароля
router.post('/reset', authController.resetPassword);

module.exports = router;