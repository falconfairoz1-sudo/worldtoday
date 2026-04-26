import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import api from '../../utils/api';
import '../../styles/LeftSidebar.css';

const NAV_SECTIONS = [
  {
    title: 'Discover',
    items: [
      { icon: '🏠', label: 'Home',          path: '/' },
      { icon: '🔥', label: 'Trending',      path: '/category/general?sort=trending' },
      { icon: '🔴', label: 'Breaking News', path: '/category/general?breaking=true' },
      { icon: '✨', label: 'For You',       path: '/?feed=personalized', auth: true },
    ],
  },
  {
    title: 'Categories',
    items: [
      { icon: '🏛️', label: 'Politics',      path: '/category/politics' },
      { icon: '💼', label: 'Business',      path: '/category/business' },
      { icon: '💻', label: 'Technology',    path: '/category/technology' },
      { icon: '⚽', label: 'Sports',        path: '/category/sports' },
      { icon: '🎬', label: 'Entertainment', path: '/category/entertainment' },
      { icon: '🏥', label: 'Health',        path: '/category/health' },
      { icon: '🔬', label: 'Science',       path: '/category/science' },
      { icon: '🌍', label: 'World',         path: '/category/general' },
    ],
  },
  {
    title: 'Sections',
    items: [
      { icon: '✍️', label: 'Opinion',       path: '/section/opinion' },
      { icon: '✅', label: 'Fact Check',    path: '/section/factcheck' },
      { icon: '🔍', label: 'Investigative', path: '/section/investigative' },
      { icon: '📱', label: 'Web Stories',   path: '/web-stories' },
      { icon: '🎙️', label: 'Podcasts',      path: '/section/podcast' },
    ],
  },
  {
    title: 'Community',
    items: [
      { icon: '💬', label: 'Forum',         path: '/forum' },
      { icon: '⭐', label: 'Premium',       path: '/premium' },
    ],
  },
  {
    title: 'My Account',
    auth: true,
    items: [
      { icon: '👤', label: 'Profile',       path: '/profile',       auth: true },
      { icon: '🔖', label: 'Saved',         path: '/saved',         auth: true },
      { icon: '📖', label: 'History',       path: '/history',       auth: true },
      { icon: '🔔', label: 'Notifications', path: '/notifications', auth: true },
    ],
  },
];

const COUNTRIES = [
  { code: 'in', flag: '🇮🇳', name: 'India' },
  { code: 'us', flag: '🇺🇸', name: 'USA' },
  { code: 'gb', flag: '🇬🇧', name: 'UK' },
  { code: 'au', flag: '🇦🇺', name: 'Australia' },
  { code: 'ca', flag: '🇨🇦', name: 'Canada' },
  { code: 'de', flag: '🇩🇪', name: 'Germany' },
  { code: 'fr', flag: '🇫🇷', name: 'France' },
  { code: 'jp', flag: '🇯🇵', name: 'Japan' },
  { code: 'br', flag: '🇧🇷', name: 'Brazil' },
  { code: 'ae', flag: '🇦🇪', name: 'UAE' },
  { code: 'sg', flag: '🇸🇬', name: 'Singapore' },
  { code: 'pk', flag: '🇵🇰', name: 'Pakistan' },
  { code: 'ng', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'za', flag: '🇿🇦', name: 'S. Africa' },
  { code: 'ru', flag: '🇷🇺', name: 'Russia' },
  { code: 'cn', flag: '🇨🇳', name: 'China' },
  { code: 'kr', flag: '🇰🇷', name: 'S. Korea' },
  { code: 'mx', flag: '🇲🇽', name: 'Mexico' },
];

export default function LeftSidebar() {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('worldtoday_country') || '');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => setSelectedCountry(e.detail);
    window.addEventListener('worldtoday_country_change', handler);
    return () => window.removeEventListener('worldtoday_country_change', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    api.get('/news/trending')
      .then(res => {
        const articles = res.data?.articles || res.data || [];
        const topics = [...new Set(articles.flatMap(a => a.tags || [a.category]).filter(Boolean))].slice(0, 8);
        setTrendingTopics(topics);
      })
      .catch(() => {});
  }, []);

  const handleCountryClick = (code) => {
    const newCode = selectedCountry === code ? '' : code;
    setSelectedCountry(newCode);
    localStorage.setItem('worldtoday_country', newCode);
    window.dispatchEvent(new CustomEvent('worldtoday_country_change', { detail: newCode }));
  };

  const isActive = (path) => {
    const base = path.split('?')[0];
    return location.pathname === base;
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="leftsidebar__mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className="leftsidebar__overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`leftsidebar${collapsed ? ' leftsidebar--collapsed' : ''}${mobileOpen ? ' leftsidebar--open' : ''}`}
        aria-label="Left navigation sidebar"
      >
        {/* Collapse toggle (desktop) */}
        <button
          className="leftsidebar__collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>

        <div className="leftsidebar__inner">
          {/* Logo (collapsed state) */}
          {collapsed && (
            <Link to="/" className="leftsidebar__logo-mini" aria-label="WorldToday Home">
              <span>W</span>
            </Link>
          )}

          {/* Navigation Sections */}
          {NAV_SECTIONS.map(section => {
            // Hide auth-only sections when not logged in
            if (section.auth && !user) return null;
            const visibleItems = section.items.filter(item => !item.auth || user);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="leftsidebar__section">
                {!collapsed && (
                  <span className="leftsidebar__section-title">{section.title}</span>
                )}
                <ul className="leftsidebar__nav" role="list">
                  {visibleItems.map(item => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`leftsidebar__nav-item${isActive(item.path) ? ' active' : ''}`}
                        title={collapsed ? item.label : undefined}
                        aria-label={item.label}
                      >
                        <span className="leftsidebar__nav-icon">{item.icon}</span>
                        {!collapsed && (
                          <span className="leftsidebar__nav-label">{item.label}</span>
                        )}
                        {!collapsed && item.label === 'Notifications' && user && (
                          <NotificationBadge />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Country Quick-Select */}
          {!collapsed && (
            <div className="leftsidebar__section">
              <span className="leftsidebar__section-title">Countries</span>
              <div className="leftsidebar__countries">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code}
                    className={`leftsidebar__country-btn${selectedCountry === c.code ? ' active' : ''}`}
                    onClick={() => handleCountryClick(c.code)}
                    title={c.name}
                    aria-label={`${selectedCountry === c.code ? 'Deselect' : 'Select'} ${c.name}`}
                    aria-pressed={selectedCountry === c.code}
                  >
                    <span className="leftsidebar__country-flag">{c.flag}</span>
                    <span className="leftsidebar__country-name">{c.name}</span>
                  </button>
                ))}
                {selectedCountry && (
                  <button
                    className="leftsidebar__country-clear"
                    onClick={() => handleCountryClick('')}
                    aria-label="Show all countries"
                  >
                    🌍 All Countries
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Trending Topics */}
          {!collapsed && trendingTopics.length > 0 && (
            <div className="leftsidebar__section">
              <span className="leftsidebar__section-title">Trending Topics</span>
              <div className="leftsidebar__topics">
                {trendingTopics.map((topic, i) => (
                  <Link
                    key={i}
                    to={`/search?q=${encodeURIComponent(topic)}`}
                    className="leftsidebar__topic-tag"
                  >
                    #{topic}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          {!collapsed && (
            <div className="leftsidebar__section leftsidebar__section--bottom">
              <button
                className="leftsidebar__darkmode-btn"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span>{darkMode ? '☀️' : '🌙'}</span>
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          )}

          {/* User quick info */}
          {!collapsed && user && (
            <div className="leftsidebar__user">
              <div className="leftsidebar__user-avatar">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} />
                  : <span>{user.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="leftsidebar__user-info">
                <span className="leftsidebar__user-name">{user.name}</span>
                <span className="leftsidebar__user-role">
                  {user.isPremium ? '⭐ Premium' : user.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function NotificationBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    api.get('/notifications')
      .then(res => {
        const unread = (res.data || []).filter(n => !n.isRead).length;
        setCount(unread);
      })
      .catch(() => {});
  }, []);
  if (!count) return null;
  return <span className="leftsidebar__badge">{count > 9 ? '9+' : count}</span>;
}
