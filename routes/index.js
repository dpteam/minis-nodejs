const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const feedService = require('../services/feedService');

// Главная страница
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const feed = await feedService.getPublicFeed(page, limit);
        
        res.render('index', {
            title: 'Minis - Minimal Social Network',
            posts: feed.rows, // Передаем массив записей как posts
            user: req.user,
            currentPage: page,
            totalPages: Math.ceil(feed.count / limit),
        });
    } catch (error) {
        console.error('Error loading feed:', error);
        res.status(500).render('error', {
            message: 'Error loading feed',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

// Лента пользователя
router.get('/feed', ensureAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const feedType = req.query.type || 'all'; // all, friends, groups
        const feed = await feedService.getUserFeed(req.user.id, feedType, page, limit);
        
        res.render('feed', {
            title: 'Your Feed',
            posts: feed.rows, // Передаем массив записей как posts
            feedType,
            user: req.user,
            currentPage: page,
            totalPages: Math.ceil(feed.count / limit),
        });
    } catch (error) {
        console.error('Error loading user feed:', error);
        res.status(500).render('error', {
            message: 'Error loading feed',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
});

module.exports = router;