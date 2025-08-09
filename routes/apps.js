const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const apps = await db.query('SELECT * FROM applications');
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения приложений' });
  }
});

module.exports = router;