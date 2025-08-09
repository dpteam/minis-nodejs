const jwt = require('jsonwebtoken');
const { User, App } = require('../models');
const config = require('../config/app');

const ensureAuthenticated = async (req, res, next) => {
  try {
    const token = req.session.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.redirect('/login');
    }

    // Обновляем время последней активности
    await user.update({ lastActivityTime: Math.floor(Date.now() / 1000) });

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.redirect('/login');
  }
};

const authenticateApp = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
      return res.status(401).json({ error: 'API key and secret required' });
    }

    const app = await App.findOne({
      where: { apiKey, apiSecret, isActive: true },
    });

    if (!app) {
      return res.status(401).json({ error: 'Invalid API credentials' });
    }

    // Обновляем время последнего использования
    await app.update({ lastUsed: Math.floor(Date.now() / 1000) });

    req.app = app;
    next();
  } catch (error) {
    console.error('App authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.app) {
      return res.status(401).json({ error: 'App authentication required' });
    }

    const hasPermission = req.app.permissions.includes(permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  ensureAuthenticated,
  authenticateApp,
  requireRole,
  requirePermission,
};