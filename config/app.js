module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h',
  bcryptRounds: 12,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // limit each IP to 100 requests per windowMs
  feed: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  notifications: {
    batchSize: 50,
    maxRetries: 3,
  },
  apps: {
    maxAppsPerUser: 10,
    apiRateLimit: 1000,
  }
};