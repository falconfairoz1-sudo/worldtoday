const express = require('express');
const router = express.Router();
const { addReaction, removeReaction, getUserReaction } = require('../controllers/reactionController');
const { protect } = require('../middleware/auth');

router.post('/:articleId', protect, addReaction);
router.delete('/:articleId', protect, removeReaction);
router.get('/:articleId', protect, getUserReaction);

module.exports = router;
