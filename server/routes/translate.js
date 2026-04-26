const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy translation to LibreTranslate (free, no key needed for public instance)
router.post('/', async (req, res) => {
  try {
    const { text, title, description, target } = req.body;

    if (!text || !target) {
      return res.status(400).json({ message: 'text and target language required' });
    }

    const translateText = async (t) => {
      if (!t) return t;
      const response = await axios.post('https://libretranslate.com/translate', {
        q: t,
        source: 'en',
        target,
        format: 'text'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      return response.data.translatedText;
    };

    const [translatedTitle, translatedDescription, translatedContent] = await Promise.all([
      title ? translateText(title) : Promise.resolve(title),
      description ? translateText(description) : Promise.resolve(description),
      translateText(text.substring(0, 5000)) // Limit content length
    ]);

    res.json({
      title: translatedTitle,
      description: translatedDescription,
      content: translatedContent
    });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(503).json({ message: 'Translation service unavailable' });
  }
});

module.exports = router;
