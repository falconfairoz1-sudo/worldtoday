const axios = require('axios');
const path = require('path');
const Article = require('./models/Article');
const connectDB = require('./config/db');

// Load .env from parent directory (root)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function testImageLoading() {
  try {
    await connectDB();
    
    console.log('🔍 Testing Image Loading...\n');
    
    // Get 10 recent articles
    const articles = await Article.find({ isFakeNews: false })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();
    
    console.log(`Found ${articles.length} articles\n`);
    
    let withImages = 0;
    let withoutImages = 0;
    let workingImages = 0;
    let brokenImages = 0;
    
    for (const article of articles) {
      console.log(`\n📰 ${article.title.substring(0, 60)}...`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Country: ${article.country}`);
      console.log(`   Source: ${article.source?.name || 'Unknown'}`);
      
      if (article.urlToImage) {
        withImages++;
        console.log(`   ✅ Has image: ${article.urlToImage.substring(0, 80)}...`);
        
        // Test if image is accessible
        try {
          const response = await axios.head(article.urlToImage, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            validateStatus: (status) => status < 500,
          });
          
          if (response.status === 200) {
            workingImages++;
            console.log(`   ✅ Image accessible (${response.headers['content-type']})`);
          } else {
            brokenImages++;
            console.log(`   ❌ Image not accessible (Status: ${response.status})`);
          }
        } catch (err) {
          brokenImages++;
          console.log(`   ❌ Image error: ${err.message}`);
        }
      } else {
        withoutImages++;
        console.log(`   ❌ No image URL`);
      }
    }
    
    console.log('\n\n📊 Summary:');
    console.log(`   Total articles: ${articles.length}`);
    console.log(`   With images: ${withImages} (${Math.round(withImages/articles.length*100)}%)`);
    console.log(`   Without images: ${withoutImages} (${Math.round(withoutImages/articles.length*100)}%)`);
    console.log(`   Working images: ${workingImages} (${Math.round(workingImages/withImages*100)}%)`);
    console.log(`   Broken images: ${brokenImages} (${Math.round(brokenImages/withImages*100)}%)`);
    
    console.log('\n\n💡 Recommendations:');
    if (withoutImages > articles.length * 0.3) {
      console.log('   ⚠️  Many articles missing images - check news aggregator');
    }
    if (brokenImages > workingImages * 0.5) {
      console.log('   ⚠️  Many broken image URLs - enable image proxy');
    }
    if (workingImages === withImages) {
      console.log('   ✅ All images are accessible!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testImageLoading();
