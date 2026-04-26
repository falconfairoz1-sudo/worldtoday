const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'editor', 'journalist'],
    default: 'user'
  },
  bio: { type: String, maxlength: 500 },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isSuspended: { type: Boolean, default: false },
  notificationPrefs: {
    breaking: { type: Boolean, default: true },
    categories: [String],
    countries: [String]
  },
  newsletterSubscriptions: [{
    type: { type: String, enum: ['daily', 'breaking', 'category'] },
    category: String,
    active: { type: Boolean, default: true }
  }],
  apiKey: String,
  country: {
    type: String,
    default: 'us'
  },
  language: {
    type: String,
    default: 'en'
  },
  preferences: {
    categories: [{ type: String }],
    sources: [{ type: String }],
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    language: { type: String, default: 'en' }
  },
  savedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  readingHistory: [{
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    readAt: {
      type: Date,
      default: Date.now
    },
    readTime: Number // in seconds
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiresAt: Date,
  fcmToken: String, // For push notifications
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user without sensitive data
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
