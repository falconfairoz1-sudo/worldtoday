const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const RSS = require('rss');

function buildFeed(title, description, articles) {
  const feed = new RSS({
    title: `WorldToday - ${title}`,
    description,
    feed_url: 'https://worldtoday.news/rss',
    site_url: 'https://worldtoday.news',
    image_url: 'https://worldtoday.news/logo.png',
    language: 'en',
    ttl: 5,
  });

  articles.forEach(article => {
    feed.item({
      title: article.title,
      description: article.description || '',
      url: `https://worldtoday.news/article/${article._id}`,
      guid: article._id.toString(),
      categories: [article.category],
      author: article.author || 'WorldToday',
      date: article.publishedAt,
      enclosure: article.urlToImage ? { url: article.urlToImage } : undefined,
      custom_elements: [{ 'content:encoded': { _cdata: article.content || article.description || '' } }]
    });
  });

  return feed.xml({ indent: true });
}

// RSS by category
router.get('/category/:category', async (req, res) => {
  try {
    const articles = await Article.find({
      category: req.params.category,
      isFakeNews: false
    }).sort({ publishedAt: -1 }).limit(20).lean();

    res.set('Content-Type', 'application/rss+xml');
    res.send(buildFeed(
      `${req.params.category} News`,
      `Latest ${req.params.category} news from WorldToday`,
      articles
    ));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// RSS by country
router.get('/country/:country', async (req, res) => {
  try {
    const articles = await Article.find({
      country: req.params.country,
      isFakeNews: false
    }).sort({ publishedAt: -1 }).limit(20).lean();

    res.set('Content-Type', 'application/rss+xml');
    res.send(buildFeed(
      `${req.params.country.toUpperCase()} News`,
      `Latest news from ${req.params.country.toUpperCase()} on WorldToday`,
      articles
    ));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Breaking news RSS
router.get('/breaking', async (req, res) => {
  try {
    const articles = await Article.find({
      isBreaking: true,
      isFakeNews: false
    }).sort({ publishedAt: -1 }).limit(20).lean();

    res.set('Content-Type', 'application/rss+xml');
    res.send(buildFeed('Breaking News', 'Breaking news from WorldToday', articles));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
