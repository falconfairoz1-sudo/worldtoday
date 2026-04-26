const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'love', 'insightful', 'angry', 'sad'],
    required: true
  }
}, { timestamps: true });

// One reaction per user per article
reactionSchema.index({ article: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
