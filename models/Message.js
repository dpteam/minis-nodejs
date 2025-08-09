const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  deleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'friends'),
    defaultValue: 'public'
  },
  postTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  timestamps: true
});

// Define associations
Message.associate = (models) => {
  Message.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'author'
  });
  
  Message.hasMany(models.Like, {
    foreignKey: 'messageId',
    as: 'likes'
  });
  
  Message.hasMany(Message, {
    foreignKey: 'parentId',
    as: 'replies'
  });
  
  Message.belongsTo(Message, {
    foreignKey: 'parentId',
    as: 'parent'
  });
};

module.exports = Message;