// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const Post = require('../models/Post'); // Ensure this path is correct

// Import Passport configuration
require('../config/passportConfig'); // Make sure this points to your passportConfig.js file

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://mejova:me1jo2va3%40@bloggy.u09ewis.mongodb.net/?retryWrites=true&w=majority&appName=Bloggy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {
    console.log('Connected to MongoDB Atlas successfully!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
  

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.set('view engine', 'pug'); // Set Pug as the view engine

// Session and Passport
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.user;
  next();
});

// Routes
const authRoutes = require('../routes/auth'); // Authentication routes
app.use(authRoutes); // Use the routes

const postRoutes = require('../routes/posts'); // Import post routes
app.use(postRoutes); // Register the blog post routes

const adminRoutes = require('../routes/admin');
app.use(adminRoutes); // Use admin routes

app.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'username').limit(3);
    res.render('home', { posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error', 'Error loading homepage.');
    res.redirect('/posts');
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const posts = await Post.find({ title: { $regex: query, $options: 'i' } });
    res.render('posts/search', { posts, query });
  } catch (err) {
    req.flash('error', 'Error while searching.');
    res.redirect('/');
  }
});


// Server Startup
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

