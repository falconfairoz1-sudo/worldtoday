const Comment = require('../models/Comment');
const Article = require('../models/Article');

const PROHIBITED_WORDS = ['spam', 'scam', 'xxx', 'porn'];

function containsProhibited(text) {
  const lower = text.toLowerCase();
  return PROHIBITED_WORDS.some(w => lower.includes(w));
}

// Get comments for an article
exports.getComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const comments = await Comment.find({
      article: articleId,
      parentComment: null,
      isDeleted: false
    })
      .sort({ createdAt: sort })
      .populate('author', 'name avatar')
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        populate: [
          { path: 'author', select: 'name avatar' },
          {
            path: 'replies',
            match: { isDeleted: false },
            populate: { path: 'author', select: 'name avatar' }
          }
        ]
      });

    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Post a comment
exports.postComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentComment } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (containsProhibited(content)) {
      return res.status(400).json({ message: 'Comment contains prohibited content' });
    }

    let depth = 0;
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) return res.status(404).json({ message: 'Parent comment not found' });
      depth = parent.depth + 1;
      if (depth > 2) return res.status(400).json({ message: 'Maximum reply depth reached' });
    }

    const comment = await Comment.create({
      article: articleId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null,
      depth
    });

    // Add reply reference to parent
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    await comment.populate('author', 'name avatar');
    res.status(201).json(comment);
  } catch (err) {
    console.error('Post comment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit a comment (within 15 minutes)
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const ageMs = Date.now() - new Date(comment.createdAt).getTime();
    if (ageMs > 15 * 60 * 1000) {
      return res.status(400).json({ message: 'Edit window has expired (15 minutes)' });
    }

    if (containsProhibited(content)) {
      return res.status(400).json({ message: 'Comment contains prohibited content' });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a comment (soft delete)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
