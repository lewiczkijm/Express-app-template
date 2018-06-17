var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookies = require('cookies')
var logger = require('morgan');
var engine = require('ejs-layout');



var accessUser = require('./middleware/access-user')
var menu = require('./middleware/menu')
var router = require('./middleware/router')

const documentsCtrl = require('./controllers/documents')
const apiCtrl = require('./controllers/api')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.engine('ejs', engine.__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookies.express())

app.use(express.static(path.join(__dirname, 'public')));

// Включение прослоек пользователя и меню
app.use(accessUser)
app.use(menu(documentsCtrl))


app.use('/',router(documentsCtrl))
app.use('/api',router(apiCtrl))

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
