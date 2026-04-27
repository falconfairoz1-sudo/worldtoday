import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WeatherWidget from '../widgets/WeatherWidget';
import StockTicker from '../widgets/StockTicker';
import CurrencyConverter from '../widgets/CurrencyConverter';
import TrendingTopics from '../widgets/TrendingTopics';
import ApiStatusWidget from '../widgets/ApiStatusWidget';
import api from '../../utils/api';
import '../../styles/Sidebar.css';

export default function Sidebar() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    api.get('/news/trending')
      .then(res => setTrending((res.data?.articles || res.data || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <aside className="sidebar" aria-label="Sidebar">
      {/* Trending Section - Single Column */}
      <div className="trending-container">
        {/* Trending Articles */}
        {trending.length > 0 && (
          <div className="widget">
            <div className="widget__header">
              <span className="widget__title">🔥 Trending Articles</span>
            </div>
            <ol className="trending__list">
              {trending.map((article, i) => (
                <li key={article._id} className="trending__item">
                  <span className="trending__num">{i + 1}</span>
                  <Link to={`/article/${article._id}`} className="trending__title">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Trending Topics */}
        <TrendingTopics />
      </div>

      <WeatherWidget />
      <StockTicker />
      <CurrencyConverter />
      <ApiStatusWidget />

      {/* Newsletter CTA */}
      <div className="widget widget--newsletter">
        <div className="widget__header">
          <span className="widget__title">📧 Newsletter</span>
        </div>
        <p className="newsletter__desc">Get the top stories delivered to your inbox daily.</p>
        <Link to="/newsletter" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          Subscribe Free
        </Link>
      </div>
    </aside>
  );
}
