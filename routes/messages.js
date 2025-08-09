const express = require('express');
const router = express.Router();
const { PrivateMessage, User } = require('../models');
const { Op } = require('sequelize');

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

// Новое сообщение
router.get('/new', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  res.render('new-message', { 
    title: 'Новое сообщение',
    user: req.user
  });
});

// Непрочитанные сообщения
router.get('/unread', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }
    
    const unreadMessages = await PrivateMessage.findAll({
      where: {
        receiverId: req.user.id,
        isRead: false
      },
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('unread-messages', {
      title: 'Непрочитанные сообщения',
      messages: unreadMessages,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading unread messages:', error);
    res.status(500).send('Ошибка загрузки непрочитанных сообщений');
  }
});

// Отправленные сообщения
router.get('/sent', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }
    
    const sentMessages = await PrivateMessage.findAll({
      where: {
        senderId: req.user.id
      },
      include: [
        { 
          model: User, 
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('sent-messages', {
      title: 'Отправленные сообщения',
      messages: sentMessages,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading sent messages:', error);
    res.status(500).send('Ошибка загрузки отправленных сообщений');
  }
});

module.exports = router;