import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NewsProvider } from './context/NewsContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import SourcesSidebar from './components/layout/SourcesSidebar';

const Home          = lazy(() => import('./pages/Home'));
const Article       = lazy(() => import('./pages/Article'));
const Category      = lazy(() => import('./pages/Category'));
const Search        = lazy(() => import('./pages/Search'));
const Saved         = lazy(() => import('./pages/Saved'));
const History       = lazy(() => import('./pages/History'));
const Profile       = lazy(() => import('./pages/Profile'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Admin         = lazy(() => import('./pages/Admin'));
const NotFound      = lazy(() => import('./pages/NotFound'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Premium       = lazy(() => import('./pages/Premium'));
const Forum         = lazy(() => import('./pages/Forum'));
const Sources       = lazy(() => import('./pages/Sources'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="spinner" />
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <NewsProvider>
              <a href="#main-content" className="skip-to-content">Skip to main content</a>
              <div className="app">
                <Navbar />
                <SourcesSidebar />
                <main className="main-content" id="main-content">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/"                   element={<Home />} />
                      <Route path="/article/:id"        element={<Article />} />
                      <Route path="/category/:category" element={<Category />} />
                      <Route path="/section/:category"  element={<Category />} />
                      <Route path="/search"             element={<Search />} />
                      <Route path="/login"              element={<Login />} />
                      <Route path="/register"           element={<Register />} />
                      <Route path="/premium"            element={<Premium />} />
                      <Route path="/forum"              element={<Forum />} />
                      <Route path="/sources"            element={<Sources />} />
                      <Route path="/saved"              element={<PrivateRoute><Saved /></PrivateRoute>} />
                      <Route path="/history"            element={<PrivateRoute><History /></PrivateRoute>} />
                      <Route path="/profile"            element={<PrivateRoute><Profile /></PrivateRoute>} />
                      <Route path="/notifications"      element={<PrivateRoute><Notifications /></PrivateRoute>} />
                      <Route path="/admin"              element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
                      <Route path="*"                   element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <ToastContainer position="top-right" autoClose={3000} />
              </div>
            </NewsProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
}
