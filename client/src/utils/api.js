import axios from 'axios';

// Use production backend for all environments
const PRIMARY_API_URL = 'https://worldtoday.onrender.com/api';
const FALLBACK_API_URL = 'https://worldtoday.onrender.com/api';

// Create primary API instance
const api = axios.create({
  baseURL: PRIMARY_API_URL,
  timeout: 10000,
});

// Create fallback API instance
const fallbackApi = axios.create({
  baseURL: FALLBACK_API_URL,
  timeout: 10000,
});

// Add token to requests
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);
fallbackApi.interceptors.request.use(addAuthToken);

// Enhanced API with fallback
const enhancedApi = {
  async get(url, config = {}) {
    try {
      console.log(`🔍 Trying primary API: ${PRIMARY_API_URL}${url}`);
      const response = await api.get(url, config);
      console.log('✅ Primary API success');
      return response;
    } catch (error) {
      console.warn('❌ Primary API failed:', error.message);
      
      // If primary fails and we're not already using localhost, try fallback
      if (PRIMARY_API_URL !== FALLBACK_API_URL) {
        try {
          console.log(`🔄 Trying fallback API: ${FALLBACK_API_URL}${url}`);
          const response = await fallbackApi.get(url, config);
          console.log('✅ Fallback API success');
          return response;
        } catch (fallbackError) {
          console.error('❌ Fallback API also failed:', fallbackError.message);
        }
      }
      
      // If both fail, return mock data for development
      console.log('🎭 Returning mock data');
      return getMockData(url);
    }
  },

  async post(url, data, config = {}) {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      if (PRIMARY_API_URL !== FALLBACK_API_URL) {
        return await fallbackApi.post(url, data, config);
      }
      throw error;
    }
  },

  async put(url, data, config = {}) {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      if (PRIMARY_API_URL !== FALLBACK_API_URL) {
        return await fallbackApi.put(url, data, config);
      }
      throw error;
    }
  },

  async delete(url, config = {}) {
    try {
      return await api.delete(url, config);
    } catch (error) {
      if (PRIMARY_API_URL !== FALLBACK_API_URL) {
        return await fallbackApi.delete(url, config);
      }
      throw error;
    }
  }
};

// Mock data for development/fallback
function getMockData(url) {
  console.log('🎭 Generating mock data for:', url);
  
  // Extract category from URL if present
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const category = urlParams.get('category') || 'general';
  
  const mockArticlesByCategory = {
    politics: [
      {
        _id: 'pol1',
        title: 'Political Leaders Meet for Global Summit',
        description: 'World leaders gather to discuss international cooperation and policy reforms.',
        content: 'In a historic gathering, political leaders from around the world...',
        category: 'politics',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=10',
        source: { name: 'Political News', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/politics-1'
      },
      {
        _id: 'pol2',
        title: 'New Policy Reforms Announced by Government',
        description: 'Government announces major policy changes affecting citizens nationwide.',
        content: 'The government has announced significant policy reforms...',
        category: 'politics',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=11',
        source: { name: 'Policy Today', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/politics-2'
      }
    ],
    business: [
      {
        _id: 'bus1',
        title: 'Global Markets Show Strong Growth This Quarter',
        description: 'International markets demonstrate positive trends as economic indicators improve.',
        content: 'Business analysts report encouraging signs across multiple sectors...',
        category: 'business',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=20',
        source: { name: 'Business Today', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/business-1'
      },
      {
        _id: 'bus2',
        title: 'Tech Stocks Reach New Heights in Trading',
        description: 'Technology companies see unprecedented growth in market valuation.',
        content: 'The technology sector continues to lead market growth...',
        category: 'business',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=21',
        source: { name: 'Market Watch', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/business-2'
      }
    ],
    technology: [
      {
        _id: 'tech1',
        title: 'AI Revolution Transforms Industries Worldwide',
        description: 'Latest developments in artificial intelligence are reshaping industries worldwide.',
        content: 'The technology sector continues to evolve rapidly with new innovations...',
        category: 'technology',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=30',
        source: { name: 'Tech News', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/tech-1'
      },
      {
        _id: 'tech2',
        title: 'Breakthrough in Quantum Computing Research',
        description: 'Scientists achieve major milestone in quantum computing development.',
        content: 'Researchers have made significant progress in quantum computing...',
        category: 'technology',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=31',
        source: { name: 'Science Tech', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/tech-2'
      }
    ],
    sports: [
      {
        _id: 'sport1',
        title: 'Championship Finals Draw Record Crowds',
        description: 'Latest results from major sporting events around the world.',
        content: 'Sports fans celebrate as championships deliver exciting matches...',
        category: 'sports',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=40',
        source: { name: 'Sports Network', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/sports-1'
      },
      {
        _id: 'sport2',
        title: 'Olympic Preparations Underway for Athletes',
        description: 'Athletes prepare for upcoming international competitions.',
        content: 'Olympic preparations are in full swing as athletes...',
        category: 'sports',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=41',
        source: { name: 'Olympic News', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/sports-2'
      }
    ],
    entertainment: [
      {
        _id: 'ent1',
        title: 'Hollywood Blockbuster Breaks Box Office Records',
        description: 'Latest movie releases dominate box office worldwide.',
        content: 'The entertainment industry sees record-breaking performances...',
        category: 'entertainment',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=50',
        source: { name: 'Entertainment Weekly', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/entertainment-1'
      },
      {
        _id: 'ent2',
        title: 'Music Festival Season Kicks Off Worldwide',
        description: 'Major music festivals announce lineups and ticket sales begin.',
        content: 'Music fans prepare for the biggest festival season...',
        category: 'entertainment',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=51',
        source: { name: 'Music Today', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/entertainment-2'
      }
    ],
    health: [
      {
        _id: 'health1',
        title: 'Medical Breakthrough in Cancer Treatment',
        description: 'Scientists discover new treatment methods for common diseases.',
        content: 'Medical researchers have made significant breakthroughs...',
        category: 'health',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=60',
        source: { name: 'Health News', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/health-1'
      }
    ],
    science: [
      {
        _id: 'sci1',
        title: 'Space Exploration Reaches New Milestone',
        description: 'Space agencies achieve historic milestones in exploration.',
        content: 'Space exploration continues to push boundaries...',
        category: 'science',
        country: 'us',
        urlToImage: 'https://picsum.photos/800/600?random=70',
        source: { name: 'Science Daily', url: 'https://example.com' },
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/science-1'
      }
    ]
  };

  // Get articles for the requested category or general articles
  const articles = mockArticlesByCategory[category] || [
    ...mockArticlesByCategory.politics,
    ...mockArticlesByCategory.business,
    ...mockArticlesByCategory.technology,
    ...mockArticlesByCategory.sports,
    ...mockArticlesByCategory.entertainment
  ];

  if (url.includes('/news')) {
    return {
      data: {
        articles: articles,
        total: articles.length,
        success: true
      }
    };
  }

  return { data: { success: false, message: 'Mock data not available for this endpoint' } };
}

// Handle auth errors
enhancedApi.interceptors = {
  response: {
    use: (successCallback, errorCallback) => {
      api.interceptors.response.use(successCallback, errorCallback);
      fallbackApi.interceptors.response.use(successCallback, errorCallback);
    }
  }
};

// Add default response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default enhancedApi;
