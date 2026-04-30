import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../styles/CommentSection.css';

export default function CommentSection({ articleId }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchComments();
  }, [articleId, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${articleId}?sort=${sortOrder}`);
      setComments(res.data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/comments/${articleId}`, { content: newComment.trim() });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  return (
    <section className="comment-section" aria-label="Comments">
      <div className="comment-section__header">
        <h3 className="comment-section__title">
          💬 Comments ({comments.length})
        </h3>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="comment-section__sort"
          aria-label="Sort comments"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={submitComment} className="comment-form">
          <div className="comment-form__avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="comment-form__input-wrapper">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="comment-form__textarea"
              rows={3}
              maxLength={1000}
              aria-label="Write a comment"
            />
            <div className="comment-form__footer">
              <span className="comment-form__count">{newComment.length}/1000</span>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link to="/login" className="btn btn-outline">Login to comment</Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : comments.length === 0 ? (
        <p className="comment-section__empty">Be the first to comment!</p>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              articleId={articleId}
              currentUser={user}
              onDelete={deleteComment}
              depth={0}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentItem({ comment, articleId, currentUser, onDelete, depth }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replies, setReplies] = useState(comment.replies || []);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = currentUser?._id === comment.author?._id &&
    (Date.now() - new Date(comment.createdAt).getTime()) < 15 * 60 * 1000;

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting || depth >= 2) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/comments/${articleId}`, {
        content: replyText.trim(),
        parentComment: comment._id
      });
      setReplies(prev => [...prev, res.data]);
      setReplyText('');
      setReplying(false);
    } catch (err) {
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      await api.put(`/comments/${comment._id}`, { content: editText.trim() });
      comment.content = editText.trim();
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  return (
    <div className={`comment comment--depth-${depth}`}>
      <div className="comment__avatar">
        {comment.author?.avatar ? (
          <img src={comment.author.avatar} alt={comment.author.name} />
        ) : (
          <span>{comment.author?.name?.charAt(0).toUpperCase() || '?'}</span>
        )}
      </div>
      <div className="comment__body">
        <div className="comment__header">
          <span className="comment__author">{comment.author?.name || 'Anonymous'}</span>
          <span className="comment__time">{formatTimeAgo(comment.createdAt)}</span>
          {comment.isEdited && <span className="comment__edited">(edited)</span>}
        </div>

        {editing ? (
          <form onSubmit={submitEdit} className="comment__edit-form">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="comment-form__textarea"
              rows={2}
              aria-label="Edit comment"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
              <button type="button" className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <p className="comment__content">{comment.content}</p>
        )}

        <div className="comment__actions">
          {depth < 2 && currentUser && (
            <button className="comment__action-btn" onClick={() => setReplying(!replying)}>
              ↩ Reply
            </button>
          )}
          {canEdit && !editing && (
            <button className="comment__action-btn" onClick={() => setEditing(true)}>
              ✏️ Edit
            </button>
          )}
          {currentUser?._id === comment.author?._id && (
            <button className="comment__action-btn comment__action-btn--delete" onClick={() => onDelete(comment._id)}>
              🗑 Delete
            </button>
          )}
        </div>

        {replying && (
          <form onSubmit={submitReply} className="comment-form comment-form--reply">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="comment-form__textarea"
              rows={2}
              autoFocus
              aria-label="Write a reply"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!replyText.trim() || submitting}>
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => setReplying(false)}>Cancel</button>
            </div>
          </form>
        )}

        {replies.length > 0 && (
          <div className="comment__replies">
            {replies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                articleId={articleId}
                currentUser={currentUser}
                onDelete={onDelete}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}
