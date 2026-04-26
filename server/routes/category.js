const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// Get all categories with article counts
router.get('/', async (req, res) => {
  try {
    const { country = 'us' } = req.query;

    const categories = await Article.aggregate([
      { $match: { country, isFakeNews: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(categories.map(cat => ({
      name: cat._id,
      count: cat.count
    })));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending tags
router.get('/tags/trending', async (req, res) => {
  try {
    const { country = 'us', limit = 20 } = req.query;

    const tags = await Article.aggregate([
      { $match: { country, isFakeNews: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(tags.map(tag => ({
      name: tag._id,
      count: tag.count
    })));
  } catch (error) {
    console.error('Get trending tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
