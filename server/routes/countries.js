const express = require('express');
const router = express.Router();
const countries = require('../config/countries');

// @desc    Get all countries
// @route   GET /api/countries
// @access  Public
router.get('/', (req, res) => {
  res.json(countries);
});

// @desc    Get country by code
// @route   GET /api/countries/:code
// @access  Public
router.get('/:code', (req, res) => {
  const country = countries.find(c => c.code === req.params.code);
  if (country) {
    res.json(country);
  } else {
    res.status(404).json({ message: 'Country not found' });
  }
});

module.exports = router;
