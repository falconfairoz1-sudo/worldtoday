const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('articleId', 'title');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update notification preferences
exports.updatePrefs = async (req, res) => {
  try {
    const { breaking, categories, countries } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      notificationPrefs: { breaking, categories, countries }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send breaking news notification to all subscribed users (internal helper)
exports.sendBreakingNotification = async (article) => {
  try {
    const users = await User.find({
      'notificationPrefs.breaking': true,
      isSuspended: { $ne: true }
    }).select('_id');

    const notifications = users.map(u => ({
      user: u._id,
      type: 'breaking',
      title: '🔴 Breaking News',
      message: article.title,
      articleId: article._id
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications, { ordered: false });
    }
  } catch (err) {
    console.error('Failed to send breaking notifications:', err);
  }
};
