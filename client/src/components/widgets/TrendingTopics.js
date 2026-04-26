import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/Widgets.css';

export default function TrendingTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      const res = await api.get('/news/trending-topics');
      setTopics(res.data?.topics || []);
    } catch (err) {
      console.error('Failed to fetch trending topics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="widget trending-topics-modern">
        <div className="widget__header">
          <span className="widget__title">📈 Trending Now</span>
        </div>
        <div className="widget__body">
          <div className="loading-spinner-sm"><div className="spinner" /></div>
        </div>
      </div>
    );
  }

  if (topics.length === 0) return null;

  return (
    <div className="widget trending-topics-modern">
      <div className="widget__header">
        <span className="widget__title">📈 Trending Now</span>
      </div>
      <div className="widget__body">
        <div className="trending-topics-grid">
          {topics.slice(0, 8).map((topic, index) => (
            <Link
              key={topic.keyword}
              to={`/search?q=${encodeURIComponent(topic.keyword)}`}
              className={`trending-chip trending-chip--${topic.trend}`}
              title={`${topic.count} mentions`}
            >
              <span className="trending-chip__text">{topic.keyword}</span>
              <span className="trending-chip__count">{topic.count}</span>
              {topic.trend === 'hot' && <span className="trending-chip__icon">🔥</span>}
              {topic.trend === 'up' && <span className="trending-chip__icon">↗️</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
