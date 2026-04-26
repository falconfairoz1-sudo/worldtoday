import React, { useState } from 'react';
import '../../styles/SourcesSidebar.css';

const SOURCES = [
  // India
  { name: 'Times of India',  url: 'https://timesofindia.indiatimes.com', logo: 'https://timesofindia.indiatimes.com/favicon.ico',  country: '🇮🇳', category: 'India' },
  { name: 'The Hindu',       url: 'https://www.thehindu.com',            logo: 'https://www.thehindu.com/favicon.ico',             country: '🇮🇳', category: 'India' },
  { name: 'NDTV',            url: 'https://www.ndtv.com',                logo: 'https://www.ndtv.com/favicon.ico',                 country: '🇮🇳', category: 'India' },
  { name: 'Indian Express',  url: 'https://indianexpress.com',           logo: 'https://indianexpress.com/favicon.ico',            country: '🇮🇳', category: 'India' },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com',      logo: 'https://www.hindustantimes.com/favicon.ico',       country: '🇮🇳', category: 'India' },
  { name: 'Economic Times',  url: 'https://economictimes.indiatimes.com',logo: 'https://economictimes.indiatimes.com/favicon.ico', country: '🇮🇳', category: 'India' },
  { name: 'Livemint',        url: 'https://www.livemint.com',            logo: 'https://www.livemint.com/favicon.ico',             country: '🇮🇳', category: 'India' },
  { name: 'Deccan Herald',   url: 'https://www.deccanherald.com',        logo: 'https://www.deccanherald.com/favicon.ico',         country: '🇮🇳', category: 'India' },
  // International
  { name: 'BBC News',        url: 'https://www.bbc.com/news',            logo: 'https://www.bbc.com/favicon.ico',                  country: '🇬🇧', category: 'International' },
  { name: 'Reuters',         url: 'https://www.reuters.com',             logo: 'https://www.reuters.com/favicon.ico',              country: '🌍', category: 'International' },
  { name: 'Al Jazeera',      url: 'https://www.aljazeera.com',           logo: 'https://www.aljazeera.com/favicon.ico',            country: '🌍', category: 'International' },
  { name: 'The Guardian',    url: 'https://www.theguardian.com',         logo: 'https://www.theguardian.com/favicon.ico',          country: '🇬🇧', category: 'International' },
  { name: 'France24',        url: 'https://www.france24.com',            logo: 'https://www.france24.com/favicon.ico',             country: '🇫🇷', category: 'International' },
  { name: 'DW',              url: 'https://www.dw.com',                  logo: 'https://www.dw.com/favicon.ico',                   country: '🇩🇪', category: 'International' },
  { name: 'Sky News',        url: 'https://news.sky.com',                logo: 'https://news.sky.com/favicon.ico',                 country: '🇬🇧', category: 'International' },
  // USA
  { name: 'New York Times',  url: 'https://www.nytimes.com',             logo: 'https://www.nytimes.com/favicon.ico',              country: '🇺🇸', category: 'USA' },
  { name: 'Washington Post', url: 'https://www.washingtonpost.com',      logo: 'https://www.washingtonpost.com/favicon.ico',       country: '🇺🇸', category: 'USA' },
  { name: 'NPR',             url: 'https://www.npr.org',                 logo: 'https://www.npr.org/favicon.ico',                  country: '🇺🇸', category: 'USA' },
  { name: 'ABC News',        url: 'https://abcnews.go.com',              logo: 'https://abcnews.go.com/favicon.ico',               country: '🇺🇸', category: 'USA' },
  { name: 'Fox News',        url: 'https://www.foxnews.com',             logo: 'https://www.foxnews.com/favicon.ico',              country: '🇺🇸', category: 'USA' },
  // Business & Tech
  { name: 'Bloomberg',       url: 'https://www.bloomberg.com',           logo: 'https://www.bloomberg.com/favicon.ico',            country: '🇺🇸', category: 'Business & Tech' },
  { name: 'Financial Times', url: 'https://www.ft.com',                  logo: 'https://www.ft.com/favicon.ico',                   country: '🇬🇧', category: 'Business & Tech' },
  { name: 'CNBC',            url: 'https://www.cnbc.com',                logo: 'https://www.cnbc.com/favicon.ico',                 country: '🇺🇸', category: 'Business & Tech' },
  { name: 'TechCrunch',      url: 'https://techcrunch.com',              logo: 'https://techcrunch.com/favicon.ico',               country: '🇺🇸', category: 'Business & Tech' },
  { name: 'The Verge',       url: 'https://www.theverge.com',            logo: 'https://www.theverge.com/favicon.ico',             country: '🇺🇸', category: 'Business & Tech' },
  { name: 'Wired',           url: 'https://www.wired.com',               logo: 'https://www.wired.com/favicon.ico',                country: '🇺🇸', category: 'Business & Tech' },
  // Pakistan / Bangladesh
  { name: 'Dawn',            url: 'https://www.dawn.com',                logo: 'https://www.dawn.com/favicon.ico',                 country: '🇵🇰', category: 'South Asia' },
  { name: 'Geo News',        url: 'https://www.geo.tv',                  logo: 'https://www.geo.tv/favicon.ico',                   country: '🇵🇰', category: 'South Asia' },
  { name: 'Daily Star',      url: 'https://www.thedailystar.net',        logo: 'https://www.thedailystar.net/favicon.ico',         country: '🇧🇩', category: 'South Asia' },
];

const CATEGORIES = ['All', 'India', 'International', 'USA', 'Business & Tech', 'South Asia'];

export default function SourcesSidebar() {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? SOURCES
    : SOURCES.filter(s => s.category === activeCategory);

  return (
    <>
      {/* Toggle Tab */}
      <button
        className={`sources-sidebar__tab${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close sources panel' : 'Open sources panel'}
        aria-expanded={open}
      >
        <span className="sources-sidebar__tab-icon">📰</span>
        <span className="sources-sidebar__tab-text">Sources</span>
        <span className="sources-sidebar__tab-arrow">{open ? '‹' : '›'}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="sources-sidebar__overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        className={`sources-sidebar${open ? ' sources-sidebar--open' : ''}`}
        aria-label="News sources panel"
        aria-hidden={!open}
      >
        <div className="sources-sidebar__header">
          <h2 className="sources-sidebar__title">📰 News Sources</h2>
          <button
            className="sources-sidebar__close"
            onClick={() => setOpen(false)}
            aria-label="Close sources panel"
          >
            ✕
          </button>
        </div>

        <p className="sources-sidebar__subtitle">
          WorldToday aggregates news from {SOURCES.length}+ trusted sources worldwide.
        </p>

        {/* Category Filter */}
        <div className="sources-sidebar__filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`sources-sidebar__filter-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sources List */}
        <div className="sources-sidebar__list">
          {filtered.map(source => (
            <SourceItem key={source.name} source={source} />
          ))}
        </div>
      </aside>
    </>
  );
}

function SourceItem({ source }) {
  const [imgError, setImgError] = useState(false);
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="sources-sidebar__item"
    >
      <div className="sources-sidebar__item-logo">
        {!imgError ? (
          <img
            src={source.logo}
            alt=""
            onError={() => setImgError(true)}
          />
        ) : (
          <span>📰</span>
        )}
      </div>
      <div className="sources-sidebar__item-info">
        <span className="sources-sidebar__item-name">{source.name}</span>
        <span className="sources-sidebar__item-country">{source.country} {source.category}</span>
      </div>
      <span className="sources-sidebar__item-arrow">↗</span>
    </a>
  );
}
