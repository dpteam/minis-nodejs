const express = require('express');
const router = express.Router();
const db = require('../db');

// Только GET-маршрут для /events
router.get('/', async (req, res) => {
  try {
    const events = await db.query('SELECT * FROM events');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения событий' });
  }
});

module.exports = router;