import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ReadingProgress from '../components/reading/ReadingProgress';
import ShareButtons from '../components/social/ShareButtons';
import ReactionBar from '../components/social/ReactionBar';
import CommentSection from '../components/social/CommentSection';
import ArticleIntelligence from '../components/article/ArticleIntelligence';
import api from '../utils/api';
import { copyToClipboard, calculateReadingTime } from '../utils/helpers';
import '../styles/Article.css';
import '../styles/ArticleIntelligence.css';

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' }, { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' }, { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' }, { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' }, { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' }, { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' }, { code: 'tr', label: 'Turkish' },
  { code: 'pl', label: 'Polish' }, { code: 'sv', label: 'Swedish' },
  { code: 'da', label: 'Danish' }, { code: 'fi', label: 'Finnish' },
  { code: 'no', label: 'Norwegian' }, { code: 'cs', label: 'Czech' },
  { code: 'ro', label: 'Romanian' }, { code: 'hu', label: 'Hungarian' },
  { code: 'uk', label: 'Ukrainian' }, { code: 'bn', label: 'Bengali' },
  { code: 'ta', label: 'Tamil' }, { code: 'te', label: 'Telugu' },
  { code: 'mr', label: 'Marathi' }, { code: 'gu', label: 'Gujarati' },
  { code: 'ur', label: 'Urdu' }, { code: 'id', label: 'Indonesian' },
];

export default function Article() {
  const { id } = useParams();
  const { user, toggleBookmark, bookmarks } = useContext(AuthContext);
  const { fontSize, setFontSize } = useContext(ThemeContext);
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(localStorage.getItem('worldtoday_lang') || 'en');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);
  const [liveBlogUpdates, setLiveBlogUpdates] = useState([]);
  const [newUpdatesAvailable, setNewUpdatesAvailable] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const ttsRef = useRef(null);
  const isBookmarked = bookmarks?.includes(id);

  useEffect(() => {
    fetchArticle();
    return () => {
      const currentTts = ttsRef.current;
      if (currentTts) window.speechSynthesis.cancel();
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (article?.format === 'liveblog' && article?.isActive) {
      const interval = setInterval(checkLiveBlogUpdates, 30000);
      return () => clearInterval(interval);
    }
  }, [article]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (language !== 'en' && article) {
      translateArticle();
    } else {
      setTranslatedContent(null);
    }
  }, [language, article]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save scroll position
  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll_${id}`);
    if (saved) window.scrollTo(0, parseInt(saved));
    const handleScroll = () => sessionStorage.setItem(`scroll_${id}`, window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const [articleRes, relatedRes] = await Promise.allSettled([
        api.get(`/news/${id}`),
        api.get(`/news/${id}/related`),
      ]);
      if (articleRes.status === 'fulfilled') {
        const data = articleRes.value.data;
        setArticle(data);
        setLiveBlogUpdates(data.liveBlogUpdates || []);
        // Track view
        api.post(`/news/${id}/view`).catch(() => {});
      } else {
        setError('Article not found');
      }
      if (relatedRes.status === 'fulfilled') {
        setRelated(relatedRes.value.data?.articles || relatedRes.value.data || []);
      }
    } catch (err) {
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const checkLiveBlogUpdates = async () => {
    try {
      const res = await api.get(`/news/${id}/liveblog-updates`);
      const updates = res.data || [];
      if (updates.length > liveBlogUpdates.length) {
        setNewUpdatesAvailable(true);
      }
    } catch (e) {}
  };

  const loadNewUpdates = async () => {
    try {
      const res = await api.get(`/news/${id}/liveblog-updates`);
      setLiveBlogUpdates(res.data || []);
      setNewUpdatesAvailable(false);
    } catch (e) {}
  };

  const translateArticle = async () => {
    setTranslating(true);
    try {
      const res = await api.post('/translate', {
        text: article.content,
        target: language,
        title: article.title,
        description: article.description,
      });
      setTranslatedContent(res.data);
    } catch (err) {
      setTranslatedContent(null);
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('worldtoday_lang', lang);
  };

  const toggleTTS = () => {
    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
    } else {
      const text = translatedContent?.content || article?.content || '';
      const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, ''));
      utterance.onend = () => setTtsActive(false);
      window.speechSynthesis.speak(utterance);
      setTtsActive(true);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(articleUrl);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate reading time if not provided
  const readingTime = article?.readTime || calculateReadingTime(article?.content || '');

  if (loading) return (
    <div className="article-page">
      <div className="container">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    </div>
  );

  if (error || !article) return (
    <div className="article-page">
      <div className="container">
        <div className="article-error">
          <h2>Article not found</h2>
          <Link to="/" className="btn btn-primary">← Back to Home</Link>
        </div>
      </div>
    </div>
  );

  const displayTitle = translatedContent?.title || article.title;
  const displayDescription = translatedContent?.description || article.description;
  const displayContent = translatedContent?.content || article.content;
  const articleUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{article.title} - WorldToday</title>
        <meta name="description" content={article.description || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description || ''} />
        <meta property="og:image" content={article.urlToImage || ''} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.description || ''} />
        <meta name="twitter:image" content={article.urlToImage || ''} />
        <link rel="canonical" href={articleUrl} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": article.title,
          "description": article.description,
          "image": article.urlToImage,
          "datePublished": article.publishedAt,
          "author": { "@type": "Person", "name": article.author || 'WorldToday' },
          "publisher": { "@type": "Organization", "name": "WorldToday" },
        })}</script>
      </Helmet>

      <ReadingProgress />

      <div className="article-page">
        <div className="container">
          <div className="article-layout">
            {/* Main Article */}
            <main className="article-main" id="main-content">
              {/* Breadcrumb */}
              <nav className="article-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span>›</span>
                <Link to={`/category/${article.category}`}>{article.category}</Link>
                <span>›</span>
                <span>{article.title?.substring(0, 40)}...</span>
              </nav>

              {/* Article Header */}
              <header className="article-header">
                <div className="article-header__badges">
                  {article.isBreaking && <span className="badge badge-breaking">Breaking</span>}
                  {article.section && article.section !== 'news' && (
                    <span className={`badge badge-${article.section}`}>{article.section}</span>
                  )}
                  {article.format && article.format !== 'text' && (
                    <span className="badge badge-primary">{article.format}</span>
                  )}
                  {article.isPremium && <span className="badge badge-accent">⭐ Premium</span>}
                </div>

                <h1 className="article-title">{displayTitle}</h1>

                {displayDescription && (
                  <p className="article-description">{displayDescription}</p>
                )}

                <div className="article-meta">
                  <div className="article-meta__left">
                    <span className="article-meta__author">By {article.author || 'WorldToday Staff'}</span>
                    {article.source?.name && (
                      <a
                        href={article.source?.url || article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="article-meta__source-link"
                        title={`Read original on ${article.source.name}`}
                      >
                        📰 {article.source.name} ↗
                      </a>
                    )}
                    <time className="article-meta__date" dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </time>
                    <span className="article-meta__readtime">⏱ {readingTime} min read</span>
                  </div>
                  <div className="article-meta__right">
                    {/* Reading Controls */}
                    <div className="reading-controls" aria-label="Reading controls">
                      <button
                        className={`reading-ctrl-btn${ttsActive ? ' active' : ''}`}
                        onClick={toggleTTS}
                        aria-label={ttsActive ? 'Stop reading' : 'Read aloud'}
                        title="Text to Speech"
                      >
                        🔊
                      </button>
                      <button
                        className="reading-ctrl-btn"
                        onClick={handlePrint}
                        aria-label="Print article"
                        title="Print"
                      >
                        🖨️
                      </button>
                      <button
                        className={`reading-ctrl-btn${copySuccess ? ' active' : ''}`}
                        onClick={handleCopyLink}
                        aria-label="Copy link"
                        title={copySuccess ? 'Link copied!' : 'Copy link'}
                      >
                        {copySuccess ? '✓' : '🔗'}
                      </button>
                      <div className="reading-ctrl-font" aria-label="Font size">
                        <button className={fontSize === 'small' ? 'active' : ''} onClick={() => setFontSize('small')} aria-label="Small font">A</button>
                        <button className={fontSize === 'medium' ? 'active' : ''} onClick={() => setFontSize('medium')} aria-label="Medium font">A</button>
                        <button className={fontSize === 'large' ? 'active' : ''} onClick={() => setFontSize('large')} aria-label="Large font">A</button>
                      </div>
                      {user && (
                        <button
                          className={`reading-ctrl-btn${isBookmarked ? ' active' : ''}`}
                          onClick={() => toggleBookmark(id)}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                          title={isBookmarked ? 'Saved' : 'Save for later'}
                        >
                          {isBookmarked ? '🔖' : '🏷️'}
                        </button>
                      )}
                    </div>

                    {/* Language Selector */}
                    <select
                      value={language}
                      onChange={handleLanguageChange}
                      className="article-lang-select"
                      aria-label="Select language"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </header>

              {/* Hero Image */}
              {article.urlToImage && (
                <figure className="article-hero">
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(article.urlToImage)}`}
                    alt={article.title}
                    className="article-hero__img"
                    onError={e => { e.target.src = article.urlToImage; }}
                  />
                </figure>
              )}

              {/* Visit Original Source — prominent button */}
              {article.url && (
                <div className="article-visit-source">
                  <div className="article-visit-source__info">
                    <span className="article-visit-source__label">Original Article</span>
                    <span className="article-visit-source__source">
                      {article.source?.name || new URL(article.url).hostname}
                    </span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-visit-source__btn"
                  >
                    🔗 Read Full Article on {article.source?.name || 'Source'} ↗
                  </a>
                </div>
              )}

              {/* Premium Paywall */}
              {article.isPremium && !user?.isPremium ? (
                <div className="article-paywall">
                  <div className="article-paywall__content">
                    <span className="article-paywall__icon">⭐</span>
                    <h3>Premium Content</h3>
                    <p>This article is available exclusively to WorldToday Premium members.</p>
                    <Link to="/premium" className="btn btn-primary btn-lg">Upgrade to Premium</Link>
                    <p className="article-paywall__note">Already a member? <Link to="/login">Login</Link></p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Translation Notice */}
                  {language !== 'en' && (
                    <div className="article-translation-notice" role="status">
                      {translating ? (
                        <span>🌐 Translating...</span>
                      ) : translatedContent ? (
                        <span>🌐 Machine translated to {LANGUAGES.find(l => l.code === language)?.label}. <button onClick={() => setLanguage('en')} className="article-translation-notice__reset">View original</button></span>
                      ) : (
                        <span>⚠️ Translation unavailable. Showing original content.</span>
                      )}
                    </div>
                  )}

                  {/* Live Blog Updates Banner */}
                  {newUpdatesAvailable && (
                    <button className="liveblog-update-banner" onClick={loadNewUpdates}>
                      🔴 New updates available — Click to load
                    </button>
                  )}

                  {/* Live Blog Updates */}
                  {article.format === 'liveblog' && liveBlogUpdates.length > 0 && (
                    <div className="liveblog-updates">
                      <div className="liveblog-status">
                        {article.isActive ? (
                          <span className="badge badge-live">🔴 LIVE</span>
                        ) : (
                          <span className="badge">Concluded</span>
                        )}
                      </div>
                      {liveBlogUpdates.map((update, i) => (
                        <div key={i} className="liveblog-update">
                          <time className="liveblog-update__time">
                            {new Date(update.timestamp).toLocaleTimeString()}
                          </time>
                          <div className="liveblog-update__content">{update.content}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Article Body */}
                  <div
                    id="article-body"
                    className="article-body font-body"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                  />

                  {/* Tags */}
                  {article.tags?.length > 0 && (
                    <div className="article-tags">
                      <span className="article-tags__label">Tags:</span>
                      {article.tags.map(tag => (
                        <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="article-tag">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Share */}
                  <ShareButtons title={article.title} url={articleUrl} />

                  {/* Reactions */}
                  <ReactionBar
                    articleId={id}
                    initialReactions={article.reactions || {}}
                    userReaction={article.userReaction || null}
                  />

                  {/* Comments */}
                  <CommentSection articleId={id} />
                </>
              )}
            </main>

            {/* Article Sidebar */}
            <aside className="article-sidebar">
              {/* Article Intelligence Panel */}
              <ArticleIntelligence article={article} />

              {/* Related Articles */}
              {related.length > 0 && (
                <div className="widget">
                  <div className="widget__header">
                    <span className="widget__title">📰 Related</span>
                  </div>
                  <div className="related-articles">
                    {related.slice(0, 5).map(a => (
                      <Link key={a._id} to={`/article/${a._id}`} className="related-article">
                        {a.urlToImage && (
                          <img src={a.urlToImage} alt={a.title} className="related-article__img" loading="lazy" />
                        )}
                        <div className="related-article__info">
                          <span className="related-article__cat">{a.category}</span>
                          <p className="related-article__title">{a.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
