import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import api from '../utils/api';
import '../styles/History.css';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/history')
      .then(res => setHistory(res.data || []))
      .catch(() => toast.error('Failed to load reading history'))
      .finally(() => setLoading(false));
  }, []);

  const clearHistory = async () => {
    if (!window.confirm('Clear your entire reading history?')) return;
    try {
      await api.delete('/user/history');
      setHistory([]);
      toast.success('History cleared');
    } catch {
      toast.error('Failed to clear history');
    }
  };

  return (
    <>
      <Helmet><title>Reading History - WorldToday</title></Helmet>
      <div className="history-page">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">📖 Reading History</h1>
            {history.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={clearHistory}>
                Clear All
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <span>📖</span>
              <h3>No reading history yet</h3>
              <p>Articles you read will appear here</p>
              <Link to="/" className="btn btn-primary">Browse News</Link>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, i) => {
                const article = item.article;
                if (!article || !article._id) return null;
                return (
                  <Link key={i} to={`/article/${article._id}`} className="history-item">
                    {article.urlToImage && (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="history-item__img"
                        loading="lazy"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div className="history-item__content">
                      <span className="history-item__category">{article.category}</span>
                      <h3 className="history-item__title">{article.title}</h3>
                      <span className="history-item__time">
                        Read {formatTimeAgo(item.readAt)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
