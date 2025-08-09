const { App, User } = require('../models');
const crypto = require('crypto');

class AppService {
  async createApp(ownerId, appData) {
    try {
      const { name, description, permissions } = appData;

      // Проверяем количество приложений пользователя
      const appCount = await App.count({ where: { ownerId } });
      if (appCount >= 10) { // Максимум 10 приложений на пользователя
        throw new Error('Maximum number of apps reached');
      }

      // Генерируем API ключ и секрет
      const apiKey = this.generateApiKey();
      const apiSecret = this.generateApiSecret();

      const app = await App.create({
        name,
        description,
        ownerId,
        apiKey,
        apiSecret,
        permissions: permissions || ['read:profile', 'read:messages'],
      });

      return app;
    } catch (error) {
      console.error('Error creating app:', error);
      throw error;
    }
  }

  async getAppById(appId, userId = null) {
    try {
      const where = { id: appId };
      if (userId) {
        where.ownerId = userId;
      }

      const app = await App.findOne({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      });

      return app;
    } catch (error) {
      console.error('Error getting app:', error);
      throw error;
    }
  }

  async getAppsByUser(userId) {
    try {
      const apps = await App.findAll({
        where: { ownerId: userId },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      return apps;
    } catch (error) {
      console.error('Error getting user apps:', error);
      throw error;
    }
  }

  async updateApp(appId, userId, updateData) {
    try {
      const app = await App.findOne({
        where: { id: appId, ownerId: userId },
      });

      if (!app) {
        throw new Error('App not found or access denied');
      }

      const allowedFields = ['name', 'description', 'permissions', 'isActive'];
      const updates = {};

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      await app.update(updates);
      return app;
    } catch (error) {
      console.error('Error updating app:', error);
      throw error;
    }
  }

  async deleteApp(appId, userId) {
    try {
      const app = await App.findOne({
        where: { id: appId, ownerId: userId },
      });

      if (!app) {
        throw new Error('App not found or access denied');
      }

      await app.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting app:', error);
      throw error;
    }
  }

  async regenerateApiKeys(appId, userId) {
    try {
      const app = await App.findOne({
        where: { id: appId, ownerId: userId },
      });

      if (!app) {
        throw new Error('App not found or access denied');
      }

      const newApiKey = this.generateApiKey();
      const newApiSecret = this.generateApiSecret();

      await app.update({
        apiKey: newApiKey,
        apiSecret: newApiSecret,
      });

      return app;
    } catch (error) {
      console.error('Error regenerating API keys:', error);
      throw error;
    }
  }

  async authenticateApp(apiKey, apiSecret) {
    try {
      const app = await App.findOne({
        where: { 
          apiKey, 
          apiSecret, 
          isActive: true 
        },
      });

      if (app) {
        // Обновляем время последнего использования
        await app.update({ lastUsed: Math.floor(Date.now() / 1000) });
        return app;
      }

      return null;
    } catch (error) {
      console.error('Error authenticating app:', error);
      throw error;
    }
  }

  async checkRateLimit(appId) {
    try {
      const app = await App.findByPk(appId);
      if (!app) {
        throw new Error('App not found');
      }

      // Здесь должна быть реализация проверки rate limit
      // Для примера просто возвращаем true
      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      throw error;
    }
  }

  async hasPermission(appId, permission) {
    try {
      const app = await App.findByPk(appId);
      if (!app) {
        return false;
      }

      return app.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Вспомогательные методы
  generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateApiSecret() {
    return crypto.randomBytes(64).toString('hex');
  }
}

module.exports = new AppService();