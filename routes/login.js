const express = require('express');
const router = express.Router();
const passport = require('passport'); // Добавляем эту строку

router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  
  // Получаем flash-сообщения об ошибках, если они есть
  const error = req.flash('error');
  
  res.render('login', { 
    title: 'Вход',
    error: error.length > 0 ? error[0] : null
  });
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true // Включаем flash-сообщения при ошибке
}));

module.exports = router;