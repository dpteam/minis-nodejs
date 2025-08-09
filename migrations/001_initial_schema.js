const { sequelize } = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Users" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "firstName" VARCHAR(100) NOT NULL,
      "lastName" VARCHAR(100) NOT NULL,
      "email" VARCHAR(100) NOT NULL UNIQUE,
      "password" VARCHAR(255) NOT NULL,
      "emailPublic" BOOLEAN DEFAULT 0,
      "bio" TEXT DEFAULT '',
      "avatar" VARCHAR(255),
      "registrationTime" INTEGER DEFAULT (strftime('%s', 'now')),
      "lastActivityTime" INTEGER DEFAULT (strftime('%s', 'now')),
      "isActive" BOOLEAN DEFAULT 1,
      "role" VARCHAR(20) DEFAULT 'user',
      "preferences" TEXT DEFAULT '{}',
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Messages" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL,
      "addresseeId" INTEGER,
      "parentId" INTEGER,
      "postTime" INTEGER DEFAULT (strftime('%s', 'now')),
      "content" TEXT NOT NULL,
      "deleted" BOOLEAN DEFAULT 0,
      "isPrivate" BOOLEAN DEFAULT 0,
      "mentions" TEXT DEFAULT '[]',
      "hashtags" TEXT DEFAULT '[]',
      "visibility" VARCHAR(20) DEFAULT 'public',
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,
      FOREIGN KEY ("addresseeId") REFERENCES "Users"("id") ON DELETE SET NULL,
      FOREIGN KEY ("parentId") REFERENCES "Messages"("id") ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Friendships" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL,
      "friendId" INTEGER NOT NULL,
      "status" VARCHAR(20) DEFAULT 'pending',
      "createdAt" INTEGER DEFAULT (strftime('%s', 'now')),
      "updatedAt" INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,
      FOREIGN KEY ("friendId") REFERENCES "Users"("id") ON DELETE CASCADE,
      UNIQUE ("userId", "friendId")
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "PrivateMessages" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "senderId" INTEGER NOT NULL,
      "receiverId" INTEGER NOT NULL,
      "content" TEXT NOT NULL,
      "isRead" BOOLEAN DEFAULT 0,
      "sentAt" INTEGER DEFAULT (strftime('%s', 'now')),
      "readAt" INTEGER,
      "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE,
      FOREIGN KEY ("receiverId") REFERENCES "Users"("id") ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Likes" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL,
      "messageId" INTEGER NOT NULL,
      "type" VARCHAR(10) NOT NULL DEFAULT 'like',
      "createdAt" INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,
      FOREIGN KEY ("messageId") REFERENCES "Messages"("id") ON DELETE CASCADE,
      UNIQUE ("userId", "messageId")
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "UserGroups" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" VARCHAR(100) NOT NULL,
      "description" TEXT,
      "isPrivate" BOOLEAN DEFAULT 0,
      "ownerId" INTEGER NOT NULL,
      "avatar" VARCHAR(255),
      "createdAt" INTEGER DEFAULT (strftime('%s', 'now')),
      "updatedAt" INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "UserGroupMembers" (
      "userId" INTEGER NOT NULL,
      "groupId" INTEGER NOT NULL,
      "role" VARCHAR(20) DEFAULT 'member',
      "joinedAt" INTEGER DEFAULT (strftime('%s', 'now')),
      PRIMARY KEY ("userId", "groupId"),
      FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE,
      FOREIGN KEY ("groupId") REFERENCES "UserGroups"("id") ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Notifications" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "userId" INTEGER NOT NULL,
      "type" VARCHAR(20) NOT NULL,
      "title" VARCHAR(255) NOT NULL,
      "message" TEXT NOT NULL,
      "isRead" BOOLEAN DEFAULT 0,
      "data" TEXT DEFAULT '{}',
      "createdAt" INTEGER DEFAULT (strftime('%s', 'now')),
      "expiresAt" INTEGER,
      FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE
    );
  `);

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS "Apps" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "name" VARCHAR(100) NOT NULL,
      "description" TEXT,
      "ownerId" INTEGER NOT NULL,
      "apiKey" VARCHAR(255) NOT NULL UNIQUE,
      "apiSecret" VARCHAR(255) NOT NULL,
      "permissions" TEXT DEFAULT '["read:profile", "read:messages"]',
      "isActive" BOOLEAN DEFAULT 1,
      "createdAt" INTEGER DEFAULT (strftime('%s', 'now')),
      "lastUsed" INTEGER,
      "rateLimit" INTEGER DEFAULT 1000,
      FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE CASCADE
    );
  `);

  // Создание индексов для оптимизации производительности
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_messages_userId" ON "Messages"("userId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_messages_postTime" ON "Messages"("postTime");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_messages_visibility" ON "Messages"("visibility");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_friendships_status" ON "Friendships"("status");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_userId" ON "Notifications"("userId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_isRead" ON "Notifications"("isRead");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_likes_messageId" ON "Likes"("messageId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_privateMessages_senderId" ON "PrivateMessages"("senderId");`);
  await sequelize.query(`CREATE INDEX IF NOT EXISTS "idx_privateMessages_receiverId" ON "PrivateMessages"("receiverId");`);
}

async function down() {
  await sequelize.query(`DROP TABLE IF EXISTS "Apps";`);
  await sequelize.query(`DROP TABLE IF EXISTS "Notifications";`);
  await sequelize.query(`DROP TABLE IF EXISTS "UserGroupMembers";`);
  await sequelize.query(`DROP TABLE IF EXISTS "UserGroups";`);
  await sequelize.query(`DROP TABLE IF EXISTS "Likes";`);
  await sequelize.query(`DROP TABLE IF EXISTS "PrivateMessages";`);
  await sequelize.query(`DROP TABLE IF EXISTS "Friendships";`);
  await sequelize.query(`DROP TABLE IF EXISTS "Messages";`);
  await sequelize.query(`DROP TABLE IF EXISTS "Users";`);
}

module.exports = { up, down };