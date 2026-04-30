import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      // Load bookmarks
      const bookmarksRes = await api.get('/user/bookmarks');
      const bookmarkIds = (bookmarksRes.data || []).map(a => a._id || a);
      setBookmarks(bookmarkIds);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = res.data;
      
      if (!newToken) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData || res.data);
      
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, country, language) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, country, language });
      
      const { token: newToken, user: userData } = res.data;
      
      if (!newToken) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData || res.data);
      
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setBookmarks([]);
  };

  const toggleBookmark = async (articleId) => {
    if (!user) return;
    const isBookmarked = bookmarks.includes(articleId);
    try {
      if (isBookmarked) {
        await api.delete(`/user/bookmark/${articleId}`);
        setBookmarks(prev => prev.filter(id => id !== articleId));
      } else {
        await api.post(`/user/bookmark/${articleId}`);
        setBookmarks(prev => [...prev, articleId]);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    loading,
    bookmarks,
    login,
    register,
    logout,
    toggleBookmark,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isJournalist: user?.role === 'journalist' || user?.role === 'admin',
    isPremium: user?.isPremium
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
