const { sequelize, User, Message, Friendship } = require('./models');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // Синхронизируем модели
    await sequelize.sync({ force: true });
    console.log('Database synchronized');
    
    // Создаем тестовых пользователей
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user1 = await User.create({
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@example.com',
      password: hashedPassword,
      avatar: '/img/avatar1.png',
      bio: 'Люблю музыку и программирование',
      city: 'Москва'
    });
    
    const user2 = await User.create({
      firstName: 'Мария',
      lastName: 'Сидорова',
      email: 'maria@example.com',
      password: hashedPassword,
      avatar: '/img/avatar2.png',
      bio: 'Фотограф и путешественник',
      city: 'Санкт-Петербург'
    });
    
    const user3 = await User.create({
      firstName: 'Алексей',
      lastName: 'Козлов',
      email: 'alex@example.com',
      password: hashedPassword,
      avatar: '/img/avatar3.png',
      bio: 'Студент технического университета',
      city: 'Новосибирск'
    });
    
    console.log('Users created');
    
    // Создаем дружбу между пользователями
    await Friendship.create({
      userId: user1.id,
      friendId: user2.id,
      status: 'accepted'
    });
    
    await Friendship.create({
      userId: user1.id,
      friendId: user3.id,
      status: 'accepted'
    });
    
    console.log('Friendships created');
    
    // Создаем тестовые сообщения
    await Message.create({
      userId: user1.id,
      content: 'Привет всем! Это мой первый пост в ВКонтакте!',
      postTime: new Date(Date.now() - 3600000),
      visibility: 'public'
    });
    
    await Message.create({
      userId: user2.id,
      content: 'Сегодня отличный день! Солнце светит, настроение хорошее.',
      postTime: new Date(Date.now() - 7200000),
      visibility: 'public'
    });
    
    await Message.create({
      userId: user3.id,
      content: 'Кто-нибудь смотрел новый фильм? Как вам?',
      postTime: new Date(Date.now() - 10800000),
      visibility: 'public'
    });
    
    console.log('Messages created');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();