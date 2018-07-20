
var express = require('express');
var router = express.Router();
var models = require('./models.js');
var User = models.User

module.exports = function (passport) {
  // POST registration page
  var validateReq = function(userData) {
    return (userData.body.password === userData.body.passwordRepeat);
  };

  router.post('/register', function(req, res) {
    // validation step
    //console.log("Body for register", req.body);
    User.findOne({username: req.body.username}, (err, result) => {
      if (result) {
        res.json({
          success: false,
          user: req.body.username,
          status: '500',
          error: 'username exists, try a different name'
        })

      } else {
        if(!validateReq(req)) {
          res.json({
            success: false,
            user: req.body.username,
            status: '400',
            error: 'passwords dont match, try again'
          })
        } else {
          var u = new User({
            username: req.body.username,
            password: req.body.password,
            docList: []
          });

          u.save(function(err, user){
            if(err){
              console.log(err);
              res.json({
                success: false,
                user: u,
                status: '500',
                error: err
              })
            }else{
              res.json({
                success: true,
                user: u,
                status: '200'
              });
            }
          })
        }
      }
    })
  })


  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    //console.log('req.user', req.user)
    //console.log('req.session', req.session)
    res.json({
      success: true,
    });
  })


  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.json({success: true})
  });

  return router;
};
