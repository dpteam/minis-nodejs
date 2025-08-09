const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Получить все посты
router.get('/', postController.getPosts);

// Создать новый пост
router.post('/', auth, postController.createPost);

// Получить пост по ID
router.get('/:id', postController.getPostById);

// Обновить пост
router.put('/:id', auth, postController.updatePost);

// Удалить пост
router.delete('/:id', auth, postController.deletePost);

module.exports = router;