const db = require('../db');

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.query(
      'INSERT INTO groups (name, description, creator_id) VALUES (?, ?, ?)',
      [name, description, req.user.id]
    );
    
    // Добавляем создателя в участники группы
    await db.query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [result.insertId, req.user.id]
    );
    
    res.status(201).json({ id: result.insertId, name, description });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка создания группы' });
  }
};

exports.getSuggestedGroups = async (req, res) => {
  try {
    const [groups] = await db.query(`
      SELECT g.*, u.name as creator_name
      FROM groups g
      JOIN users u ON g.creator_id = u.id
      ORDER BY g.created_at DESC
      LIMIT 10
    `);
      
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения групп' });
  }
};