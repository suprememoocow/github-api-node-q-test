/* jshint node:true */
"use strict";

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var github = require('./routes/github');
var http = require('http');
var path = require('path');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = "97ca92c7b69de5d6c701";
var GITHUB_CLIENT_SECRET = "42225a6deef706df3a501ec5f4130cb86166a654";

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/github/auth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, { accessToken: accessToken, refreshToken: refreshToken, profile: profile });
  }
));


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: '2981298wkdjdasbjsdoiqw'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/github/auth',
  passport.authorize('github'));

app.get('/github/auth/callback',
  passport.authorize('github', { failureRedirect: '/' }),
  function(req, res) {
    req.session.account = req.account;
    res.redirect('/github/select');
  });


app.get('/github/select', github.list);
app.post('/github/submit', github.submit);
app.get('/github/submit', github.complete);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
