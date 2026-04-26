const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory cache for images
const imageCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Image proxy — fetches external images server-side to bypass CORS
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
    const decoded = decodeURIComponent(url);
    
    // Only allow http/https
    if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
      return res.status(400).send('Invalid URL');
    }

    // Check cache first
    const cached = imageCache.get(decoded);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      res.set('Content-Type', cached.contentType);
      res.set('Cache-Control', 'public, max-age=86400, immutable');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('X-Cache', 'HIT');
      return res.send(cached.data);
    }

    console.log(`[Image Proxy] Fetching: ${decoded.substring(0, 100)}...`);

    const response = await axios.get(decoded, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': decoded.split('/').slice(0, 3).join('/'),
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Validate it's actually an image
    if (!contentType.startsWith('image/')) {
      console.log(`[Image Proxy] Not an image: ${contentType}`);
      return res.status(400).send('Not an image');
    }

    console.log(`[Image Proxy] Success: ${decoded.substring(0, 100)}... (${contentType})`);

    // Cache the image
    imageCache.set(decoded, {
      data: response.data,
      contentType,
      timestamp: Date.now(),
    });

    // Clean old cache entries (keep last 1000 images)
    if (imageCache.size > 1000) {
      const entries = Array.from(imageCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 500).forEach(([key]) => imageCache.delete(key));
    }

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400, immutable');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('X-Cache', 'MISS');
    res.send(response.data);
  } catch (err) {
    console.error(`[Image Proxy] Error: ${err.message}`);
    
    // Return 1x1 transparent pixel on error
    const transparentPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.set('Content-Type', 'image/gif');
    res.set('Cache-Control', 'public, max-age=3600');
    res.set('Access-Control-Allow-Origin', '*');
    res.send(transparentPixel);
  }
});

module.exports = router;
