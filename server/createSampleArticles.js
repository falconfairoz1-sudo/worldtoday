const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Article = require('./models/Article');

const sampleArticles = [
  {
    title: "BREAKING: Global Climate Summit Reaches Historic Agreement",
    description: "World leaders agree on ambitious carbon reduction targets in landmark climate deal.",
    content: "In a historic moment for environmental policy, representatives from 195 countries have reached a comprehensive agreement on climate action...",
    category: "politics",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=1",
    source: { name: "Global News", url: "https://example.com" },
    url: "https://example.com/climate-summit-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "BREAKING: Tech Giants Announce AI Safety Initiative",
    description: "Major technology companies commit to responsible AI development and deployment.",
    content: "Leading technology companies have announced a joint initiative to ensure artificial intelligence is developed safely...",
    category: "technology",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=2",
    source: { name: "Tech Today", url: "https://example.com" },
    url: "https://example.com/ai-safety-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "BREAKING: Stock Markets Hit Record Highs Amid Economic Recovery",
    description: "Major indices reach all-time peaks as investors show confidence in economic outlook.",
    content: "Global stock markets celebrated a milestone today as major indices reached record highs...",
    category: "business",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=3",
    source: { name: "Financial Times", url: "https://example.com" },
    url: "https://example.com/markets-high-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "BREAKING: Championship Final Delivers Thrilling Overtime Victory",
    description: "Underdog team secures dramatic win in final seconds of overtime play.",
    content: "In one of the most exciting championship finals in recent memory, the underdog team secured victory...",
    category: "sports",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=4",
    source: { name: "Sports Network", url: "https://example.com" },
    url: "https://example.com/championship-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "BREAKING: Breakthrough Cancer Treatment Shows Promising Results",
    description: "New immunotherapy approach demonstrates high success rates in clinical trials.",
    content: "Medical researchers have announced promising results from a groundbreaking cancer treatment...",
    category: "health",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=5",
    source: { name: "Health News", url: "https://example.com" },
    url: "https://example.com/cancer-treatment-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "BREAKING: Scientists Discover New Earth-Like Exoplanet",
    description: "Astronomers identify potentially habitable planet in nearby star system.",
    content: "A team of international astronomers has discovered a new exoplanet that shows remarkable similarities to Earth...",
    category: "science",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=6",
    source: { name: "Science Daily", url: "https://example.com" },
    url: "https://example.com/exoplanet-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "BREAKING: Award-Winning Film Breaks Box Office Records",
    description: "Latest blockbuster surpasses expectations with record-breaking opening weekend.",
    content: "The highly anticipated film has shattered box office records in its opening weekend...",
    category: "entertainment",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=7",
    source: { name: "Entertainment Weekly", url: "https://example.com" },
    url: "https://example.com/box-office-" + Date.now(),
    isBreaking: true,
  },
  {
    title: "India Launches Ambitious Space Mission",
    description: "ISRO successfully launches satellite constellation for improved connectivity.",
    content: "India's space agency has successfully launched a new constellation of satellites...",
    category: "technology",
    country: "in",
    urlToImage: "https://picsum.photos/800/600?random=8",
    source: { name: "Indian Express", url: "https://example.com" },
    url: "https://example.com/space-mission-" + Date.now(),
  },
  {
    title: "Renewable Energy Surpasses Fossil Fuels in Power Generation",
    description: "Historic milestone as clean energy becomes dominant source of electricity.",
    content: "For the first time in history, renewable energy sources have generated more electricity than fossil fuels...",
    category: "science",
    country: "gb",
    urlToImage: "https://picsum.photos/800/600?random=9",
    source: { name: "The Guardian", url: "https://example.com" },
    url: "https://example.com/renewable-energy-" + Date.now(),
  },
  {
    title: "Major Cybersecurity Breach Affects Millions",
    description: "Tech company reports data breach impacting user accounts worldwide.",
    content: "A major technology company has disclosed a significant cybersecurity breach...",
    category: "technology",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=10",
    source: { name: "Tech News", url: "https://example.com" },
    url: "https://example.com/cybersecurity-" + Date.now(),
  },
  {
    title: "International Trade Agreement Signed by 50 Nations",
    description: "Historic trade deal promises to boost global economic cooperation.",
    content: "Representatives from 50 countries have signed a comprehensive trade agreement...",
    category: "business",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=11",
    source: { name: "Business Wire", url: "https://example.com" },
    url: "https://example.com/trade-agreement-" + Date.now(),
  },
  {
    title: "Olympic Games Set New Viewership Records",
    description: "Summer Olympics attract billions of viewers worldwide across all platforms.",
    content: "The latest Olympic Games have set new records for global viewership...",
    category: "sports",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=12",
    source: { name: "Olympic News", url: "https://example.com" },
    url: "https://example.com/olympics-" + Date.now(),
  },
  {
    title: "New Vaccine Shows 95% Effectiveness in Trials",
    description: "Pharmaceutical breakthrough offers hope for disease prevention.",
    content: "Clinical trials have demonstrated remarkable effectiveness for a new vaccine...",
    category: "health",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=13",
    source: { name: "Medical Journal", url: "https://example.com" },
    url: "https://example.com/vaccine-" + Date.now(),
  },
  {
    title: "Streaming Service Announces Exclusive Content Deal",
    description: "Major platform secures rights to highly anticipated series and films.",
    content: "A leading streaming service has announced an exclusive content partnership...",
    category: "entertainment",
    country: "us",
    urlToImage: "https://picsum.photos/800/600?random=14",
    source: { name: "Media Today", url: "https://example.com" },
    url: "https://example.com/streaming-" + Date.now(),
  },
  {
    title: "Education Reform Bill Passes Parliament",
    description: "Sweeping changes to education system approved by lawmakers.",
    content: "Parliament has approved comprehensive education reform legislation...",
    category: "politics",
    country: "gb",
    urlToImage: "https://picsum.photos/800/600?random=15",
    source: { name: "Political Review", url: "https://example.com" },
    url: "https://example.com/education-reform-" + Date.now(),
  },
];

async function createSamples() {
  try {
    console.log('🎨 Creating Sample Articles...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Delete existing sample articles
    await Article.deleteMany({ 'source.name': { $in: ['Global News', 'Tech Today', 'Financial Times', 'Sports Network', 'Health News', 'Science Daily', 'Entertainment Weekly', 'Indian Express', 'The Guardian', 'Tech News'] } });
    
    let created = 0;
    for (const articleData of sampleArticles) {
      const article = new Article({
        ...articleData,
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24h
        author: 'Sample Author',
        readTime: Math.floor(Math.random() * 5) + 3, // 3-8 minutes
        views: Math.floor(Math.random() * 1000),
        isBreaking: articleData.isBreaking || false,
      });
      
      await article.save();
      created++;
      console.log(`✅ Created: ${article.title.substring(0, 50)}...`);
    }
    
    console.log(`\n✅ Created ${created} sample articles with images!`);
    console.log('📊 Refresh your browser to see them\n');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSamples();
