const express = require('express');
const mongoose = require('mongoose');
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
  const searchTerm = req.query.search;

  try {
    let query = {};
    if (searchTerm) {
      query = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
        ],
      };
    }

    const posts = await Post.find(query).populate('createdBy', 'username');
    res.render('posts', { posts, searchTerm });
  } catch (err) {
    console.error('Error fetching posts:', err);
    req.flash('error', 'Error fetching posts');
    res.redirect('/');
  }
});

// View a Single Post
router.get('/posts/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid post ID');
    return res.redirect('/posts');
  }

  try {
    const post = await Post.findById(id).populate('createdBy', 'username');
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/posts');
    }

    res.render('post', { post });
  } catch (err) {
    console.error('Error fetching post:', err);
    req.flash('error', 'Error fetching post');
    res.redirect('/posts');
  }
});

// Edit a Post (GET)
router.get('/posts/:id/edit', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid post ID');
    return res.redirect('/posts');
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/posts');
    }

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
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid post ID');
    return res.redirect('/posts');
  }

  const { title, content, tags } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/posts');
    }

    if (!req.user._id.equals(post.createdBy)) {
      req.flash('error', 'Unauthorized access');
      return res.redirect('/posts');
    }

    post.title = title;
    post.content = content;
    post.tags = tags;
    await post.save();
    req.flash('success', 'Post updated successfully!');
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error('Error updating post:', err);
    req.flash('error', 'Error updating post');
    res.redirect(`/posts/${id}/edit`);
  }
});

// Delete a Post
router.post('/posts/:id/delete', isAuthenticated, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid post ID');
    return res.redirect('/posts');
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/posts');
    }

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
