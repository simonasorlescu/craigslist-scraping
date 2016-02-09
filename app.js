var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var request = require('request');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose')
var passport = require('./authentication');

// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('./config');
var user = require('./models/user');
var routes = require('./routes');

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

// serialize and deserialize
// passport.serializeUser(function(user, done) {
//   done(null, user);
// });

// passport.deserializeUser(function(obj, done) {
//   done(null, obj);
// });

// passport settings
// passport.serializeUser(function(user, done) {
//   console.log('serializeUser: ' + user.id)
//   done(null, user.id);
// });
// passport.deserializeUser(function(id, done) {
//   user.findOne({_id : id}, function(err, user) {
//     console.log(user)
//     if(!err) done(null, user);
//     else done(err, null)
//   });
// });

// config
// passport.use(new GoogleStrategy({
//   clientID: config.google.clientID,
//   clientSecret: config.google.clientSecret,
//   callbackURL: config.google.callbackURL
// },
// function (accessToken, refreshToken, profile, done) {
//   User.findOne({ oauthID: profile.id }, function(err, user) {
//     if(err) { console.log(err); }
//     if (!err && user != null) {
//      done(null, user);
//     } else {
//      var user = new User({
//        oauthID: profile.id,
//        created: Date.now()
//      });
//      user.save(function(err) {
//        if(err) {
//          console.log(err);
//        } else {
//          console.log("saving user ...");
//          done(null, user);
//        };
//      });
//     };
//   });
// }
// function (accessToken, refreshToken, profile, done) {
//     console.log(profile.emails[0].value)
//     process.nextTick(function() {
//       var query = user.findOne({'email': profile.emails[0].value});
//       query.exec(function(err, oldUser) {
//         if(oldUser) {
//           console.log("Found registered user: " + oldUser.name + " is logged in!");
//           done(null, oldUser);
//         } else {
//           var newUser = new user();
//           newUser.name = profile.displayName;
//           newUser.email = profile.emails[0].value;
//           console.log(newUser);
//           newUser.save(function(err){
//             if(err){
//               throw err;
//             }
//             console.log("New user, " + newUser.name + ", was created");
//             done(null, newUser);
//           });
//         }
//       });
//     });
//   }
// ));


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
