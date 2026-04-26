const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Bookmarks
router.get('/bookmarks', userController.getBookmarks);
router.post('/bookmark/:id', userController.bookmarkArticle);
router.delete('/bookmark/:id', userController.removeBookmark);

// Legacy saved
router.get('/saved', userController.getSavedArticles);
router.post('/save/:id', userController.saveArticle);
router.delete('/save/:id', userController.unsaveArticle);

// Follow
router.post('/follow/:id', userController.followUser);
router.delete('/follow/:id', userController.unfollowUser);

// History
router.get('/history', userController.getReadingHistory);
router.delete('/history', userController.clearHistory);

// Preferences
router.put('/preferences', userController.updatePreferences);

// Premium
router.post('/subscribe', userController.subscribePremium);

// FCM
router.post('/fcm-token', userController.updateFCMToken);

module.exports = router;
