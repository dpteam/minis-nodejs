const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserGroup = sequelize.define('UserGroup', {
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
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    }
  },
  createdAt: {
    type: DataTypes.INTEGER,
    defaultValue: () => Math.floor(Date.now() / 1000),
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
});

module.exports = UserGroup;