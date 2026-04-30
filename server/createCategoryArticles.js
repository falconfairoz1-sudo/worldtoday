const mongoose = require('mongoose');
const Article = require('./models/Article');
require('dotenv').config({ path: '../.env' });

const sampleArticles = [
  // Politics Articles
  {
    title: 'Political Leaders Meet for Global Summit on Climate Change',
    description: 'World leaders gather to discuss international cooperation and climate policy reforms.',
    content: 'In a historic gathering, political leaders from around the world convened to address pressing climate issues and establish new international agreements.',
    category: 'politics',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=101',
    source: { name: 'Political News', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/politics-climate-summit-1',
    author: 'Political Reporter'
  },
  {
    title: 'New Policy Reforms Announced by Government',
    description: 'Government announces major policy changes affecting healthcare and education nationwide.',
    content: 'The government has announced significant policy reforms that will impact millions of citizens across the country.',
    category: 'politics',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=102',
    source: { name: 'Policy Today', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/politics-policy-reforms-2',
    author: 'Policy Analyst'
  },
  {
    title: 'Election Campaign Heats Up Across the Nation',
    description: 'Political candidates intensify their campaigns as election day approaches.',
    content: 'With election day drawing near, political candidates are making their final push to win over voters.',
    category: 'politics',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=103',
    source: { name: 'Election Watch', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/politics-election-campaign-3',
    author: 'Election Reporter'
  },

  // Business Articles
  {
    title: 'Global Markets Show Strong Growth This Quarter',
    description: 'International markets demonstrate positive trends as economic indicators improve significantly.',
    content: 'Business analysts report encouraging signs across multiple sectors as global markets continue their upward trajectory.',
    category: 'business',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=201',
    source: { name: 'Business Today', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/business-markets-growth-1',
    author: 'Market Analyst'
  },
  {
    title: 'Tech Stocks Reach New Heights in Trading',
    description: 'Technology companies see unprecedented growth in market valuation and investor confidence.',
    content: 'The technology sector continues to lead market growth with several major companies reaching all-time highs.',
    category: 'business',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=202',
    source: { name: 'Market Watch', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/business-tech-stocks-2',
    author: 'Financial Reporter'
  },
  {
    title: 'Cryptocurrency Market Sees Major Developments',
    description: 'Digital currencies experience significant movements as regulatory clarity improves.',
    content: 'The cryptocurrency market is experiencing major shifts as governments worldwide provide clearer regulations.',
    category: 'business',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=203',
    source: { name: 'Crypto News', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/business-crypto-developments-3',
    author: 'Crypto Analyst'
  },

  // Technology Articles
  {
    title: 'AI Revolution Transforms Industries Worldwide',
    description: 'Latest developments in artificial intelligence are reshaping industries and changing how we work.',
    content: 'The technology sector continues to evolve rapidly with new AI innovations transforming everything from healthcare to finance.',
    category: 'technology',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=301',
    source: { name: 'Tech News', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/tech-ai-revolution-1',
    author: 'Tech Reporter'
  },
  {
    title: 'Breakthrough in Quantum Computing Research',
    description: 'Scientists achieve major milestone in quantum computing development with new processor design.',
    content: 'Researchers have made significant progress in quantum computing, bringing us closer to practical quantum applications.',
    category: 'technology',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=302',
    source: { name: 'Science Tech', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/tech-quantum-breakthrough-2',
    author: 'Science Reporter'
  },
  {
    title: 'New Smartphone Technology Changes Mobile Experience',
    description: 'Latest smartphone innovations introduce revolutionary features for mobile users.',
    content: 'The mobile technology landscape is evolving with new smartphone features that enhance user experience.',
    category: 'technology',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=303',
    source: { name: 'Mobile Tech', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/tech-smartphone-innovation-3',
    author: 'Mobile Reporter'
  },

  // Sports Articles
  {
    title: 'Championship Finals Draw Record Crowds',
    description: 'Latest results from major sporting events around the world attract massive audiences.',
    content: 'Sports fans celebrate as championships deliver exciting matches and record-breaking performances.',
    category: 'sports',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=401',
    source: { name: 'Sports Network', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/sports-championship-finals-1',
    author: 'Sports Reporter'
  },
  {
    title: 'Olympic Preparations Underway for Athletes',
    description: 'Athletes prepare for upcoming international competitions with intensive training programs.',
    content: 'Olympic preparations are in full swing as athletes from around the world gear up for the games.',
    category: 'sports',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=402',
    source: { name: 'Olympic News', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/sports-olympic-preparations-2',
    author: 'Olympic Reporter'
  },
  {
    title: 'Football Season Kicks Off with Exciting Matches',
    description: 'New football season begins with thrilling games and surprising upsets.',
    content: 'The football season has started with a bang, featuring unexpected results and outstanding performances.',
    category: 'sports',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=403',
    source: { name: 'Football Today', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/sports-football-season-3',
    author: 'Football Reporter'
  },

  // Entertainment Articles
  {
    title: 'Hollywood Blockbuster Breaks Box Office Records',
    description: 'Latest movie releases dominate box office worldwide with unprecedented success.',
    content: 'The entertainment industry sees record-breaking performances as new blockbusters captivate audiences globally.',
    category: 'entertainment',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=501',
    source: { name: 'Entertainment Weekly', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/entertainment-blockbuster-records-1',
    author: 'Entertainment Reporter'
  },
  {
    title: 'Music Festival Season Kicks Off Worldwide',
    description: 'Major music festivals announce lineups and ticket sales begin for summer events.',
    content: 'Music fans prepare for the biggest festival season as major events announce their star-studded lineups.',
    category: 'entertainment',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=502',
    source: { name: 'Music Today', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/entertainment-music-festivals-2',
    author: 'Music Reporter'
  },
  {
    title: 'Streaming Services Launch New Original Content',
    description: 'Major streaming platforms announce exciting new shows and movies for subscribers.',
    content: 'The streaming wars continue as platforms compete with high-quality original content and exclusive releases.',
    category: 'entertainment',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=503',
    source: { name: 'Streaming News', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/entertainment-streaming-content-3',
    author: 'Streaming Reporter'
  },

  // Health Articles
  {
    title: 'Medical Breakthrough in Cancer Treatment',
    description: 'Scientists discover new treatment methods that show promising results for cancer patients.',
    content: 'Medical researchers have made significant breakthroughs in cancer treatment, offering new hope to patients.',
    category: 'health',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=601',
    source: { name: 'Health News', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/health-cancer-breakthrough-1',
    author: 'Health Reporter'
  },
  {
    title: 'Mental Health Awareness Campaign Launches',
    description: 'New initiative aims to reduce stigma and improve mental health support services.',
    content: 'A comprehensive mental health awareness campaign has been launched to address growing concerns.',
    category: 'health',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=602',
    source: { name: 'Mental Health Today', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/health-mental-awareness-2',
    author: 'Mental Health Reporter'
  },

  // Science Articles
  {
    title: 'Space Exploration Reaches New Milestone',
    description: 'Space agencies achieve historic milestones in exploration and discovery.',
    content: 'Space exploration continues to push boundaries as agencies make groundbreaking discoveries.',
    category: 'science',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=701',
    source: { name: 'Science Daily', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/science-space-milestone-1',
    author: 'Science Reporter'
  },
  {
    title: 'Climate Research Reveals Important Findings',
    description: 'New climate research provides crucial insights into environmental changes.',
    content: 'Scientists have published important findings about climate change and its global impact.',
    category: 'science',
    country: 'us',
    urlToImage: 'https://picsum.photos/800/600?random=702',
    source: { name: 'Climate Science', url: 'https://example.com' },
    publishedAt: new Date(),
    url: 'https://example.com/science-climate-research-2',
    author: 'Climate Reporter'
  }
];

async function createCategoryArticles() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing articles...');
    await Article.deleteMany({});
    console.log('✅ Cleared existing articles');

    console.log('📝 Creating new category-specific articles...');
    const createdArticles = await Article.insertMany(sampleArticles);
    console.log(`✅ Created ${createdArticles.length} articles`);

    // Log summary by category
    const categories = ['politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];
    for (const category of categories) {
      const count = createdArticles.filter(a => a.category === category).length;
      console.log(`📊 ${category}: ${count} articles`);
    }

    console.log('🎉 Database populated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createCategoryArticles();