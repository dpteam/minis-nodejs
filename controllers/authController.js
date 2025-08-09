const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');
const config = require('../config/app');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('auth/register', {
          title: 'Register',
          errors: errors.array(),
          formData: req.body,
        });
      }

      const { firstName, lastName, email, password } = req.body;

      // Проверяем, существует ли пользователь
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).render('auth/register', {
          title: 'Register',
          errors: [{ msg: 'Email already registered' }],
          formData: req.body,
        });
      }

      // Создаем пользователя
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
      });

      // Создаем JWT токен
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiration }
      );

      // Сохраняем токен в сессии
      req.session.token = token;
      req.session.user = user;

      res.redirect('/');
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).render('error', {
        message: 'Error during registration',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('auth/login', {
          title: 'Login',
          errors: errors.array(),
          formData: req.body,
        });
      }

      const { email, password } = req.body;

      // Находим пользователя
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).render('auth/login', {
          title: 'Login',
          errors: [{ msg: 'Invalid credentials' }],
          formData: req.body,
        });
      }

      // Проверяем пароль
      const isValidPassword = await user.validPassword(password);
      if (!isValidPassword) {
        return res.status(400).render('auth/login', {
          title: 'Login',
          errors: [{ msg: 'Invalid credentials' }],
          formData: req.body,
        });
      }

      // Обновляем время последней активности
      await user.update({ lastActivityTime: Math.floor(Date.now() / 1000) });

      // Создаем JWT токен
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: config.jwtExpiration }
      );

      // Сохраняем токен в сессии
      req.session.token = token;
      req.session.user = user;

      res.redirect('/');
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).render('error', {
        message: 'Error during login',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  logout(req, res) {
    req.session.destroy();
    res.redirect('/login');
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });

      if (user) {
        // Здесь должна быть логика отправки email для сброса пароля
        // Для примера просто показываем сообщение
        return res.render('auth/forgot-password', {
          title: 'Forgot Password',
          message: 'Password reset link has been sent to your email',
        });
      }

      res.render('auth/forgot-password', {
        title: 'Forgot Password',
        message: 'If email exists, reset link has been sent',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).render('error', {
        message: 'Error processing request',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  showResetPassword(req, res) {
    res.render('auth/reset-password', {
      title: 'Reset Password',
      token: req.params.token,
    });
  }

  async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.render('auth/reset-password', {
          title: 'Reset Password',
          token,
          errors: [{ msg: 'Passwords do not match' }],
        });
      }

      // Здесь должна быть логика проверки токена и обновления пароля
      // Для примера просто показываем сообщение об успехе
      res.render('auth/login', {
        title: 'Login',
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).render('error', {
        message: 'Error resetting password',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }
}

module.exports = new AuthController();