// Check existing articles in database for image status
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Article = require('./models/Article');

async function checkImages() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const total = await Article.countDocuments();
    const withImages = await Article.countDocuments({ urlToImage: { $exists: true, $ne: null, $ne: '' } });
    const withoutImages = total - withImages;

    console.log('📊 Database Image Statistics:');
    console.log(`  Total articles: ${total}`);
    console.log(`  ✅ With images: ${withImages} (${Math.round(withImages/total*100)}%)`);
    console.log(`  ❌ Without images: ${withoutImages} (${Math.round(withoutImages/total*100)}%)`);

    // Sample articles with images
    console.log('\n📸 Sample articles WITH images:');
    const samplesWithImages = await Article.find({ urlToImage: { $exists: true, $ne: null, $ne: '' } })
      .limit(3)
      .select('title urlToImage source.name');
    
    samplesWithImages.forEach((article, i) => {
      console.log(`  ${i+1}. ${article.title.substring(0, 60)}...`);
      console.log(`     Source: ${article.source?.name || 'Unknown'}`);
      console.log(`     Image: ${article.urlToImage?.substring(0, 80)}...`);
    });

    // Sample articles without images
    console.log('\n🚫 Sample articles WITHOUT images:');
    const samplesWithoutImages = await Article.find({ 
      $or: [
        { urlToImage: { $exists: false } },
        { urlToImage: null },
        { urlToImage: '' }
      ]
    })
      .limit(3)
      .select('title source.name category country');
    
    samplesWithoutImages.forEach((article, i) => {
      console.log(`  ${i+1}. ${article.title.substring(0, 60)}...`);
      console.log(`     Source: ${article.source?.name || 'Unknown'}`);
      console.log(`     Category: ${article.category}, Country: ${article.country}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkImages();
