const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ isFakeNews: false })
      .select('_id publishedAt')
      .sort({ publishedAt: -1 })
      .limit(1000)
      .lean();

    const baseUrl = 'https://worldtoday.news';
    const staticPages = ['', '/about', '/contact', '/premium', '/forum'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    articles.forEach(article => {
      xml += `
  <url>
    <loc>${baseUrl}/article/${article._id}</loc>
    <lastmod>${new Date(article.publishedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
