const express = require('express');
const router = express.Router();
const { PrivateMessage, User } = require('../models');

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }
    
    // Получаем диалоги пользователя
    const dialogs = await PrivateMessage.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        { 
          model: User, 
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      group: ['senderId', 'receiverId']
    });
    
    res.render('messages', {
      title: 'Сообщения',
      dialogs: dialogs,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading messages:', error);
    res.status(500).send('Ошибка загрузки сообщений');
  }
});

module.exports = router;