const { User } = require('../models');
const bcrypt = require('bcrypt');

async function up() {
  // Создание администратора
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@minis.local',
    password: hashedPassword,
    emailPublic: false,
    bio: 'System administrator',
    role: 'admin',
    isActive: true,
    preferences: JSON.stringify({
      emailNotifications: true,
      pushNotifications: true,
      theme: 'light',
      language: 'en'
    })
  });
  
  console.log('Admin user created successfully');
}

async function down() {
  await User.destroy({
    where: {
      email: 'admin@minis.local'
    }
  });
  
  console.log('Admin user removed');
}

module.exports = { up, down };