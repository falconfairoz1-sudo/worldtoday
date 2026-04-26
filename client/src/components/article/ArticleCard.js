import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { calculateReadingTime } from '../../utils/helpers';
import '../../styles/ArticleCard.css';

const FORMAT_BADGES = {
  video:       { label: '▶ Video',        cls: 'badge-video' },
  gallery:     { label: '🖼 Gallery',     cls: 'badge-gallery' },
  infographic: { label: '📊 Infographic', cls: 'badge-accent' },
  liveblog:    { label: '🔴 Live',        cls: 'badge-live' },
  podcast:     { label: '🎙 Podcast',     cls: 'badge-podcast' },
  webstory:    { label: '📱 Story',       cls: 'badge-primary' },
};

const SECTION_BADGES = {
  opinion:       { label: 'Opinion',       cls: 'badge-opinion' },
  factcheck:     { label: 'Fact Check',    cls: 'badge-factcheck' },
  investigative: { label: 'Investigative', cls: 'badge-primary' },
};

// Source logo/favicon helper
const SOURCE_LOGOS = {
  'bbc':              'https://www.bbc.com/favicon.ico',
  'bbc news':         'https://www.bbc.com/favicon.ico',
  'the guardian':     'https://www.theguardian.com/favicon.ico',
  'reuters':          'https://www.reuters.com/favicon.ico',
  'al jazeera':       'https://www.aljazeera.com/favicon.ico',
  'ndtv':             'https://www.ndtv.com/favicon.ico',
  'times of india':   'https://timesofindia.indiatimes.com/favicon.ico',
  'the hindu':        'https://www.thehindu.com/favicon.ico',
  'hindustan times':  'https://www.hindustantimes.com/favicon.ico',
  'indian express':   'https://indianexpress.com/favicon.ico',
  'economic times':   'https://economictimes.indiatimes.com/favicon.ico',
  'nytimes':          'https://www.nytimes.com/favicon.ico',
  'new york times':   'https://www.nytimes.com/favicon.ico',
  'washington post':  'https://www.washingtonpost.com/favicon.ico',
  'bloomberg':        'https://www.bloomberg.com/favicon.ico',
  'techcrunch':       'https://techcrunch.com/favicon.ico',
  'the verge':        'https://www.theverge.com/favicon.ico',
  'wired':            'https://www.wired.com/favicon.ico',
  'espn':             'https://www.espn.com/favicon.ico',
  'france24':         'https://www.france24.com/favicon.ico',
  'dw':               'https://www.dw.com/favicon.ico',
  'sky news':         'https://news.sky.com/favicon.ico',
  'npr':              'https://www.npr.org/favicon.ico',
  'abc news':         'https://abcnews.go.com/favicon.ico',
  'cbs news':         'https://www.cbsnews.com/favicon.ico',
  'fox news':         'https://www.foxnews.com/favicon.ico',
  'cnbc':             'https://www.cnbc.com/favicon.ico',
  'ft':               'https://www.ft.com/favicon.ico',
  'financial times':  'https://www.ft.com/favicon.ico',
  'dawn':             'https://www.dawn.com/favicon.ico',
  'the daily star':   'https://www.thedailystar.net/favicon.ico',
  'vanguard':         'https://www.vanguardngr.com/favicon.ico',
  'nhk':              'https://www3.nhk.or.jp/favicon.ico',
  'straitstimes':     'https://www.straitstimes.com/favicon.ico',
  'straits times':    'https://www.straitstimes.com/favicon.ico',
};

const CATEGORY_ICONS = {
  politics:      '🏛️',
  business:      '💼',
  technology:    '💻',
  sports:        '⚽',
  entertainment: '🎬',
  health:        '🏥',
  science:       '🔬',
  general:       '📰',
};

function SourceLogo({ name }) {
  const [imgError, setImgError] = useState(false);
  if (!name) return null;
  const key = name.toLowerCase();
  const logoUrl = SOURCE_LOGOS[key];
  if (!logoUrl || imgError) {
    return (
      <span className="article-card__source-dot" aria-hidden="true">●</span>
    );
  }
  return (
    <img
      src={logoUrl}
      alt=""
      className="article-card__source-logo"
      onError={() => setImgError(true)}
      aria-hidden="true"
    />
  );
}

// Multi-source image fallback with preloading and caching
function LazyImage({ src, alt, className }) {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const mountedRef = React.useRef(true);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    mountedRef.current = true;
    
    if (!src) {
      setError(true);
      return;
    }

    // Reset states
    setLoaded(false);
    setError(false);
    
    // Create sources array
    const sources = [];
    if (src.startsWith('http://') || src.startsWith('https://')) {
      sources.push(src); // Direct first
      sources.push(`/api/image-proxy?url=${encodeURIComponent(src)}`); // Proxy second
    }
    
    let currentIndex = 0;
    
    const tryLoad = () => {
      if (!mountedRef.current || currentIndex >= sources.length) {
        if (currentIndex >= sources.length) {
          setError(true);
        }
        return;
      }

      const testSrc = sources[currentIndex];
      const img = new Image();
      
      img.onload = () => {
        if (mountedRef.current) {
          setCurrentSrc(testSrc);
          setLoaded(true);
          setError(false);
        }
      };
      
      img.onerror = () => {
        if (mountedRef.current) {
          currentIndex++;
          if (currentIndex < sources.length) {
            setTimeout(tryLoad, 100);
          } else {
            setError(true);
          }
        }
      };

      img.src = testSrc;
    };

    tryLoad();
    
    return () => {
      mountedRef.current = false;
    };
  }, [src]);

  if (!src || error) {
    return null;
  }

  if (!currentSrc || !loaded) {
    return <div className="article-card__image-skeleton" aria-hidden="true" />;
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} loaded`}
      loading="lazy"
      decoding="async"
    />
  );
}

export default function ArticleCard({ article, size = 'medium', showBookmark = true }) {
  const { user, toggleBookmark, bookmarks } = useContext(AuthContext);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const isBookmarked = bookmarks?.includes(article._id);

  if (!article) return null;

  const formatBadge = FORMAT_BADGES[article.format];
  const sectionBadge = SECTION_BADGES[article.section];
  const categoryIcon = CATEGORY_ICONS[article.category] || '📰';
  const sourceName = article.source?.name || article.apiSource || '';
  const sourceUrl = article.source?.url || article.url;

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to save articles');
      return;
    }
    setIsBookmarking(true);
    try {
      await toggleBookmark(article._id);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <article className={`article-card article-card--${size}`}>
      {/* Image */}
      <Link to={`/article/${article._id}`} className="article-card__image-link" tabIndex="-1" aria-hidden="true">
        <div className="article-card__image-wrapper">
          <LazyImage src={article.urlToImage} alt={article.title} className="article-card__image" />
          <div className={`article-card__image-placeholder${article.urlToImage ? ' has-image' : ''}`}>
            <span className="article-card__placeholder-icon">{categoryIcon}</span>
            <span className="article-card__placeholder-text">{article.category}</span>
          </div>
          <div className="article-card__badges">
            {article.isBreaking && <span className="badge badge-breaking">Breaking</span>}
            {formatBadge && <span className={`badge ${formatBadge.cls}`}>{formatBadge.label}</span>}
            {sectionBadge && !formatBadge && <span className={`badge ${sectionBadge.cls}`}>{sectionBadge.label}</span>}
            {article.isPremium && <span className="badge badge-accent">⭐ Premium</span>}
          </div>
          {/* Bookmark button on image */}
          {showBookmark && (
            <button
              className={`article-card__bookmark-overlay${isBookmarked ? ' bookmarked' : ''}${isBookmarking ? ' loading' : ''}`}
              onClick={handleBookmark}
              disabled={isBookmarking}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              title={user ? (isBookmarked ? 'Saved' : 'Save for later') : 'Login to save'}
            >
              {isBookmarking ? '⏳' : isBookmarked ? '🔖' : '🏷️'}
            </button>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="article-card__body">
        {/* Source + Category row */}
        <div className="article-card__source-row">
          {sourceName && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="article-card__source-link"
              onClick={e => e.stopPropagation()}
              title={`Read on ${sourceName}`}
            >
              <SourceLogo name={sourceName} />
              <span className="article-card__source-name">{sourceName}</span>
            </a>
          )}
          <Link
            to={`/category/${article.category}`}
            className="article-card__category-tag"
            onClick={e => e.stopPropagation()}
          >
            {article.category?.toUpperCase()}
          </Link>
        </div>

        {/* Title */}
        <Link to={`/article/${article._id}`} className="article-card__title-link">
          <h3 className="article-card__title">{article.title}</h3>
        </Link>

        {/* Description */}
        {size !== 'small' && article.description && (
          <p className="article-card__description">{article.description}</p>
        )}

        {/* Footer */}
        <div className="article-card__footer">
          <div className="article-card__meta-row">
            {article.country && (
              <span className="article-card__country-tag">
                {getCountryFlag(article.country)} {article.country.toUpperCase()}
              </span>
            )}
            <span className="article-card__time">{formatTimeAgo(article.publishedAt)}</span>
            <span className="article-card__readtime">
              ⏱ {article.readTime || calculateReadingTime(article.content || article.description || '')}m
            </span>
          </div>
          <div className="article-card__actions">
            {article.views > 0 && (
              <span className="article-card__views" title="Views">👁 {formatCount(article.views)}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function getCountryFlag(code) {
  const flags = { in:'🇮🇳', us:'🇺🇸', gb:'🇬🇧', au:'🇦🇺', ca:'🇨🇦', de:'🇩🇪', fr:'🇫🇷', jp:'🇯🇵', cn:'🇨🇳', br:'🇧🇷', ru:'🇷🇺', za:'🇿🇦', ng:'🇳🇬', mx:'🇲🇽', ae:'🇦🇪', sg:'🇸🇬', pk:'🇵🇰', bd:'🇧🇩', eg:'🇪🇬', ar:'🇦🇷', it:'🇮🇹', es:'🇪🇸', kr:'🇰🇷', id:'🇮🇩', tr:'🇹🇷', sa:'🇸🇦', nl:'🇳🇱', se:'🇸🇪', no:'🇳🇴', pl:'🇵🇱' };
  return flags[code] || '🌍';
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}
