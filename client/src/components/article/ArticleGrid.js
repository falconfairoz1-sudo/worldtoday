import React from 'react';
import ArticleCard from './ArticleCard';
import '../../styles/ArticleGrid.css';

export default function ArticleGrid({ articles = [], layout = 'magazine' }) {
  if (!articles.length) return null;

  if (layout === 'magazine' && articles.length >= 3) {
    // Top row: 1 featured + 4 secondary = 5 columns, each from a different category
    const [featured, ...rest] = articles;
    const secondary = rest.slice(0, 4); // exactly 4 → total 5 columns in top row
    const remaining = rest.slice(4);    // everything else goes to the bottom grid

    return (
      <div className="article-grid article-grid--magazine">
        {/* Featured article - medium size, not huge */}
        <div className="article-grid__featured">
          <ArticleCard article={featured} size="medium" />
        </div>
        {/* Secondary articles - also medium */}
        <div className="article-grid__secondary">
          {secondary.map(a => (
            <ArticleCard key={a._id} article={a} size="medium" />
          ))}
        </div>
        {/* Remaining articles - small, fills the grid */}
        {remaining.length > 0 && (
          <div className="article-grid__remaining">
            {remaining.map(a => (
              <ArticleCard key={a._id} article={a} size="small" />
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
