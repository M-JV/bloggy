const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { isAdmin } = require('../middleware/auth');
const router = express.Router();

// Admin Dashboard
router.get('/admin', isAdmin, (req, res) => {
    res.render('admin-dashboard');
});

// View All Users
router.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('username isAdmin'); // Select only needed fields
        res.render('admin-users', { users });
    } catch (err) {
        console.error('Error fetching users:', err);
        req.flash('error', 'Error fetching users');
        res.redirect('/admin');
    }
});

// View All Posts
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

// Delete Any Post
router.post('/admin/posts/:id/delete', isAdmin, async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            req.flash('error', 'Invalid post ID');
            return res.redirect('/admin/posts');
        }

        await Post.findByIdAndDelete(req.params.id);
        req.flash('success', 'Post deleted successfully');
        res.redirect('/admin/posts');
    } catch (err) {
        console.error('Error deleting post:', err);
        req.flash('error', 'Error deleting post');
        res.redirect('/admin/posts');
    }
});

module.exports = router;
