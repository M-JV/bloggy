const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Admin route to view users
router.get('/admin/users', isAdmin, async (req, res) => {
  const users = await User.find();
  res.render('admin-users', { users });
});

// Admin route to view posts
router.get('/admin/posts', isAdmin, async (req, res) => {
    try {
        const posts = await Post.find().populate('createdBy', 'username');
        res.render('admin-posts', { posts });
    } catch (err) {
        console.error('Error fetching posts:', err);
        req.flash('error', 'Error fetching posts');
        res.redirect('/admin');
    }
});

// Admin Dashboard
router.get('/admin', isAdmin, (req, res) => {
    res.render('admin-dashboard');
});

// Delete Any Post
router.post('/admin/posts/:id/delete', isAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    req.flash('success', 'Post deleted successfully.');
    res.redirect('/admin/posts');
  } catch (err) {
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/admin/posts');
  }
});

module.exports = router;
