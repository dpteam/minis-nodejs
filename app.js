const express = require('express');
const path = require('path');
const sequelize = require('./config/database');

// Импортируем модели
const db = require('./models');

// Импортируем маршруты
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const friendsRouter = require('./routes/friends');
const photosRouter = require('./routes/photos');
const groupsRouter = require('./routes/groups');
const appsRouter = require('./routes/apps');
const eventsRouter = require('./routes/events');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Подключение маршрутов
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/friends', friendsRouter);
app.use('/photos', photosRouter);
app.use('/groups', groupsRouter);
app.use('/apps', appsRouter);
app.use('/events', eventsRouter);

// Обработка ошибок
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Страница не найдена'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
});

// Синхронизация базы данных и запуск сервера
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Синхронизируем модели с базой данных
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();