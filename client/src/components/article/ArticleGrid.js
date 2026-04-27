import React from 'react';
import ArticleCard from './ArticleCard';
import '../../styles/ArticleGrid.css';

export default function ArticleGrid({ articles = [], layout = 'magazine' }) {
  if (!articles.length) return null;

  if (layout === 'magazine' && articles.length >= 5) {
    // Top 5 articles in a single row (desktop layout)
    const topFive = articles.slice(0, 5);
    const remaining = articles.slice(5);

    return (
      <div className="article-grid article-grid--magazine">
        {/* Top 5 articles in single row */}
        <div className="article-grid__top-row">
          {topFive.map(article => (
            <ArticleCard key={article._id} article={article} size="medium" />
          ))}
        </div>
        {/* Remaining articles in grid below */}
        {remaining.length > 0 && (
          <div className="article-grid__remaining">
            {remaining.map(article => (
              <ArticleCard key={article._id} article={article} size="small" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="article-grid article-grid--grid">
        {articles.map(a => (
          <ArticleCard key={a._id} article={a} size="medium" />
        ))}
      </div>
    );
  }

  // List layout
  return (
    <div className="article-grid article-grid--list">
      {articles.map(a => (
        <ArticleCard key={a._id} article={a} size="small" />
      ))}
    </div>
  );
}
