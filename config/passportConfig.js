// config/passportConfig.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Ensure the path is correct

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

// Serialize & Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

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