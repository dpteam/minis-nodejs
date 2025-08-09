const { Notification, User, Message, Friendship } = require('../models');
const { Op } = require('sequelize');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const type = req.query.type; // Опциональный фильтр по типу

      const whereClause = { userId };
      if (type) {
        whereClause.type = type;
      }

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      // Получаем количество непрочитанных уведомлений
      const unreadCount = await Notification.count({
        where: { userId, isRead: false },
      });

      res.render('notifications/index', {
        title: 'Notifications',
        notifications: notifications.rows,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(notifications.count / limit),
        currentType: type,
        user: req.user,
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).render('error', {
        message: 'Error loading notifications',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async getNotificationDetails(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });

      if (!notification) {
        return res.status(404).render('error', {
          message: 'Notification not found',
        });
      }

      // Помечаем уведомление как прочитанное
      if (!notification.isRead) {
        await notification.update({ isRead: true });
      }

      res.render('notifications/details', {
        title: 'Notification Details',
        notification,
        user: req.user,
      });
    } catch (error) {
      console.error('Get notification details error:', error);
      res.status(500).render('error', {
        message: 'Error loading notification details',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await notification.update({ isRead: true });

      // Для AJAX запросов
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ success: true });
      }

      // Для обычных HTTP запросов
      res.redirect('/notifications');
    } catch (error) {
      console.error('Mark notification as read error:', error);
      
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(500).render('error', {
        message: 'Error marking notification as read',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );

      // Для AJAX запросов
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ success: true });
      }

      // Для обычных HTTP запросов
      res.redirect('/notifications');
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(500).render('error', {
        message: 'Error marking all notifications as read',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      await notification.destroy();

      // Для AJAX запросов
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ success: true });
      }

      // Для обычных HTTP запросов
      res.redirect('/notifications');
    } catch (error) {
      console.error('Delete notification error:', error);
      
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.status(500).render('error', {
        message: 'Error deleting notification',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Notification.count({
        where: { userId, isRead: false },
      });

      res.json({ unreadCount: count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotificationPreferences(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId, {
        attributes: ['preferences'],
      });

      if (!user) {
        return res.status(404).render('error', {
          message: 'User not found',
        });
      }

      res.render('notifications/preferences', {
        title: 'Notification Preferences',
        preferences: user.preferences,
        user: req.user,
      });
    } catch (error) {
      console.error('Get notification preferences error:', error);
      res.status(500).render('error', {
        message: 'Error loading notification preferences',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async updateNotificationPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { emailNotifications, pushNotifications, browserNotifications } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const preferences = {
        ...user.preferences,
        emailNotifications: emailNotifications === 'on',
        pushNotifications: pushNotifications === 'on',
        browserNotifications: browserNotifications === 'on',
      };

      await user.update({ preferences });

      res.redirect('/notifications/preferences');
    } catch (error) {
      console.error('Update notification preferences error:', error);
      res.status(500).render('error', {
        message: 'Error updating notification preferences',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async testNotification(req, res) {
    try {
      const userId = req.user.id;
      const notificationService = require('../services/notificationService');

      await notificationService.createNotification(
        userId,
        'system',
        'Test Notification',
        'This is a test notification to check if the system is working properly.',
        { test: true }
      );

      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new NotificationController();