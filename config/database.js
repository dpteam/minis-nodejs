const { Sequelize } = require('sequelize');

// Конфигурация базы данных
const config = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log,
  },
  production: {
    dialect: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'minis',
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Создаем экземпляр Sequelize
const sequelize = new Sequelize(dbConfig);

module.exports = { sequelize, Sequelize };