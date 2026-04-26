const mongoose = require('mongoose');
const crypto = require('crypto');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscriptions: [{
    type: { type: String, enum: ['daily', 'breaking', 'category'], default: 'daily' },
    category: String,
    active: { type: Boolean, default: true }
  }],
  confirmToken: String,
  isConfirmed: { type: Boolean, default: false },
  unsubscribeToken: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex')
  }
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
