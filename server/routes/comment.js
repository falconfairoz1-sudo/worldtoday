const express = require('express');
const router = express.Router();
const { getComments, postComment, editComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/:articleId', getComments);
router.post('/:articleId', protect, postComment);
router.put('/:commentId', protect, editComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
