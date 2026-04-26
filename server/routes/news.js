const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes - specific routes BEFORE parameterized routes
router.get('/breaking', newsController.getBreaking);
router.get('/trending', newsController.getTrending);
router.get('/trending-topics', newsController.getTrendingTopics);
router.get('/search', newsController.searchArticles);
router.get('/', newsController.getNews);

// Parameterized routes
router.get('/:id/related', newsController.getRelated);
router.get('/:id/liveblog-updates', newsController.getLiveBlogUpdates);
router.post('/:id/view', newsController.trackView);
router.get('/:id', optionalAuth, newsController.getArticle);

// Protected routes
router.get('/feed/personalized', protect, newsController.getPersonalized);

module.exports = router;
