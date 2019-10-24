const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const USER_ROLES = require('./constant').USER_ROLES;

require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    async (accessToken, refreshToken, profile, done) => {
      const currentUser = await User.findOne({ googleId: profile.id });
      if (currentUser) {
        return done(null, currentUser);
      } else {
        const newUser = await new User({ googleId: profile.id, role: USER_ROLES.STUDENT }).save();
        return done(null, newUser);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      enableProof: true,
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      const currentUser = await User.findOne({ facebookId: profile.id });
      console.log(profile.id);
      if (currentUser) {
        return done(null, currentUser);
      } else {
        const newUser = await new User({ facebookId: profile.id, role: USER_ROLES.STUDENT }).save();
        return done(null, newUser);
      }
    }
  )
);
