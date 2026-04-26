const Article = require('../models/Article');
const User = require('../models/User');
const Reaction = require('../models/Reaction');

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  // Limit cache size
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

// @desc    Get news articles with filters
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const {
      country,
      category,
      page = 1,
      limit = 20,
      search,
      format,
      section,
      sortBy = 'publishedAt'
    } = req.query;

    // Create cache key
    const cacheKey = `news:${country}:${category}:${page}:${limit}:${search}:${format}:${section}:${sortBy}`;
    
    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const query = { isFakeNews: false };

    // Country filter — only apply if articles exist for that country
    if (country) {
      const countryCount = await Article.countDocuments({ country, isFakeNews: false });
      if (countryCount > 0) {
        query.country = country;
      }
      // else: silently drop country filter and show all countries
    }

    // Category filter — apply, but fall back to all categories if none found
    if (category && category !== 'all') {
      const catQuery = { ...query, category };
      const catCount = await Article.countDocuments(catQuery);
      if (catCount > 0) {
        query.category = category;
      } else {
        // No articles for this category+country combo — drop country restriction
        delete query.country;
        const catCountGlobal = await Article.countDocuments({ category, isFakeNews: false });
        if (catCountGlobal > 0) {
          query.category = category;
        }
        // If still nothing, show all (no category filter)
      }
    }

    if (format) query.format = format;
    if (section) query.section = section;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ [sortBy]: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content -revisions') // Exclude heavy fields
        .lean(),
      Article.countDocuments(query)
    ]);

    const result = {
      articles,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalArticles: total
    };

    // Cache the result
    setCache(cacheKey, result);

    // Set HTTP cache headers (5 minutes)
    res.set('Cache-Control', 'public, max-age=300');
    res.json(result);
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single article
// @route   GET /api/news/:id
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Get user reaction if logged in
    let userReaction = null;
    if (req.user) {
      const reaction = await Reaction.findOne({ article: article._id, user: req.user._id });
      userReaction = reaction?.type || null;

      // Track reading history
      User.findByIdAndUpdate(req.user._id, {
        $push: {
          readingHistory: {
            $each: [{ article: article._id, readAt: new Date() }],
            $slice: -100
          }
        }
      }).catch(() => {});
    }

    res.json({ ...article, userReaction });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Track article view
// @route   POST /api/news/:id/view
// @access  Public
exports.trackView = async (req, res) => {
  try {
    await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get related articles
// @route   GET /api/news/:id/related
// @access  Public
exports.getRelated = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const related = await Article.find({
      _id: { $ne: article._id },
      isFakeNews: false,
      $or: [
        { category: article.category },
        { country: article.country },
        { tags: { $in: article.tags || [] } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();

    res.json({ articles: related });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get live blog updates
// @route   GET /api/news/:id/liveblog-updates
// @access  Public
exports.getLiveBlogUpdates = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('liveBlogUpdates isActive').lean();
    if (!article) return res.status(404).json({ message: 'Article not found' });
    const updates = (article.liveBlogUpdates || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get breaking news
// @route   GET /api/news/breaking
// @access  Public
exports.getBreaking = async (req, res) => {
  try {
    const articles = await Article.find({
      isBreaking: true,
      isFakeNews: false,
      publishedAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    // Fallback: return latest articles if no breaking news
    if (articles.length === 0) {
      const latest = await Article.find({ isFakeNews: false })
        .sort({ publishedAt: -1 })
        .limit(10)
        .lean();
      return res.json({ articles: latest });
    }

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get trending news
// @route   GET /api/news/trending
// @access  Public
exports.getTrending = async (req, res) => {
  try {
    const articles = await Article.find({
      isFakeNews: false,
      publishedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    })
      .sort({ trendingScore: -1, views: -1 })
      .limit(10)
      .lean();

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get personalized news feed
// @route   GET /api/news/personalized
// @access  Private
exports.getPersonalized = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const preferredCategories = user.preferences?.categories || [];
    const preferredCountries = user.preferences?.countries || [];

    const query = { isFakeNews: false };
    const orConditions = [];

    if (preferredCategories.length > 0) orConditions.push({ category: { $in: preferredCategories } });
    if (preferredCountries.length > 0) orConditions.push({ country: { $in: preferredCountries } });

    if (orConditions.length > 0) query.$or = orConditions;

    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    res.json({ articles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search articles
// @route   GET /api/news/search
// @access  Public
exports.searchArticles = async (req, res) => {
  try {
    const { q, category, country, format, from, to, page = 1, limit = 20 } = req.query;

    if (!q) return res.status(400).json({ message: 'Search query required' });

    const query = {
      isFakeNews: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (category) query.category = category;
    if (country) query.country = country;
    if (format) query.format = format;
    if (from || to) {
      query.publishedAt = {};
      if (from) query.publishedAt.$gte = new Date(from);
      if (to) query.publishedAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [articles, total] = await Promise.all([
      Article.find(query).sort({ publishedAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Article.countDocuments(query)
    ]);

    // Suggest alternatives if no results
    let suggestions = [];
    if (articles.length === 0) {
      const words = q.split(' ');
      if (words.length > 1) suggestions = words;
    }

    res.json({
      articles,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      suggestions
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Get trending topics
// @route   GET /api/news/trending-topics
// @access  Public
exports.getTrendingTopics = async (req, res) => {
  try {
    // Get articles from last 24 hours
    const articles = await Article.find({
      isFakeNews: false,
      publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
      .select('title tags category')
      .lean();

    // Extract keywords from titles and tags
    const keywordCount = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their']);

    articles.forEach(article => {
      // Extract from title
      const words = article.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach(word => {
        keywordCount[word] = (keywordCount[word] || 0) + 1;
      });

      // Extract from tags
      if (article.tags && article.tags.length > 0) {
        article.tags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          keywordCount[tagLower] = (keywordCount[tagLower] || 0) + 2; // Tags count more
        });
      }
    });

    // Convert to array and sort by count
    const topics = Object.entries(keywordCount)
      .map(([keyword, count]) => ({
        keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        count,
        trend: count > 10 ? 'hot' : count > 5 ? 'up' : 'normal'
      }))
      .filter(topic => topic.count >= 3) // Minimum 3 mentions
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json({ topics });
  } catch (error) {
    console.error('Get trending topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
