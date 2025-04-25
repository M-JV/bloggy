const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../controllers/validation');
const router = express.Router();

// Registration (GET + POST)
router.get('/register', (req, res) => {
    res.render('register', { error: req.flash('error'), success: req.flash('success') });
});

router.post('/register', async (req, res) => {
    const { error } = registerValidation.validate(req.body);
    if (error) {
        req.flash('error', error.details[0].message);
        return res.redirect('/register');
    }

    try {
        const { username, password } = req.body;
        if (await User.findOne({ username })) {
            req.flash('error', 'Username already exists');
            return res.redirect('/register');
        }

        const user = new User({ username, password });
        await user.save();
        req.flash('success', 'Registration successful');
        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        req.flash('error', 'Error registering user');
        res.redirect('/register');
    }
});

// Login (GET + POST)
router.get('/login', (req, res) => {
    res.render('login', { error: req.flash('error'), success: req.flash('success') });
});

router.post('/login', (req, res, next) => {
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

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success', 'Logged out successfully');
        res.redirect('/login');
    });
});

// Dashboard
router.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    res.render('dashboard');
});

module.exports = router;
