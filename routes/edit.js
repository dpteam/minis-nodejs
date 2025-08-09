const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.get('/', async (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'birthDate', 'city', 'avatar']
    });
    
    res.render('edit', { 
      title: 'Редактирование профиля',
      user: user,
      error: null
    });
  } catch (error) {
    console.error('Error loading edit form:', error);
    res.status(500).send('Ошибка загрузки формы редактирования');
  }
});

router.post('/', async (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  try {
    const { firstName, lastName, bio, birthDate, city } = req.body;
    
    await User.update({
      firstName,
      lastName,
      bio,
      birthDate: birthDate || null,
      city
    }, {
      where: { id: req.user.id }
    });
    
    res.redirect('/profile/' + req.user.id);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.render('edit', { 
      title: 'Редактирование профиля',
      user: req.user,
      error: 'Ошибка при обновлении профиля'
    });
  }
});

module.exports = router;