// Script to fix existing articles without images by extracting from content
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Article = require('./models/Article');

async function fixImages() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // Find articles without images
    const articlesWithoutImages = await Article.find({
      $or: [
        { urlToImage: { $exists: false } },
        { urlToImage: null },
        { urlToImage: '' }
      ]
    }).limit(100); // Process 100 at a time

    console.log(`📊 Found ${articlesWithoutImages.length} articles without images`);
    console.log('🔧 Attempting to extract images from content...\n');

    let fixed = 0;
    let notFixed = 0;

    for (const article of articlesWithoutImages) {
      let imageUrl = null;

      // Try to extract from content
      if (article.content) {
        const imgMatch = article.content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      // Try to extract from description if content didn't work
      if (!imageUrl && article.description) {
        const imgMatch = article.description.match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      if (imageUrl) {
        article.urlToImage = imageUrl;
        await article.save();
        fixed++;
        console.log(`✅ Fixed: ${article.title.substring(0, 60)}...`);
        console.log(`   Image: ${imageUrl.substring(0, 80)}...`);
      } else {
        notFixed++;
      }
    }

    console.log('\n📊 Results:');
    console.log(`  ✅ Fixed: ${fixed} articles`);
    console.log(`  ❌ Could not fix: ${notFixed} articles`);
    console.log(`  📈 Success rate: ${Math.round(fixed/(fixed+notFixed)*100)}%`);

    await mongoose.connection.close();
    console.log('\n✅ Process complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixImages();
