const express = require('express');
const router = express.Router();
const { User, Message, Friendship } = require('../models');

router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Получаем данные пользователя
    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'avatar', 'bio', 'birthDate', 'city']
    });
    
    if (!user) {
      return res.status(404).send('Пользователь не найден');
    }
    
    // Получаем посты пользователя
    const posts = await Message.findAll({
      where: {
        userId: userId,
        deleted: 0,
        parentId: null,
        visibility: 'public'
      },
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }
      ],
      order: [['postTime', 'DESC']],
      limit: 20
    });
    
    // Проверяем, является ли пользователь другом текущего пользователя
    let isFriend = false;
    if (req.user) {
      const friendship = await Friendship.findOne({
        where: {
          userId: req.user.id,
          friendId: userId
        }
      });
      isFriend = !!friendship;
    }
    
    res.render('profile', {
      title: `${user.firstName} ${user.lastName}`,
      user: user,
      posts: posts,
      currentUser: req.user,
      isFriend: isFriend
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).send('Ошибка загрузки профиля');
  }
});

module.exports = router;