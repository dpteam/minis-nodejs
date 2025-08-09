const { Message, User, Friendship, UserGroup, Like } = require('../models');
const { Op } = require('sequelize');

class FeedService {
  async getPublicFeed(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      where: { 
        deleted: false, 
        parentId: null,
        visibility: 'public'
      },
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
          model: Like,
          attributes: ['id', 'type'],
        },
      ],
      order: [['postTime', 'DESC']],
      limit,
      offset,
    });

    return {
      messages: messages.rows,
      count: messages.count,
      page,
      limit,
    };
  }

  async getUserFeed(userId, feedType = 'all', page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    let whereClause = { deleted: false, parentId: null };

    switch (feedType) {
      case 'friends':
        const friendIds = await this.getFriendIds(userId);
        whereClause.userId = { [Op.in]: friendIds };
        break;
      case 'groups':
        const groupIds = await this.getUserGroupIds(userId);
        // Здесь должна быть логика для групповых сообщений
        break;
      default:
        // Все сообщения, включая публичные и от друзей
        const allIds = await this.getFriendIds(userId);
        allIds.push(userId);
        whereClause[Op.or] = [
          { userId: { [Op.in]: allIds }, visibility: { [Op.in]: ['public', 'friends'] } },
          { visibility: 'public' }
        ];
        break;
    }

    const messages = await Message.findAndCountAll({
      where: whereClause,
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
          model: Like,
          attributes: ['id', 'type'],
        },
      ],
      order: [['postTime', 'DESC']],
      limit,
      offset,
    });

    return {
      messages: messages.rows,
      count: messages.count,
      page,
      limit,
      feedType,
    };
  }

  async getCustomFeed(userId, preferences = {}) {
    const {
      includeFriends = true,
      includeGroups = true,
      includePublic = true,
      hashtags = [],
      mentionedOnly = false,
    } = preferences;

    let whereClause = { deleted: false, parentId: null };
    let orConditions = [];

    if (includeFriends) {
      const friendIds = await this.getFriendIds(userId);
      friendIds.push(userId);
      orConditions.push({
        userId: { [Op.in]: friendIds },
        visibility: { [Op.in]: ['public', 'friends'] }
      });
    }

    if (includePublic) {
      orConditions.push({ visibility: 'public' });
    }

    if (hashtags.length > 0) {
      orConditions.push({
        hashtags: { [Op.overlap]: hashtags }
      });
    }

    if (mentionedOnly) {
      orConditions.push({
        mentions: { [Op.contains]: [userId.toString()] }
      });
    }

    if (orConditions.length > 0) {
      whereClause[Op.or] = orConditions;
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
        {
          model: Like,
          attributes: ['id', 'type'],
        },
      ],
      order: [['postTime', 'DESC']],
      limit: 50,
    });

    return messages;
  }

  async getTrendingHashtags(limit = 10) {
    const messages = await Message.findAll({
      where: { deleted: false },
      attributes: ['hashtags'],
    });

    const hashtagCounts = {};
    messages.forEach(message => {
      if (message.hashtags && Array.isArray(message.hashtags)) {
        message.hashtags.forEach(hashtag => {
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
        });
      }
    });

    return Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([hashtag, count]) => ({ hashtag, count }));
  }

  // Вспомогательные методы
  async getFriendIds(userId) {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { userId, status: 'accepted' },
          { friendId: userId, status: 'accepted' },
        ],
      },
    });

    return friendships.map(f => 
      f.userId === userId ? f.friendId : f.userId
    );
  }

  async getUserGroupIds(userId) {
    // Здесь должна быть логика получения ID групп пользователя
    return [];
  }
}

module.exports = new FeedService();