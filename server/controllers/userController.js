const User = require('../models/User');
const Article = require('../models/Article');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('following', 'name avatar role')
      .lean();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio.substring(0, 500);
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bookmark article (idempotent)
// @route   POST /api/user/bookmark/:id
// @access  Private
exports.bookmarkArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user.savedArticles.map(id => id.toString()).includes(articleId)) {
      user.savedArticles.push(articleId);
      await user.save();
    }

    res.json({ bookmarked: true, bookmarks: user.savedArticles });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove bookmark (idempotent)
// @route   DELETE /api/user/bookmark/:id
// @access  Private
exports.removeBookmark = async (req, res) => {
  try {
    const articleId = req.params.id;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedArticles: articleId }
    });
    res.json({ bookmarked: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bookmarks
// @route   GET /api/user/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedArticles')
      .lean();
    res.json(user.savedArticles || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Follow journalist
// @route   POST /api/user/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });

    res.json({ following: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unfollow journalist
// @route   DELETE /api/user/follow/:id
// @access  Private
exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
    res.json({ following: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reading history
// @route   GET /api/user/history
// @access  Private
exports.getReadingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('readingHistory.article', 'title urlToImage category publishedAt')
      .lean();
    res.json(user.readingHistory || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update preferences
// @route   PUT /api/user/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { categories, countries, language, darkMode, fontSize, notifications } = req.body;
    const updates = {};
    if (categories !== undefined) updates['preferences.categories'] = categories;
    if (countries !== undefined) updates['preferences.countries'] = countries;
    if (language) updates['preferences.language'] = language;
    if (darkMode !== undefined) updates['preferences.darkMode'] = darkMode;
    if (fontSize) updates['preferences.fontSize'] = fontSize;
    if (notifications !== undefined) updates['preferences.notifications'] = notifications;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get saved articles (legacy)
// @route   GET /api/user/saved
// @access  Private
exports.getSavedArticles = exports.getBookmarks;

// @desc    Save article (legacy)
exports.saveArticle = exports.bookmarkArticle;

// @desc    Unsave article (legacy)
exports.unsaveArticle = exports.removeBookmark;

// @desc    Clear reading history
exports.clearHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { readingHistory: [] });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Subscribe to premium (UI only)
exports.subscribePremium = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isPremium: true, premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { new: true }
    ).select('-password');
    res.json({ message: 'Premium activated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update FCM token
exports.updateFCMToken = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
