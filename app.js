var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var taskRouter = require('./routes/taskRoutes');
var usersRouter = require('./routes/userRoutes');

var app = express();

// Database setup from https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://admin:fullstackapp@cluster0-gnqm2.mongodb.net/todomap?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Found how to start with a file other than index.html here:
// https://stackoverflow.com/questions/25166726/express-serves-index-html-even-when-my-routing-is-to-a-different-file
app.get('/', function(req, res, next) {
  res.redirect("login.html");
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tasks', taskRouter);
app.use('/users', usersRouter);

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
