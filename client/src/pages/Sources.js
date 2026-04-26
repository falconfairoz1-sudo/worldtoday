import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import '../styles/Sources.css';

const SOURCE_GROUPS = [
  {
    group: '🇮🇳 India',
    sources: [
      { name: 'Times of India',   url: 'https://timesofindia.indiatimes.com', logo: 'https://timesofindia.indiatimes.com/favicon.ico',   category: 'general',   country: 'in' },
      { name: 'The Hindu',        url: 'https://www.thehindu.com',            logo: 'https://www.thehindu.com/favicon.ico',              category: 'general',   country: 'in' },
      { name: 'NDTV',             url: 'https://www.ndtv.com',                logo: 'https://www.ndtv.com/favicon.ico',                  category: 'general',   country: 'in' },
      { name: 'Indian Express',   url: 'https://indianexpress.com',           logo: 'https://indianexpress.com/favicon.ico',             category: 'politics',  country: 'in' },
      { name: 'Hindustan Times',  url: 'https://www.hindustantimes.com',      logo: 'https://www.hindustantimes.com/favicon.ico',        category: 'general',   country: 'in' },
      { name: 'Economic Times',   url: 'https://economictimes.indiatimes.com',logo: 'https://economictimes.indiatimes.com/favicon.ico',  category: 'business',  country: 'in' },
      { name: 'Livemint',         url: 'https://www.livemint.com',            logo: 'https://www.livemint.com/favicon.ico',              category: 'business',  country: 'in' },
      { name: 'Deccan Herald',    url: 'https://www.deccanherald.com',        logo: 'https://www.deccanherald.com/favicon.ico',          category: 'general',   country: 'in' },
    ]
  },
  {
    group: '🌍 International',
    sources: [
      { name: 'BBC News',         url: 'https://www.bbc.com/news',            logo: 'https://www.bbc.com/favicon.ico',                   category: 'general',   country: 'gb' },
      { name: 'Reuters',          url: 'https://www.reuters.com',             logo: 'https://www.reuters.com/favicon.ico',               category: 'general',   country: 'gb' },
      { name: 'Al Jazeera',       url: 'https://www.aljazeera.com',           logo: 'https://www.aljazeera.com/favicon.ico',             category: 'general',   country: 'ae' },
      { name: 'The Guardian',     url: 'https://www.theguardian.com',         logo: 'https://www.theguardian.com/favicon.ico',           category: 'general',   country: 'gb' },
      { name: 'France24',         url: 'https://www.france24.com',            logo: 'https://www.france24.com/favicon.ico',              category: 'general',   country: 'fr' },
      { name: 'DW',               url: 'https://www.dw.com',                  logo: 'https://www.dw.com/favicon.ico',                    category: 'general',   country: 'de' },
      { name: 'Sky News',         url: 'https://news.sky.com',                logo: 'https://news.sky.com/favicon.ico',                  category: 'general',   country: 'gb' },
    ]
  },
  {
    group: '🇺🇸 USA',
    sources: [
      { name: 'New York Times',   url: 'https://www.nytimes.com',             logo: 'https://www.nytimes.com/favicon.ico',               category: 'general',   country: 'us' },
      { name: 'Washington Post',  url: 'https://www.washingtonpost.com',      logo: 'https://www.washingtonpost.com/favicon.ico',        category: 'politics',  country: 'us' },
      { name: 'NPR',              url: 'https://www.npr.org',                 logo: 'https://www.npr.org/favicon.ico',                   category: 'general',   country: 'us' },
      { name: 'ABC News',         url: 'https://abcnews.go.com',              logo: 'https://abcnews.go.com/favicon.ico',                category: 'general',   country: 'us' },
      { name: 'Fox News',         url: 'https://www.foxnews.com',             logo: 'https://www.foxnews.com/favicon.ico',               category: 'general',   country: 'us' },
    ]
  },
  {
    group: '💼 Business & Finance',
    sources: [
      { name: 'Bloomberg',        url: 'https://www.bloomberg.com',           logo: 'https://www.bloomberg.com/favicon.ico',             category: 'business',  country: 'us' },
      { name: 'Financial Times',  url: 'https://www.ft.com',                  logo: 'https://www.ft.com/favicon.ico',                    category: 'business',  country: 'gb' },
      { name: 'CNBC',             url: 'https://www.cnbc.com',                logo: 'https://www.cnbc.com/favicon.ico',                  category: 'business',  country: 'us' },
      { name: 'Business Standard',url: 'https://www.business-standard.com',  logo: 'https://www.business-standard.com/favicon.ico',     category: 'business',  country: 'in' },
    ]
  },
  {
    group: '💻 Technology',
    sources: [
      { name: 'TechCrunch',       url: 'https://techcrunch.com',              logo: 'https://techcrunch.com/favicon.ico',                category: 'technology',country: 'us' },
      { name: 'The Verge',        url: 'https://www.theverge.com',            logo: 'https://www.theverge.com/favicon.ico',              category: 'technology',country: 'us' },
      { name: 'Wired',            url: 'https://www.wired.com',               logo: 'https://www.wired.com/favicon.ico',                 category: 'technology',country: 'us' },
      { name: 'Ars Technica',     url: 'https://arstechnica.com',             logo: 'https://arstechnica.com/favicon.ico',               category: 'technology',country: 'us' },
    ]
  },
  {
    group: '🇵🇰 Pakistan / 🇧🇩 Bangladesh',
    sources: [
      { name: 'Dawn',             url: 'https://www.dawn.com',                logo: 'https://www.dawn.com/favicon.ico',                  category: 'general',   country: 'pk' },
      { name: 'Geo News',         url: 'https://www.geo.tv',                  logo: 'https://www.geo.tv/favicon.ico',                    category: 'general',   country: 'pk' },
      { name: 'Daily Star',       url: 'https://www.thedailystar.net',        logo: 'https://www.thedailystar.net/favicon.ico',          category: 'general',   country: 'bd' },
    ]
  },
];

export default function Sources() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeSource, setActiveSource] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentGroup = SOURCE_GROUPS[activeGroup];

  useEffect(() => {
    if (activeSource) {
      fetchSourceNews(activeSource);
    }
  }, [activeSource]);

  const fetchSourceNews = async (source) => {
    setLoading(true);
    setArticles([]);
    try {
      const res = await api.get('/news', {
        params: { country: source.country, category: source.category, limit: 12 }
      });
      const all = res.data?.articles || res.data || [];
      // Filter to show articles from this source if possible
      const filtered = all.filter(a =>
        a.source?.name?.toLowerCase().includes(source.name.toLowerCase().split(' ')[0]) ||
        a.source?.url?.includes(new URL(source.url).hostname)
      );
      setArticles(filtered.length >= 3 ? filtered : all.slice(0, 12));
    } catch (e) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>News Sources — WorldToday</title>
        <meta name="description" content="Browse all news sources integrated in WorldToday — BBC, Reuters, NDTV, The Hindu, Al Jazeera, Bloomberg and 30+ more." />
      </Helmet>

      <div className="sources-page">
        {/* Hero */}
        <div className="sources-hero">
          <div className="container">
            <h1 className="sources-hero__title">📰 News Sources</h1>
            <p className="sources-hero__subtitle">
              WorldToday aggregates news from <strong>30+ trusted sources</strong> across India and the world.
              Click any source to browse its latest articles.
            </p>
          </div>
        </div>

        <div className="container sources-body">
          <div className="sources-layout">
            {/* Groups sidebar */}
            <nav className="sources-groups" aria-label="Source groups">
              {SOURCE_GROUPS.map((g, i) => (
                <button
                  key={i}
                  className={`sources-groups__item${activeGroup === i ? ' active' : ''}`}
                  onClick={() => { setActiveGroup(i); setActiveSource(null); setArticles([]); }}
                >
                  {g.group}
                  <span className="sources-groups__count">{g.sources.length}</span>
                </button>
              ))}
            </nav>

            {/* Main content */}
            <div className="sources-main">
              {/* Source cards */}
              <div className="sources-grid">
                {currentGroup.sources.map((source, i) => (
                  <SourceCard
                    key={i}
                    source={source}
                    active={activeSource?.name === source.name}
                    onClick={() => setActiveSource(activeSource?.name === source.name ? null : source)}
                  />
                ))}
              </div>

              {/* Articles from selected source */}
              {activeSource && (
                <div className="sources-articles">
                  <div className="sources-articles__header">
                    <SourceLogo src={activeSource.logo} name={activeSource.name} size={28} />
                    <h2 className="sources-articles__title">Latest from {activeSource.name}</h2>
                    <a href={activeSource.url} target="_blank" rel="noreferrer" className="sources-articles__visit">
                      Visit Website ↗
                    </a>
                  </div>

                  {loading ? (
                    <div className="loading-spinner"><div className="spinner" /></div>
                  ) : articles.length === 0 ? (
                    <div className="sources-articles__empty">
                      <p>No articles found from this source yet.</p>
                      <p className="text-muted">News is aggregated every 30 minutes. Check back soon.</p>
                    </div>
                  ) : (
                    <div className="sources-articles__list">
                      {articles.map((article, i) => (
                        <ArticleRow key={i} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!activeSource && (
                <div className="sources-prompt">
                  <span className="sources-prompt__icon">👆</span>
                  <p>Click on any source above to see its latest articles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SourceCard({ source, active, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      className={`source-card${active ? ' active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="source-card__logo">
        {!imgError ? (
          <img src={source.logo} alt="" onError={() => setImgError(true)} />
        ) : (
          <span>📰</span>
        )}
      </div>
      <div className="source-card__info">
        <span className="source-card__name">{source.name}</span>
        <span className="source-card__category">{source.category}</span>
      </div>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="source-card__ext"
        onClick={e => e.stopPropagation()}
        title="Open website"
      >
        ↗
      </a>
    </button>
  );
}

function SourceLogo({ src, name, size = 20 }) {
  const [err, setErr] = useState(false);
  if (err) return <span style={{ fontSize: '1.2rem' }}>📰</span>;
  return <img src={src} alt="" width={size} height={size} style={{ borderRadius: 4, objectFit: 'contain' }} onError={() => setErr(true)} />;
}

function ArticleRow({ article }) {
  const timeAgo = (d) => {
    if (!d) return '';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <Link to={`/article/${article._id}`} className="sources-article-row">
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt=""
          className="sources-article-row__img"
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="sources-article-row__content">
        <span className="sources-article-row__category">{article.category}</span>
        <p className="sources-article-row__title">{article.title}</p>
        <span className="sources-article-row__time">{timeAgo(article.publishedAt)}</span>
      </div>
    </Link>
  );
}
