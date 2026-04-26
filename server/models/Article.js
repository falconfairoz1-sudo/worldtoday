const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String, // AI-generated summary
    maxlength: 500
  },
  author: {
    type: String,
    default: 'Unknown'
  },
  source: {
    name: String,
    url: String,
    id: String
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  urlToImage: String,
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['politics', 'technology', 'business', 'sports', 'entertainment', 'health', 'science', 'general'],
    index: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    default: 'en'
  },
  tags: [{
    type: String,
    trim: true
  }],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  },
  credibilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  isFakeNews: {
    type: Boolean,
    default: false
  },
  fakeNewsReasons: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isOriginal: {
    type: Boolean,
    default: false // true if created by platform, false if aggregated
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  readTime: Number, // estimated read time in minutes
  translations: {
    type: Map,
    of: {
      title: String,
      description: String,
      content: String
    }
  },
  // WorldToday extended fields
  format: {
    type: String,
    enum: ['text', 'video', 'gallery', 'infographic', 'liveblog', 'podcast', 'webstory', 'poll', 'quiz'],
    default: 'text'
  },
  section: {
    type: String,
    enum: ['news', 'opinion', 'factcheck', 'investigative', 'special', 'podcast', 'webstory'],
    default: 'news'
  },
  isActive: { type: Boolean, default: false }, // for live blogs
  liveBlogUpdates: [{
    content: String,
    author: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    insightful: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    sad: { type: Number, default: 0 }
  },
  mediaItems: [{
    type: { type: String, enum: ['image', 'video', 'audio'] },
    url: String,
    caption: String
  }],
  pollOptions: [{
    text: String,
    votes: { type: Number, default: 0 }
  }],
  quizQuestions: [{
    question: String,
    options: [String],
    correctIndex: Number
  }],
  revisions: [{
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now }
  }],
  scheduledAt: Date,
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wordCount: Number
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ country: 1, category: 1, publishedAt: -1 });
articleSchema.index({ isTrending: 1, trendingScore: -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ 'source.name': 1 });
articleSchema.index({ publishedAt: -1 }); // For sorting by date
articleSchema.index({ isFakeNews: 1, publishedAt: -1 }); // For filtering fake news
articleSchema.index({ category: 1, publishedAt: -1 }); // For category pages
articleSchema.index({ country: 1, publishedAt: -1 }); // For country filtering

// Calculate trending score based on engagement
articleSchema.methods.calculateTrendingScore = function() {
  const ageInHours = (Date.now() - this.publishedAt) / (1000 * 60 * 60);
  const engagementScore = (this.views * 0.1) + (this.likes * 2) + (this.shares * 5) + (this.comments.length * 3);
  
  // Decay factor: newer articles get higher scores
  const decayFactor = Math.exp(-ageInHours / 24);
  
  this.trendingScore = engagementScore * decayFactor;
  return this.trendingScore;
};

// Estimate read time
articleSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
