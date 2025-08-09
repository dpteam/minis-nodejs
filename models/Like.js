const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'messages',
      key: 'id'
    }
  }
}, {
  tableName: 'likes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'messageId']
    }
  ]
});

// Define associations
Like.associate = (models) => {
  Like.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Like.belongsTo(models.Message, {
    foreignKey: 'messageId',
    as: 'message'
  });
};

module.exports = Like;