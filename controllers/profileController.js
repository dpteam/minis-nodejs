const db = require('../db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    // Получаем основную информацию о пользователе
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }
    const user = users[0];
    // Получаем друзей пользователя
    const [friends] = await db.query(`
      SELECT u.id, u.name, u.avatar
      FROM users u
      JOIN friends f ON u.id = f.friend_id
      WHERE f.user_id = ?
    `, [userId]);
    // Получаем посты пользователя
    const [posts] = await db.query('SELECT * FROM posts WHERE user_id = ?', [userId]);
    res.render('profile', {
      user,
      friends,
      posts,
      isOwner: req.user.id === userId
    });
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
    res.status(500).send('Ошибка загрузки профиля');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const { name, email, avatar, bio } = req.body;
    
    // Update user information
    await db.query(
      'UPDATE users SET name = ?, email = ?, avatar = ?, bio = ? WHERE id = ?',
      [name, email, avatar, bio, userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).send('Ошибка обновления профиля');
  }
};