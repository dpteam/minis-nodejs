const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // Найти пользователя по email
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
          return done(null, false, { message: 'Пользователь не найден' });
        }
        
        // Сравнить пароли
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Неверный пароль' });
        }
        
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error);
      }
    })
  );
  
  // Сериализация пользователя
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Десериализация пользователя
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};