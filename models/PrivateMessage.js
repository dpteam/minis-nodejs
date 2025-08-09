const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PrivateMessage extends Model {
    static associate(models) {
      PrivateMessage.belongsTo(models.User, { 
        foreignKey: 'senderId', 
        as: 'sender'
      });
      
      PrivateMessage.belongsTo(models.User, { 
        foreignKey: 'receiverId', 
        as: 'receiver'
      });
    }
  }

  PrivateMessage.init({
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'PrivateMessage',
    tableName: 'PrivateMessages',
    timestamps: true
  });

  return PrivateMessage;
};