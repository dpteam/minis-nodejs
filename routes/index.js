const express = require('express');
const router = express.Router();
const { Message, User, Like } = require('../models');

router.get('/', async (req, res) => {
  try {
    // Получаем посты с авторами и лайками
    const posts = await Message.findAll({
      where: {
        deleted: 0,
        parentId: null,
        visibility: 'public'
      },
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        },
        { 
          model: Like,
          attributes: ['id', 'userId']
        }
      ],
      order: [['postTime', 'DESC']],
      limit: 20
    });
    
    res.render('index', { 
      title: 'Моя Страница',
      posts: posts,
      user: req.user || null // Для аутентификации
    });
  } catch (error) {
    console.error('Error loading posts:', error);
    res.status(500).send('Ошибка загрузки страницы');
  }
});

module.exports = router;