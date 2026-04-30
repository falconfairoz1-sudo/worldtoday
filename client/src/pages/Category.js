import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ArticleCard from '../components/article/ArticleCard';
import api from '../utils/api';
import '../styles/Category.css';

const SECTION_INFO = {
  opinion: { title: 'Opinion & Editorial', desc: 'Perspectives and analysis from our writers', icon: '✍️' },
  factcheck: { title: 'Fact Check', desc: 'Verified facts and debunked misinformation', icon: '✅' },
  investigative: { title: 'Investigative', desc: 'In-depth investigative journalism', icon: '🔍' },
  special: { title: 'Special Reports', desc: 'Curated special coverage', icon: '📋' },
  podcast: { title: 'Podcasts', desc: 'Audio journalism and interviews', icon: '🎙️' },
  webstory: { title: 'Web Stories', desc: 'Short-form visual stories', icon: '📱' },
};

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem('worldtoday_country') || ''
  );

  const isSection = Object.keys(SECTION_INFO).includes(category);
  const sectionInfo = SECTION_INFO[category];

  // Listen for country changes from Navbar
  useEffect(() => {
    const handler = (e) => {
      setSelectedCountry(e.detail);
      setArticles([]);
      setPage(1);
    };
    window.addEventListener('worldtoday_country_change', handler);
    return () => window.removeEventListener('worldtoday_country_change', handler);
  }, []);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    fetchArticles(1);
  }, [category, selectedCountry, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchArticles = async (p) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      if (isSection) {
        params.section = category;
      } else {
        params.category = category;
      }
      if (selectedCountry) params.country = selectedCountry;

      const res = await api.get('/news', { params });
      const newArticles = res.data?.articles || res.data || [];
      setArticles(prev => p === 1 ? newArticles : [...prev, ...newArticles]);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error('Category fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage);
  };

  const title = isSection
    ? sectionInfo?.title
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <>
      <Helmet>
        <title>{title} - WorldToday</title>
        <meta name="description" content={`Latest ${title} news from WorldToday`} />
        <link rel="alternate" type="application/rss+xml" title={`WorldToday ${title} RSS`} href={`/api/rss/category/${category}`} />
      </Helmet>

      <div className="category-page">
        <div className="container">
          {/* Header */}
          <div className="category-header">
            {isSection && <span className="category-header__icon">{sectionInfo?.icon}</span>}
            <div>
              <h1 className="category-header__title">{title}</h1>
              {isSection && <p className="category-header__desc">{sectionInfo?.desc}</p>}
              {selectedCountry && (
                <p className="category-header__country">
                  Showing news for: <strong>{selectedCountry.toUpperCase()}</strong>
                  <button
                    className="category-header__clear-country"
                    onClick={() => {
                      setSelectedCountry('');
                      localStorage.setItem('worldtoday_country', '');
                      window.dispatchEvent(new CustomEvent('worldtoday_country_change', { detail: '' }));
                    }}
                  >
                    ✕ Clear
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="category-filters">
            <button className={`filter-pill${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-pill${filter === 'quick' ? ' active' : ''}`} onClick={() => setFilter('quick')}>⚡ Quick Reads</button>
            <button className={`filter-pill${filter === 'long' ? ' active' : ''}`} onClick={() => setFilter('long')}>📖 Long Form</button>
          </div>

          {/* Articles */}
          {loading && articles.length === 0 ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : articles.length === 0 ? (
            <div className="category-empty">
              <p>No articles found in this category yet.</p>
            </div>
          ) : (
            <>
              <div className="category-grid">
                {articles.map(article => (
                  <ArticleCard key={article._id} article={article} size="medium" />
                ))}
              </div>
              {page < totalPages && (
                <div className="category-load-more">
                  <button
                    className="btn btn-outline btn-lg"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
