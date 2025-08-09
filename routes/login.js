const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('login', { title: 'Вход' });
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

module.exports = router;