const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const dns = require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);

// Load .env from parent directory (root)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/category');
const commentRoutes = require('./routes/comment');
const countriesRoutes = require('./routes/countries');
const reactionsRoutes = require('./routes/reactions');
const notificationsRoutes = require('./routes/notifications');
const rssRoutes = require('./routes/rss');
const translateRoutes = require('./routes/translate');
const newsletterRoutes = require('./routes/newsletter');
const forumRoutes = require('./routes/forum');
const sitemapRoutes = require('./routes/sitemap');
const imageProxyRoutes = require('./routes/imageProxy');

// Import services
const newsAggregator = require('./services/newsAggregator');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.io for real-time notifications
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration for multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://worldtoday.vercel.app',
  'https://worldtoday-git-main-falconfairoz1-sudo.vercel.app',
  'https://worldtoday-falconfairoz1-sudo.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// TODO: Install compression package for better performance
// Run: cd server && npm install compression
// Then uncomment the lines below:
/*
const compression = require('compression');
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));
*/

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/rss', rssRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/forum', forumRoutes);
app.use('/sitemap.xml', sitemapRoutes);
app.use('/api/image-proxy', imageProxyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'WorldToday Backend API', 
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      news: '/api/news'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Connect to DB then start server
connectDB().then(() => {
  newsAggregator.startAggregation();

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 WorldToday Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(() => process.exit(0));
});
