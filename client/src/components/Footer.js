import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Footer.css';

const CATEGORIES = ['Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'Science'];
const SECTIONS = ['Opinion', 'Fact Check', 'Investigative', 'Web Stories', 'Podcasts'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await api.post('/newsletter/subscribe', { email, subscriptions: [{ type: 'daily' }] });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      {/* Newsletter Banner */}
      <div className="footer__newsletter">
        <div className="container footer__newsletter-inner">
          <div className="footer__newsletter-text">
            <h3>📧 Stay Informed with WorldToday</h3>
            <p>Get the top stories delivered to your inbox every morning.</p>
          </div>
          {subscribed ? (
            <div className="footer__newsletter-success">✅ Subscribed! Check your email.</div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer__newsletter-form">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="footer__newsletter-input"
                required
                aria-label="Email for newsletter"
              />
              <button type="submit" className="btn btn-primary" disabled={subscribing}>
                {subscribing ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer__main">
        <div className="container footer__main-inner">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src="/logo.svg" alt="WorldToday Logo" className="footer__logo-icon" />
              <span className="footer__logo-text">
                <span className="footer__logo-world">World</span>
                <span className="footer__logo-day">Today</span>
              </span>
            </Link>
            <p className="footer__tagline">Your window to the world. Breaking news, in-depth analysis, and stories that matter — from 54 countries.</p>
            <div className="footer__social">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Twitter">𝕏</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Facebook">f</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Instagram">📷</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="footer__social-link" aria-label="YouTube">▶</a>
            </div>
          </div>

          {/* Categories */}
          <div className="footer__col">
            <h4 className="footer__col-title">Categories</h4>
            <ul className="footer__links">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link to={`/category/${cat.toLowerCase()}`} className="footer__link">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="footer__col">
            <h4 className="footer__col-title">Sections</h4>
            <ul className="footer__links">
              {SECTIONS.map(s => (
                <li key={s}>
                  <Link to={`/section/${s.toLowerCase().replace(' ', '')}`} className="footer__link">{s}</Link>
                </li>
              ))}
              <li><Link to="/forum" className="footer__link">Community Forum</Link></li>
              <li><Link to="/premium" className="footer__link">Premium ⭐</Link></li>
            </ul>
          </div>

          {/* RSS & Company */}
          <div className="footer__col">
            <h4 className="footer__col-title">RSS Feeds</h4>
            <ul className="footer__links">
              <li><a href="/api/rss/breaking" className="footer__link">🔴 Breaking News</a></li>
              <li><a href="/api/rss/category/politics" className="footer__link">Politics</a></li>
              <li><a href="/api/rss/category/technology" className="footer__link">Technology</a></li>
              <li><a href="/api/rss/category/sports" className="footer__link">Sports</a></li>
              <li><a href="/sitemap.xml" className="footer__link">Sitemap</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copyright">
            © {new Date().getFullYear()} WorldToday. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <Link to="/privacy" className="footer__bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer__bottom-link">Terms of Service</Link>
            <Link to="/contact" className="footer__bottom-link">Contact</Link>
            <Link to="/about" className="footer__bottom-link">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
