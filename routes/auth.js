const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validation');
const router = express.Router();

// Registration route (GET and POST)
router.get('/register', (req, res) => {
  res.render('register', { error: req.flash('error') });
});

router.post('/register', async (req, res) => {
  // Validate Input
  const { error } = registerValidation.validate(req.body);
  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect('/register');
  }

  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    req.flash('success', 'Registration successful!');
    res.redirect('/login');
  } catch (err) {
    console.error('Error during registration:', err);
    req.flash('error', 'Error registering user');
    res.redirect('/register');
  }
});

// Login route (GET and POST)
router.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') });
});

router.post('/login', async (req, res, next) => {
  // Validate Input
  const { error } = loginValidation.validate(req.body);
  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect('/login');
  }

  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.flash('success', 'You have logged out successfully!');
    res.redirect('/login');
  });
});

// Dashboard route (GET)
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be logged in to access the dashboard');
    return res.redirect('/login');
  }
  res.render('dashboard'); // Render the dashboard page
});

module.exports = router;