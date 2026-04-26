const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require admin access
router.use(protect);
router.use(admin);

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/traffic', adminController.getTrafficStats);

// Article management
router.post('/articles', adminController.createArticle);
router.put('/articles/:id', adminController.updateArticle);
router.delete('/articles/:id', adminController.deleteArticle);
router.post('/articles/:id/feature', adminController.featureArticle);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/role', adminController.changeUserRole);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Source management
router.get('/sources', adminController.getSources);
router.post('/sources/block', adminController.blockSource);
router.post('/sources/unblock', adminController.unblockSource);

module.exports = router;
