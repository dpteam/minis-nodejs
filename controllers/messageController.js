const { Message, User, Like, PrivateMessage } = require('../models');
const { validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');

class MessageController {
  async getMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const messages = await Message.findAndCountAll({
        where: { deleted: false, parentId: null },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
          {
            model: User,
            as: 'addressee',
            attributes: ['id', 'firstName', 'lastName'],
          },
          {
            model: Message,
            as: 'replies',
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['id', 'firstName', 'lastName', 'avatar'],
              },
            ],
          },
        ],
        order: [['postTime', 'DESC']],
        limit,
        offset,
      });

      res.render('messages/index', {
        title: 'Messages',
        messages: messages.rows,
        currentPage: page,
        totalPages: Math.ceil(messages.count / limit),
        user: req.user,
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).render('error', {
        message: 'Error loading messages',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async createMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, addresseeId, parentId } = req.body;
      const userId = req.user.id;

      // Обработка упоминаний и хештегов
      const mentions = this.extractMentions(content);
      const hashtags = this.extractHashtags(content);

      const message = await Message.create({
        userId,
        content,
        addresseeId: addresseeId || null,
        parentId: parentId || null,
        mentions,
        hashtags,
      });

      // Создаем уведомления для упомянутых пользователей
      if (mentions.length > 0) {
        await notificationService.createMentionNotifications(userId, mentions, message.id);
      }

      // Если это ответ, создаем уведомление автору родительского сообщения
      if (parentId) {
        const parentMessage = await Message.findByPk(parentId);
        if (parentMessage && parentMessage.userId !== userId) {
          await notificationService.createReplyNotification(userId, parentMessage.userId, message.id);
        }
      }

      // Если сообщение адресовано конкретному пользователю
      if (addresseeId && parseInt(addresseeId) !== userId) {
        await notificationService.createMessageNotification(userId, addresseeId, message.id);
      }

      res.redirect('/messages');
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).render('error', {
        message: 'Error creating message',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async deleteMessage(req, res) {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Проверяем, что пользователь является автором сообщения
      if (message.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      await message.update({ deleted: true });

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ message: 'Error deleting message' });
    }
  }

  async replyToMessage(req, res) {
    try {
      const messageId = req.params.id;
      const { content } = req.body;
      const userId = req.user.id;

      const parentMessage = await Message.findByPk(messageId);
      if (!parentMessage) {
        return res.status(404).json({ message: 'Parent message not found' });
      }

      const reply = await Message.create({
        userId,
        content,
        parentId: messageId,
        addresseeId: parentMessage.userId,
      });

      // Создаем уведомление автору родительского сообщения
      if (parentMessage.userId !== userId) {
        await notificationService.createReplyNotification(userId, parentMessage.userId, reply.id);
      }

      res.json({ message: 'Reply created successfully', reply });
    } catch (error) {
      console.error('Reply to message error:', error);
      res.status(500).json({ message: 'Error creating reply' });
    }
  }

  async likeMessage(req, res) {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      // Проверяем, существует ли сообщение
      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Проверяем, не лайкал ли пользователь уже это сообщение
      const existingLike = await Like.findOne({
        where: { userId, messageId, type: 'like' },
      });

      if (existingLike) {
        // Удаляем лайк
        await existingLike.destroy();
        return res.json({ message: 'Like removed' });
      }

      // Удаляем дизлайк, если он есть
      await Like.destroy({
        where: { userId, messageId, type: 'dislike' },
      });

      // Создаем лайк
      await Like.create({
        userId,
        messageId,
        type: 'like',
      });

      // Создаем уведомление автору сообщения
      if (message.userId !== userId) {
        await notificationService.createLikeNotification(userId, message.userId, messageId);
      }

      res.json({ message: 'Like added' });
    } catch (error) {
      console.error('Like message error:', error);
      res.status(500).json({ message: 'Error liking message' });
    }
  }

  async dislikeMessage(req, res) {
    try {
      const messageId = req.params.id;
      const userId = req.user.id;

      // Проверяем, существует ли сообщение
      const message = await Message.findByPk(messageId);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      // Проверяем, не дизлайкал ли пользователь уже это сообщение
      const existingDislike = await Like.findOne({
        where: { userId, messageId, type: 'dislike' },
      });

      if (existingDislike) {
        // Удаляем дизлайк
        await existingDislike.destroy();
        return res.json({ message: 'Dislike removed' });
      }

      // Удаляем лайк, если он есть
      await Like.destroy({
        where: { userId, messageId, type: 'like' },
      });

      // Создаем дизлайк
      await Like.create({
        userId,
        messageId,
        type: 'dislike',
      });

      res.json({ message: 'Dislike added' });
    } catch (error) {
      console.error('Dislike message error:', error);
      res.status(500).json({ message: 'Error disliking message' });
    }
  }

  async getPrivateMessages(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await PrivateMessage.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
        order: [['sentAt', 'DESC']],
        group: ['senderId', 'receiverId'],
      });

      res.render('messages/private', {
        title: 'Private Messages',
        conversations,
        user: req.user,
      });
    } catch (error) {
      console.error('Get private messages error:', error);
      res.status(500).render('error', {
        message: 'Error loading private messages',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async getPrivateConversation(req, res) {
    try {
      const userId = req.user.id;
      const otherUserId = req.params.userId;

      const messages = await PrivateMessage.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
          },
        ],
        order: [['sentAt', 'ASC']],
      });

      // Помечаем сообщения как прочитанные
      await PrivateMessage.update(
        { isRead: true, readAt: Math.floor(Date.now() / 1000) },
        {
          where: {
            receiverId: userId,
            senderId: otherUserId,
            isRead: false,
          },
        }
      );

      res.render('messages/conversation', {
        title: 'Conversation',
        messages,
        otherUserId,
        user: req.user,
      });
    } catch (error) {
      console.error('Get private conversation error:', error);
      res.status(500).render('error', {
        message: 'Error loading conversation',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async sendPrivateMessage(req, res) {
    try {
      const receiverId = req.params.userId;
      const { content } = req.body;
      const senderId = req.user.id;

      const message = await PrivateMessage.create({
        senderId,
        receiverId,
        content,
      });

      // Создаем уведомление получателю
      await notificationService.createPrivateMessageNotification(senderId, receiverId, message.id);

      res.json({ message: 'Private message sent', message });
    } catch (error) {
      console.error('Send private message error:', error);
      res.status(500).json({ message: 'Error sending private message' });
    }
  }

  // Вспомогательные методы
  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)]; // Удаляем дубликаты
  }

  extractHashtags(content) {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1]);
    }
    return [...new Set(hashtags)]; // Удаляем дубликаты
  }
}

module.exports = new MessageController();