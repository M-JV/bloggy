// config/passportConfig.js

const passport = require('passport'); // Core Passport
const LocalStrategy = require('passport-local').Strategy; // “Username & password” strategy
const bcrypt = require('bcrypt'); // For comparing password hashes
const User = require('../models/User');  // Your Mongoose user model

// defininh local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'User not found. Please register first.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid password. Please try again.' });
      }

      return done(null, user);
    } catch (err) {
      console.error('Error in authentication:', err);
      return done(null, false, { message: 'An error occurred. Please try again later.' });
    }
  })
);

// Session Serialization & Deserialization 

// storing users id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// On each subsequent request, Passport pulls that id out of the session
// and calls deserializeUser to turn it back into a full user object.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false, { message: 'User session invalid. Please log in again.' });
    }
    done(null, user);
  } catch (err) {
    console.error('Error in session management:', err);
    done(err, false);
  }
});

module.exports = passport;