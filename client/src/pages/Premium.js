import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Premium.css';

const FEATURES = [
  { icon: '🚫', label: 'Ad-free experience' },
  { icon: '⭐', label: 'Exclusive premium articles' },
  { icon: '📧', label: 'Priority newsletter' },
  { icon: '🔔', label: 'Instant breaking news alerts' },
  { icon: '📱', label: 'Offline reading (PWA)' },
  { icon: '🌐', label: 'Unlimited translations' },
  { icon: '📊', label: 'Advanced analytics' },
  { icon: '💬', label: 'Priority comment visibility' },
];

export default function Premium() {
  const { user, updateUser } = useContext(AuthContext);

  const handleSubscribe = async (plan) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      await api.post('/user/subscribe', { plan });
      updateUser({ isPremium: true });
      alert('🎉 Premium activated! Enjoy WorldToday Premium.');
    } catch (err) {
      alert('Failed to activate premium. Please try again.');
    }
  };

  if (user?.isPremium) {
    return (
      <div className="premium-page">
        <div className="container">
          <div className="premium-active">
            <span className="premium-active__icon">⭐</span>
            <h2>You're a Premium Member!</h2>
            <p>Enjoy all WorldToday Premium features.</p>
            {user.premiumExpiresAt && (
              <p className="premium-active__expiry">
                Valid until: {new Date(user.premiumExpiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>WorldToday Premium - Ad-free News Experience</title>
      </Helmet>
      <div className="premium-page">
        <div className="container">
          <div className="premium-hero">
            <span className="premium-hero__badge">⭐ PREMIUM</span>
            <h1 className="premium-hero__title">Experience WorldToday Without Limits</h1>
            <p className="premium-hero__subtitle">Ad-free, exclusive content, and more</p>
          </div>

          <div className="premium-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="premium-feature">
                <span className="premium-feature__icon">{f.icon}</span>
                <span className="premium-feature__label">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="premium-plans">
            <div className="premium-plan">
              <div className="premium-plan__header">
                <h3>Monthly</h3>
                <div className="premium-plan__price">
                  <span className="premium-plan__amount">₹99</span>
                  <span className="premium-plan__period">/month</span>
                </div>
              </div>
              <ul className="premium-plan__features">
                <li>✓ All premium features</li>
                <li>✓ Cancel anytime</li>
                <li>✓ Instant activation</li>
              </ul>
              <button className="btn btn-outline btn-lg" onClick={() => handleSubscribe('monthly')} style={{ width: '100%' }}>
                Subscribe Monthly
              </button>
            </div>

            <div className="premium-plan premium-plan--featured">
              <div className="premium-plan__badge">Best Value</div>
              <div className="premium-plan__header">
                <h3>Annual</h3>
                <div className="premium-plan__price">
                  <span className="premium-plan__amount">₹799</span>
                  <span className="premium-plan__period">/year</span>
                </div>
                <p className="premium-plan__savings">Save 33%</p>
              </div>
              <ul className="premium-plan__features">
                <li>✓ All premium features</li>
                <li>✓ Priority support</li>
                <li>✓ Exclusive newsletters</li>
                <li>✓ Early access to new features</li>
              </ul>
              <button className="btn btn-primary btn-lg" onClick={() => handleSubscribe('annual')} style={{ width: '100%' }}>
                Subscribe Annual
              </button>
            </div>
          </div>

          <p className="premium-disclaimer">
            * This is a demo subscription. No actual payment is processed.
          </p>
        </div>
      </div>
    </>
  );
}
