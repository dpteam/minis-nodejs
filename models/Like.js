const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { 
        foreignKey: 'userId', 
        as: 'user'
      });
      
      Like.belongsTo(models.Message, { 
        foreignKey: 'messageId', 
        as: 'message'
      });
    }
  }

  Like.init({
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
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike', 'funny', 'wow', 'sad', 'angry'),
      defaultValue: 'like'
    }
  }, {
    sequelize,
    modelName: 'Like',
    tableName: 'Likes',
    timestamps: true,
    // Убираем составной индекс, чтобы избежать проблем
    indexes: [
      {
        unique: true,
        fields: ['userId', 'messageId']
      }
    ]
  });

  return Like;
};