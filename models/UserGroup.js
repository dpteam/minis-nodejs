const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserGroup extends Model {
    static associate(models) {
      UserGroup.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user'
      });
      
      UserGroup.belongsTo(models.Group, { 
        foreignKey: 'groupId', 
        as: 'group'
      });
    }
  }

  UserGroup.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('member', 'moderator', 'admin'),
      defaultValue: 'member'
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserGroup',
    tableName: 'UserGroups',
    timestamps: true,
    // Убираем составной индекс, чтобы избежать проблем
    indexes: [
      {
        unique: true,
        fields: ['userId', 'groupId']
      }
    ]
  });

  return UserGroup;
};