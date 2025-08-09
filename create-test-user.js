const { sequelize, User } = require('./models');
const bcrypt = require('bcrypt');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Синхронизируем модели с базой данных
    await sequelize.sync();
    console.log('Database models synchronized.');
    
    // Проверяем, существует ли уже пользователь
    const existingUser = await User.findOne({ where: { email: 'test@example.com' } });
    
    if (existingUser) {
      console.log('Test user already exists:');
      console.log(`Email: test@example.com`);
      console.log(`Password: password123`);
      process.exit(0);
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Создаем тестового пользователя
    const user = await User.create({
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'test@example.com',
      password: hashedPassword,
      bio: 'Тестовый пользователь',
      city: 'Москва'
    });
    
    console.log('Test user created successfully:');
    console.log(`Email: test@example.com`);
    console.log(`Password: password123`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser();