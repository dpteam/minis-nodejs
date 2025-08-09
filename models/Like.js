const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    }
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Messages',
      key: 'id',
    }
  },
  type: {
    type: DataTypes.ENUM('like', 'dislike'),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.INTEGER,
    defaultValue: () => Math.floor(Date.now() / 1000),
  }
});

module.exports = Like;