// Simple website speed checker
const https = require('https');

function checkWebsiteSpeed(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const loadTime = endTime - startTime;
        
        resolve({
          url,
          statusCode: res.statusCode,
          loadTime: `${loadTime}ms`,
          contentLength: data.length,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runSpeedTests() {
  console.log('🚀 Checking website speed...\n');
  
  const urls = [
    'https://worldtoday.vercel.app',
    'https://worldtoday.onrender.com/health',
    'https://worldtoday.onrender.com/api/news'
  ];
  
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const result = await checkWebsiteSpeed(url);
      
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`⏱️  Load Time: ${result.loadTime}`);
      console.log(`📦 Content Size: ${result.contentLength} bytes`);
      
      if (result.loadTime.replace('ms', '') > 3000) {
        console.log('⚠️  WARNING: Slow loading time (>3s)');
      }
      
      console.log('---');
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('---');
    }
  }
}

runSpeedTests();