# Implementation Tasks: WorldDay Transformation

## Task Overview

Transform the existing Global News Platform into WorldDay - a professional, India Today-style news website.

---

- [ ] 1. WorldDay Branding & Design System
  - [ ] 1.1 Update `client/src/styles/index.css` with WorldDay color scheme (primary red #C41E3A, navy #1a1a2e, gold #f5a623), CSS variables, and typography (Inter + Merriweather)
  - [ ] 1.2 Rebuild `client/src/components/Navbar.js` with WorldDay logo, mega-menu navigation, country selector, search bar, dark mode toggle, and auth buttons
  - [ ] 1.3 Rebuild `client/src/styles/Navbar.css` with magazine-style navbar styling, responsive breakpoints
  - [ ] 1.4 Rebuild `client/src/components/Footer.js` with WorldDay branding, category links, newsletter signup form, social media links, and RSS feed links
  - [ ] 1.5 Update `client/public/index.html` with WorldDay meta tags, Open Graph tags, and PWA manifest link
  - [ ] 1.6 Create `client/public/manifest.json` for PWA with WorldDay name, icons, and theme colors

- [ ] 2. Extended Data Models
  - [ ] 2.1 Update `server/models/Article.js` to add: format (text/video/gallery/infographic/liveblog/podcast/webstory/poll/quiz), section (news/opinion/factcheck/investigative/special), liveBlogUpdates array, reactions object, mediaItems array, pollOptions, quizQuestions, revisions array, scheduledAt, wordCount
  - [ ] 2.2 Update `server/models/User.js` to add: role journalist, bio, following/followers arrays, bookmarks array, notificationPrefs, newsletterSubscriptions, apiKey, isSuspended, fontSize preference
  - [ ] 2.3 Update `server/models/Comment.js` to add: parentComment ref, depth (0-3), isEdited, editedAt, isDeleted fields
  - [ ] 2.4 Create `server/models/Reaction.js` with article ref, user ref, type enum (like/love/insightful/angry/sad), unique compound index on article+user
  - [ ] 2.5 Create `server/models/Notification.js` with user ref, type, title, message, articleId, isRead
  - [ ] 2.6 Create `server/models/Newsletter.js` with email, subscriptions array, confirmToken, isConfirmed, unsubscribeToken
  - [ ] 2.7 Create `server/models/Forum.js` with title, content, author ref, topic, replies array, isPinned, isLocked

- [ ] 3. Backend API - Articles & News
  - [ ] 3.1 Update `server/controllers/newsController.js` to support format/section filters, search with relevance ranking, related articles endpoint, personalized feed endpoint, breaking news endpoint, trending endpoint, and view count tracking
  - [ ] 3.2 Update `server/routes/news.js` to add routes: GET /breaking, GET /trending, GET /personalized, GET /search, POST /:id/view, GET /:id/related, GET /:id/liveblog-updates
  - [ ] 3.3 Create `server/controllers/reactionController.js` with addReaction (upsert), removeReaction, getReactions - enforcing one reaction per user per article
  - [ ] 3.4 Create `server/routes/reactions.js` and register in `server/index.js`
  - [ ] 3.5 Update `server/controllers/commentController.js` to support threaded replies (depth 0-3), edit within 15-minute window enforcement, soft delete, and sort options
  - [ ] 3.6 Create `server/controllers/notificationController.js` with getNotifications, markRead, updatePrefs, and a sendBreakingNotification helper
  - [ ] 3.7 Create `server/routes/notifications.js` and register in `server/index.js`

- [ ] 4. Backend API - User Features
  - [ ] 4.1 Update `server/controllers/userController.js` to add: bookmark/unbookmark (idempotent), getBookmarks, follow/unfollow journalist, getFollowing, updatePreferences (language, fontSize, darkMode, categories, countries), uploadAvatar
  - [ ] 4.2 Update `server/routes/user.js` with new endpoints: POST/DELETE /bookmark/:id, GET /bookmarks, POST/DELETE /follow/:id, GET /following, PUT /preferences, POST /avatar
  - [ ] 4.3 Create `server/controllers/newsletterController.js` with subscribe, confirmSubscription, unsubscribe, updatePreferences
  - [ ] 4.4 Create `server/routes/newsletter.js` and register in `server/index.js`

- [ ] 5. Backend API - Admin & CMS
  - [ ] 5.1 Update `server/controllers/adminController.js` to add: createArticle (with rich content, format, section, scheduling), editArticle (saves revision), deleteArticle, scheduleArticle, getAnalytics (views/engagement/demographics), suspendUser, changeUserRole, getUsers with activity stats
  - [ ] 5.2 Update `server/routes/admin.js` with CMS endpoints: POST /articles, PUT /articles/:id, DELETE /articles/:id, GET /analytics, PUT /users/:id/suspend, PUT /users/:id/role
  - [ ] 5.3 Create `server/services/schedulerService.js` using node-cron to publish scheduled articles and send daily newsletter digests
  - [ ] 5.4 Create `server/services/emailService.js` using Nodemailer with Gmail SMTP for newsletter confirmation emails and digest sending

- [ ] 6. Backend API - RSS, Public API & Widgets
  - [ ] 6.1 Create `server/controllers/rssController.js` generating RSS XML feeds by category, country, and breaking news using the `rss` npm package
  - [ ] 6.2 Create `server/routes/rss.js` with GET /category/:cat, GET /country/:code, GET /breaking and register in `server/index.js`
  - [ ] 6.3 Create `server/controllers/publicApiController.js` with API key authentication middleware, rate limiting (1000/hr per key), and article retrieval endpoints
  - [ ] 6.4 Create `server/routes/publicApi.js` (mounted at /api/v1) and register in `server/index.js`
  - [ ] 6.5 Create `server/controllers/widgetController.js` proxying Open-Meteo (weather), Finnhub free tier (stocks), and exchangerate-api.com (currency)
  - [ ] 6.6 Create `server/routes/widgets.js` with GET /weather, GET /stocks, GET /currency and register in `server/index.js`

- [ ] 7. Homepage - Magazine Layout
  - [ ] 7.1 Rebuild `client/src/pages/Home.js` with magazine layout: BreakingNewsTicker at top, hero featured story grid, category sections, trending sidebar, personalized feed toggle for logged-in users
  - [ ] 7.2 Create `client/src/components/BreakingNewsTicker.js` that polls /api/news/breaking every 60 seconds with CSS marquee animation
  - [ ] 7.3 Create `client/src/components/article/ArticleCard.js` with format badge, category label, read time, reaction counts, bookmark button, and share button
  - [ ] 7.4 Create `client/src/components/article/ArticleGrid.js` with magazine-style CSS grid (featured large + smaller cards)
  - [ ] 7.5 Create `client/src/components/layout/Sidebar.js` with trending articles, weather widget, stock ticker, and currency converter
  - [ ] 7.6 Create `client/src/styles/Home.css` with full magazine-style layout, responsive grid, and section styling

- [ ] 8. Article Page - Full Experience
  - [ ] 8.1 Rebuild `client/src/pages/Article.js` with: format-specific rendering, reading progress bar, reading toolbar (font size, dark mode, TTS), social share buttons, reaction bar, threaded comments, related articles, Open Graph meta tags, JSON-LD structured data
  - [ ] 8.2 Create `client/src/components/reading/ReadingProgress.js` - fixed top progress bar tracking scroll position
  - [ ] 8.3 Create `client/src/components/reading/ReadingToolbar.js` with font size controls, text-to-speech toggle, and scroll position save/restore
  - [ ] 8.4 Create `client/src/components/social/ShareButtons.js` with Facebook, Twitter, LinkedIn, WhatsApp, email, and copy-link buttons
  - [ ] 8.5 Create `client/src/components/social/ReactionBar.js` with 5 reaction types (Like/Love/Insightful/Angry/Sad), counts, and active state for logged-in users
  - [ ] 8.6 Create `client/src/components/social/CommentSection.js` with threaded replies (3 levels), edit within 15 min, delete, sort toggle, and pagination
  - [ ] 8.7 Create `client/src/components/article/LiveBlogViewer.js` that polls for updates every 30 seconds and shows "New updates" banner
  - [ ] 8.8 Create `client/src/components/article/GalleryViewer.js` with image carousel and lightbox
  - [ ] 8.9 Create `client/src/components/article/PollWidget.js` with vote submission and results display
  - [ ] 8.10 Create `client/src/components/article/QuizWidget.js` with question flow and score display
  - [ ] 8.11 Create `client/src/styles/Article.css` with full article styling, reading enhancements, and responsive layout

- [ ] 9. Search, Category & Special Sections
  - [ ] 9.1 Rebuild `client/src/pages/Search.js` with keyword input, filters (date range, category, country, format), search suggestions, relevance-ranked results, and "no results" suggestions
  - [ ] 9.2 Rebuild `client/src/pages/Category.js` to support all categories plus special sections (Opinion, Fact-Check, Investigative, Podcasts, Web Stories)
  - [ ] 9.3 Create `client/src/pages/WebStories.js` with swipeable full-screen web story viewer
  - [ ] 9.4 Update `client/src/App.js` to add routes for /search, /category/:cat, /web-stories, /notifications, /premium, /forum, /saved, /profile

- [ ] 10. User Features - Bookmarks, Profile & Notifications
  - [ ] 10.1 Rebuild `client/src/pages/Saved.js` as bookmarks page with article cards, remove bookmark action, and empty state
  - [ ] 10.2 Rebuild `client/src/pages/Profile.js` with avatar upload, bio editing, following list, follower count, reading history, and notification preferences
  - [ ] 10.3 Create `client/src/pages/Notifications.js` with notification history list, mark-as-read, and preference settings
  - [ ] 10.4 Update `client/src/context/AuthContext.js` to include bookmarks state, following state, and notification preferences

- [ ] 11. Widgets
  - [ ] 11.1 Create `client/src/components/widgets/WeatherWidget.js` using browser geolocation + Open-Meteo API via backend proxy
  - [ ] 11.2 Create `client/src/components/widgets/StockTicker.js` showing major indices (S&P 500, NASDAQ, FTSE, NIFTY) via backend proxy
  - [ ] 11.3 Create `client/src/components/widgets/CurrencyConverter.js` with amount input, from/to currency selectors, and live rates

- [ ] 12. Premium & Newsletter
  - [ ] 12.1 Create `client/src/pages/Premium.js` with monthly/annual plan cards, feature comparison, and subscription CTA (UI only - no payment processor required)
  - [ ] 12.2 Create `client/src/components/ads/AdPlacement.js` that renders Google AdSense slots and is hidden when user.isPremium is true
  - [ ] 12.3 Create newsletter subscription form component in Footer and a dedicated subscribe page, wired to POST /api/newsletter/subscribe

- [ ] 13. Admin CMS Dashboard
  - [ ] 13.1 Rebuild `client/src/pages/Admin.js` with tabbed interface: Articles CMS, User Management, Analytics Dashboard, Newsletter Management
  - [ ] 13.2 Create article editor with react-quill rich text editor, format/section selectors, image upload, scheduling, preview, and publish controls
  - [ ] 13.3 Create analytics dashboard tab with Chart.js charts: page views over time, top articles, engagement metrics, traffic sources
  - [ ] 13.4 Create user management tab with user list, suspend/unsuspend, role assignment (journalist/admin)
  - [ ] 13.5 Create `client/src/styles/Admin.css` with full admin dashboard styling

- [ ] 14. PWA & Performance
  - [ ] 14.1 Create `client/src/serviceWorker.js` using Workbox patterns to cache static assets and last 20 articles for offline reading
  - [ ] 14.2 Register service worker in `client/src/index.js` and add offline indicator banner
  - [ ] 14.3 Implement lazy loading for all images using `loading="lazy"` attribute and Intersection Observer for below-fold content
  - [ ] 14.4 Add React.lazy() and Suspense code splitting for all page components in `client/src/App.js`

- [ ] 15. SEO & Accessibility
  - [ ] 15.1 Add React Helmet (or react-helmet-async) to all pages for dynamic meta tags, Open Graph, Twitter Card, and JSON-LD structured data
  - [ ] 15.2 Create `server/routes/sitemap.js` generating XML sitemap with all articles, updated daily, and register in `server/index.js`
  - [ ] 15.3 Audit all components for ARIA labels, keyboard navigation (tabIndex, onKeyDown), alt text on images, and minimum 4.5:1 contrast ratios
  - [ ] 15.4 Add `lang` attribute to HTML, skip-to-content link, and focus management for dynamic content updates

- [ ] 16. Multi-Language Translation
  - [ ] 16.1 Create `client/src/components/LanguageSelector.js` with 30+ language options, persisting selection to localStorage and user profile
  - [ ] 16.2 Add translation fetch logic in `client/src/pages/Article.js` calling LibreTranslate via backend proxy when language != 'en', with fallback to original on error
  - [ ] 16.3 Create `server/routes/translate.js` proxying requests to LibreTranslate public API and register in `server/index.js`

- [ ] 17. Community Forums
  - [ ] 17.1 Create `server/controllers/forumController.js` with getTopics, getThreads, createThread, replyToThread
  - [ ] 17.2 Create `server/routes/forum.js` and register in `server/index.js`
  - [ ] 17.3 Create `client/src/pages/Forum.js` with topic list, thread list, create thread form, and reply functionality

- [ ] 18. Final Integration & Cleanup
  - [ ] 18.1 Install all required npm packages: server (`rss`, `node-cron`, `nodemailer`, `socket.io`) and client (`react-quill`, `chart.js`, `react-chartjs-2`, `react-helmet-async`, `workbox-webpack-plugin`)
  - [ ] 18.2 Update `server/index.js` to register all new routes, add Socket.io for real-time notifications, and add translation proxy route
  - [ ] 18.3 Update `client/src/context/ThemeContext.js` to handle dark mode, font size (small/medium/large), and persist to localStorage
  - [ ] 18.4 Update `.env.example` with all new environment variables (FCM keys, Gmail SMTP, Finnhub key)
  - [ ] 18.5 Verify all existing functionality still works: MongoDB connection, news aggregation for 54 countries, auth (login/register/admin), RSS fallback
