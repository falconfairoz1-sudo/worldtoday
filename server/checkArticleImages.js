const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

// Simple connection without the db.js wrapper
async function checkImages() {
  try {
    console.log('🔍 Checking Article Images...\n');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    const Article = mongoose.model('Article', new mongoose.Schema({}, { strict: false }));
    
    // Get 10 recent articles
    const articles = await Article.find({ isFakeNews: false })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();
    
    console.log(`Found ${articles.length} articles\n`);
    console.log('='.repeat(80));
    
    let withImages = 0;
    let withoutImages = 0;
    
    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title?.substring(0, 60)}...`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Country: ${article.country}`);
      console.log(`   Source: ${article.source?.name || 'Unknown'}`);
      
      if (article.urlToImage) {
        withImages++;
        console.log(`   ✅ Image: ${article.urlToImage.substring(0, 80)}...`);
      } else {
        withoutImages++;
        console.log(`   ❌ No image URL`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   Total: ${articles.length}`);
    console.log(`   With images: ${withImages} (${Math.round(withImages/articles.length*100)}%)`);
    console.log(`   Without images: ${withoutImages} (${Math.round(withoutImages/articles.length*100)}%)`);
    
    if (withoutImages > articles.length * 0.5) {
      console.log('\n⚠️  WARNING: More than 50% of articles have no images!');
      console.log('   Solution: Run news aggregator to fetch fresh articles with images');
      console.log('   The aggregator should fetch images from RSS feeds and APIs');
    }
    
    if (withImages > 0) {
      console.log('\n✅ Some articles have images. If they\'re not showing:');
      console.log('   1. Check browser console for CORS errors');
      console.log('   2. Check if image URLs are accessible');
      console.log('   3. Verify image proxy is working: http://localhost:5000/api/image-proxy?url=TEST_URL');
    }
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkImages();
