const express = require('express');
const router = express.Router();
const { User, Message, Friendship, App, Notification } = require('../models');
const { ensureAuthenticated, requireRole } = require('../middleware/auth');

// Middleware для проверки прав администратора
router.use(ensureAuthenticated);
router.use(requireRole(['admin']));

// Панель администратора
router.get('/', async (req, res) => {
  try {
    // Получаем статистику
    const stats = {
      totalUsers: await User.count(),
      activeUsers: await User.count({ where: { isActive: true } }),
      totalMessages: await Message.count({ where: { deleted: false } }),
      totalApps: await App.count(),
      totalNotifications: await Notification.count(),
    };

    // Получаем последних пользователей
    const recentUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'registrationTime', 'isActive'],
      order: [['registrationTime', 'DESC']],
      limit: 10,
    });

    // Получаем последние сообщения
    const recentMessages = await Message.findAll({
      attributes: ['id', 'content', 'postTime', 'deleted'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['postTime', 'DESC']],
      limit: 10,
    });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats,
      recentUsers,
      recentMessages,
      user: req.user,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).render('error', {
      message: 'Error loading admin dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// Управление пользователями
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.like]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'isActive', 'role', 'registrationTime', 'lastActivityTime'],
      order: [['registrationTime', 'DESC']],
      limit,
      offset,
    });

    res.render('admin/users', {
      title: 'Manage Users',
      users: users.rows,
      currentPage: page,
      totalPages: Math.ceil(users.count / limit),
      search,
      user: req.user,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).render('error', {
      message: 'Error loading users',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// Просмотр пользователя
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Message,
          as: 'messages',
          where: { deleted: false },
          required: false,
          limit: 10,
        },
        {
          model: App,
          as: 'apps',
          limit: 10,
        },
      ],
    });

    if (!user) {
      return res.status(404).render('error', {
        message: 'User not found',
      });
    }

    const stats = {
      messageCount: await Message.count({ where: { userId: user.id, deleted: false } }),
      friendCount: await Friendship.count({
        where: {
          [require('sequelize').Op.or]: [
            { userId: user.id, status: 'accepted' },
            { friendId: user.id, status: 'accepted' },
          ],
        },
      }),
      appCount: await App.count({ where: { ownerId: user.id } }),
    };

    res.render('admin/user-details', {
      title: `User: ${user.firstName} ${user.lastName}`,
      user: req.user,
      targetUser: user,
      stats,
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).render('error', {
      message: 'Error loading user details',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// Обновление пользователя
router.post('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive, role } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      isActive: isActive === 'on',
      role: role || 'user',
    });

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удаление пользователя
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Нельзя удалить себя
    if (userId == req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Управление сообщениями
router.get('/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['postTime', 'DESC']],
      limit,
      offset,
    });

    res.render('admin/messages', {
      title: 'Manage Messages',
      messages: messages.rows,
      currentPage: page,
      totalPages: Math.ceil(messages.count / limit),
      user: req.user,
    });
  } catch (error) {
    console.error('Admin messages error:', error);
    res.status(500).render('error', {
      message: 'Error loading messages',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// Удаление сообщения
router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    await message.update({ deleted: true });

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Управление приложениями
router.get('/apps', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const apps = await App.findAndCountAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.render('admin/apps', {
      title: 'Manage Apps',
      apps: apps.rows,
      currentPage: page,
      totalPages: Math.ceil(apps.count / limit),
      user: req.user,
    });
  } catch (error) {
    console.error('Admin apps error:', error);
    res.status(500).render('error', {
      message: 'Error loading apps',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// Отключение приложения
router.post('/apps/:id/toggle', async (req, res) => {
  try {
    const app = await App.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    await app.update({ isActive: !app.isActive });

    res.json({ 
      success: true, 
      message: `App ${app.isActive ? 'enabled' : 'disabled'} successfully`,
      isActive: app.isActive 
    });
  } catch (error) {
    console.error('Toggle app error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удаление приложения
router.delete('/apps/:id', async (req, res) => {
  try {
    const app = await App.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    await app.destroy();

    res.json({ success: true, message: 'App deleted successfully' });
  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Системные настройки
router.get('/settings', (req, res) => {
  res.render('admin/settings', {
    title: 'System Settings',
    user: req.user,
  });
});

// Логи системы
router.get('/logs', async (req, res) => {
  try {
    // Здесь должна быть логика чтения логов
    // Для примера просто показываем страницу
    res.render('admin/logs', {
      title: 'System Logs',
      user: req.user,
    });
  } catch (error) {
    console.error('Admin logs error:', error);
    res.status(500).render('error', {
      message: 'Error loading logs',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

// Экспорт данных
router.get('/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    
    switch (format) {
      case 'json':
        const data = {
          users: await User.findAll(),
          messages: await Message.findAll(),
          friendships: await Friendship.findAll(),
          apps: await App.findAll(),
          exported_at: new Date().toISOString(),
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=minis-export.json');
        res.json(data);
        break;
        
      case 'csv':
        // Здесь должна быть логика экспорта в CSV
        res.status(501).json({ error: 'CSV export not implemented yet' });
        break;
        
      default:
        res.status(400).json({ error: 'Invalid export format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Очистка кэша
router.post('/clear-cache', async (req, res) => {
  try {
    // Здесь должна быть логика очистки кэша
    // Для примера просто возвращаем успех
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;