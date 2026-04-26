const Reaction = require('../models/Reaction');
const Article = require('../models/Article');

// Add or change reaction (upsert)
exports.addReaction = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    const validTypes = ['like', 'love', 'insightful', 'angry', 'sad'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    // Check if user already has a reaction
    const existing = await Reaction.findOne({ article: articleId, user: userId });

    if (existing) {
      const oldType = existing.type;
      existing.type = type;
      await existing.save();

      // Update article reaction counts
      await Article.findByIdAndUpdate(articleId, {
        $inc: {
          [`reactions.${oldType}`]: -1,
          [`reactions.${type}`]: 1
        }
      });
    } else {
      await Reaction.create({ article: articleId, user: userId, type });
      await Article.findByIdAndUpdate(articleId, {
        $inc: { [`reactions.${type}`]: 1 }
      });
    }

    const article = await Article.findById(articleId).select('reactions');
    res.json({ reactions: article.reactions, userReaction: type });
  } catch (err) {
    console.error('Reaction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove reaction
exports.removeReaction = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id;

    const reaction = await Reaction.findOneAndDelete({ article: articleId, user: userId });
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    await Article.findByIdAndUpdate(articleId, {
      $inc: { [`reactions.${reaction.type}`]: -1 }
    });

    const article = await Article.findById(articleId).select('reactions');
    res.json({ reactions: article.reactions, userReaction: null });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's reaction for an article
exports.getUserReaction = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user._id;
    const reaction = await Reaction.findOne({ article: articleId, user: userId });
    res.json({ userReaction: reaction?.type || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
