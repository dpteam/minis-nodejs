const fs = require('fs');
const path = require('path');

// Удаляем файл базы данных, если он существует
const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Database file deleted');
}

// Импортируем и инициализируем sequelize
const { sequelize } = require('./models');

async function resetDatabase() {
  try {
    // Проверяем подключение к базе данных
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Создаем все таблицы заново
    await sequelize.sync({ force: true });
    console.log('All tables recreated successfully');
    
    // Создаем тестового пользователя
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await sequelize.models.User.create({
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@example.com',
      password: hashedPassword,
      bio: 'Люблю музыку и программирование',
      city: 'Москва'
    });
    
    console.log('Test user created:', user.id);
    
    // Создаем тестовое сообщение
    await sequelize.models.Message.create({
      userId: user.id,
      content: 'Привет всем! Это мой первый пост в ВКонтакте!',
      visibility: 'public'
    });
    
    console.log('Test message created');
    
    console.log('Database reset successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();