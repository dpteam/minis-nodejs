const { sequelize } = require('../config/database');

// Глобальная настройка перед тестами
beforeAll(async () => {
  // Подключение к тестовой базе данных
  await sequelize.authenticate();
  console.log('Test database connection established successfully');
});

// Глобальная очистка после тестов
afterAll(async () => {
  // Закрытие соединения с базой данных
  await sequelize.close();
  console.log('Test database connection closed');
});

// Очистка базы данных перед каждым тестом
beforeEach(async () => {
  // Очистка всех таблиц
  await sequelize.query('DELETE FROM "Apps";');
  await sequelize.query('DELETE FROM "Notifications";');
  await sequelize.query('DELETE FROM "UserGroupMembers";');
  await sequelize.query('DELETE FROM "UserGroups";');
  await sequelize.query('DELETE FROM "Likes";');
  await sequelize.query('DELETE FROM "PrivateMessages";');
  await sequelize.query('DELETE FROM "Friendships";');
  await sequelize.query('DELETE FROM "Messages";');
  await sequelize.query('DELETE FROM "Users";');
});

// Глобальные тестовые утилиты
global.testUtils = {
  // Создание тестового пользователя
  async createUser(userData = {}) {
    const defaultData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      emailPublic: false,
      bio: 'Test user',
      role: 'user',
      isActive: true,
      preferences: '{}'
    };
    
    const { User } = require('../models');
    return await User.create({ ...defaultData, ...userData });
  },
  
  // Создание тестового сообщения
  async createMessage(messageData = {}) {
    const defaultData = {
      content: 'Test message',
      visibility: 'public'
    };
    
    const { Message } = require('../models');
    return await Message.create({ ...defaultData, ...messageData });
  },
  
  // Создание тестовой дружбы
  async createFriendship(friendshipData = {}) {
    const defaultData = {
      status: 'pending'
    };
    
    const { Friendship } = require('../models');
    return await Friendship.create({ ...defaultData, ...friendshipData });
  },
  
  // Генерация случайной строки
  generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Генерация случайного email
  generateRandomEmail() {
    return `test-${this.generateRandomString()}@example.com`;
  }
};