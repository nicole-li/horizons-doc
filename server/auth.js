var express = require('express');
var router = express.Router();
var models = require('.././src/models.js');


module.exports = function(passport) {

  // POST registration page
  var validateReq = function(userData) {
    return (userData.body.password === userData.body.passwordRepeat);
  };

  router.post('/register', function(req, res) {
    // validation step
    if (!validateReq(req)) {
      res.render('/register', {
        error: "Passwords don't match."
      });
    }

    User.find({username: req.body.username}, (err, result) => {
      if (result) {
        res.send({
          success: false,
          user: req.body.username,
          status: '500',
          error: 'username exists, try a different name'
        }
    })

    var u = new models.User({
      username: req.body.username,
      password: req.body.password,
      docList: []
    });

    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.send({
          success: false,
          user: u,
          status: '500',
          error: err
        })
        return;
      }
      console.log(user)
      res.send({
        success: true,
        user: u,
        status: '400'
      });
    });
  });

  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.send({});
  });

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  return router;
};
