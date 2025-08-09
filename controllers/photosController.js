const db = require('../db');
const multer = require('multer');
const path = require('path');

// Конфигурация Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Middleware загрузки
exports.uploadPhoto = [
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
      }
      
      const url = `/uploads/${req.file.filename}`;
      const [result] = await db.query(
        'INSERT INTO photos (url, owner_id, description) VALUES (?, ?, ?)',
        [url, req.user.id, req.body.description || '']
      );
      
      res.status(201).json({
        id: result.insertId,
        url,
        description: req.body.description
      });
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      res.status(500).json({ message: 'Ошибка загрузки фото' });
    }
  }
];