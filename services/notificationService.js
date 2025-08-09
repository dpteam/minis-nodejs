const { Notification, User, Message, PrivateMessage } = require('../models');

class NotificationService {
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
      });

      // Здесь можно добавить отправку push-уведомлений или email
      await this.sendRealTimeNotification(userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async createMentionNotification(senderId, mentions, messageId) {
    try {
      const message = await Message.findByPk(messageId, {
        include: [{ model: User, as: 'author', attributes: ['firstName', 'lastName'] }],
      });

      for (const mention of mentions) {
        const mentionedUser = await User.findOne({
          where: {
            [require('sequelize').Op.or]: [
              { firstName: mention },
              { lastName: mention },
              { email: mention },
            ],
          },
        });

        if (mentionedUser && mentionedUser.id !== senderId) {
          await this.createNotification(
            mentionedUser.id,
            'mention',
            `You were mentioned by ${message.author.firstName} ${message.author.lastName}`,
            message.content.substring(0, 100),
            { messageId, senderId }
          );
        }
      }
    } catch (error) {
      console.error('Error creating mention notifications:', error);
    }
  }

  async createLikeNotification(senderId, receiverId, messageId) {
    try {
      const message = await Message.findByPk(messageId, {
        include: [{ model: User, as: 'author', attributes: ['firstName', 'lastName'] }],
      });

      await this.createNotification(
        receiverId,
        'like',
        `Your message was liked`,
        message.content.substring(0, 100),
        { messageId, senderId }
      );
    } catch (error) {
      console.error('Error creating like notification:', error);
    }
  }

  async createReplyNotification(senderId, receiverId, messageId) {
    try {
      const message = await Message.findByPk(messageId, {
        include: [{ model: User, as: 'author', attributes: ['firstName', 'LastName'] }],
      });

      await this.createNotification(
        receiverId,
        'comment',
        `Someone replied to your message`,
        message.content.substring(0, 100),
        { messageId, senderId }
      );
    } catch (error) {
      console.error('Error creating reply notification:', error);
    }
  }

  async createMessageNotification(senderId, receiverId, messageId) {
    try {
      const message = await Message.findByPk(messageId);
      const sender = await User.findByPk(senderId);

      await this.createNotification(
        receiverId,
        'message',
        `New message from ${sender.firstName} ${sender.lastName}`,
        message.content.substring(0, 100),
        { messageId, senderId }
      );
    } catch (error) {
      console.error('Error creating message notification:', error);
    }
  }

  async createPrivateMessageNotification(senderId, receiverId, messageId) {
    try {
      const message = await PrivateMessage.findByPk(messageId);
      const sender = await User.findByPk(senderId);

      await this.createNotification(
        receiverId,
        'message',
        `New private message from ${sender.firstName} ${sender.lastName}`,
        message.content.substring(0, 100),
        { messageId, senderId, isPrivate: true }
      );
    } catch (error) {
      console.error('Error creating private message notification:', error);
    }
  }

  async createFriendRequestNotification(senderId, receiverId) {
    try {
      const sender = await User.findByPk(senderId);

      await this.createNotification(
        receiverId,
        'friend_request',
        `New friend request from ${sender.firstName} ${sender.lastName}`,
        `${sender.firstName} ${sender.lastName} wants to be your friend`,
        { senderId }
      );
    } catch (error) {
      console.error('Error creating friend request notification:', error);
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
      });

      if (notification) {
        await notification.update({ isRead: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: { userId, isRead: false },
      });
      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }

  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      
      await Notification.destroy({
        where: {
          createdAt: { [require('sequelize').Op.lt]: thirtyDaysAgo },
          isRead: true,
        },
      });

      console.log('Old notifications cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }

  async sendRealTimeNotification(userId, notification) {
    // Здесь можно интегрировать WebSocket для реальных уведомлений
    // Например, используя Socket.io или Server-Sent Events
    
    // Для примера просто логируем
    console.log(`Real-time notification for user ${userId}:`, notification);
  }
}

module.exports = new NotificationService();