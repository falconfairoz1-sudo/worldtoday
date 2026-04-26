# Technical Design Document: WorldDay Transformation

## Overview

This document specifies the technical design for transforming the existing Global News Platform into "WorldDay". The transformation builds upon the existing MERN stack (MongoDB, Express, React, Node.js) with 54-country news aggregation already in place.

### Technology Stack

**Backend:** Node.js 18+ / Express.js / MongoDB Atlas / JWT / Socket.io  
**Frontend:** React 18 / React Router v6 / Context API / CSS Modules  
**Free Services:** LibreTranslate, Open-Meteo, Firebase FCM, Nodemailer/Gmail SMTP, Google AdSense

---

## Data Models

### Article Model (Extended)
```
format: enum ['text','video','gallery','infographic','liveblog','podcast','webstory','poll','quiz']
section: enum ['news','opinion','factcheck','investigative','special','podcast','webstory']
isBreaking, isPremium, isTrending, isLiveBlog, isActive (liveblog)
liveBlogUpdates: [{ content, author, timestamp }]
reactions: { like, love, insightful, angry, sad }
readTime, wordCount
mediaItems: [{ type, url, caption }]
pollOptions: [{ text, votes }]
quizQuestions: [{ question, options, correctIndex }]
revisions: [{ content, editedBy, editedAt }]
scheduledAt, publishedBy
```

### User Model (Extended)
```
role: enum ['user','journalist','admin']
bio: String (max 500)
avatar: String
following: [ObjectId ref User]
followers: [ObjectId ref User]
bookmarks: [ObjectId ref Article]
readingHistory: [{ article, readAt }]
preferences: { categories[], countries[], language, darkMode, fontSize }
notificationPrefs: { breaking, categories[], countries[] }
fcmToken, isPremium, premiumExpiresAt
newsletterSubscriptions: [{ type, active }]
apiKey: String
isSuspended: Boolean
```

### Comment Model (Extended)
```
article: ObjectId ref Article
author: ObjectId ref User
content: String
parentComment: ObjectId ref Comment (for threading)
depth: Number (0-3)
isEdited: Boolean, editedAt: Date
isDeleted: Boolean
```

### Reaction Model
```
article: ObjectId ref Article
user: ObjectId ref User
type: enum ['like','love','insightful','angry','sad']
```

### Notification Model
```
user: ObjectId ref User
type: enum ['breaking','followed_journalist','comment_reply','system']
title, message, articleId
isRead: Boolean
```

### Newsletter Model
```
email: String
subscriptions: [{ type: enum['daily','breaking','category'], category, active }]
confirmToken, isConfirmed
unsubscribeToken
```

### Forum Model
```
title, content, author: ObjectId ref User
topic: String
replies: [{ content, author, createdAt }]
isPinned, isLocked
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login, returns JWT
- `GET /api/auth/me` — get current user

### Articles
- `GET /api/news` — list articles (filters: country, category, format, section, search, page, limit)
- `GET /api/news/:id` — get single article
- `POST /api/news/:id/view` — increment view count
- `GET /api/news/:id/related` — related articles
- `GET /api/news/breaking` — breaking news
- `GET /api/news/trending` — trending articles
- `GET /api/news/personalized` — personalized feed (auth required)
- `GET /api/news/search` — search with filters

### Reactions
- `POST /api/reactions/:articleId` — add/change reaction
- `DELETE /api/reactions/:articleId` — remove reaction

### Comments
- `GET /api/comments/:articleId` — get comments
- `POST /api/comments/:articleId` — post comment
- `PUT /api/comments/:commentId` — edit comment (within 15 min)
- `DELETE /api/comments/:commentId` — delete comment

### User
- `GET /api/user/profile` — get profile
- `PUT /api/user/profile` — update profile (bio, avatar, preferences)
- `POST /api/user/bookmark/:articleId` — bookmark article
- `DELETE /api/user/bookmark/:articleId` — remove bookmark
- `GET /api/user/bookmarks` — list bookmarks
- `POST /api/user/follow/:userId` — follow journalist
- `DELETE /api/user/follow/:userId` — unfollow
- `GET /api/user/notifications` — notification history
- `PUT /api/user/notifications/prefs` — update notification prefs

### Admin
- `GET /api/admin/users` — list users
- `PUT /api/admin/users/:id/suspend` — suspend user
- `PUT /api/admin/users/:id/role` — change role
- `GET /api/admin/analytics` — analytics data
- `POST /api/admin/articles` — create article (CMS)
- `PUT /api/admin/articles/:id` — edit article
- `DELETE /api/admin/articles/:id` — delete article

### Newsletter
- `POST /api/newsletter/subscribe` — subscribe
- `GET /api/newsletter/confirm/:token` — confirm subscription
- `GET /api/newsletter/unsubscribe/:token` — unsubscribe

### RSS
- `GET /api/rss/category/:category` — RSS feed by category
- `GET /api/rss/country/:country` — RSS feed by country
- `GET /api/rss/breaking` — breaking news RSS

### Public API
- `GET /api/v1/articles` — public API (requires API key header)
- `GET /api/v1/articles/:id` — single article

### Widgets
- `GET /api/widgets/weather?lat=&lon=` — weather (proxies Open-Meteo)
- `GET /api/widgets/stocks` — stock tickers (proxies Finnhub)
- `GET /api/widgets/currency` — currency rates

---

## Frontend Component Structure

```
client/src/
├── components/
│   ├── layout/
│   │   ├── Navbar.js          # WorldDay branded navbar with search
│   │   ├── Footer.js          # Links, newsletter signup, social
│   │   ├── BreakingNewsTicker.js
│   │   └── Sidebar.js         # Trending, weather, stocks widgets
│   ├── article/
│   │   ├── ArticleCard.js     # Card with format badge, reactions, read time
│   │   ├── ArticleGrid.js     # Magazine-style grid layout
│   │   ├── ArticleList.js     # List view with ads every 5 items
│   │   ├── LiveBlogViewer.js  # Auto-polling live blog
│   │   ├── GalleryViewer.js   # Photo gallery carousel
│   │   ├── VideoPlayer.js     # Embedded video player
│   │   ├── PollWidget.js      # Interactive poll
│   │   ├── QuizWidget.js      # Interactive quiz
│   │   └── WebStoryViewer.js  # Swipeable web stories
│   ├── reading/
│   │   ├── ReadingProgress.js # Progress bar
│   │   ├── FontSizeControl.js
│   │   ├── TextToSpeech.js
│   │   └── ReadingToolbar.js  # All reading controls
│   ├── social/
│   │   ├── ShareButtons.js    # FB, Twitter, LinkedIn, WhatsApp, copy
│   │   ├── ReactionBar.js     # 5 reaction types
│   │   ├── CommentSection.js  # Threaded comments
│   │   └── BookmarkButton.js
│   ├── widgets/
│   │   ├── WeatherWidget.js
│   │   ├── StockTicker.js
│   │   ├── CurrencyConverter.js
│   │   └── SportsScores.js
│   ├── ads/
│   │   └── AdPlacement.js     # Hidden for premium users
│   └── common/
│       ├── PrivateRoute.js
│       ├── LoadingSpinner.js
│       └── ErrorBoundary.js
├── pages/
│   ├── Home.js                # Magazine homepage
│   ├── Article.js             # Full article with all enhancements
│   ├── Category.js            # Category page
│   ├── Search.js              # Advanced search with filters
│   ├── Saved.js               # Bookmarks page
│   ├── Profile.js             # User profile
│   ├── Notifications.js       # Notification history
│   ├── Premium.js             # Premium subscription page
│   ├── Forum.js               # Community forums
│   ├── Admin.js               # Admin CMS dashboard
│   ├── Login.js
│   ├── Register.js
│   └── NotFound.js
├── context/
│   ├── AuthContext.js
│   ├── ThemeContext.js        # Dark mode + font size
│   └── NewsContext.js
└── styles/                    # CSS per component
```

---

## Key Implementation Details

### WorldDay Branding
- Primary color: `#C41E3A` (deep red, like India Today)
- Secondary: `#1a1a2e` (dark navy)
- Accent: `#f5a623` (gold)
- Font: Inter for UI, Merriweather for article body

### Breaking News Ticker
- Polls `/api/news/breaking` every 60 seconds
- CSS marquee animation with pause-on-hover

### Live Blog
- Frontend polls `/api/news/:id/liveblog-updates` every 30 seconds
- Shows "New updates available" banner, user clicks to load

### Personalization
- Tracks category/country of articles read in localStorage + server
- Weights: category (40%), country (30%), tags (30%)
- Toggle between "For You" and "Top Stories"

### PWA
- `public/manifest.json` with WorldDay branding
- Service Worker caches last 20 articles for offline
- Install prompt shown after 3rd visit

### RSS Feeds
- Generated server-side using `rss` npm package
- Cached for 5 minutes, regenerated on new article

### Translation
- Uses LibreTranslate public API (free, no key needed)
- Fallback: display original with error message
- Language preference stored in localStorage + user profile

### Notifications
- Firebase FCM for push notifications
- In-app notifications stored in MongoDB
- Breaking news triggers notification to all subscribed users

### Premium / Paywall
- `isPremium` flag on User model
- Premium articles show teaser + paywall overlay for non-premium
- Premium users: no ads, exclusive content access

### Analytics
- Page views tracked via `POST /api/news/:id/view`
- Aggregated daily in MongoDB
- Admin dashboard shows charts using Chart.js

### CMS Rich Text Editor
- Uses `react-quill` (free, open source)
- Supports images, formatting, embeds
- Article scheduling via `scheduledAt` field + cron job

---

## Correctness Properties

1. **Authentication Integrity**: A JWT token issued to user A must never grant access to user B's protected resources
2. **Reaction Uniqueness**: A user can have at most one reaction per article at any time
3. **Comment Edit Window**: Comment edits must be rejected if `Date.now() - comment.createdAt > 15 minutes`
4. **Premium Ad Hiding**: If `user.isPremium === true`, zero ad components must render in the DOM
5. **Bookmark Idempotency**: Bookmarking an already-bookmarked article must not create duplicate entries
6. **Live Blog Ordering**: Live blog updates must always be returned in descending timestamp order
7. **Rate Limiting**: Public API must reject requests exceeding 1000/hour per API key with 429 status
8. **Suspended User Block**: A user with `isSuspended === true` must receive 401 on all authenticated endpoints
