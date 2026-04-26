const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['breaking', 'followed_journalist', 'comment_reply', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: String,
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
