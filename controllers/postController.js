const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: ['user'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения постов'
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.create({
      content,
      userId: req.user.id
    });
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания поста'
    });
  }
};