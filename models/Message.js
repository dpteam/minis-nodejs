const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'author'
      });
      
      Message.belongsTo(models.User, { 
        foreignKey: 'addresseeId', 
        as: 'addressee'
      });
      
      Message.hasMany(models.Message, { 
        foreignKey: 'parentId', 
        as: 'replies'
      });
      
      Message.belongsTo(models.Message, { 
        foreignKey: 'parentId', 
        as: 'parent'
      });
      
      Message.hasMany(models.Like, { 
        foreignKey: 'messageId', 
        as: 'likes'  // Убедимся, что псевдоним 'likes'
      });
    }
  }

  Message.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    addresseeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'id'
      }
    },
    postTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mentions: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('mentions');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('mentions', JSON.stringify(value));
      }
    },
    hashtags: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('hashtags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('hashtags', JSON.stringify(value));
      }
    },
    visibility: {
      type: DataTypes.ENUM('public', 'friends', 'private'),
      defaultValue: 'public'
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
    timestamps: true
  });

  return Message;
};