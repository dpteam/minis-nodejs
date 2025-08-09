const express = require('express');
const router = express.Router();
const photosController = require('../controllers/photosController');

// Используем middleware загрузки как массив middleware
router.post('/upload', photosController.uploadPhoto);

module.exports = router;