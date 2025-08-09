const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsToMany(models.User, { 
        through: models.UserGroup, 
        as: 'members',
        foreignKey: 'groupId',
        otherKey: 'userId'
      });
      
      Group.hasMany(models.Message, { 
        foreignKey: 'groupId', 
        as: 'messages'
      });
    }
  }

  Group.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: null
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Group',
    tableName: 'Groups',
    timestamps: true
  });

  return Group;
};