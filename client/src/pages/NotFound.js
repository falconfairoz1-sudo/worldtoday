import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../styles/NotFound.css';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 - Page Not Found | WorldToday</title></Helmet>
      <div className="not-found-page">
        <div className="not-found-content">
          <div className="not-found-logo">
            <span className="not-found-logo-world">World</span>
            <span className="not-found-logo-day">Today</span>
          </div>
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">Page Not Found</h2>
          <p className="not-found-desc">The page you're looking for doesn't exist or has been moved.</p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
            <Link to="/search" className="btn btn-outline btn-lg">Search News</Link>
          </div>
        </div>
      </div>
    </>
  );
}
