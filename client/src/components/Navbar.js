import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../utils/api';
import '../styles/Navbar.css';

const MAIN_CATEGORIES = [
  { label: 'Politics', path: '/category/politics' },
  { label: 'Business', path: '/category/business' },
  { label: 'Technology', path: '/category/technology' },
  { label: 'Sports', path: '/category/sports' },
  { label: 'Entertainment', path: '/category/entertainment' },
  { label: 'Health', path: '/category/health' },
  { label: 'Science', path: '/category/science' },
  { label: 'World', path: '/category/general' },
];

const MORE_ITEMS = [
  { label: 'Sources', path: '/sources' },
  { label: 'Opinion', path: '/section/opinion' },
  { label: 'Fact Check', path: '/section/factcheck' },
  { label: 'Investigative', path: '/section/investigative' },
  { label: 'Forum', path: '/forum' },
  { label: 'Premium', path: '/premium' },
];

const COUNTRIES = [
  { code: '', name: '🌍 All Countries' },
  { code: 'us', name: '🇺🇸 United States' },
  { code: 'in', name: '🇮🇳 India' },
  { code: 'gb', name: '🇬🇧 United Kingdom' },
  { code: 'au', name: '🇦🇺 Australia' },
  { code: 'ca', name: '🇨🇦 Canada' },
  { code: 'de', name: '🇩🇪 Germany' },
  { code: 'fr', name: '🇫🇷 France' },
  { code: 'jp', name: '🇯🇵 Japan' },
  { code: 'cn', name: '🇨🇳 China' },
  { code: 'br', name: '🇧🇷 Brazil' },
  { code: 'ru', name: '🇷🇺 Russia' },
  { code: 'za', name: '🇿🇦 South Africa' },
  { code: 'ng', name: '🇳🇬 Nigeria' },
  { code: 'mx', name: '🇲🇽 Mexico' },
  { code: 'ae', name: '🇦🇪 UAE' },
  { code: 'sg', name: '🇸🇬 Singapore' },
  { code: 'pk', name: '🇵🇰 Pakistan' },
  { code: 'bd', name: '🇧🇩 Bangladesh' },
  { code: 'eg', name: '🇪🇬 Egypt' },
  { code: 'ar', name: '🇦🇷 Argentina' },
  { code: 'it', name: '🇮🇹 Italy' },
  { code: 'es', name: '🇪🇸 Spain' },
  { code: 'kr', name: '🇰🇷 South Korea' },
  { code: 'id', name: '🇮🇩 Indonesia' },
  { code: 'tr', name: '🇹🇷 Turkey' },
  { code: 'sa', name: '🇸🇦 Saudi Arabia' },
  { code: 'nl', name: '🇳🇱 Netherlands' },
  { code: 'se', name: '🇸🇪 Sweden' },
  { code: 'no', name: '🇳🇴 Norway' },
  { code: 'pl', name: '🇵🇱 Poland' },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode, fontSize, setFontSize } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    localStorage.getItem('worldtoday_country') || ''
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchDebounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const moreRef = useRef(null);

  const navbarRef = useRef(null);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      api.get('/notifications').then(res => {
        const count = (res.data || []).filter(n => !n.isRead).length;
        setUnreadCount(count);
      }).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamically set --navbar-height so main-content padding is always correct
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) {
        const h = navbarRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--navbar-height', `${Math.ceil(h)}px`);
      }
    };
    // Run immediately and after a short delay to catch font/image load
    updateHeight();
    const t1 = setTimeout(updateHeight, 100);
    const t2 = setTimeout(updateHeight, 500);
    window.addEventListener('resize', updateHeight);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
    setMoreOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setSearchSuggestions([]);
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    if (val.trim().length < 2) { setSearchSuggestions([]); return; }
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/news/search', { params: { q: val.trim(), limit: 5 } });
        setSearchSuggestions((res.data?.articles || []).slice(0, 5));
      } catch { setSearchSuggestions([]); }
    }, 300);
  };

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setSelectedCountry(code);
    localStorage.setItem('worldtoday_country', code);
    // Dispatch custom event so Home page reacts
    window.dispatchEvent(new CustomEvent('worldtoday_country_change', { detail: code }));
  };

  return (
    <header ref={navbarRef} className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
      {/* Top Bar */}
      <div className="navbar__topbar">
        <div className="container navbar__topbar-inner">
          <div className="navbar__topbar-left">
            <span className="navbar__date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="navbar__topbar-right">
            <button
              className="navbar__icon-btn"
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="navbar__font-controls" aria-label="Font size controls">
              <button className={`navbar__font-btn${fontSize === 'small' ? ' active' : ''}`} onClick={() => setFontSize('small')} aria-label="Small font">A</button>
              <button className={`navbar__font-btn navbar__font-btn--md${fontSize === 'medium' ? ' active' : ''}`} onClick={() => setFontSize('medium')} aria-label="Medium font">A</button>
              <button className={`navbar__font-btn navbar__font-btn--lg${fontSize === 'large' ? ' active' : ''}`} onClick={() => setFontSize('large')} aria-label="Large font">A</button>
            </div>
            {!user ? (
              <div className="navbar__auth-links">
                <Link to="/login" className="navbar__auth-link">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Subscribe</Link>
              </div>
            ) : (
              <div className="navbar__user-area">
                {/* Notification Bell */}
                <Link to="/notifications" className="navbar__notif-btn" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
                  🔔
                  {unreadCount > 0 && (
                    <span className="navbar__notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>
                <div className="navbar__user-menu" ref={userMenuRef}>
                <button
                  className="navbar__user-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="navbar__avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="navbar__username">{user.name?.split(' ')[0]}</span>
                  <span className="navbar__chevron">▾</span>
                </button>
                {userMenuOpen && (
                  <div className="navbar__dropdown" role="menu">
                    <Link to="/profile" className="navbar__dropdown-item" role="menuitem">👤 Profile</Link>
                    <Link to="/saved" className="navbar__dropdown-item" role="menuitem">🔖 Saved Articles</Link>
                    <Link to="/notifications" className="navbar__dropdown-item" role="menuitem">🔔 Notifications</Link>
                    {user.isPremium && <span className="navbar__dropdown-item navbar__premium-badge">⭐ Premium Member</span>}
                    {!user.isPremium && <Link to="/premium" className="navbar__dropdown-item navbar__upgrade-link" role="menuitem">⭐ Upgrade to Premium</Link>}
                    {(user.role === 'admin' || user.role === 'editor') && (
                      <Link to="/admin" className="navbar__dropdown-item" role="menuitem">⚙️ Admin Panel</Link>
                    )}
                    <hr className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__logout-btn" onClick={logout} role="menuitem">🚪 Logout</button>
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar__main">
        <div className="container navbar__main-inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" aria-label="WorldToday - Home">
            <img src="/logo.svg" alt="WorldToday Logo" className="navbar__logo-icon" />
            <span className="navbar__logo-text">
              <span className="navbar__logo-world">World</span>
              <span className="navbar__logo-day">Today</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar__nav" aria-label="Main navigation">
            {MAIN_CATEGORIES.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar__nav-link${location.pathname === item.path ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* More Dropdown */}
            <div className="navbar__more-dropdown" ref={moreRef}>
              <button
                className={`navbar__nav-link navbar__more-btn${moreOpen ? ' active' : ''}`}
                onClick={() => setMoreOpen(!moreOpen)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More ▾
              </button>
              {moreOpen && (
                <div className="navbar__more-menu" role="menu">
                  {MORE_ITEMS.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="navbar__more-item"
                      role="menuitem"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Country Selector + Search + Hamburger */}
          <div className="navbar__actions">
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="navbar__country-select"
              aria-label="Select country for news"
              title="Filter news by country"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <button
              className="navbar__icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              🔍
            </button>
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={menuOpen}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="navbar__search-bar" ref={searchRef}>
            <div className="container">
              <form onSubmit={handleSearch} className="navbar__search-form" role="search">
                <div className="navbar__search-wrap">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search news, topics, countries..."
                    className="navbar__search-input"
                    autoFocus
                    aria-label="Search articles"
                    autoComplete="off"
                  />
                  {searchSuggestions.length > 0 && (
                    <div className="navbar__suggestions">
                      {searchSuggestions.map(a => (
                        <button
                          key={a._id}
                          type="button"
                          className="navbar__suggestion-item"
                          onClick={() => {
                            navigate(`/article/${a._id}`);
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSearchSuggestions([]);
                          }}
                        >
                          <span className="navbar__suggestion-cat">{a.category}</span>
                          <span className="navbar__suggestion-title">{a.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="btn btn-primary" aria-label="Submit search">Search</button>
                <button type="button" className="navbar__icon-btn" onClick={() => { setSearchOpen(false); setSearchSuggestions([]); }} aria-label="Close search">✕</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu" role="navigation" aria-label="Mobile navigation">
          <div className="container">
            {MAIN_CATEGORIES.map(item => (
              <Link key={item.path} to={item.path} className="navbar__mobile-link">{item.label}</Link>
            ))}
            <hr className="navbar__mobile-divider" />
            {MORE_ITEMS.map(item => (
              <Link key={item.path} to={item.path} className="navbar__mobile-link">{item.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
