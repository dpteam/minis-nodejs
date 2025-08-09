const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const App = sequelize.define('App', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  apiSecret: {
    type: DataTypes.STRING,
    allowNull: false
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUsed: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'apps',
  timestamps: true
});

module.exports = App;