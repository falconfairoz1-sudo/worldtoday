const natural = require('natural');
const compromise = require('compromise');

class AIService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  }

  // Detect fake news using heuristics
  async detectFakeNews(article) {
    const reasons = [];
    let score = 100;

    // Check for clickbait patterns
    const clickbaitPatterns = [
      /you won't believe/i,
      /shocking/i,
      /doctors hate/i,
      /one weird trick/i,
      /what happened next/i,
      /number \d+ will shock you/i
    ];

    const title = article.title || '';
    const hasClickbait = clickbaitPatterns.some(pattern => pattern.test(title));
    
    if (hasClickbait) {
      reasons.push('Clickbait title detected');
      score -= 30;
    }

    // Check for excessive capitalization
    const capsRatio = (title.match(/[A-Z]/g) || []).length / title.length;
    if (capsRatio > 0.5) {
      reasons.push('Excessive capitalization');
      score -= 20;
    }

    // Check for excessive punctuation
    const exclamationCount = (title.match(/!/g) || []).length;
    if (exclamationCount > 2) {
      reasons.push('Excessive punctuation');
      score -= 15;
    }

    // Check source credibility (basic check)
    const sourceName = article.source?.name?.toLowerCase() || '';
    const suspiciousSources = ['unknown', 'anonymous', 'breaking', 'viral'];
    if (suspiciousSources.some(s => sourceName.includes(s))) {
      reasons.push('Suspicious source');
      score -= 25;
    }

    // Check for missing author
    if (!article.author || article.author === 'Unknown') {
      score -= 10;
    }

    // Check content length
    const content = article.content || article.description || '';
    if (content.length < 100) {
      reasons.push('Very short content');
      score -= 15;
    }

    return {
      isFake: score < 50,
      score: Math.max(0, score),
      reasons
    };
  }

  // Analyze sentiment
  async analyzeSentiment(text) {
    try {
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      const score = this.analyzer.getSentiment(tokens);

      let label;
      if (score > 0.1) label = 'positive';
      else if (score < -0.1) label = 'negative';
      else label = 'neutral';

      return {
        score: parseFloat(score.toFixed(2)),
        label
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return { score: 0, label: 'neutral' };
    }
  }

  // Generate summary
  async generateSummary(text) {
    try {
      if (!text || text.length < 100) {
        return text;
      }

      // Simple extractive summarization
      const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
      
      if (sentences.length <= 3) {
        return text;
      }

      // Take first 3 sentences as summary
      const summary = sentences.slice(0, 3).join(' ').trim();
      
      return summary.length > 500 ? summary.substring(0, 497) + '...' : summary;
    } catch (error) {
      console.error('Summary generation error:', error);
      return text.substring(0, 500);
    }
  }

  // Extract tags from text
  async extractTags(text) {
    try {
      const doc = compromise(text);
      
      // Extract nouns and proper nouns
      const nouns = doc.nouns().out('array');
      const topics = doc.topics().out('array');
      
      // Combine and deduplicate
      const tags = [...new Set([...nouns, ...topics])]
        .filter(tag => tag.length > 3)
        .slice(0, 10);

      return tags;
    } catch (error) {
      console.error('Tag extraction error:', error);
      return [];
    }
  }

  // Rank articles by user preference
  async rankArticlesByPreference(articles, readHistory) {
    try {
      // Extract categories from read history
      const categoryCount = {};
      readHistory.forEach(item => {
        if (item.article && item.article.category) {
          const cat = item.article.category;
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        }
      });

      // Score articles based on category preference
      const scoredArticles = articles.map(article => {
        const categoryScore = categoryCount[article.category] || 0;
        const recencyScore = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);
        
        return {
          ...article,
          preferenceScore: categoryScore - (recencyScore / 24)
        };
      });

      // Sort by preference score
      return scoredArticles.sort((a, b) => b.preferenceScore - a.preferenceScore);
    } catch (error) {
      console.error('Ranking error:', error);
      return articles;
    }
  }

  // Text to speech (placeholder - would integrate with actual TTS service)
  async textToSpeech(text) {
    // In production, integrate with Google Cloud Text-to-Speech or similar
    return {
      audioUrl: null,
      message: 'TTS service not configured'
    };
  }
}

module.exports = new AIService();
