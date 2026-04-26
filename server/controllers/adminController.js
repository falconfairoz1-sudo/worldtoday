const Article = require('../models/Article');
const User = require('../models/User');

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    
    const totalViews = await Article.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const topArticles = await Article.find()
      .sort({ views: -1 })
      .limit(10)
      .select('title views likes shares category');

    const categoryStats = await Article.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
      { $sort: { views: -1 } }
    ]);

    res.json({
      totalArticles,
      totalUsers,
      premiumUsers,
      totalViews: totalViews[0]?.total || 0,
      topArticles,
      categoryStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get traffic statistics
// @route   GET /api/admin/analytics/traffic
// @access  Private/Admin
exports.getTrafficStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyStats = await Article.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          articles: { $sum: 1 },
          views: { $sum: '$views' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(dailyStats);
  } catch (error) {
    console.error('Get traffic stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create article
// @route   POST /api/admin/articles
// @access  Private/Admin
exports.createArticle = async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      isOriginal: true,
      publishedAt: new Date()
    };

    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update article
// @route   PUT /api/admin/articles/:id
// @access  Private/Admin
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete article
// @route   DELETE /api/admin/articles/:id
// @access  Private/Admin
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Feature article
// @route   POST /api/admin/articles/:id/feature
// @access  Private/Admin
exports.featureArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.isBreaking = !article.isBreaking;
    await article.save();

    res.json(article);
  } catch (error) {
    console.error('Feature article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Suspend/unsuspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res) => {
  try {
    const { isSuspended } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'journalist', 'editor', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get sources
// @route   GET /api/admin/sources
// @access  Private/Admin
exports.getSources = async (req, res) => {
  try {
    const sources = await Article.aggregate([
      { $group: { _id: '$source.name', count: { $sum: 1 }, articles: { $push: '$_id' } } },
      { $sort: { count: -1 } }
    ]);

    res.json(sources);
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Block source
// @route   POST /api/admin/sources/block
// @access  Private/Admin
exports.blockSource = async (req, res) => {
  try {
    const { sourceName } = req.body;

    await Article.updateMany(
      { 'source.name': sourceName },
      { isFakeNews: true, fakeNewsReasons: ['Source blocked by admin'] }
    );

    res.json({ message: `Source ${sourceName} blocked successfully` });
  } catch (error) {
    console.error('Block source error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unblock source
// @route   POST /api/admin/sources/unblock
// @access  Private/Admin
exports.unblockSource = async (req, res) => {
  try {
    const { sourceName } = req.body;

    await Article.updateMany(
      { 'source.name': sourceName },
      { isFakeNews: false, fakeNewsReasons: [] }
    );

    res.json({ message: `Source ${sourceName} unblocked successfully` });
  } catch (error) {
    console.error('Unblock source error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
