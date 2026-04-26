import React, { useState, useEffect, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Admin.css';

const TABS = ['Articles', 'Create Article', 'Users', 'Analytics'];

export default function Admin() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('Articles');
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'Articles') fetchArticles();
    if (activeTab === 'Users') fetchUsers();
    if (activeTab === 'Analytics') fetchAnalytics();
  }, [activeTab]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news', { params: { limit: 20 } });
      setArticles(res.data?.articles || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const suspendUser = async (userId, isSuspended) => {
    try {
      await api.put(`/admin/users/${userId}/suspend`, { isSuspended: !isSuspended });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: !isSuspended } : u));
    } catch (err) { alert('Failed to update user'); }
  };

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
    } catch (err) { alert('Failed to update role'); }
  };

  return (
    <>
      <Helmet><title>Admin Panel - WorldToday</title></Helmet>
      <div className="admin-page">
        <div className="container">
          <div className="admin-header">
            <h1 className="admin-title">⚙️ Admin Panel</h1>
            <span className="admin-role">{user?.role?.toUpperCase()}</span>
          </div>

          {/* Tabs */}
          <div className="admin-tabs" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`admin-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Articles Tab */}
          {activeTab === 'Articles' && (
            <div className="admin-section">
              <h2 className="admin-section-title">Articles ({articles.length})</h2>
              {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Country</th>
                        <th>Views</th>
                        <th>Published</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map(article => (
                        <tr key={article._id}>
                          <td className="admin-table__title">{article.title?.substring(0, 60)}...</td>
                          <td><span className="badge badge-primary">{article.category}</span></td>
                          <td>{article.country?.toUpperCase()}</td>
                          <td>{article.views || 0}</td>
                          <td>{new Date(article.publishedAt).toLocaleDateString()}</td>
                          <td>
                            <a href={`/article/${article._id}`} target="_blank" rel="noreferrer" className="admin-action-btn">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create Article Tab */}
          {activeTab === 'Create Article' && <CreateArticleForm />}

          {/* Users Tab */}
          {activeTab === 'Users' && (
            <div className="admin-section">
              <h2 className="admin-section-title">Users ({users.length})</h2>
              {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Premium</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className={u.isSuspended ? 'admin-table__row--suspended' : ''}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={e => changeRole(u._id, e.target.value)}
                              className="admin-role-select"
                              aria-label={`Change role for ${u.name}`}
                            >
                              <option value="user">User</option>
                              <option value="journalist">Journalist</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>{u.isPremium ? '⭐ Yes' : 'No'}</td>
                          <td>
                            <span className={`admin-status ${u.isSuspended ? 'suspended' : 'active'}`}>
                              {u.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`admin-action-btn ${u.isSuspended ? 'restore' : 'suspend'}`}
                              onClick={() => suspendUser(u._id, u.isSuspended)}
                            >
                              {u.isSuspended ? 'Restore' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'Analytics' && (
            <div className="admin-section">
              <h2 className="admin-section-title">Analytics</h2>
              {loading ? <div className="loading-spinner"><div className="spinner" /></div> : analytics ? (
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <span className="analytics-card__icon">📰</span>
                    <div className="analytics-card__value">{analytics.totalArticles?.toLocaleString() || 0}</div>
                    <div className="analytics-card__label">Total Articles</div>
                  </div>
                  <div className="analytics-card">
                    <span className="analytics-card__icon">👥</span>
                    <div className="analytics-card__value">{analytics.totalUsers?.toLocaleString() || 0}</div>
                    <div className="analytics-card__label">Total Users</div>
                  </div>
                  <div className="analytics-card">
                    <span className="analytics-card__icon">👁</span>
                    <div className="analytics-card__value">{analytics.totalViews?.toLocaleString() || 0}</div>
                    <div className="analytics-card__label">Total Views</div>
                  </div>
                  <div className="analytics-card">
                    <span className="analytics-card__icon">💬</span>
                    <div className="analytics-card__value">{analytics.totalComments?.toLocaleString() || 0}</div>
                    <div className="analytics-card__label">Total Comments</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted">Analytics data unavailable</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CreateArticleForm() {
  const [form, setForm] = useState({
    title: '', description: '', content: '', category: 'general',
    country: 'us', format: 'text', section: 'news',
    isBreaking: false, isPremium: false, urlToImage: '', author: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/articles', { ...form, publishedAt: new Date() });
      setSuccess(true);
      setForm({ title: '', description: '', content: '', category: 'general', country: 'us', format: 'text', section: 'news', isBreaking: false, isPremium: false, urlToImage: '', author: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create article');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Create Article</h2>
      {success && <div className="admin-success">✅ Article created successfully!</div>}
      <form onSubmit={handleSubmit} className="create-article-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className="form-input" placeholder="Article title" />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input type="text" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} className="form-input" placeholder="Author name" />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="form-input" placeholder="Brief description" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="form-select">
              {['general','politics','business','technology','sports','entertainment','health','science'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Format</label>
            <select value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))} className="form-select">
              {['text','video','gallery','infographic','liveblog','podcast','webstory','poll','quiz'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Section</label>
            <select value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} className="form-select">
              {['news','opinion','factcheck','investigative','special','podcast','webstory'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Country</label>
            <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="form-input" placeholder="us, in, gb..." />
          </div>
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input type="url" value={form.urlToImage} onChange={e => setForm(p => ({ ...p, urlToImage: e.target.value }))} className="form-input" placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>Content *</label>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required className="form-textarea" rows={10} placeholder="Article content (HTML supported)" />
        </div>
        <div className="form-checkboxes">
          <label className="form-checkbox">
            <input type="checkbox" checked={form.isBreaking} onChange={e => setForm(p => ({ ...p, isBreaking: e.target.checked }))} />
            🔴 Breaking News
          </label>
          <label className="form-checkbox">
            <input type="checkbox" checked={form.isPremium} onChange={e => setForm(p => ({ ...p, isPremium: e.target.checked }))} />
            ⭐ Premium Only
          </label>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting ? 'Publishing...' : 'Publish Article'}
        </button>
      </form>
    </div>
  );
}
