import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import BreakingNewsTicker from '../components/BreakingNewsTicker';
import ArticleCard from '../components/article/ArticleCard';
import ArticleGrid from '../components/article/ArticleGrid';
import Sidebar from '../components/layout/Sidebar';
import api from '../utils/api';
import '../styles/Home.css';

const CATEGORIES = [
  { id: 'politics',      label: 'Politics',      icon: '🏛️', color: '#C41E3A' },
  { id: 'business',      label: 'Business',      icon: '💼', color: '#1a6b3c' },
  { id: 'technology',    label: 'Technology',    icon: '💻', color: '#0d6efd' },
  { id: 'sports',        label: 'Sports',        icon: '⚽', color: '#fd7e14' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#6f42c1' },
  { id: 'health',        label: 'Health',        icon: '🏥', color: '#20c997' },
  { id: 'science',       label: 'Science',       icon: '🔬', color: '#17a2b8' },
];

export default function Home() {
  const { user } = useContext(AuthContext);
  const [featured, setFeatured] = useState([]);
  const [categoryNews, setCategoryNews] = useState({});
  const [personalized, setPersonalized] = useState([]);
  const [feedMode, setFeedMode] = useState('top');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false); // Debug mode to show category info
  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem('worldtoday_country') || ''
  );

  useEffect(() => {
    const handler = (e) => setSelectedCountry(e.detail);
    window.addEventListener('worldtoday_country_change', handler);
    return () => window.removeEventListener('worldtoday_country_change', handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    setCategoryLoading(true);
    
    // Delay initial data fetching to improve perceived performance
    const timer = setTimeout(() => {
      // Fetch data
      fetchFeatured();
      fetchCategoryNews();
      if (user) fetchPersonalized();
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, user]);

  const fetchFeatured = async () => {
    try {
      const TOP_CATEGORIES = ['politics', 'business', 'technology', 'sports', 'entertainment'];
      
      // Fetch articles from each category with explicit category filtering
      const categoryPromises = TOP_CATEGORIES.map(async (categoryName) => {
        try {
          const params = { 
            category: categoryName,  // Explicit category
            limit: 5,  // Get 5 options per category
            ...(selectedCountry && selectedCountry !== '' && { country: selectedCountry })
          };
          
          console.log(`📰 Fetching ${categoryName} articles with params:`, params);
          const res = await api.get('/news', { params });
          const articles = res.data?.articles || [];
          
          console.log(`✅ ${categoryName}: ${articles.length} articles received`);
          
          // Verify articles are actually from the requested category
          const correctCategoryArticles = articles.filter(article => 
            article.category === categoryName
          );
          
          if (correctCategoryArticles.length !== articles.length) {
            console.warn(`⚠️ ${categoryName}: ${articles.length - correctCategoryArticles.length} articles had wrong category`);
          }
          
          return {
            category: categoryName,
            articles: correctCategoryArticles
          };
        } catch (error) {
          console.error(`❌ Error fetching ${categoryName}:`, error.message);
          return { category: categoryName, articles: [] };
        }
      });

      const categoryResults = await Promise.all(categoryPromises);
      
      // Select exactly ONE article from each category for the top 5
      const topFiveArticles = [];
      
      categoryResults.forEach(({ category, articles }) => {
        if (articles.length > 0) {
          // Prefer articles with images
          const withImage = articles.find(a => a.urlToImage && a.urlToImage.trim() !== '');
          const selectedArticle = withImage || articles[0];
          
          // Ensure the article has the correct category
          if (selectedArticle.category === category) {
            selectedArticle._categorySource = category;
            topFiveArticles.push(selectedArticle);
            console.log(`🎯 Selected for top row - ${category}: "${selectedArticle.title?.substring(0, 50)}..."`);
          } else {
            console.warn(`⚠️ Skipping article with wrong category: expected ${category}, got ${selectedArticle.category}`);
          }
        } else {
          console.warn(`⚠️ No articles available for ${category}`);
        }
      });

      console.log(`🎯 Top 5 articles from different categories: ${topFiveArticles.length}`);
      
      // If we don't have 5 articles, fill with general articles
      if (topFiveArticles.length < 5) {
        console.log(`🔄 Only got ${topFiveArticles.length} category articles, fetching general articles...`);
        try {
          const generalParams = { 
            category: 'general',
            limit: 10,
            ...(selectedCountry && selectedCountry !== '' && { country: selectedCountry })
          };
          const generalRes = await api.get('/news', { params: generalParams });
          const generalArticles = generalRes.data?.articles || [];
          
          // Add general articles to fill the gap
          const usedUrls = new Set(topFiveArticles.map(a => a.url));
          const additionalArticles = generalArticles
            .filter(a => !usedUrls.has(a.url))
            .slice(0, 5 - topFiveArticles.length);
            
          topFiveArticles.push(...additionalArticles);
          console.log(`📰 Added ${additionalArticles.length} general articles`);
        } catch (error) {
          console.error('❌ Error fetching general articles:', error);
        }
      }
      
      // Get remaining articles for the rest of the feed
      const usedUrls = new Set(topFiveArticles.map(a => a.url));
      const remainingArticles = categoryResults
        .flatMap(({ articles }) => articles)
        .filter(a => !usedUrls.has(a.url))
        .filter((a, i, self) => self.findIndex(x => x.url === a.url) === i)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Combine: Top 5 (different categories) + remaining articles
      const finalArticles = [...topFiveArticles, ...remainingArticles].slice(0, 30);
      console.log(`📋 Final featured articles: ${finalArticles.length} (Top ${topFiveArticles.length} from different categories + ${remainingArticles.length} others)`);
      
      setFeatured(finalArticles);
    } catch (err) {
      console.error('❌ Failed to fetch featured news:', err);
      // Set empty array if everything fails
      setFeatured([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryNews = async () => {
    console.log('🔄 Fetching category news...');
    const results = {};
    
    const promises = CATEGORIES.map(async ({ id, label }) => {
      try {
        const params = { 
          category: id, 
          limit: 16,
          ...(selectedCountry && selectedCountry !== '' && { country: selectedCountry })
        };
        
        console.log(`📰 Fetching ${label} (${id}) articles with params:`, params);
        const res = await api.get('/news', { params });
        const articles = res.data?.articles || [];
        
        console.log(`✅ ${label}: ${articles.length} articles received`);
        
        // Verify articles are actually from the requested category
        const correctCategoryArticles = articles.filter(article => 
          article.category === id
        );
        
        if (correctCategoryArticles.length !== articles.length) {
          console.warn(`⚠️ ${label}: ${articles.length - correctCategoryArticles.length} articles had wrong category`);
        }
        
        // Prioritize articles with images
        const articlesWithImages = correctCategoryArticles.filter(article => 
          article.urlToImage && article.urlToImage.trim() !== ''
        );
        const articlesWithoutImages = correctCategoryArticles.filter(article => 
          !article.urlToImage || article.urlToImage.trim() === ''
        );
        
        const combined = [...articlesWithImages, ...articlesWithoutImages];
        results[id] = combined.slice(0, 6);
        
        // Log sample articles for debugging only in development
        if (process.env.NODE_ENV === 'development' && results[id].length > 0) {
          console.log(`📋 ${label}: Using ${results[id].length} articles`);
        }
      } catch (error) {
        console.error(`❌ Error fetching ${label} (${id}):`, error.message);
        results[id] = [];
      }
    });
    
    await Promise.all(promises);
    setCategoryNews(results);
    setCategoryLoading(false);
  };

  const fetchPersonalized = async () => {
    try {
      const res = await api.get('/news/personalized');
      const articles = res.data?.articles || res.data || [];
      
      // Filter: Only articles WITH images
      const articlesWithImages = articles.filter(article => 
        article.urlToImage && article.urlToImage.trim() !== ''
      );
      
      setPersonalized(articlesWithImages);
    } catch (e) {}
  };

  const displayArticles = feedMode === 'personalized' && personalized.length > 0
    ? personalized : featured;

  return (
    <>
      <Helmet>
        <title>WorldToday — World News, Breaking News, Latest Updates</title>
        <meta name="description" content="WorldToday brings you breaking news and in-depth coverage from 54 countries." />
        <meta property="og:title" content="WorldToday — World News" />
        <meta property="og:type" content="website" />
        <link rel="alternate" type="application/rss+xml" title="WorldToday RSS" href="/api/rss/breaking" />
      </Helmet>

      {/* Breaking News Ticker */}
      <BreakingNewsTicker />

      <div className="home">
        <div className="container">
          {/* Feed Toggle + Country Banner row */}
          <div className="home__controls">
            {user && (
              <div className="home__feed-toggle">
                <button
                  className={`feed-toggle-btn${feedMode === 'top' ? ' active' : ''}`}
                  onClick={() => setFeedMode('top')}
                >
                  🌍 Top Stories
                </button>
                <button
                  className={`feed-toggle-btn${feedMode === 'personalized' ? ' active' : ''}`}
                  onClick={() => setFeedMode('personalized')}
                >
                  ✨ For You
                </button>
              </div>
            )}
            
            {/* Debug Toggle */}
            <div className="home__debug-toggle">
              <button
                className={`debug-toggle-btn${debugMode ? ' active' : ''}`}
                onClick={() => setDebugMode(!debugMode)}
                title="Toggle category debug info"
              >
                🔍 Debug
              </button>
            </div>
            
            {selectedCountry && (
              <div className="home__country-banner">
                <span>
                  {getCountryFlag(selectedCountry)} Showing: <strong>{selectedCountry.toUpperCase()}</strong>
                </span>
                <button
                  className="home__country-clear"
                  onClick={() => {
                    setSelectedCountry('');
                    localStorage.setItem('worldtoday_country', '');
                    window.dispatchEvent(new CustomEvent('worldtoday_country_change', { detail: '' }));
                  }}
                >
                  ✕ All
                </button>
              </div>
            )}
          </div>

          {/* Main Layout */}
          <div className="home__layout">
            {/* Main Content */}
            <main className="home__main" id="main-content">
              {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : (
                <>
                  {/* Hero Magazine Grid */}
                  {displayArticles.length > 0 && (
                    <section className="home__section home__section--hero" aria-label="Featured stories">
                      {debugMode && (
                        <div className="debug-info">
                          <h4>🔍 Top 5 Articles Debug Info:</h4>
                          <div className="debug-categories">
                            {displayArticles.slice(0, 5).map((article, index) => (
                              <div key={article._id} className="debug-category-item">
                                <strong>#{index + 1}:</strong> {article._categorySource || article.category || 'Unknown'} - "{article.title?.substring(0, 50)}..."
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <ArticleGrid articles={displayArticles} layout="magazine" />
                    </section>
                  )}

                  {/* Category Sections */}
                  {categoryLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner" />
                      <p>Loading category news...</p>
                    </div>
                  ) : (
                    CATEGORIES.map(({ id, label, icon, color }) => {
                      const articles = categoryNews[id];
                      if (!articles || articles.length === 0) {
                        return (
                          <section key={id} className="home__section" aria-label={`${label} news`}>
                            <div className="home__section-header" style={{ '--cat-color': color }}>
                              <div className="home__section-title">
                                <span className="home__section-icon">{icon}</span>
                                <h2>{label}</h2>
                              </div>
                              <Link to={`/category/${id}`} className="home__section-more">
                                More →
                              </Link>
                            </div>
                            <div className="home__category-grid">
                              <div className="no-articles">
                                <p>No {label.toLowerCase()} articles available at the moment.</p>
                                <Link to={`/category/${id}`} className="btn btn-primary btn-sm">
                                  Browse {label} →
                                </Link>
                              </div>
                            </div>
                          </section>
                        );
                      }
                      
                      return (
                        <section
                          key={id}
                          className="home__section"
                          aria-label={`${label} news`}
                        >
                          <div
                            className="home__section-header"
                            style={{ '--cat-color': color }}
                          >
                            <div className="home__section-title">
                              <span className="home__section-icon">{icon}</span>
                              <h2>{label}</h2>
                            </div>
                            <Link to={`/category/${id}`} className="home__section-more">
                              More →
                            </Link>
                          </div>
                          <div className="home__category-grid">
                            {/* All articles equal size - no featured/rest distinction */}
                            {articles.map(article => (
                              <ArticleCard key={article._id} article={article} size="medium" />
                            ))}
                          </div>
                        </section>
                      );
                    })
                  )}
                </>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="home__sidebar">
              <Sidebar />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

function getCountryFlag(code) {
  const flags = {
    in:'🇮🇳', us:'🇺🇸', gb:'🇬🇧', au:'🇦🇺', ca:'🇨🇦',
    de:'🇩🇪', fr:'🇫🇷', jp:'🇯🇵', cn:'🇨🇳', br:'🇧🇷',
    ru:'🇷🇺', za:'🇿🇦', ng:'🇳🇬', mx:'🇲🇽', ae:'🇦🇪',
    sg:'🇸🇬', pk:'🇵🇰', bd:'🇧🇩', eg:'🇪🇬', ar:'🇦🇷',
    it:'🇮🇹', es:'🇪🇸', kr:'🇰🇷', id:'🇮🇩', tr:'🇹🇷',
    sa:'🇸🇦', nl:'🇳🇱', se:'🇸🇪', no:'🇳🇴', pl:'🇵🇱',
  };
  return flags[code] || '🌍';
}
