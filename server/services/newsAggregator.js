const cron = require('node-cron');
const Article = require('../models/Article');
const newsService = require('./newsService');
const aiService = require('./aiService');
const countries = require('../config/countries');

class NewsAggregator {
  constructor() {
    this.isRunning = false;
    // Use all country codes from the countries list
    this.countries = countries.map(c => c.code);
    this.categories = ['general', 'politics', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'];
  }

  async fetchAndStoreNews() {
    if (this.isRunning) {
      console.log('News aggregation already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Starting news aggregation...');

    try {
      // Priority countries — India first, then others
      const priorityCountries = ['in', 'us', 'gb', 'ca', 'au', 'de', 'fr', 'jp', 'br', 'mx'];
      
      // Fetch priority countries first
      console.log('📰 Fetching news for priority countries...');
      for (const country of priorityCountries) {
        await this.fetchCountryNews(country);
      }
      
      // Then fetch remaining countries
      const remainingCountries = this.countries.filter(c => !priorityCountries.includes(c));
      console.log(`📰 Fetching news for ${remainingCountries.length} additional countries...`);
      
      for (const country of remainingCountries) {
        await this.fetchCountryNews(country);
      }

      // Update trending scores
      await this.updateTrendingScores();

      const totalArticles = await Article.countDocuments();
      console.log('✅ News aggregation completed');
      console.log(`📊 Total articles in database: ${totalArticles}`);
    } catch (error) {
      console.error('❌ News aggregation error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async fetchCountryNews(country) {
    for (const category of this.categories) {
      try {
        const articles = await newsService.fetchNews(country, category);
        if (articles.length > 0) {
          let saved = 0;
          for (const articleData of articles) {
            const wasNew = await this.processArticle(articleData, country, category);
            if (wasNew) saved++;
          }
          if (saved > 0) console.log(`  💾 [${country}/${category}] Saved ${saved} new articles`);
        }
        await this.delay(300);
      } catch (error) {
        console.error(`Error fetching ${category} news for ${country}:`, error.message);
      }
    }
  }

  async processArticle(articleData, country, category) {
    try {
      // Check if article already exists
      const exists = await Article.findOne({ url: articleData.url });
      if (exists) {
        return;
      }

      // If no image, try to extract from content
      let imageUrl = articleData.urlToImage;
      if (!imageUrl && articleData.content) {
        const imgMatch = articleData.content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      // Detect fake news
      const fakeNewsAnalysis = await aiService.detectFakeNews(articleData);

      // Analyze sentiment
      const sentiment = await aiService.analyzeSentiment(articleData.title + ' ' + articleData.description);

      // Generate summary
      const summary = await aiService.generateSummary(articleData.content || articleData.description);

      // Extract tags
      const tags = await aiService.extractTags(articleData.title + ' ' + articleData.description);

      const article = new Article({
        title:            articleData.title,
        description:      articleData.description,
        content:          articleData.content || articleData.description,
        summary,
        author:           articleData.author,
        source:           {
          name: articleData.source?.name || '',
          url:  articleData.source?.url  || articleData.url || '',
          id:   articleData.source?.id   || '',
        },
        url:              articleData.url,
        urlToImage:       imageUrl,
        publishedAt:      articleData.publishedAt || new Date(),
        category,
        country,
        language:         articleData.language || 'en',
        tags,
        sentiment,
        credibilityScore: fakeNewsAnalysis.score,
        isFakeNews:       fakeNewsAnalysis.isFake,
        fakeNewsReasons:  fakeNewsAnalysis.reasons,
        isBreaking:       this.isBreakingNews(articleData),
      });

      await article.save();
      console.log(`✅ Saved: ${article.title.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error processing article:', error.message);
    }
  }

  async updateTrendingScores() {
    try {
      const recentArticles = await Article.find({
        publishedAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      });

      for (const article of recentArticles) {
        article.calculateTrendingScore();
        article.isTrending = article.trendingScore > 10;
        await article.save();
      }

      console.log('✅ Updated trending scores');
    } catch (error) {
      console.error('Error updating trending scores:', error);
    }
  }

  isBreakingNews(articleData) {
    const breakingKeywords = ['breaking', 'urgent', 'alert', 'just in', 'developing'];
    const title = (articleData.title || '').toLowerCase();
    return breakingKeywords.some(keyword => title.includes(keyword));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  startAggregation() {
    // Run immediately on start
    this.fetchAndStoreNews();

    // Schedule to run every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      this.fetchAndStoreNews();
    });

    console.log('📅 News aggregation scheduled (every 30 minutes)');
  }

  // Clean up old articles (older than 30 days)
  async cleanupOldArticles() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Article.deleteMany({
        publishedAt: { $lt: thirtyDaysAgo },
        isOriginal: false // Don't delete original content
      });

      console.log(`🗑️ Cleaned up ${result.deletedCount} old articles`);
    } catch (error) {
      console.error('Error cleaning up articles:', error);
    }
  }
}

module.exports = new NewsAggregator();
