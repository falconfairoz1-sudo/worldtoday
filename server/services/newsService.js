const axios = require('axios');
const Parser = require('rss-parser');

class NewsService {
  constructor() {
    this.parser = new Parser({ 
      timeout: 10000, 
      headers: { 'User-Agent': 'WorldToday/1.0' },
      customFields: {
        item: [
          ['media:content', 'media:content'],
          ['media:thumbnail', 'media:thumbnail'],
          ['content:encoded', 'content:encoded'],
          ['enclosure', 'enclosure']
        ]
      }
    });
    this._cache = new Map();
    // Track rate-limited APIs: apiName → timestamp when limit expires
    this._rateLimited = new Map();

    this.key = {
      newsapi:    () => process.env.NEWSAPI_KEY,
      gnews:      () => process.env.GNEWS_API_KEY,
      currents:   () => process.env.CURRENTS_API_KEY,
      mediastack: () => process.env.MEDIASTACK_KEY,
      newsdata:   () => process.env.NEWSDATA_API_KEY,
      thenewsapi: () => process.env.THENEWSAPI_KEY,
    };

    // Global RSS by category (60+ sources)
    this.rssFeedsByCategory = {
      general: [
        'https://feeds.bbci.co.uk/news/rss.xml',
        'https://www.theguardian.com/world/rss',
        'https://feeds.reuters.com/reuters/topNews',
        'https://www.aljazeera.com/xml/rss/all.xml',
        'https://rss.dw.com/rdf/rss-en-all',
        'https://feeds.skynews.com/feeds/rss/world.xml',
        'https://feeds.npr.org/1001/rss.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
        'https://feeds.washingtonpost.com/rss/world',
        'https://www.france24.com/en/rss',
        'https://feeds.feedburner.com/euronews/en/news',
        'https://abcnews.go.com/abcnews/internationalheadlines',
        'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        'https://www.thehindu.com/feeder/default.rss',
        'https://indianexpress.com/feed/',
        'https://www.ndtv.com/rss/2012',
        'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
      ],
      politics: [
        'https://feeds.bbci.co.uk/news/politics/rss.xml',
        'https://www.theguardian.com/politics/rss',
        'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
        'https://feeds.washingtonpost.com/rss/politics',
        'https://feeds.npr.org/1014/rss.xml',
        'https://www.politico.com/rss/politicopicks.xml',
        'https://thehill.com/rss/syndicator/19109',
        'https://www.aljazeera.com/xml/rss/all.xml',
        'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
        'https://www.thehindu.com/news/national/feeder/default.rss',
        'https://indianexpress.com/section/india/feed/',
        'https://www.ndtv.com/india-news/rss',
      ],
      business: [
        'https://feeds.bbci.co.uk/news/business/rss.xml',
        'https://feeds.reuters.com/reuters/businessNews',
        'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
        'https://feeds.washingtonpost.com/rss/business',
        'https://feeds.bloomberg.com/markets/news.rss',
        'https://www.ft.com/rss/home',
        'https://feeds.marketwatch.com/marketwatch/topstories/',
        'https://feeds.cnbc.com/cnbc/ID/100003114/device/rss/rss.html',
        'https://feeds.fortune.com/fortune/rss',
        'https://economictimes.indiatimes.com/rssfeedstopstories.cms',
        'https://www.business-standard.com/rss/home_page_top_stories.rss',
        'https://www.livemint.com/rss/news',
        'https://www.financialexpress.com/feed/',
      ],
      technology: [
        'https://feeds.bbci.co.uk/news/technology/rss.xml',
        'https://techcrunch.com/feed/',
        'https://feeds.arstechnica.com/arstechnica/index',
        'https://www.theverge.com/rss/index.xml',
        'https://feeds.wired.com/wired/index',
        'https://feeds.engadget.com/weblogsinc/engadget',
        'https://www.zdnet.com/news/rss.xml',
        'https://feeds.feedburner.com/venturebeat/SZYF',
        'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
        'https://feeds.mashable.com/Mashable',
        'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms',
        'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',
        'https://gadgets.ndtv.com/rss/feeds',
      ],
      sports: [
        'https://feeds.bbci.co.uk/sport/rss.xml',
        'https://feeds.reuters.com/reuters/sportsNews',
        'https://feeds.skynews.com/feeds/rss/sports.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
        'https://feeds.espn.go.com/espn/rss/news',
        'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
        'https://www.goal.com/feeds/en/news',
        'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms',
        'https://www.ndtv.com/sport/rss',
        'https://sportstar.thehindu.com/feeder/default.rss',
        'https://www.hindustantimes.com/feeds/rss/cricket/rssfeed.xml',
      ],
      entertainment: [
        'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
        'https://feeds.skynews.com/feeds/rss/entertainment.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
        'https://feeds.hollywoodreporter.com/thr/news',
        'https://variety.com/feed/',
        'https://deadline.com/feed/',
        'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms',
        'https://www.bollywoodhungama.com/rss/news.xml',
        'https://www.filmfare.com/rss/news.xml',
        'https://www.pinkvilla.com/rss.xml',
      ],
      health: [
        'https://feeds.bbci.co.uk/news/health/rss.xml',
        'https://feeds.reuters.com/reuters/healthNews',
        'https://www.medicalnewstoday.com/rss/news.xml',
        'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
        'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
        'https://feeds.who.int/who/news',
        'https://timesofindia.indiatimes.com/rssfeeds/3908999.cms',
        'https://www.ndtv.com/health/rss',
        'https://www.thehindu.com/sci-tech/health/feeder/default.rss',
      ],
      science: [
        'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
        'https://feeds.reuters.com/reuters/scienceNews',
        'https://www.sciencedaily.com/rss/all.xml',
        'https://www.nasa.gov/rss/dyn/breaking_news.rss',
        'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
        'https://feeds.newscientist.com/science-news',
        'https://www.nature.com/nature.rss',
        'https://phys.org/rss-feed/',
        'https://www.thehindu.com/sci-tech/science/feeder/default.rss',
      ],
    };

    // Country-specific RSS feeds
    this.countryFeeds = {
      in: {
        general:       ['https://timesofindia.indiatimes.com/rssfeedstopstories.cms','https://www.thehindu.com/feeder/default.rss','https://indianexpress.com/feed/','https://www.ndtv.com/rss/2012','https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml','https://www.deccanherald.com/rss-feed/national.rss'],
        politics:      ['https://timesofindia.indiatimes.com/rssfeeds/296589292.cms','https://www.thehindu.com/news/national/feeder/default.rss','https://indianexpress.com/section/india/feed/'],
        business:      ['https://economictimes.indiatimes.com/rssfeedstopstories.cms','https://www.business-standard.com/rss/home_page_top_stories.rss','https://www.livemint.com/rss/news','https://www.financialexpress.com/feed/'],
        technology:    ['https://timesofindia.indiatimes.com/rssfeeds/66949542.cms','https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms','https://gadgets.ndtv.com/rss/feeds'],
        sports:        ['https://timesofindia.indiatimes.com/rssfeeds/4719148.cms','https://www.espncricinfo.com/rss/content/story/feeds/0.xml','https://sportstar.thehindu.com/feeder/default.rss'],
        entertainment: ['https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms','https://www.bollywoodhungama.com/rss/news.xml','https://www.pinkvilla.com/rss.xml'],
        health:        ['https://timesofindia.indiatimes.com/rssfeeds/3908999.cms','https://www.ndtv.com/health/rss'],
        science:       ['https://www.thehindu.com/sci-tech/science/feeder/default.rss'],
      },
      us: {
        general:       ['https://feeds.npr.org/1001/rss.xml','https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml','https://feeds.washingtonpost.com/rss/national','https://abcnews.go.com/abcnews/topstories','https://feeds.foxnews.com/foxnews/latest'],
        politics:      ['https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml','https://feeds.washingtonpost.com/rss/politics','https://www.politico.com/rss/politicopicks.xml','https://thehill.com/rss/syndicator/19109'],
        business:      ['https://feeds.bloomberg.com/markets/news.rss','https://feeds.marketwatch.com/marketwatch/topstories/','https://feeds.cnbc.com/cnbc/ID/100003114/device/rss/rss.html'],
        technology:    ['https://techcrunch.com/feed/','https://feeds.wired.com/wired/index','https://www.theverge.com/rss/index.xml'],
        sports:        ['https://feeds.espn.go.com/espn/rss/news'],
        entertainment: ['https://feeds.hollywoodreporter.com/thr/news','https://variety.com/feed/'],
        health:        ['https://rss.nytimes.com/services/xml/rss/nyt/Health.xml','https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC'],
        science:       ['https://rss.nytimes.com/services/xml/rss/nyt/Science.xml','https://www.nasa.gov/rss/dyn/breaking_news.rss'],
      },
      gb: {
        general:       ['https://feeds.bbci.co.uk/news/rss.xml','https://www.theguardian.com/uk/rss','https://feeds.skynews.com/feeds/rss/uk.xml','https://www.independent.co.uk/news/uk/rss'],
        politics:      ['https://feeds.bbci.co.uk/news/politics/rss.xml','https://www.theguardian.com/politics/rss'],
        business:      ['https://feeds.bbci.co.uk/news/business/rss.xml','https://www.ft.com/rss/home'],
        technology:    ['https://feeds.bbci.co.uk/news/technology/rss.xml','https://www.theguardian.com/technology/rss'],
        sports:        ['https://feeds.bbci.co.uk/sport/rss.xml','https://feeds.skynews.com/feeds/rss/sports.xml'],
        entertainment: ['https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'],
        health:        ['https://feeds.bbci.co.uk/news/health/rss.xml'],
        science:       ['https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'],
      },
      au: {
        general:       ['https://www.abc.net.au/news/feed/51120/rss.xml','https://feeds.smh.com.au/rssheadlines/top.xml'],
        sports:        ['https://www.abc.net.au/news/feed/2942460/rss.xml'],
        business:      ['https://feeds.smh.com.au/rssheadlines/business.xml'],
        technology:    ['https://feeds.smh.com.au/rssheadlines/technology.xml'],
      },
      ca: {
        general:       ['https://www.cbc.ca/cmlink/rss-topstories','https://globalnews.ca/feed/'],
        politics:      ['https://www.cbc.ca/cmlink/rss-politics'],
        business:      ['https://www.cbc.ca/cmlink/rss-business'],
        sports:        ['https://www.cbc.ca/cmlink/rss-sports'],
      },
      de: {
        general:       ['https://rss.dw.com/rdf/rss-en-all','https://www.spiegel.de/international/index.rss'],
        business:      ['https://rss.dw.com/rdf/rss-en-business'],
      },
      fr: {
        general:       ['https://www.france24.com/en/rss','https://feeds.feedburner.com/euronews/en/news'],
      },
      ae: {
        general:       ['https://www.aljazeera.com/xml/rss/all.xml','https://gulfnews.com/rss','https://www.thenationalnews.com/rss'],
      },
      sa: {
        general:       ['https://www.aljazeera.com/xml/rss/all.xml','https://arab.news/rss'],
      },
      pk: {
        general:       ['https://www.dawn.com/feeds/home','https://www.geo.tv/rss/1/0','https://tribune.com.pk/feed'],
        politics:      ['https://www.dawn.com/feeds/pakistan'],
        business:      ['https://www.dawn.com/feeds/business'],
      },
      bd: {
        general:       ['https://www.thedailystar.net/frontpage/rss.xml'],
      },
      za: {
        general:       ['https://feeds.news24.com/articles/news24/TopStories/rss','https://www.dailymaverick.co.za/feed/'],
      },
      ng: {
        general:       ['https://www.vanguardngr.com/feed/','https://punchng.com/feed/','https://www.premiumtimesng.com/feed'],
      },
      br: {
        general:       ['https://feeds.folha.uol.com.br/emcimadahora/rss091.xml'],
      },
      jp: {
        general:       ['https://www3.nhk.or.jp/rss/news/cat0.xml','https://feeds.japantimes.co.jp/japantimes/news'],
      },
      cn: {
        general:       ['https://www.chinadaily.com.cn/rss/china_rss.xml'],
      },
      ru: {
        general:       ['https://feeds.rt.com/rss/news','https://tass.com/rss/v2.xml'],
      },
      sg: {
        general:       ['https://www.straitstimes.com/news/singapore/rss.xml','https://feeds.channelnewsasia.com/rss/singapore'],
      },
      kr: {
        general:       ['https://www.koreaherald.com/common/rss_xml.php?ct=102'],
      },
    };

    this._newsApiCountries = new Set([
      'ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz',
      'de','eg','fr','gb','gr','hk','hu','id','ie','il','in','it','jp',
      'kr','lt','lv','ma','mx','my','ng','nl','no','nz','ph','pl','pt',
      'ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za',
    ]);

    this._gNewsCountries = new Set([
      'au','br','ca','cn','eg','fr','de','gr','hk','in','ie','il','it',
      'jp','nl','no','pk','pe','ph','pt','ro','ru','sg','es','se','ch',
      'tw','ua','gb','us',
    ]);

    this._mediastackCountries = new Set([
      'ae','ar','at','au','be','bg','br','ca','ch','cn','co','cz','de',
      'eg','es','fr','gb','gr','hk','hu','id','ie','il','in','it','jp',
      'kr','mx','my','ng','nl','no','nz','ph','pl','pt','ro','ru','sa',
      'se','sg','th','tr','tw','ua','us','za',
    ]);
  }

  // Main entry point — PRIMARY → SECONDARY → TERTIARY → FREE UNLIMITED → RSS
  async fetchNews(country, category) {
    const cacheKey = `${country}:${category}`;
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 15 * 60 * 1000) {
      return cached.data;
    }

    let articles = [];

    // ── GROUP A: Primary APIs (best quality, rate limited) ────────────────
    const primaryResults = await Promise.allSettled([
      this._newsApiCountries.has(country) && this.key.newsapi() && !this._isRateLimited('newsapi')
        ? this._newsapi(country, category) : Promise.resolve([]),
      this._gNewsCountries.has(country) && this.key.gnews() && !this._isRateLimited('gnews')
        ? this._gnews(country, category) : Promise.resolve([]),
    ]);
    primaryResults.forEach(r => {
      if (r.status === 'fulfilled') articles.push(...(r.value || []));
    });

    // ── GROUP B: Secondary APIs (if primary gave < 10 results) ────────────
    if (articles.length < 10) {
      const secondaryResults = await Promise.allSettled([
        this.key.currents() && !this._isRateLimited('currents')
          ? this._currents(country, category) : Promise.resolve([]),
        this._mediastackCountries.has(country) && this.key.mediastack() && !this._isRateLimited('mediastack')
          ? this._mediastack(country, category) : Promise.resolve([]),
      ]);
      secondaryResults.forEach(r => {
        if (r.status === 'fulfilled') articles.push(...(r.value || []));
      });
    }

    // ── GROUP C: Tertiary APIs (if still < 10 results) ────────────────────
    if (articles.length < 10) {
      const tertiaryResults = await Promise.allSettled([
        this.key.newsdata() && !this._isRateLimited('newsdata')
          ? this._newsdata(country, category) : Promise.resolve([]),
        !this._isRateLimited('knowivate')
          ? this._knowivate(country, category) : Promise.resolve([]),
      ]);
      tertiaryResults.forEach(r => {
        if (r.status === 'fulfilled') articles.push(...(r.value || []));
      });
    }

    // ── GROUP D: Free Unlimited APIs (always try these) ───────────────────
    if (articles.length < 15) {
      const freeResults = await Promise.allSettled([
        this._googlenews(country, category),
        this._bingnews(country, category),
        this._newsapiai(country, category),
        this._newscatcher(country, category),
      ]);
      freeResults.forEach(r => {
        if (r.status === 'fulfilled') articles.push(...(r.value || []));
      });
    }

    // ── Country-specific RSS ───────────────────────────────────────────────
    const cFeeds = this.countryFeeds[country];
    if (cFeeds && articles.length < 20) {
      const feeds = cFeeds[category] || cFeeds.general;
      if (feeds) {
        const rssArticles = await this._feedList(feeds, country);
        articles.push(...rssArticles);
      }
    }

    // ── Global RSS fallback (always runs to fill gaps) ────────────────────
    if (articles.length < 20) {
      const globalRss = await this._rssCategory(category, country);
      articles.push(...globalRss);
    }

    const deduped = this._deduplicate(articles);
    const scored  = this._scoreAndSort(deduped);
    const final   = scored.slice(0, 40); // Increased from 30 to 40

    this._cache.set(cacheKey, { data: final, ts: Date.now() });
    if (final.length > 0) {
      console.log(`  ✅ [${country}/${category}] ${final.length} articles (from ${articles.length} total)`);
    }
    return final;
  }

  // Deduplicate articles by URL and similar titles
  _deduplicate(articles) {
    const seenUrls = new Set();
    const seenTitles = new Set();
    return articles.filter(a => {
      if (!a.title || !a.url) return false;
      const normUrl = a.url.replace(/[?#].*$/, '').toLowerCase().trim();
      const normTitle = a.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().substring(0, 60);
      if (seenUrls.has(normUrl) || seenTitles.has(normTitle)) return false;
      seenUrls.add(normUrl);
      seenTitles.add(normTitle);
      return true;
    });
  }

  // Score articles: newer = higher score, known sources = bonus
  _scoreAndSort(articles) {
    const trustedSources = new Set(['bbc','reuters','guardian','nytimes','thehindu','ndtv','timesofindia','aljazeera','bloomberg','ft','washingtonpost','npr','abc','cbs','cnn','france24','dw']);
    return articles.map(a => {
      const ageHours = (Date.now() - new Date(a.publishedAt).getTime()) / 3600000;
      const freshnessScore = Math.max(0, 100 - ageHours * 2);
      const sourceName = (a.source?.name || a.source?.url || '').toLowerCase();
      const credibilityBonus = [...trustedSources].some(s => sourceName.includes(s)) ? 20 : 0;
      return { ...a, _score: freshnessScore + credibilityBonus };
    }).sort((a, b) => b._score - a._score);
  }

  async _newsapi(country, category) {
    try {
      const res = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: { country, category, apiKey: this.key.newsapi(), pageSize: 20 },
        timeout: 12000,
      });
      return (res.data.articles || [])
        .filter(a => a.title && a.url && !a.title.includes('[Removed]'))
        .map(a => ({ 
          title: a.title, 
          description: a.description || '', 
          content: a.content || a.description || '', 
          author: a.author, 
          source: { name: a.source?.name }, 
          url: a.url, 
          urlToImage: a.urlToImage || null, 
          publishedAt: new Date(a.publishedAt), 
          country 
        }));
    } catch (e) { this._err('NewsAPI', e); return []; }
  }

  async _gnews(country, category) {
    const topicMap = { general:'general', politics:'nation', business:'business', technology:'technology', sports:'sports', entertainment:'entertainment', health:'health', science:'science' };
    try {
      const res = await axios.get('https://gnews.io/api/v4/top-headlines', {
        params: { country, topic: topicMap[category]||'general', token: this.key.gnews(), max: 20, lang:'en' },
        timeout: 12000,
      });
      return (res.data.articles || []).filter(a => a.title && a.url).map(a => ({ 
        title: a.title, 
        description: a.description || '', 
        content: a.content || a.description || '', 
        author: a.source?.name, 
        source: { name: a.source?.name }, 
        url: a.url, 
        urlToImage: a.image || null, 
        publishedAt: new Date(a.publishedAt), 
        country 
      }));
    } catch (e) { this._err('GNews', e); return []; }
  }

  async _currents(country, category) {
    const catMap = { general:'world', politics:'politics', business:'business', technology:'technology', sports:'sports', entertainment:'entertainment', health:'health', science:'science' };
    try {
      const res = await axios.get('https://api.currentsapi.services/v1/latest-news', {
        params: { apiKey: this.key.currents(), country: country.toUpperCase(), category: catMap[category]||'world', language:'en', page_size: 20 },
        timeout: 12000,
      });
      return (res.data.news || []).filter(a => a.title && a.url).map(a => ({ title: a.title, description: a.description || '', content: a.description || '', author: a.author || a.source, source: { name: a.source }, url: a.url, urlToImage: a.image !== 'None' ? a.image : null, publishedAt: new Date(a.published), country }));
    } catch (e) { this._err('Currents', e); return []; }
  }

  async _mediastack(country, category) {
    try {
      const res = await axios.get('http://api.mediastack.com/v1/news', {
        params: { access_key: this.key.mediastack(), countries: country, categories: category, languages:'en', limit: 20 },
        timeout: 12000,
      });
      return (res.data.data || []).filter(a => a.title && a.url).map(a => ({ title: a.title, description: a.description || '', content: a.description || '', author: a.author, source: { name: a.source }, url: a.url, urlToImage: a.image, publishedAt: new Date(a.published_at), country }));
    } catch (e) { this._err('MediaStack', e); return []; }
  }

  async _thenewsapi(country, category) {
    const catMap = { general:'general', politics:'politics', business:'business', technology:'tech', sports:'sports', entertainment:'entertainment', health:'health', science:'science' };
    try {
      const res = await axios.get('https://api.thenewsapi.com/v1/news/top', {
        params: { api_token: this.key.thenewsapi(), locale: country, categories: catMap[category]||'general', language:'en', limit: 20 },
        timeout: 12000,
      });
      return (res.data.data || []).filter(a => a.title && a.url).map(a => ({ title: a.title, description: a.description || '', content: a.description || '', author: a.source, source: { name: a.source }, url: a.url, urlToImage: a.image_url, publishedAt: new Date(a.published_at), country }));
    } catch (e) { this._err('TheNewsAPI', e); return []; }
  }

  // ── 5. NewsData.io ────────────────────────────────────────────────────
  // Free: 200 req/day — https://newsdata.io
  async _newsdata(country, category) {
    const catMap = {
      general:'top', politics:'politics', business:'business',
      technology:'technology', sports:'sports', entertainment:'entertainment',
      health:'health', science:'science',
    };
    try {
      const res = await axios.get('https://newsdata.io/api/1/latest', {
        params: {
          apikey:   this.key.newsdata(),
          country:  country,
          category: catMap[category] || 'top',
          language: 'en',
        },
        timeout: 12000,
      });
      return (res.data.results || []).filter(a => a.title && a.link).map(a => ({
        title:       a.title,
        description: a.description || '',
        content:     a.content || a.description || '',
        author:      Array.isArray(a.creator) ? a.creator[0] : a.creator,
        source:      { name: a.source_id || a.source_name, url: a.source_url },
        url:         a.link,
        urlToImage:  a.image_url || null,
        publishedAt: new Date(a.pubDate || Date.now()),
        country,
      }));
    } catch (e) { this._err('NewsData', e); return []; }
  }

  // ── 6. Knowivate (free, no key) ───────────────────────────────────────
  async _knowivate(country, category) {
    try {
      const url = 'https://news.knowivate.com/api/latest';
      
      const res = await axios.get(url, {
        params: { country, category, limit: 20 },
        timeout: 12000,
        headers: {
          'User-Agent': 'WorldToday/1.0',
          'Accept': 'application/json',
        },
      });

      // Check if API returned valid data
      if (res.status !== 200) {
        console.log(`  ⚠️  Knowivate API returned status ${res.status}`);
        return [];
      }

      const items = res.data?.articles || res.data?.news || res.data?.data || res.data || [];
      if (!Array.isArray(items)) {
        return [];
      }

      const articles = items.filter(a => a.title && (a.url || a.link)).map(a => ({
        title:       a.title,
        description: a.description || a.summary || '',
        content:     a.content || a.description || '',
        author:      a.author || a.source,
        source:      { name: a.source || a.sourceName || 'Knowivate', url: a.sourceUrl },
        url:         a.url || a.link,
        urlToImage:  a.urlToImage || a.image || a.imageUrl || null,
        publishedAt: new Date(a.publishedAt || a.pubDate || Date.now()),
        country,
      }));

      if (articles.length > 0) {
        console.log(`  ✅ Knowivate: ${articles.length} articles`);
      }

      return articles;
    } catch (e) {
      // Silently fail
      return [];
    }
  }

  // ── 7. NewsAPI.ai (free, unlimited) ────────────────────────────────────
  async _newsapiai(country, category) {
    try {
      const res = await axios.get('https://newsapi.ai/api/v1/article/getArticles', {
        params: {
          query: JSON.stringify({
            $query: {
              $and: [
                { locationUri: `http://en.wikipedia.org/wiki/${country}` },
                { categoryUri: `news/${category}` }
              ]
            },
            $filter: { forceMaxDataTimeWindow: '31' }
          }),
          resultType: 'articles',
          articlesSortBy: 'date',
          articlesCount: 20,
          includeArticleImage: true,
        },
        timeout: 12000,
      });

      const articles = (res.data?.articles?.results || []).filter(a => a.title && a.url).map(a => ({
        title:       a.title,
        description: a.body || '',
        content:     a.body || '',
        author:      a.author,
        source:      { name: a.source?.title || 'NewsAPI.ai', url: a.source?.uri },
        url:         a.url,
        urlToImage:  a.image || null,
        publishedAt: new Date(a.dateTime || Date.now()),
        country,
      }));

      if (articles.length > 0) {
        console.log(`  ✅ NewsAPI.ai: ${articles.length} articles`);
      }

      return articles;
    } catch (e) {
      return [];
    }
  }

  // ── 8. NewsCatcher (free tier) ─────────────────────────────────────────
  async _newscatcher(country, category) {
    try {
      const res = await axios.get('https://api.newscatcherapi.com/v2/latest_headlines', {
        params: {
          countries: country,
          topic: category,
          lang: 'en',
          page_size: 20,
        },
        headers: {
          'x-api-key': process.env.NEWSCATCHER_API_KEY || 'free-tier-key',
        },
        timeout: 12000,
      });

      const articles = (res.data?.articles || []).filter(a => a.title && a.link).map(a => ({
        title:       a.title,
        description: a.summary || a.excerpt || '',
        content:     a.summary || '',
        author:      a.author,
        source:      { name: a.clean_url || 'NewsCatcher', url: a.link },
        url:         a.link,
        urlToImage:  a.media || null,
        publishedAt: new Date(a.published_date || Date.now()),
        country,
      }));

      if (articles.length > 0) {
        console.log(`  ✅ NewsCatcher: ${articles.length} articles`);
      }

      return articles;
    } catch (e) {
      return [];
    }
  }

  // ── 9. Bing News Search (free, no key) ────────────────────────────────
  async _bingnews(country, category) {
    try {
      const query = `${category} ${country} news`;
      const res = await axios.get('https://www.bing.com/news/search', {
        params: {
          q: query,
          format: 'rss',
        },
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      // Parse RSS response
      const feed = await this.parser.parseString(res.data);
      const articles = (feed.items || []).slice(0, 20).map(item => ({
        title:       item.title,
        description: item.contentSnippet || item.description || '',
        content:     item.content || item.contentSnippet || '',
        author:      item.creator || 'Bing News',
        source:      { name: 'Bing News', url: item.link },
        url:         item.link,
        urlToImage:  this._extractImageFromContent(item.content || item.description) || null,
        publishedAt: new Date(item.pubDate || Date.now()),
        country,
      }));

      if (articles.length > 0) {
        console.log(`  ✅ Bing News: ${articles.length} articles`);
      }

      return articles;
    } catch (e) {
      return [];
    }
  }

  // ── 10. Google News RSS (free, unlimited) ──────────────────────────────
  async _googlenews(country, category) {
    try {
      const topicMap = {
        general: 'WORLD',
        politics: 'NATION',
        business: 'BUSINESS',
        technology: 'TECHNOLOGY',
        sports: 'SPORTS',
        entertainment: 'ENTERTAINMENT',
        health: 'HEALTH',
        science: 'SCIENCE',
      };

      const topic = topicMap[category] || 'WORLD';
      const countryCode = country.toUpperCase();
      
      const res = await axios.get(`https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-${countryCode}&gl=${countryCode}&ceid=${countryCode}:en`, {
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const feed = await this.parser.parseString(res.data);
      const articles = (feed.items || []).slice(0, 20).map(item => ({
        title:       item.title,
        description: item.contentSnippet || '',
        content:     item.content || item.contentSnippet || '',
        author:      item.creator || 'Google News',
        source:      { name: item.source?.title || 'Google News', url: item.link },
        url:         item.link,
        urlToImage:  this._extractImageFromContent(item.content) || null,
        publishedAt: new Date(item.pubDate || Date.now()),
        country,
      }));

      if (articles.length > 0) {
        console.log(`  ✅ Google News: ${articles.length} articles`);
      }

      return articles;
    } catch (e) {
      return [];
    }
  }

  // Helper: Extract image from HTML content
  _extractImageFromContent(html) {
    if (!html) return null;
    const imgMatch = html.match(/<img[^>]+src=["']([^"'>]+)["']/i);
    return imgMatch ? imgMatch[1] : null;
  }

  async _rssCategory(category, country) {
    const feeds = this.rssFeedsByCategory[category] || this.rssFeedsByCategory.general;
    return this._feedList(feeds, country);
  }

  async _feedList(urls, country) {
    const all = [];
    for (const url of urls) {
      try {
        const items = await this._rss(url, country);
        all.push(...items);
        if (all.length >= 20) break;
      } catch (_) {}
    }
    return all.slice(0, 20);
  }

  async _rss(feedUrl, country = 'us') {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      return (feed.items || []).slice(0, 15).map(item => {
        // Try multiple image sources from RSS
        let imageUrl = null;
        
        // Try enclosure
        if (item.enclosure?.url) {
          imageUrl = item.enclosure.url;
        }
        // Try media:content
        else if (item['media:content']?.$ && item['media:content'].$.url) {
          imageUrl = item['media:content'].$.url;
        }
        // Try media:thumbnail
        else if (item['media:thumbnail']?.$ && item['media:thumbnail'].$.url) {
          imageUrl = item['media:thumbnail'].$.url;
        }
        // Try content:encoded for embedded images
        else if (item['content:encoded']) {
          const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }
        // Try description for embedded images
        else if (item.description) {
          const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }

        return {
          title: (item.title || '').trim(),
          description: item.contentSnippet || item.summary || '',
          content: item.content || item.contentSnippet || '',
          author: item.creator || item.author || feed.title,
          source: { name: feed.title, url: feed.link },
          url: item.link || item.guid,
          urlToImage: imageUrl,
          publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
          country,
        };
      }).filter(a => a.title && a.url);
    } catch (e) {
      const m = e.message || '';
      if (!m.includes('TLS') && !m.includes('socket') && !m.includes('ECONNRESET') && !m.includes('ETIMEDOUT')) {
        console.error(`  ❌ RSS (${feedUrl}):`, m);
      }
      return [];
    }
  }

  _err(name, e) {
    const s = e.response?.status;
    if (s === 401 || s === 403) {
      console.error(`  ❌ ${name}: Bad key (${s})`);
    } else if (s === 429 || s === 426) {
      // Rate limited — skip this API for 1 hour
      const expiry = Date.now() + 60 * 60 * 1000;
      this._rateLimited.set(name.toLowerCase(), expiry);
      console.warn(`  ⚠️  ${name}: Rate limit hit — skipping for 1 hour`);
    }
  }

  // Check if an API is currently rate-limited
  _isRateLimited(name) {
    const expiry = this._rateLimited.get(name.toLowerCase());
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this._rateLimited.delete(name.toLowerCase());
      return false;
    }
    return true;
  }

  async translateArticle(article, targetLang) {
    try {
      const url = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';
      const t = async (text) => {
        if (!text) return '';
        const res = await axios.post(url, { q: text, source: 'auto', target: targetLang, format: 'text' }, { timeout: 10000 });
        return res.data.translatedText;
      };
      const [title, description, content] = await Promise.all([t(article.title), t(article.description), t(article.content)]);
      return { title, description, content };
    } catch (e) {
      return { title: article.title, description: article.description, content: article.content };
    }
  }
}

module.exports = new NewsService();
