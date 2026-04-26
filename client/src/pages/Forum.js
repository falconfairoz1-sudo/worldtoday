import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Forum.css';

const TOPICS = ['General', 'Politics', 'Technology', 'Sports', 'Entertainment', 'Business', 'Health', 'Science', 'World'];

export default function Forum() {
  const { user } = useContext(AuthContext);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', topic: 'General' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, [selectedTopic]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const params = selectedTopic ? { topic: selectedTopic } : {};
      const res = await api.get('/forum/threads', { params });
      setThreads(res.data || []);
    } catch (err) {
      console.error('Forum fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createThread = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/forum/threads', newThread);
      setThreads(prev => [res.data, ...prev]);
      setNewThread({ title: '', content: '', topic: 'General' });
      setShowCreate(false);
    } catch (err) {
      alert('Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>Community Forum - WorldToday</title></Helmet>
      <div className="forum-page">
        <div className="container">
          <div className="forum-header">
            <div>
              <h1 className="forum-title">💬 Community Forum</h1>
              <p className="forum-subtitle">Discuss news and share your views</p>
            </div>
            {user && (
              <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                + New Thread
              </button>
            )}
          </div>

          {/* Create Thread Form */}
          {showCreate && (
            <form onSubmit={createThread} className="forum-create-form">
              <h3>Create New Thread</h3>
              <select
                value={newThread.topic}
                onChange={e => setNewThread(p => ({ ...p, topic: e.target.value }))}
                className="forum-select"
                aria-label="Topic"
              >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="text"
                value={newThread.title}
                onChange={e => setNewThread(p => ({ ...p, title: e.target.value }))}
                placeholder="Thread title..."
                className="forum-input"
                maxLength={200}
                required
                aria-label="Thread title"
              />
              <textarea
                value={newThread.content}
                onChange={e => setNewThread(p => ({ ...p, content: e.target.value }))}
                placeholder="Share your thoughts..."
                className="forum-textarea"
                rows={4}
                required
                aria-label="Thread content"
              />
              <div className="forum-create-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Thread'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          )}

          {/* Topic Filter */}
          <div className="forum-topics">
            <button className={`filter-pill${!selectedTopic ? ' active' : ''}`} onClick={() => setSelectedTopic('')}>All Topics</button>
            {TOPICS.map(t => (
              <button key={t} className={`filter-pill${selectedTopic === t ? ' active' : ''}`} onClick={() => setSelectedTopic(t)}>{t}</button>
            ))}
          </div>

          {/* Threads */}
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : threads.length === 0 ? (
            <div className="forum-empty">
              <p>No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="forum-threads">
              {threads.map(thread => (
                <div key={thread._id} className={`forum-thread${thread.isPinned ? ' pinned' : ''}`}>
                  <div className="forum-thread__meta">
                    <span className="forum-thread__topic">{thread.topic}</span>
                    {thread.isPinned && <span className="badge badge-accent">📌 Pinned</span>}
                    {thread.isLocked && <span className="badge">🔒 Locked</span>}
                  </div>
                  <h3 className="forum-thread__title">{thread.title}</h3>
                  <p className="forum-thread__preview">{thread.content?.substring(0, 150)}...</p>
                  <div className="forum-thread__footer">
                    <span className="forum-thread__author">
                      By {thread.author?.name || 'Anonymous'}
                    </span>
                    <span className="forum-thread__replies">💬 {thread.replies?.length || 0} replies</span>
                    <span className="forum-thread__views">👁 {thread.views || 0} views</span>
                    <span className="forum-thread__time">{formatTimeAgo(thread.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}
