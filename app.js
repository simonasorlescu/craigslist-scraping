var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var request = require('request');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose')

var config = require('./config');
var user = require('./models/user');
var routes = require('./routes');
var passport = require('./authentication');

var app = express();

// connect to the database
mongoose.connect(config.mongoUrl);

// all environments
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'my_precious'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);

// user routes
app.get('/', routes.index);
app.get('/search', ensureAuthenticated, routes.search);
app.get('/searching', ensureAuthenticated, routes.searching);
app.get('/logout', function(req, res){
  req.logOut();
  res.redirect('/');
});

// auth routes
app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/search',
  failureRedirect: '/'
}));

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}


function requests(url, callback) {
  // request module is used to process the yql url and return the results in JSON format
  request(url, function(err, resp, body) {
    var resultsArray = [];
  body = JSON.parse(body);
  // console.log(body.query.results.RDF.item)
  // logic used to compare search results with the input from user
  if (!body.query.results.RDF.item) {
    results = "No results found. Try again.";
    callback(results);
  } else {
    results = body.query.results.RDF.item;
    for (var i = 0; i < results.length; i++) {
      resultsArray.push(
        {title:results[i].title[0], about:results[i]["about"], desc:results[i]["description"]}
      );
    };
  };
    // pass back the results to client side
    callback(resultsArray);
  });
};

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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
