const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const crypto = require('crypto');

// Subscribe
router.post('/subscribe', async (req, res) => {
  try {
    const { email, subscriptions = [{ type: 'daily' }] } = req.body;

    if (!email) return res.status(400).json({ message: 'Email required' });

    let newsletter = await Newsletter.findOne({ email });
    if (newsletter) {
      newsletter.subscriptions = subscriptions;
      await newsletter.save();
      return res.json({ message: 'Subscription updated' });
    }

    const confirmToken = crypto.randomBytes(32).toString('hex');
    newsletter = await Newsletter.create({ email, subscriptions, confirmToken });

    // In production, send confirmation email here
    res.json({ message: 'Subscribed! Check your email to confirm.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm subscription
router.get('/confirm/:token', async (req, res) => {
  try {
    const newsletter = await Newsletter.findOneAndUpdate(
      { confirmToken: req.params.token },
      { isConfirmed: true, confirmToken: null },
      { new: true }
    );
    if (!newsletter) return res.status(404).json({ message: 'Invalid token' });
    res.json({ message: 'Subscription confirmed!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsubscribe
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const newsletter = await Newsletter.findOneAndUpdate(
      { unsubscribeToken: req.params.token },
      { 'subscriptions.$[].active': false },
      { new: true }
    );
    if (!newsletter) return res.status(404).json({ message: 'Invalid token' });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
