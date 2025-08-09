const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('register', { title: 'Регистрация' });
});

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('register', { 
        title: 'Регистрация',
        error: 'Пользователь с таким email уже существует'
      });
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создаем нового пользователя
    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    
    // Перенаправляем на страницу входа
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { 
      title: 'Регистрация',
      error: 'Ошибка при регистрации'
    });
  }
});

module.exports = router;