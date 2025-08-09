const { User, Message, Friendship, UserGroup, Notification } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Настройка загрузки аватаров
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  },
});

class UserController {
  async getProfile(req, res) {
    try {
      const profileId = req.params.id;
      const currentUserId = req.user ? req.user.id : null;

      const user = await User.findByPk(profileId, {
        attributes: ['id', 'firstName', 'lastName', 'bio', 'avatar', 'registrationTime', 'emailPublic', 'email'],
        include: [
          {
            model: Message,
            as: 'messages',
            where: { deleted: false, parentId: null },
            required: false,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'firstName', 'lastName', 'avatar'],
              },
            ],
            order: [['postTime', 'DESC']],
            limit: 10,
          },
        ],
      });

      if (!user) {
        return res.status(404).render('error', {
          message: 'User not found',
        });
      }

      // Проверяем дружбу
      let friendshipStatus = null;
      if (currentUserId && currentUserId !== parseInt(profileId)) {
        const friendship = await Friendship.findOne({
          where: {
            [Op.or]: [
              { userId: currentUserId, friendId: profileId },
              { userId: profileId, friendId: currentUserId },
            ],
          },
        });

        if (friendship) {
          friendshipStatus = friendship.status;
        }
      }

      // Получаем статистику
      const messageCount = await Message.count({
        where: { userId: profileId, deleted: false },
      });

      const friendCount = await Friendship.count({
        where: {
          [Op.or]: [
            { userId: profileId, status: 'accepted' },
            { friendId: profileId, status: 'accepted' },
          ],
        },
      });

      res.render('users/profile', {
        title: `${user.firstName} ${user.lastName}`,
        profileUser: user,
        friendshipStatus,
        messageCount,
        friendCount,
        isOwnProfile: currentUserId === parseInt(profileId),
        user: req.user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).render('error', {
        message: 'Error loading profile',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async showEditProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'avatar', 'preferences'],
      });

      res.render('users/edit-profile', {
        title: 'Edit Profile',
        user: user,
        formData: user.toJSON(),
      });
    } catch (error) {
      console.error('Show edit profile error:', error);
      res.status(500).render('error', {
        message: 'Error loading edit profile page',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, bio, emailPublic, preferences } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).render('error', {
          message: 'User not found',
        });
      }

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        email: email || user.email,
        bio: bio || user.bio,
        emailPublic: emailPublic === 'on',
        preferences: preferences ? JSON.parse(preferences) : user.preferences,
      });

      res.redirect(`/profile/${userId}`);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).render('users/edit-profile', {
        title: 'Edit Profile',
        user: req.user,
        formData: req.body,
        error: 'Error updating profile',
      });
    }
  }

  async uploadAvatar(req, res) {
    try {
      upload.single('avatar')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        const user = await User.findByPk(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Удаляем старый аватар, если он есть
        if (user.avatar && user.avatar !== '/default-avatar.png') {
          const oldAvatarPath = path.join(__dirname, '../public', user.avatar);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }

        await user.update({ avatar: avatarPath });

        res.json({ 
          success: true, 
          avatarUrl: avatarPath,
          message: 'Avatar updated successfully' 
        });
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const friendships = await Friendship.findAndCountAll({
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
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
      });

      const friends = friendships.rows.map(f => 
        f.userId === userId ? f.friend : f.user
      );

      // Получаем запросы в друзья
      const friendRequests = await Friendship.findAll({
        where: { friendId: userId, status: 'pending' },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
      });

      res.render('users/friends', {
        title: 'Friends',
        friends,
        friendRequests,
        currentPage: page,
        totalPages: Math.ceil(friendships.count / limit),
        user: req.user,
      });
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).render('error', {
        message: 'Error loading friends',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
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

      // Создаем уведомление
      const notificationService = require('../services/notificationService');
      await notificationService.createFriendRequestNotification(userId, friendId);

      res.json({ success: true, message: 'Friend request sent' });
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

      res.json({ success: true, message: 'Friend removed successfully' });
    } catch (error) {
      console.error('Remove friend error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async acceptFriend(req, res) {
    try {
      const userId = req.user.id;
      const friendId = parseInt(req.params.id);

      const friendship = await Friendship.findOne({
        where: { userId: friendId, friendId: userId, status: 'pending' },
      });

      if (!friendship) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      await friendship.update({ status: 'accepted' });

      res.json({ success: true, message: 'Friend request accepted' });
    } catch (error) {
      console.error('Accept friend error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async rejectFriend(req, res) {
    try {
      const userId = req.user.id;
      const friendId = parseInt(req.params.id);

      const friendship = await Friendship.findOne({
        where: { userId: friendId, friendId: userId, status: 'pending' },
      });

      if (!friendship) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      await friendship.destroy();

      res.json({ success: true, message: 'Friend request rejected' });
    } catch (error) {
      console.error('Reject friend error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getGroups(req, res) {
    try {
      const userId = req.user.id;
      const groups = await UserGroup.findAll({
        where: { ownerId: userId },
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
            through: { attributes: [] },
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.render('users/groups', {
        title: 'My Groups',
        groups,
        user: req.user,
      });
    } catch (error) {
      console.error('Get groups error:', error);
      res.status(500).render('error', {
        message: 'Error loading groups',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async showCreateGroup(req, res) {
    res.render('users/create-group', {
      title: 'Create Group',
      user: req.user,
    });
  }

  async createGroup(req, res) {
    try {
      const userId = req.user.id;
      const { name, description, isPrivate } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).render('users/create-group', {
          title: 'Create Group',
          user: req.user,
          error: 'Group name is required',
          formData: req.body,
        });
      }

      const group = await UserGroup.create({
        name,
        description,
        isPrivate: isPrivate === 'on',
        ownerId: userId,
      });

      res.redirect(`/groups/${group.id}`);
    } catch (error) {
      console.error('Create group error:', error);
      res.status(500).render('users/create-group', {
        title: 'Create Group',
        user: req.user,
        error: 'Error creating group',
        formData: req.body,
      });
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

      const unreadCount = await Notification.count({
        where: { userId, isRead: false },
      });

      res.render('users/notifications', {
        title: 'Notifications',
        notifications: notifications.rows,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(notifications.count / limit),
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

      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async markAllNotificationsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();