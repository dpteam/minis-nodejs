const express = require('express');
const router = express.Router();
const { Group, UserGroup } = require('../models');

router.get('/', async (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  try {
    // Получаем группы, в которых состоит пользователь
    const userGroups = await UserGroup.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Group,
          as: 'group'
        }
      ]
    });
    
    // Получаем популярные группы (пока просто все группы)
    const popularGroups = await Group.findAll({
      limit: 10
    });
    
    res.render('groups', { 
      title: 'Группы',
      userGroups: userGroups,
      popularGroups: popularGroups,
      user: req.user
    });
  } catch (error) {
    console.error('Error loading groups:', error);
    res.status(500).send('Ошибка загрузки групп');
  }
});

module.exports = router;