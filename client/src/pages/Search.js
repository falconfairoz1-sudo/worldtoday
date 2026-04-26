import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ArticleCard from '../components/article/ArticleCard';
import api from '../utils/api';
import '../styles/Search.css';

const CATEGORIES = ['all', 'politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];
const FORMATS = ['all', 'text', 'video', 'gallery', 'infographic', 'liveblog', 'podcast'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    format: 'all',
    from: '',
    to: '',
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const doSearch = async (q, f) => {
    if (!q?.trim()) return;
    setLoading(true);
    try {
      const params = { q };
      if (f.category && f.category !== 'all') params.category = f.category;
      if (f.format && f.format !== 'all') params.format = f.format;
      if (f.from) params.from = f.from;
      if (f.to) params.to = f.to;

      const res = await api.get('/news/search', { params });
      setResults(res.data.articles || []);
      setTotal(res.data.total || 0);
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      doSearch(query.trim(), filters);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query.trim()) doSearch(query.trim(), newFilters);
  };

  return (
    <>
      <Helmet>
        <title>{query ? `Search: ${query}` : 'Search'} - WorldToday</title>
      </Helmet>
      <div className="search-page">
        <div className="container">
          <div className="search-header">
            <h1 className="search-title">Search WorldToday</h1>
            <form onSubmit={handleSubmit} className="search-form" role="search">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search news, topics, countries..."
                className="search-input"
                aria-label="Search articles"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>

          {/* Filters */}
          <div className="search-filters" aria-label="Search filters">
            <div className="search-filter-group">
              <label className="search-filter-label">Category</label>
              <div className="search-filter-pills">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`filter-pill${filters.category === cat ? ' active' : ''}`}
                    onClick={() => handleFilterChange('category', cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-filter-group">
              <label className="search-filter-label">Format</label>
              <div className="search-filter-pills">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt}
                    className={`filter-pill${filters.format === fmt ? ' active' : ''}`}
                    onClick={() => handleFilterChange('format', fmt)}
                  >
                    {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-filter-group search-filter-dates">
              <label className="search-filter-label">Date Range</label>
              <input type="date" value={filters.from} onChange={e => handleFilterChange('from', e.target.value)} className="search-date-input" aria-label="From date" />
              <span>to</span>
              <input type="date" value={filters.to} onChange={e => handleFilterChange('to', e.target.value)} className="search-date-input" aria-label="To date" />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : query && results.length === 0 ? (
            <div className="search-no-results">
              <p>No results found for "<strong>{query}</strong>"</p>
              {suggestions.length > 0 && (
                <div className="search-suggestions">
                  <p>Try searching for:</p>
                  {suggestions.map(s => (
                    <button key={s} className="search-suggestion-btn" onClick={() => { setQuery(s); setSearchParams({ q: s }); }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="search-count">{total} results for "<strong>{query}</strong>"</p>
              <div className="search-results">
                {results.map(article => (
                  <ArticleCard key={article._id} article={article} size="medium" />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
