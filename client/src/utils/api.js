import axios from 'axios';

const PRIMARY_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FALLBACK_API_URL = 'http://localhost:5000/api';

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
  const mockArticles = [
    {
      _id: '1',
      title: 'Breaking: Technology Advances in 2024',
      description: 'Latest developments in artificial intelligence and machine learning are reshaping industries worldwide.',
      content: 'The technology sector continues to evolve rapidly with new innovations...',
      category: 'technology',
      country: 'us',
      urlToImage: 'https://picsum.photos/800/600?random=1',
      source: { name: 'Tech News', url: 'https://example.com' },
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/tech-news-1'
    },
    {
      _id: '2',
      title: 'Global Business Markets Show Growth',
      description: 'International markets demonstrate positive trends as economic indicators improve.',
      content: 'Business analysts report encouraging signs across multiple sectors...',
      category: 'business',
      country: 'us',
      urlToImage: 'https://picsum.photos/800/600?random=2',
      source: { name: 'Business Today', url: 'https://example.com' },
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/business-news-1'
    },
    {
      _id: '3',
      title: 'Sports Championship Updates',
      description: 'Latest results from major sporting events around the world.',
      content: 'Sports fans celebrate as championships deliver exciting matches...',
      category: 'sports',
      country: 'us',
      urlToImage: 'https://picsum.photos/800/600?random=3',
      source: { name: 'Sports Network', url: 'https://example.com' },
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/sports-news-1'
    }
  ];

  if (url.includes('/news')) {
    return {
      data: {
        articles: mockArticles,
        total: mockArticles.length,
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
