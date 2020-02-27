var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
// var session = require('express-session');
// var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mysqlRouter = require('./routes/mysql');
var boardRouter = require('./routes/board');

var apiUserRouter = require('./routes/api/user');
var apiBoardRouter = require('./routes/api/board');

var app = express();

//set Passport middlewares
// app.use(cookieParser());
// app.use(bodyParser.urlendcoded({extended:true}));
// app.use(bodyParser.json());
// app.use(session({
//   secret: 'enter secret key',
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// //Passport Session - 인증을 지원하기 위해선 세션의 유니크한 값을 넣어줘야한다 
// //user => serialize(user인스턴스로 부터 유니크한 값을 반환),deserialize(유니크한 값을 이용하여 user 인스턴스를 구하도록 구현)
// passport.serializeUser(function(user,done){
//   done(null,user.id);
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/mysql',mysqlRouter);
app.use('/board',boardRouter);

app.use('/api/user', apiUserRouter);
app.use('/api/board' , apiBoardRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
