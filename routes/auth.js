const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Регистрация
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', validateRegistration, authController.register);

// Вход
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', validateLogin, authController.login);

// Выход
router.get('/logout', authController.logout);

// Сброс пароля
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', { title: 'Forgot Password' });
});

router.post('/forgot-password', authController.forgotPassword);

router.get('/reset-password/:token', authController.showResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;