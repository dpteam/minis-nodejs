const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const db = require('./models');
const { sequelize } = db;
const indexRouter = require('./routes/index');
const profileRouter = require('./routes/profile');
const friendsRouter = require('./routes/friends');
const messagesRouter = require('./routes/messages');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const editRouter = require('./routes/edit');
const groupsRouter = require('./routes/groups');
const photosRouter = require('./routes/photos');
const appsRoutes = require('./routes/apps'); // Добавьте этот импорт
const eventsRoutes = require('./routes/events'); // Добавьте этот импорт

const app = express();

// Настройка шаблонизатора
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессий
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Подключаем flash сообщения
app.use(flash());

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Настройка стратегии Passport
require('./config/passport')(passport);

// Маршруты
app.use('/', indexRouter);
app.use('/profile', profileRouter);
app.use('/friends', friendsRouter);
app.use('/messages', messagesRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/edit', editRouter);
app.use('/groups', groupsRouter);
app.use('/photos', photosRouter);
app.use('/apps', appsRoutes);
app.use('/events', eventsRoutes);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Просто синхронизируем модели без изменения существующих таблиц
    await sequelize.sync();
    console.log('Database models synchronized.');
    
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Unable to start server:', error);
  }
});

// Обработка 404 ошибок
app.use((req, res, next) => {
  res.status(404).send('Страница не найдена');
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ошибка сервера');
});