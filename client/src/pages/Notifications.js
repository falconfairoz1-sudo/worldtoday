import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import '../styles/Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <Helmet><title>Notifications - WorldToday</title></Helmet>
      <div className="notifications-page">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">🔔 Notifications {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}</h1>
            {unreadCount > 0 && (
              <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <span>🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(n => (
                <div
                  key={n._id}
                  className={`notification-item${n.isRead ? '' : ' unread'}`}
                  onClick={() => !n.isRead && markRead(n._id)}
                >
                  <div className="notification-item__icon">
                    {n.type === 'breaking' ? '🔴' : n.type === 'followed_journalist' ? '👤' : '📢'}
                  </div>
                  <div className="notification-item__body">
                    <p className="notification-item__title">{n.title}</p>
                    {n.message && <p className="notification-item__message">{n.message}</p>}
                    <span className="notification-item__time">{formatTimeAgo(n.createdAt)}</span>
                  </div>
                  {n.articleId && (
                    <Link to={`/article/${n.articleId}`} className="notification-item__link" onClick={e => e.stopPropagation()}>
                      Read →
                    </Link>
                  )}
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
