// Quick test script to verify news APIs are returning images
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const newsService = require('./services/newsService');

async function testImageFetch() {
  console.log('🔍 Testing image fetching from news APIs...\n');

  const testCases = [
    { country: 'in', category: 'general' },
    { country: 'us', category: 'technology' },
    { country: 'gb', category: 'business' }
  ];

  for (const { country, category } of testCases) {
    console.log(`\n📰 Fetching ${country}/${category}...`);
    const articles = await newsService.fetchNews(country, category);
    
    const withImages = articles.filter(a => a.urlToImage);
    const withoutImages = articles.filter(a => !a.urlToImage);
    
    console.log(`  Total articles: ${articles.length}`);
    console.log(`  ✅ With images: ${withImages.length} (${Math.round(withImages.length/articles.length*100)}%)`);
    console.log(`  ❌ Without images: ${withoutImages.length}`);
    
    if (withImages.length > 0) {
      console.log(`  Sample image URL: ${withImages[0].urlToImage.substring(0, 80)}...`);
    }
  }

  console.log('\n✅ Test complete!');
  process.exit(0);
}

testImageFetch().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
