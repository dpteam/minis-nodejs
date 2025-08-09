// Константы приложения
module.exports = {
  // Роли пользователей
  USER_ROLES: {
    USER: 'user',
    MODERATOR: 'moderator',
    ADMIN: 'admin',
  },

  // Типы уведомлений
  NOTIFICATION_TYPES: {
    MESSAGE: 'message',
    LIKE: 'like',
    FRIEND_REQUEST: 'friend_request',
    MENTION: 'mention',
    COMMENT: 'comment',
    SYSTEM: 'system',
  },

  // Типы лайков
  LIKE_TYPES: {
    LIKE: 'like',
    DISLIKE: 'dislike',
  },

  // Статусы дружбы
  FRIENDSHIP_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked',
  },

  // Видимость сообщений
  MESSAGE_VISIBILITY: {
    PUBLIC: 'public',
    FRIENDS: 'friends',
    PRIVATE: 'private',
  },

  // Разрешения для приложений
  APP_PERMISSIONS: {
    READ_PROFILE: 'read:profile',
    WRITE_PROFILE: 'write:profile',
    READ_MESSAGES: 'read:messages',
    WRITE_MESSAGES: 'write:messages',
    READ_FRIENDS: 'read:friends',
    WRITE_FRIENDS: 'write:friends',
    READ_NOTIFICATIONS: 'read:notifications',
    WRITE_NOTIFICATIONS: 'write:notifications',
    READ_GROUPS: 'read:groups',
    WRITE_GROUPS: 'write:groups',
  },

  // Ограничения
  LIMITS: {
    MAX_MESSAGE_LENGTH: 5000,
    MAX_BIO_LENGTH: 1000,
    MAX_APP_NAME_LENGTH: 100,
    MAX_APP_DESCRIPTION_LENGTH: 500,
    MAX_APPS_PER_USER: 10,
    MAX_FRIENDS_PER_USER: 1000,
    MAX_GROUPS_PER_USER: 50,
    MAX_MEMBERS_PER_GROUP: 500,
    MAX_NOTIFICATIONS_PER_USER: 1000,
    MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 минут
    API_RATE_LIMIT: 1000,
    API_RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 минут
  },

  // Временные интервалы (в секундах)
  TIME_INTERVALS: {
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    WEEK: 604800,
    MONTH: 2592000,
    YEAR: 31536000,
  },

  // Статусы HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Типы контента
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_URLENCODED: 'application/x-www-form-urlencoded',
    MULTIPART_FORM_DATA: 'multipart/form-data',
  },

  // Регулярные выражения
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    URL: /^https?:\/\/.+\..+/,
    MENTION: /@(\w+)/g,
    HASHTAG: /#(\w+)/g,
  },

  // Коды ошибок
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  },

  // События
  EVENTS: {
    USER_REGISTERED: 'user:registered',
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    MESSAGE_CREATED: 'message:created',
    MESSAGE_DELETED: 'message:deleted',
    LIKE_CREATED: 'like:created',
    FRIEND_REQUEST_SENT: 'friend:request:sent',
    FRIEND_REQUEST_ACCEPTED: 'friend:request:accepted',
    NOTIFICATION_CREATED: 'notification:created',
    APP_CREATED: 'app:created',
  },

  // Настройки кэширования
  CACHE: {
    DEFAULT_TTL: 3600, // 1 час
    USER_PROFILE_TTL: 1800, // 30 минут
    MESSAGE_CACHE_TTL: 300, // 5 минут
    FEED_CACHE_TTL: 600, // 10 минут
  },

  // Настройки безопасности
  SECURITY: {
    BCRYPT_ROUNDS: 12,
    JWT_EXPIRATION: '24h',
    SESSION_SECRET_LENGTH: 32,
    API_KEY_LENGTH: 64,
    API_SECRET_LENGTH: 128,
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 минут
  },

  // Настройки базы данных
  DATABASE: {
    MAX_CONNECTIONS: 10,
    MIN_CONNECTIONS: 2,
    ACQUIRE_TIMEOUT: 60000,
    IDLE_TIMEOUT: 300000,
  },
};