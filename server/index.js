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

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('');
  console.error('🔧 Please add these to your .env file or Render environment variables');
  process.exit(1);
}

console.log('✅ Environment variables validated');

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

// Import routes with error handling
const routes = [
  { path: '/api/auth', file: './routes/auth' },
  { path: '/api/news', file: './routes/news' },
  { path: '/api/user', file: './routes/user' },
  { path: '/api/admin', file: './routes/admin' },
  { path: '/api/categories', file: './routes/category' },
  { path: '/api/comments', file: './routes/comment' },
  { path: '/api/countries', file: './routes/countries' },
  { path: '/api/reactions', file: './routes/reactions' },
  { path: '/api/notifications', file: './routes/notifications' },
  { path: '/api/rss', file: './routes/rss' },
  { path: '/api/translate', file: './routes/translate' },
  { path: '/api/newsletter', file: './routes/newsletter' },
  { path: '/api/forum', file: './routes/forum' },
  { path: '/sitemap.xml', file: './routes/sitemap' },
  { path: '/api/image-proxy', file: './routes/imageProxy' }
];

// Load routes safely
routes.forEach(({ path, file }) => {
  try {
    const route = require(file);
    app.use(path, route);
    console.log(`✅ Loaded route: ${path}`);
  } catch (error) {
    console.error(`❌ Failed to load route ${path}:`, error.message);
  }
});

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
  console.log('✅ Database connected successfully');
  
  // Start news aggregation
  try {
    newsAggregator.startAggregation();
    console.log('✅ News aggregator started');
  } catch (err) {
    console.warn('⚠️ News aggregator failed to start:', err.message);
  }

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WorldToday Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}).catch((error) => {
  console.error('❌ Failed to connect to database:', error.message);
  console.error('Full error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(() => process.exit(0));
});
