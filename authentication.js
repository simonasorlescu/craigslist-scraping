// authentication
var mongoose = require('mongoose')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('./config');
// var user = require('./models/user');

// create a user model
var User = mongoose.model('User', {
  oauthID: Number
});

// passport settings
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user.id)
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  user.findOne({_id : id}, function(err, user) {
    console.log(user)
    if(!err) done(null, user);
    else done(err, null)
  });
});

// config
passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL
},
function (accessToken, refreshToken, profile, done) {
  // console.log(profile.emails[0].value)
  User.findOne({ oauthID: profile.id }, function(err, user) {
    if(err) { console.log(err); }
    if (!err && user != null) {
     done(null, user);
    } else {
     var user = new User({
       oauthID: profile.id,
       created: Date.now()
     });
     user.save(function(err) {
       if(err) {
         console.log(err);
       } else {
         console.log("saving user ...");
         done(null, user);
       };
     });
    };
  });

    // process.nextTick(function() {
    //   var query = user.findOne({'email': profile.emails[0].value});
    //   query.exec(function(err, oldUser) {
    //     if(oldUser) {
    //       console.log("Found registered user: " + oldUser.name + " is logged in!");
    //       done(null, oldUser);
    //     } else {
    //       var newUser = new user();
    //       newUser.name = profile.displayName;
    //       newUser.email = profile.emails[0].value;
    //       console.log(newUser);
    //       newUser.save(function(err){
    //         if(err){
    //           throw err;
    //         }
    //         console.log("New user, " + newUser.name + ", was created");
    //         done(null, newUser);
    //       });
    //     }
    //   });
    // });
  }
));






//   function(identifier, profile, done) {
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

module.exports = passport;