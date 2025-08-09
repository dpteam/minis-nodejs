const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      Friendship.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user'
      });
      
      Friendship.belongsTo(models.User, { 
        foreignKey: 'friendId', 
        as: 'friend'
      });
    }
  }

  Friendship.init({
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
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Friendship',
    tableName: 'Friendships',
    timestamps: true,
    // Убираем составной индекс, чтобы избежать проблем
    indexes: [
      {
        unique: true,
        fields: ['userId', 'friendId']
      }
    ]
  });

  return Friendship;
};