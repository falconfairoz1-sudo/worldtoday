import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/BreakingNewsTicker.css';

export default function BreakingNewsTicker() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBreaking = async () => {
    try {
      const res = await api.get('/news/breaking', { 
        params: { limit: 30 } // Fetch more to ensure diversity
      });
      const articles = res.data?.articles || res.data || [];
      
      // Prioritize articles WITH images, but include all
      const articlesWithImages = articles.filter(article => 
        article.urlToImage && article.urlToImage.trim() !== ''
      );
      const articlesWithoutImages = articles.filter(article => 
        !article.urlToImage || article.urlToImage.trim() === ''
      );
      
      // Ensure category diversity - pick one from each category
      const categories = ['politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];
      const diverseArticles = [];
      const usedCategories = new Set();
      
      // First pass: Get one article WITH IMAGE from each category
      for (const article of articlesWithImages) {
        const category = article.category?.toLowerCase();
        if (category && categories.includes(category) && !usedCategories.has(category)) {
          diverseArticles.push(article);
          usedCategories.add(category);
          if (diverseArticles.length >= 8) break;
        }
      }
      
      // Second pass: Fill with articles WITHOUT images if needed
      if (diverseArticles.length < 8) {
        for (const article of articlesWithoutImages) {
          const category = article.category?.toLowerCase();
          if (category && categories.includes(category) && !usedCategories.has(category)) {
            diverseArticles.push(article);
            usedCategories.add(category);
            if (diverseArticles.length >= 8) break;
          }
        }
      }
      
      // Third pass: Fill remaining slots with any articles
      if (diverseArticles.length < 8) {
        const allArticles = [...articlesWithImages, ...articlesWithoutImages];
        for (const article of allArticles) {
          if (!diverseArticles.includes(article)) {
            diverseArticles.push(article);
            if (diverseArticles.length >= 8) break;
          }
        }
      }
      
      setHeadlines(diverseArticles);
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreaking();
    // Increased interval from 60s to 5 minutes to reduce API calls
    const interval = setInterval(fetchBreaking, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !headlines.length) return null;

  return (
    <div className="breaking-ticker" role="marquee" aria-label="Breaking news ticker">
      <div className="breaking-ticker__label">
        <span className="badge badge-breaking">BREAKING</span>
      </div>
      <div className="breaking-ticker__track">
        <div className="breaking-ticker__inner">
          {[...headlines, ...headlines].map((article, i) => (
            <Link
              key={`${article._id}-${i}`}
              to={`/article/${article._id}`}
              className="breaking-ticker__item"
            >
              <span className="breaking-ticker__dot">●</span>
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
