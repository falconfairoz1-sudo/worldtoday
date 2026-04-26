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
    fetchFeatured();
    fetchCategoryNews();
    if (user) fetchPersonalized();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, user]);

  const fetchFeatured = async () => {
    try {
      const TOP_CATEGORIES = ['politics', 'business', 'technology', 'sports', 'entertainment'];
      const REST_CATEGORIES = ['health', 'science'];

      const topPromises = TOP_CATEGORIES.map(id =>
        api.get('/news', {
          params: {
            category: id,
            limit: 5,
            ...(selectedCountry && { country: selectedCountry })
          }
        }).catch(() => ({ data: { articles: [] } }))
      );

      const restPromises = REST_CATEGORIES.map(id =>
        api.get('/news', {
          params: {
            category: id,
            limit: 10,
            ...(selectedCountry && { country: selectedCountry })
          }
        }).catch(() => ({ data: { articles: [] } }))
      );

      const [topResults, restResults] = await Promise.all([
        Promise.all(topPromises),
        Promise.all(restPromises),
      ]);

      const topArticles = topResults.map(res => {
        const articles = res.data?.articles || res.data || [];
        return (
          articles.find(a => a.urlToImage && a.urlToImage.trim() !== '') ||
          articles[0] ||
          null
        );
      }).filter(Boolean);

      const usedUrls = new Set(topArticles.map(a => a.url));

      const restArticles = [...topResults, ...restResults]
        .flatMap(res => res.data?.articles || res.data || [])
        .filter(a => !usedUrls.has(a.url))
        .filter((a, i, self) => self.findIndex(x => x.url === a.url) === i)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      setFeatured([...topArticles, ...restArticles].slice(0, 30));
    } catch (err) {
      console.error('Failed to fetch featured news:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryNews = async () => {
    const results = {};
    await Promise.allSettled(
      CATEGORIES.map(async ({ id }) => {
        try {
          const params = { category: id, limit: 16 };
          if (selectedCountry) params.country = selectedCountry;
          const res = await api.get('/news', { params });
          const articles = res.data?.articles || res.data || [];
          
          const articlesWithImages = articles.filter(article => 
            article.urlToImage && article.urlToImage.trim() !== ''
          );
          const articlesWithoutImages = articles.filter(article => 
            !article.urlToImage || article.urlToImage.trim() === ''
          );
          
          const combined = [...articlesWithImages, ...articlesWithoutImages];
          results[id] = combined.slice(0, 6);
        } catch (e) {
          results[id] = [];
        }
      })
    );
    setCategoryNews(results);
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
                      <ArticleGrid articles={displayArticles} layout="magazine" />
                    </section>
                  )}

                  {/* Category Sections */}
                  {CATEGORIES.map(({ id, label, icon, color }) => {
                    const articles = categoryNews[id];
                    if (!articles || articles.length === 0) return null;
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
                  })}
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
