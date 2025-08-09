const express = require('express');
const router = express.Router();
const { User, Friendship } = require('../models');

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }
    
    // Получаем друзей пользователя
    const friends = await Friendship.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: User, 
          as: 'friend',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    // Получаем входящие запросы в друзья
    const incomingRequests = await Friendship.findAll({
      where: { 
        friendId: req.user.id,
        status: 'pending'
      },
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ]
    });
    
    res.render('friends', {
      title: 'Мои Друзья',
      friends: friends,
      incomingRequests: incomingRequests,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading friends:', error);
    res.status(500).send('Ошибка загрузки друзей');
  }
});

module.exports = router;