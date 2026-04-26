const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');
const { protect } = require('../middleware/auth');

// Get all topics
router.get('/topics', async (req, res) => {
  try {
    const topics = await Forum.distinct('topic');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get threads by topic
router.get('/threads', async (req, res) => {
  try {
    const { topic, page = 1, limit = 20 } = req.query;
    const query = topic ? { topic } : {};
    const threads = await Forum.find(query)
      .populate('author', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single thread
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await Forum.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar').populate('replies.author', 'name avatar').lean();
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create thread
router.post('/threads', protect, async (req, res) => {
  try {
    const { title, content, topic } = req.body;
    if (!title || !content || !topic) {
      return res.status(400).json({ message: 'Title, content, and topic required' });
    }
    const thread = await Forum.create({ title, content, topic, author: req.user._id });
    await thread.populate('author', 'name avatar');
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to thread
router.post('/threads/:id/reply', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content required' });

    const thread = await Forum.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.isLocked) return res.status(400).json({ message: 'Thread is locked' });

    thread.replies.push({ content, author: req.user._id });
    await thread.save();
    await thread.populate('replies.author', 'name avatar');

    res.json(thread.replies[thread.replies.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
