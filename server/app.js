var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var models = require('./models.js');
var User = models.User
var Document = models.Document

var routes = require('./routes.js');
var auth = require('./auth.js');

var app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);


// app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));
app.use(cookieParser('keyboard cat'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieSession({
  keys: ['keyboard cat'],
  name: 'session',
  saveUninitialized: true,
  resave: true,
  maxAge: 1000000
}));
// app.use(session({ secret: 'keyboard cat' }));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// passport strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
    User.findOne({ username: username }, function (err, user) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) {
        console.log(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        console.log(user);
        return done(null, false, { message: 'Incorrect username.' });
      }
      // if passwords do not match, auth failed
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      // auth has has succeeded
      return done(null, user);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', auth(passport));

app.use('/', function(req, res, next){
  console.log('middleware', req.user)
  console.log('req.session', req.session)
  if(!req.user){
    res.json({
      success: false,
      error: "User Not Logged In"
    })
  }else{
    next();
  }
})

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      success: false,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    success: false,
    error: err
  });
});


io.on('connection', (socket) => {
  console.log('connected backend');

  //check for number of users in a room
  socket.on('watchDoc', ({id, username}, next) =>{
    console.log('@@backend watchDoc fired ',id, username)
    Document.findById(id, (error, res) => {
      if (res.numUser.length > 0) {
        console.log('@@socket.join', id)
        socket.join(id)
        //console.log(res)
        //res.update({ _id: id}, {
      //    numUser: res.numUser++
        //})
        User.findOne({username: username}, function(err, result){
          if(err){
            // socket.emit("Could not find User");
          }else{
            result.color=res.numUser[0];
            res.numUser.shift();
            socket.emit('color', result.color);
          }
        })
      } else {
        socket.emit('joinRoomError', 'room full, cannot join ')
      }
      next();
    })
  })
  //step 2 update sync
  socket.on('sync', ({id, content,username}) => {
    console.log("SYNC", id);
    console.log("CONTENT", content);
    //console.log("DOC", doc);
    socket.to(id).emit('update', {content, username})
  })

  socket.on('closeDocument', (docId, user) =>{
    Document.findById(docId, (err, res)=>{
      if(err){
        socket.emit('Error Closing the Document');
      }else{
        res.numUser.push(user.color);
        user.color = '';
      }
    })
  })

  //selection and highlighting
  socket.on('selection', ({selectionState, color, docId}) => {
    socket.to(docId).emit('otherUserSelection', {selectionState, color})
  })
})


server.listen(process.env.PORT || 3000)
