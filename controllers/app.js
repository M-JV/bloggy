// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const path = require('path');
const Post = require('../models/Post'); // Make sure this path is correct
const { csrfProtection, addCsrfToken } = require('../middleware/csrf');


// Import Passport configuration
require('../config/passportConfig'); // Ensure this points to your passportConfig.js file

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://mejova:me1jo2va3%40@bloggy.u09ewis.mongodb.net/?retryWrites=true&w=majority&appName=Bloggy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Middleware Setup
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

app.set('view engine', 'pug'); // Set Pug as the view engine

// Session middleware
app.use(session({
  secret: 'yourSecretKey', // Replace with a strong secret in production!
  resave: false,
  saveUninitialized: false,
}));

// Flash middleware (MUST come immediately after session)
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CSRF Protection Middleware
app.use(csrfProtection);
app.use(addCsrfToken);


// Global Variables Middleware (for flash messages and user info)
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
});

// Route Handlers
const authRoutes = require('../routes/auth');
const postRoutes = require('../routes/posts');
const adminRoutes = require('../routes/admin');

app.use(authRoutes);
app.use(postRoutes);
app.use(adminRoutes);

// Home Route
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('createdBy', 'username')
      .limit(3);

    res.render('home', { posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error', 'Error loading homepage.');
    res.redirect('/posts');
  }
});

// CSRF Error Handler
app.use(function (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    req.flash('error', 'Invalid CSRF token.');
    res.redirect('back');
  } else {
    next(err);
  }
});


// Server Startup
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at: http://localhost:${PORT}`);
});
