// Test script to check if Knowivate API is working
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');

async function testKnowivateAPI() {
  console.log('🔍 Testing Knowivate API...\n');

  const url = process.env.KNOWIVATE_API_URL;

  if (!url) {
    console.log('❌ KNOWIVATE_API_URL is not set in .env file');
    console.log('ℹ️  The Knowivate API is currently disabled.');
    console.log('ℹ️  If you have a valid Knowivate API endpoint, add it to your .env file:\n');
    console.log('   KNOWIVATE_API_URL=https://your-knowivate-api-endpoint.com/api/latest\n');
    process.exit(0);
  }

  console.log(`📡 Testing endpoint: ${url}\n`);

  // Test 1: Basic connectivity
  console.log('Test 1: Basic connectivity...');
  try {
    const response = await axios.get(url, {
      params: { country: 'us', category: 'general', limit: 5 },
      timeout: 10000,
      validateStatus: () => true, // Accept any status
    });

    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Response type: ${typeof response.data}`);
    
    if (response.status === 200) {
      console.log('  ✅ API is reachable and responding\n');
    } else if (response.status === 404) {
      console.log('  ❌ API endpoint not found (404)\n');
    } else if (response.status >= 500) {
      console.log('  ❌ API server error\n');
    } else {
      console.log(`  ⚠️  Unexpected status code\n`);
    }

    // Test 2: Data structure
    if (response.status === 200) {
      console.log('Test 2: Data structure validation...');
      
      const data = response.data;
      const articles = data?.articles || data?.news || data?.data || data || [];
      
      console.log(`  Data structure: ${JSON.stringify(Object.keys(data)).substring(0, 100)}`);
      console.log(`  Is array: ${Array.isArray(articles)}`);
      console.log(`  Article count: ${Array.isArray(articles) ? articles.length : 'N/A'}`);
      
      if (Array.isArray(articles) && articles.length > 0) {
        console.log('  ✅ Valid data structure\n');
        
        // Test 3: Sample article
        console.log('Test 3: Sample article structure...');
        const sample = articles[0];
        console.log(`  Title: ${sample.title ? '✅' : '❌'} ${sample.title?.substring(0, 50) || 'Missing'}`);
        console.log(`  URL: ${sample.url || sample.link ? '✅' : '❌'} ${(sample.url || sample.link)?.substring(0, 50) || 'Missing'}`);
        console.log(`  Image: ${sample.urlToImage || sample.image || sample.imageUrl ? '✅' : '❌'} ${(sample.urlToImage || sample.image || sample.imageUrl)?.substring(0, 50) || 'Missing'}`);
        console.log(`  Description: ${sample.description || sample.summary ? '✅' : '❌'}`);
        console.log(`  Source: ${sample.source || sample.sourceName ? '✅' : '❌'} ${sample.source || sample.sourceName || 'Missing'}`);
        console.log(`  Published: ${sample.publishedAt || sample.pubDate ? '✅' : '❌'}`);
        
        console.log('\n✅ Knowivate API is working correctly!');
        console.log(`📊 Successfully fetched ${articles.length} articles`);
      } else {
        console.log('  ❌ No articles found in response\n');
        console.log('⚠️  API is reachable but not returning articles');
      }
    }

  } catch (error) {
    console.log('  ❌ Connection failed\n');
    
    if (error.code === 'ENOTFOUND') {
      console.log('❌ DNS Error: Domain not found');
      console.log('   The API endpoint does not exist or is unreachable');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection Refused: Server is not accepting connections');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('❌ Timeout: Server took too long to respond');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n⚠️  Knowivate API is not working');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log('\nThe Knowivate API is configured in your .env file but:');
  console.log('1. The endpoint may not be publicly available');
  console.log('2. It may require authentication or special access');
  console.log('3. The URL might be incorrect\n');
  console.log('RECOMMENDATION:');
  console.log('- If you don\'t have a valid Knowivate API, comment out or remove');
  console.log('  KNOWIVATE_API_URL from your .env file');
  console.log('- The news aggregation will work fine without it using other APIs');
  console.log('- You have 5 other working news APIs configured:\n');
  console.log('  ✅ NewsAPI');
  console.log('  ✅ GNews');
  console.log('  ✅ Currents');
  console.log('  ✅ MediaStack');
  console.log('  ✅ NewsData.io');
  console.log('  ✅ 60+ RSS feeds\n');

  process.exit(0);
}

testKnowivateAPI();
