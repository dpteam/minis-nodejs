const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Ассоциация с сообщениями
      User.hasMany(models.Message, { 
        foreignKey: 'userId', 
        as: 'messages',
        onDelete: 'CASCADE'
      });
      
      // Ассоциация с лайками
      User.hasMany(models.Like, { 
        foreignKey: 'userId', 
        as: 'likes',
        onDelete: 'CASCADE'
      });
      
      // Ассоциация с друзьями (многие-ко-многим через таблицу Friendships)
      User.belongsToMany(User, { 
        through: models.Friendship, 
        as: 'friends',
        foreignKey: 'userId',
        otherKey: 'friendId',
        timestamps: false
      });
      
      // Ассоциация с группами (многие-ко-многим через таблицу UserGroups)
      User.belongsToMany(models.Group, { 
        through: models.UserGroup, 
        as: 'groups',
        foreignKey: 'userId',
        otherKey: 'groupId'
      });
      
      // Ассоциация с приватными сообщениями (отправленные)
      User.hasMany(models.PrivateMessage, { 
        foreignKey: 'senderId', 
        as: 'sentMessages',
        onDelete: 'CASCADE'
      });
      
      // Ассоциация с приватными сообщениями (полученные)
      User.hasMany(models.PrivateMessage, { 
        foreignKey: 'receiverId', 
        as: 'receivedMessages',
        onDelete: 'CASCADE'
      });
      
      // Ассоциация с уведомлениями
      User.hasMany(models.Notification, { 
        foreignKey: 'userId', 
        as: 'notifications',
        onDelete: 'CASCADE'
      });
      
      // Ассоциация с приложениями (многие-ко-многим через таблицу UserApps)
      User.belongsToMany(models.App, { 
        through: 'UserApps', 
        as: 'apps',
        foreignKey: 'userId',
        otherKey: 'appId'
      });
    }

    // Метод для проверки пароля
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Метод для получения полного имени
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    // Метод для получения публичных данных
    getPublicProfile() {
      return {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        avatar: this.avatar,
        bio: this.bio,
        city: this.city
      };
    }
  }

  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    birthDate: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    city: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: null
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  });

  return User;
};