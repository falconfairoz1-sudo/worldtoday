import React, { useState, useEffect } from 'react';
import '../../styles/Widgets.css';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'AED'];

export default function CurrencyConverter() {
  const [rates, setRates] = useState({});
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => {
        if (data.rates) setRates(data.rates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (rates[from] && rates[to] && amount) {
      const usdAmount = parseFloat(amount) / (rates[from] || 1);
      setResult((usdAmount * rates[to]).toFixed(4));
    }
  }, [amount, from, to, rates]);

  return (
    <div className="widget widget--currency" aria-label="Currency converter">
      <div className="widget__header">
        <span className="widget__title">💱 Currency</span>
      </div>
      {loading ? (
        <div className="widget__loading">Loading rates...</div>
      ) : (
        <div className="currency__form">
          <div className="currency__row">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="currency__input"
              min="0"
              aria-label="Amount to convert"
            />
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="currency__select"
              aria-label="From currency"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="currency__arrow">⇅</div>
          <div className="currency__row">
            <div className="currency__result">{result || '—'}</div>
            <select
              value={to}
              onChange={e => setTo(e.target.value)}
              className="currency__select"
              aria-label="To currency"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <p className="currency__note">Rates updated daily</p>
        </div>
      )}
    </div>
  );
}
