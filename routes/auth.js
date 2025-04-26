// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../controllers/validation');

// GET Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// POST Register User
router.post('/register', async (req, res) => {
  try {
    // Validate the incoming data
    const { error } = registerValidation.validate(req.body);

    if (error) {
      req.flash('error', error.details.map(detail => detail.message));
      return res.redirect('/register');
    }

    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists.');
      return res.redirect('/register');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    req.flash('success', 'Registration successful! You can now log in.');
    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Something went wrong during registration.');
    res.redirect('/register');
  }
});

// GET Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// POST Login User
router.post('/login', (req, res, next) => {
  const { error } = loginValidation.validate(req.body);

  if (error) {
    req.flash('error', error.details.map(detail => detail.message));
    return res.redirect('/login');
  }

  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome back!',
  })(req, res, next);
});

// GET Logout User
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      req.flash('error', 'Error logging out.');
      return res.redirect('/');
    }
    req.flash('success', 'Logged out successfully.');
    res.redirect('/login');
  });
});

module.exports = router;
