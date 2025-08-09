const { sequelize } = require('../config/database');
const User = require('./User');
const Message = require('./Message');
const Friendship = require('./Friendship');
const PrivateMessage = require('./PrivateMessage');
const Like = require('./Like');
const UserGroup = require('./UserGroup');
const Notification = require('./Notification');
const App = require('./App');

// Определяем ассоциации
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Message, { foreignKey: 'addresseeId', as: 'addressedMessages' });
Message.belongsTo(User, { foreignKey: 'addresseeId', as: 'addressee' });

Message.hasMany(Message, { foreignKey: 'parentId', as: 'replies' });
Message.belongsTo(Message, { foreignKey: 'parentId', as: 'parent' });

// Friendships
User.belongsToMany(User, { 
  through: Friendship, 
  as: 'friends', 
  foreignKey: 'userId', 
  otherKey: 'friendId' 
});

// Private Messages
User.hasMany(PrivateMessage, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(PrivateMessage, { foreignKey: 'receiverId', as: 'receivedMessages' });
PrivateMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
PrivateMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Likes
User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });
Message.hasMany(Like, { foreignKey: 'messageId' });
Like.belongsTo(Message, { foreignKey: 'messageId' });

// User Groups
User.belongsToMany(UserGroup, { through: 'UserGroupMembers' });
UserGroup.belongsToMany(User, { through: 'UserGroupMembers' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Apps
User.hasMany(App, { foreignKey: 'ownerId' });
App.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = {
  sequelize,
  User,
  Message,
  Friendship,
  PrivateMessage,
  Like,
  UserGroup,
  Notification,
  App,
};