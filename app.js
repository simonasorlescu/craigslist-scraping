var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var request = require('request');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

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

// routes
app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/search', ensureAuthenticated, function(req, res){
  res.render('search', { user: req.user });
});

app.get('/searching', function(req, res){
  // input value from search
  var val = req.query.search;
  // url used to search yql
  var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20craigslist.search" +
  "%20where%20location%3D%22sfbay%22%20and%20type%3D%22jjj%22%20and%20query%3D%22" + val + "%22&format=" +
  "json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

  requests(url,function(data){
      res.send(data);
  });
});

app.get('/auth/google', passport.authenticate('google', {scope: ['email']}));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/fail'
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

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

// serialize and deserialize
passport.serializeUser(function(user, callback){
        console.log('serializing user.');
        callback(null, user.id);
    });

passport.deserializeUser(function(user, callback){
       console.log('deserialize user.');
       callback(null, user.id);
    });

// config
passport.use(new GoogleStrategy({
    clientID: '60568825522-52qmtg82t11tm3pa35b7q0r39a00j5pk.apps.googleusercontent.com',
    clientSecret: 'votoysXixm8uVwpq5rfh1EVq',
    callbackURL: "https://craigslist-scraping.herokuapp.com/auth/google/callback"
},
function (accessToken, refreshToken, profile, done) {
    console.log(profile); //profile contains all the personal data returned
    done(null, profile)
}
));

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
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
