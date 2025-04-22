const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Admin Dashboard
router.get('/admin', isAdmin, (req, res) => {
  res.render('admin-dashboard'); // Render admin panel
});

// View All Users
router.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.render('admin-users', { users });
  } catch (err) {
    req.flash('error', 'Error fetching users');
    res.redirect('/admin');
  }
});

// View All Posts
router.get('/admin/posts', isAdmin, async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'username'); // Fetch all posts with author info
    res.render('admin-posts', { posts });
  } catch (err) {
    req.flash('error', 'Error fetching posts');
    res.redirect('/admin');
  }
});

// Delete Any Post
router.post('/admin/posts/:id/delete', isAdmin, async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id); // Delete post by ID
    req.flash('success', 'Post deleted successfully!');
    res.redirect('/admin/posts');
  } catch (err) {
    req.flash('error', 'Error deleting post');
    res.redirect('/admin/posts');
  }
});

module.exports = router;