const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user'
      });
      
      Notification.belongsTo(models.User, { 
        foreignKey: 'actorId', 
        as: 'actor'
      });
      
      Notification.belongsTo(models.Message, { 
        foreignKey: 'messageId', 
        as: 'message'
      });
    }
  }

  Notification.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    actorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('like', 'comment', 'friend_request', 'friend_accept', 'mention'),
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
    timestamps: true
  });

  return Notification;
};