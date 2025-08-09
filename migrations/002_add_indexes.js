const { sequelize } = require('../config/database');

async function up() {
  // Дополнительные индексы для оптимизации запросов
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_messages_parentId" ON "Messages"("parentId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_messages_addresseeId" ON "Messages"("addresseeId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_friendships_userId" ON "Friendships"("userId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_friendships_friendId" ON "Friendships"("friendId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_type" ON "Notifications"("type");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_createdAt" ON "Notifications"("createdAt");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_apps_ownerId" ON "Apps"("ownerId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_apps_apiKey" ON "Apps"("apiKey");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_userGroups_ownerId" ON "UserGroups"("ownerId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_userGroupMembers_groupId" ON "UserGroupMembers"("groupId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_privateMessages_sentAt" ON "PrivateMessages"("sentAt");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_privateMessages_isRead" ON "PrivateMessages"("isRead");`);
  
  // Композитные индексы для сложных запросов
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_messages_user_postTime" ON "Messages"("userId", "postTime");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "Notifications"("userId", "isRead");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_privateMessages_conversation" ON "PrivateMessages"("senderId", "receiverId");`);
}

async function down() {
  // Удаление дополнительных индексов
  await sequelize.query(`DROP INDEX IF EXISTS "idx_messages_parentId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_messages_addresseeId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_friendships_userId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_friendships_friendId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_notifications_type";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_notifications_createdAt";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_apps_ownerId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_apps_apiKey";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_userGroups_ownerId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_userGroupMembers_groupId";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_privateMessages_sentAt";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_privateMessages_isRead";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_messages_user_postTime";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_notifications_user_read";`);
  await sequelize.query(`DROP INDEX IF EXISTS "idx_privateMessages_conversation";`);
}

module.exports = { up, down };