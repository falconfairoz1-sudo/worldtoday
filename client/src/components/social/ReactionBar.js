import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../styles/ReactionBar.css';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
];

export default function ReactionBar({ articleId, initialReactions = {}, userReaction: initialUserReaction = null }) {
  const { user } = useContext(AuthContext);
  const [reactions, setReactions] = useState(initialReactions);
  const [userReaction, setUserReaction] = useState(initialUserReaction);
  const [loading, setLoading] = useState(false);

  const handleReaction = async (type) => {
    if (!user) {
      alert('Please login to react to articles');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      if (userReaction === type) {
        // Remove reaction
        await api.delete(`/reactions/${articleId}`);
        setReactions(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) - 1) }));
        setUserReaction(null);
      } else {
        // Add or change reaction
        await api.post(`/reactions/${articleId}`, { type });
        setReactions(prev => {
          const updated = { ...prev };
          if (userReaction) updated[userReaction] = Math.max(0, (updated[userReaction] || 0) - 1);
          updated[type] = (updated[type] || 0) + 1;
          return updated;
        });
        setUserReaction(type);
      }
    } catch (err) {
      console.error('Reaction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = Object.values(reactions).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="reaction-bar" aria-label="Article reactions">
      <div className="reaction-bar__reactions">
        {REACTIONS.map(r => (
          <button
            key={r.type}
            className={`reaction-btn${userReaction === r.type ? ' active' : ''}`}
            onClick={() => handleReaction(r.type)}
            aria-label={`${r.label}: ${reactions[r.type] || 0}`}
            aria-pressed={userReaction === r.type}
            disabled={loading}
            title={r.label}
          >
            <span className="reaction-btn__emoji">{r.emoji}</span>
            <span className="reaction-btn__count">{reactions[r.type] || 0}</span>
          </button>
        ))}
      </div>
      {total > 0 && (
        <span className="reaction-bar__total">{total} reaction{total !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
}
