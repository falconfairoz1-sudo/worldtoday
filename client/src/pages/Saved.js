import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ArticleCard from '../components/article/ArticleCard';
import api from '../utils/api';
import '../styles/Saved.css';

export default function Saved() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/user/bookmarks');
      setArticles(res.data || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Saved Articles - WorldToday</title>
      </Helmet>
      <div className="saved-page">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">🔖 Saved Articles</h1>
            <span className="text-muted">{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : articles.length === 0 ? (
            <div className="saved-empty">
              <span className="saved-empty__icon">🔖</span>
              <h3>No saved articles yet</h3>
              <p>Bookmark articles to read them later</p>
              <Link to="/" className="btn btn-primary">Browse News</Link>
            </div>
          ) : (
            <div className="saved-grid">
              {articles.map(article => (
                <ArticleCard key={article._id} article={article} size="medium" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
