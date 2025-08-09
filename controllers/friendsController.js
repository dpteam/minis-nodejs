const db = require('../db');

exports.getRequests = async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT fr.id, u.name, u.avatar 
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
    `, [req.user.id]);
    
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения запросов' });
  }
};

exports.findFriends = async (req, res) => {
  try {
    const { query } = req.query;
    const [users] = await db.query(`
      SELECT id, name, avatar 
      FROM users 
      WHERE (name LIKE ? OR email LIKE ?) 
        AND id != ?
      LIMIT 10
    `, [`%${query}%`, `%${query}%`, req.user.id]);
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка поиска' });
  }
};