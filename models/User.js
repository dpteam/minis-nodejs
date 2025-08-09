const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  emailPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
  registrationTime: {
    type: DataTypes.INTEGER,
    defaultValue: () => Math.floor(Date.now() / 1000),
  },
  lastActivityTime: {
    type: DataTypes.INTEGER,
    defaultValue: () => Math.floor(Date.now() / 1000),
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user',
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      emailNotifications: true,
      pushNotifications: true,
      showEmail: false,
      theme: 'light',
      language: 'en',
    }
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  },
  instanceMethods: {
    validPassword: async function(password) {
      return await bcrypt.compare(password, this.password);
    }
  }
});

module.exports = User;