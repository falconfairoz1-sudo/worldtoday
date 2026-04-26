const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead, updatePrefs } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);
router.put('/prefs', protect, updatePrefs);

module.exports = router;
