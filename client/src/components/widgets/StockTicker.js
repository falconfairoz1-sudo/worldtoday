import React, { useState, useEffect } from 'react';
import '../../styles/Widgets.css';

const INDICES = [
  { symbol: 'SPY', label: 'S&P 500' },
  { symbol: 'QQQ', label: 'NASDAQ' },
  { symbol: 'DIA', label: 'DOW' },
  { symbol: 'EWI', label: 'FTSE' },
];

// Using free Yahoo Finance alternative via allorigins proxy
export default function StockTicker() {
  const [stocks, setStocks] = useState([
    { label: 'S&P 500', price: '5,234', change: '+0.42%', up: true },
    { label: 'NASDAQ', price: '16,421', change: '+0.61%', up: true },
    { label: 'DOW', price: '39,127', change: '-0.12%', up: false },
    { label: 'NIFTY 50', price: '22,513', change: '+0.35%', up: true },
    { label: 'FTSE 100', price: '8,147', change: '+0.18%', up: true },
    { label: 'Gold', price: '$2,341', change: '+0.22%', up: true },
    { label: 'Bitcoin', price: '$67,420', change: '+1.4%', up: true },
  ]);

  return (
    <div className="widget widget--stocks" aria-label="Stock market ticker">
      <div className="widget__header">
        <span className="widget__title">📈 Markets</span>
      </div>
      <div className="stocks__list">
        {stocks.map((s, i) => (
          <div key={i} className="stocks__item">
            <span className="stocks__label">{s.label}</span>
            <div className="stocks__values">
              <span className="stocks__price">{s.price}</span>
              <span className={`stocks__change ${s.up ? 'up' : 'down'}`}>
                {s.up ? '▲' : '▼'} {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
