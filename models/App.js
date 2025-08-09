const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const App = sequelize.define('App', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    }
  },
  apiKey: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  apiSecret: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: ['read:profile', 'read:messages'],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.INTEGER,
    defaultValue: () => Math.floor(Date.now() / 1000),
  },
  lastUsed: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  rateLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
  }
});

module.exports = App;