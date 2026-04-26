const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const newsAggregator = require('./services/newsAggregator');

async function fetchNewsNow() {
  try {
    console.log('🚀 Fetching fresh news articles with images...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Run news aggregation
    await newsAggregator.fetchAndStoreNews();
    
    console.log('\n✅ News fetch complete!');
    console.log('📊 Check your homepage - articles should now have images\n');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n🔧 MongoDB Connection Issue:');
      console.log('   1. Change DNS to 8.8.8.8 (Google DNS)');
      console.log('   2. Or whitelist IP in MongoDB Atlas');
      console.log('   3. Or use local MongoDB\n');
    }
    
    process.exit(1);
  }
}

console.log('='.repeat(60));
console.log('  WorldToday News Fetcher');
console.log('='.repeat(60));
console.log('');

fetchNewsNow();
