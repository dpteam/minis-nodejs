const { Message, User } = require('../models');

async function up() {
  // Получаем пользователей
  const users = await User.findAll();
  if (users.length === 0) {
    console.log('No users found. Skipping sample messages creation.');
    return;
  }
  
  // Создание тестовых сообщений
  const sampleMessages = [
    {
      content: 'Welcome to Minis! This is a minimalist social network built with Node.js and SQLite.',
      userId: users[0].id,
      visibility: 'public'
    },
    {
      content: 'Just deployed my first Node.js application. Excited to share it with the community! 🚀',
      userId: users[1].id,
      visibility: 'public'
    },
    {
      content: 'Working on a new project using React and Express. The development experience is amazing!',
      userId: users[2].id,
      visibility: 'public'
    },
    {
      content: 'Does anyone have experience with Docker? I\'m trying to containerize my application.',
      userId: users[3].id,
      visibility: 'public'
    },
    {
      content: 'Just finished reading "Clean Code" by Robert Martin. Highly recommend it to all developers! 📚',
      userId: users[4].id,
      visibility: 'public'
    },
    {
      content: 'Looking for collaborators on an open-source project. DM me if interested!',
      userId: users[0].id,
      visibility: 'public'
    },
    {
      content: 'The weather is perfect today for some outdoor coding. ☀️',
      userId: users[1].id,
      visibility: 'public'
    },
    {
      content: 'Just discovered a great new CSS framework. Check it out!',
      userId: users[2].id,
      visibility: 'public',
      mentions: JSON.stringify(['jane'])
    },
    {
      content: 'Productivity tip: Use the Pomodoro technique to stay focused during work sessions.',
      userId: users[3].id,
      visibility: 'public'
    },
    {
      content: 'Excited to announce that our team just launched a new feature! 🎉',
      userId: users[4].id,
      visibility: 'public'
    }
  ];
  
  // Добавляем постTime для каждого сообщения (разное время)
  const now = Math.floor(Date.now() / 1000);
  const messagesWithTime = sampleMessages.map((msg, index) => ({
    ...msg,
    postTime: now - (index * 3600) // Каждое сообщение на час раньше
  }));
  
  await Message.bulkCreate(messagesWithTime);
  console.log('Sample messages created successfully');
}

async function down() {
  await Message.destroy({
    where: {
      content: {
        [require('sequelize').Op.or]: [
          { [require('sequelize').Op.like]: '%Welcome to Minis!%' },
          { [require('sequelize').Op.like]: '%Just deployed%' },
          { [require('sequelize').Op.like]: '%Working on a new project%' },
          { [require('sequelize').Op.like]: '%Does anyone have experience%' },
          { [require('sequelize').Op.like]: '%Just finished reading%' },
          { [require('sequelize').Op.like]: '%Looking for collaborators%' },
          { [require('sequelize').Op.like]: '%The weather is perfect%' },
          { [require('sequelize').Op.like]: '%Just discovered%' },
          { [require('sequelize').Op.like]: '%Productivity tip%' },
          { [require('sequelize').Op.like]: '%Excited to announce%' }
        ]
      }
    }
  });
  
  console.log('Sample messages removed');
}

module.exports = { up, down };