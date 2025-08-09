const { User } = require('../models');
const bcrypt = require('bcrypt');

async function up() {
  // Создание тестовых пользователей
  const sampleUsers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 12),
      bio: 'Software developer passionate about social networks',
      preferences: JSON.stringify({
        emailNotifications: true,
        pushNotifications: true,
        theme: 'light',
        language: 'en'
      })
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 12),
      bio: 'UX designer and frontend developer',
      preferences: JSON.stringify({
        emailNotifications: true,
        pushNotifications: false,
        theme: 'dark',
        language: 'en'
      })
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      password: await bcrypt.hash('password123', 12),
      bio: 'Full-stack developer and tech enthusiast',
      preferences: JSON.stringify({
        emailNotifications: false,
        pushNotifications: true,
        theme: 'auto',
        language: 'en'
      })
    },
    {
      firstName: 'Alice',
      lastName: 'Brown',
      email: 'alice@example.com',
      password: await bcrypt.hash('password123', 12),
      bio: 'Product manager with a love for agile methodologies',
      preferences: JSON.stringify({
        emailNotifications: true,
        pushNotifications: true,
        theme: 'light',
        language: 'en'
      })
    },
    {
      firstName: 'Charlie',
      lastName: 'Wilson',
      email: 'charlie@example.com',
      password: await bcrypt.hash('password123', 12),
      bio: 'DevOps engineer and automation expert',
      preferences: JSON.stringify({
        emailNotifications: false,
        pushNotifications: false,
        theme: 'dark',
        language: 'en'
      })
    }
  ];
  
  await User.bulkCreate(sampleUsers);
  console.log('Sample users created successfully');
}

async function down() {
  await User.destroy({
    where: {
      email: {
        [require('sequelize').Op.in]: [
          'john@example.com',
          'jane@example.com',
          'bob@example.com',
          'alice@example.com',
          'charlie@example.com'
        ]
      }
    }
  });
  
  console.log('Sample users removed');
}

module.exports = { up, down };