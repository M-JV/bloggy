const express = require('express');
const Post = require('../models/Post');
const { postValidation } = require('../validation');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

// Show Create Post Form
router.get('/posts/new', isAuthenticated, (req, res) => {
  res.render('new-post', { error: req.flash('error') });
});

// Handle Post Creation
router.post('/posts', isAuthenticated, async (req, res) => {
  // Validate Input
  const { error } = postValidation.validate(req.body);
  if (error) {
    req.flash('error', error.details[0].message);
    return res.redirect('/posts/new');
  }

  try {
    const { title, content, tags } = req.body;
    const post = new Post({ title, content, tags, createdBy: req.user._id });
    await post.save();
    req.flash('success', 'Post created successfully!');
    res.redirect('/posts');
  } catch (err) {
    console.error('Error creating post:', err);
    req.flash('error', 'Error creating post');
    res.redirect('/posts/new');
  }
});

// View All Posts with Search Functionality
router.get('/posts', async (req, res) => {
  const searchTerm = req.query.search; // Get search term from query string

  try {
    let query = {};
    if (searchTerm) {
      // MongoDB $regex for partial matches (case-insensitive)
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } }, // Search by title
          { tags: { $regex: searchTerm, $options: 'i' } },  // Search by tags
        ],
      };
    }

    const posts = await Post.find(query).populate('createdBy', 'username'); // Populate author info
    res.render('posts', { posts, searchTerm }); // Pass searchTerm to the template
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error', 'Error fetching posts');
    res.redirect('/');
  }
});

// View a Single Post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('createdBy', 'username');
    res.render('post', { post });
  } catch (err) {
    console.error('Error fetching post:', err);
    req.flash('error', 'Error fetching post');
    res.redirect('/posts');
  }
});

// Edit a Post (GET)
router.get('/posts/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!req.user._id.equals(post.createdBy)) {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/posts');
    }
    res.render('edit-post', { post });
  } catch (err) {
    console.error('Error fetching post for edit:', err);
    req.flash('error', 'Error fetching post');
    res.redirect('/posts');
  }
});

// Update a Post (POST)
router.post('/posts/:id', isAuthenticated, async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!req.user._id.equals(post.createdBy)) {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/posts');
    }

    // Update post fields
    post.title = title;
    post.content = content;
    post.tags = tags;
    await post.save();
    req.flash('success', 'Post updated successfully!');
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error('Error updating post:', err);
    req.flash('error', 'Error updating post');
    res.redirect(`/posts/${post._id}/edit`);
  }
});

// Delete a Post
router.post('/posts/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!req.user._id.equals(post.createdBy)) {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/posts');
    }

    await post.remove();
    req.flash('success', 'Post deleted successfully!');
    res.redirect('/posts');
  } catch (err) {
    console.error('Error deleting post:', err);
    req.flash('error', 'Error deleting post');
    res.redirect('/posts');
  }
});

module.exports = router;