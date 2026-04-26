import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Profile.css';

const CATEGORIES = ['politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    categories: user?.preferences?.categories || [],
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/user/profile', { name: form.name, bio: form.bio });
      await api.put('/user/preferences', { categories: form.categories });
      updateUser({ name: form.name, bio: form.bio });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  return (
    <>
      <Helmet><title>Profile - WorldToday</title></Helmet>
      <div className="profile-page">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-badges">
                <span className={`badge badge-${user?.role === 'admin' ? 'primary' : 'accent'}`}>
                  {user?.role?.toUpperCase()}
                </span>
                {user?.isPremium && <span className="badge badge-accent">⭐ Premium</span>}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            {['profile', 'preferences', 'account'].map(tab => (
              <button
                key={tab}
                className={`profile-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="form-input"
                  required
                  aria-label="Display name"
                />
              </div>
              <div className="form-group">
                <label>Bio <span className="form-hint">({form.bio.length}/500)</span></label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value.substring(0, 500) }))}
                  className="form-textarea"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  aria-label="Bio"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email} disabled className="form-input form-input--disabled" />
                <span className="form-hint">Email cannot be changed</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Preferred Categories</label>
                <div className="profile-categories">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="profile-category-toggle">
                      <input
                        type="checkbox"
                        checked={form.categories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        aria-label={`Toggle ${cat}`}
                      />
                      <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="profile-account">
              <div className="profile-account-card">
                <h3>Subscription</h3>
                {user?.isPremium ? (
                  <div>
                    <p className="profile-premium-active">⭐ Premium Member</p>
                    {user.premiumExpiresAt && (
                      <p className="form-hint">Valid until: {new Date(user.premiumExpiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="form-hint">Upgrade to Premium for ad-free experience and exclusive content.</p>
                    <Link to="/premium" className="btn btn-primary" style={{ marginTop: 12 }}>Upgrade to Premium</Link>
                  </div>
                )}
              </div>
              <div className="profile-account-card">
                <h3>Quick Links</h3>
                <div className="profile-quick-links">
                  <Link to="/saved" className="profile-quick-link">🔖 Saved Articles</Link>
                  <Link to="/history" className="profile-quick-link">📖 Reading History</Link>
                  <Link to="/notifications" className="profile-quick-link">🔔 Notifications</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
