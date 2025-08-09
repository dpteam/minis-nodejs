const { User, Message, Friendship, Notification, App } = require('../models');
const { Op } = require('sequelize');

class ApiController {
  async getStatus(req, res) {
    try {
      const status = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'connected',
      };
      res.json(status);
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }

  async getUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'bio', 'avatar', 'registrationTime'],
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPublicMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const messages = await Message.findAndCountAll({
        where: { deleted: false, parentId: null, visibility: 'public' },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
        order: [['postTime', 'DESC']],
        limit,
        offset,
      });

      res.json({
        messages: messages.rows,
        pagination: {
          page,
          limit,
          total: messages.count,
          pages: Math.ceil(messages.count / limit),
        },
      });
    } catch (error) {
      console.error('Get public messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id; // Из JWT токена
      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'avatar', 'preferences'],
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, bio, preferences } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        bio: bio || user.bio,
        preferences: preferences || user.preferences,
      });

      res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Update current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const userId = req.user.id;

      const messages = await Message.findAndCountAll({
        where: { deleted: false, parentId: null },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
        order: [['postTime', 'DESC']],
        limit,
        offset,
      });

      res.json({
        messages: messages.rows,
        pagination: {
          page,
          limit,
          total: messages.count,
          pages: Math.ceil(messages.count / limit),
        },
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createMessage(req, res) {
    try {
      const userId = req.user.id;
      const { content, visibility = 'public' } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const message = await Message.create({
        userId,
        content,
        visibility,
      });

      const createdMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });

      res.status(201).json({ message: 'Message created successfully', data: createdMessage });
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteMessage(req, res) {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this message' });
      }

      await message.update({ deleted: true });

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const friendships = await Friendship.findAll({
        where: {
          [Op.or]: [
            { userId, status: 'accepted' },
            { friendId: userId, status: 'accepted' },
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
          {
            model: User,
            as: 'friend',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });

      const friends = friendships.map(f => 
        f.userId === userId ? f.friend : f.user
      );

      res.json({ friends });
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addFriend(req, res) {
    try {
      const userId = req.user.id;
      const friendId = parseInt(req.params.id);

      if (userId === friendId) {
        return res.status(400).json({ error: 'Cannot add yourself as friend' });
      }

      const existingFriendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (existingFriendship) {
        return res.status(400).json({ error: 'Friendship already exists or pending' });
      }

      const friendship = await Friendship.create({
        userId,
        friendId,
        status: 'pending',
      });

      res.status(201).json({ message: 'Friend request sent', friendship });
    } catch (error) {
      console.error('Add friend error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeFriend(req, res) {
    try {
      const userId = req.user.id;
      const friendId = parseInt(req.params.id);

      const friendship = await Friendship.findOne({
        where: {
          [Op.or]: [
            { userId, friendId },
            { userId: friendId, friendId: userId },
          ],
        },
      });

      if (!friendship) {
        return res.status(404).json({ error: 'Friendship not found' });
      }

      await friendship.destroy();

      res.json({ message: 'Friend removed successfully' });
    } catch (error) {
      console.error('Remove friend error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const notifications = await Notification.findAndCountAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      res.json({
        notifications: notifications.rows,
        pagination: {
          page,
          limit,
          total: notifications.count,
          pages: Math.ceil(notifications.count / limit),
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markNotificationRead(req, res) {
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

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getApps(req, res) {
    try {
      const userId = req.user.id;
      const apps = await App.findAll({
        where: { ownerId: userId },
        attributes: ['id', 'name', 'description', 'permissions', 'isActive', 'createdAt', 'lastUsed'],
      });

      res.json({ apps });
    } catch (error) {
      console.error('Get apps error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createApp(req, res) {
    try {
      const userId = req.user.id;
      const { name, description, permissions } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'App name is required' });
      }

      const appCount = await App.count({ where: { ownerId: userId } });
      if (appCount >= 10) {
        return res.status(400).json({ error: 'Maximum number of apps reached' });
      }

      const app = await App.create({
        name,
        description,
        ownerId: userId,
        permissions: permissions || ['read:profile'],
      });

      res.status(201).json({ message: 'App created successfully', app });
    } catch (error) {
      console.error('Create app error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteApp(req, res) {
    try {
      const appId = req.params.id;
      const userId = req.user.id;

      const app = await App.findOne({
        where: { id: appId, ownerId: userId },
      });

      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }

      await app.destroy();

      res.json({ message: 'App deleted successfully' });
    } catch (error) {
      console.error('Delete app error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ApiController();