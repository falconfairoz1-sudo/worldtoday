import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AuthStatus = () => {
  const { user, login, register, logout, loading } = useAuth();
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState('');

  const testLogin = async () => {
    setTestMode(true);
    setTestResults('Testing login...\n');
    
    try {
      // Test with a simple user
      await login('test@example.com', 'password123');
      setTestResults(prev => prev + '✅ Login successful!\n');
      toast.success('Test login successful!');
    } catch (error) {
      setTestResults(prev => prev + `❌ Login failed: ${error.message}\n`);
      setTestResults(prev => prev + `Error details: ${JSON.stringify(error.response?.data, null, 2)}\n`);
      toast.error('Test login failed');
    }
    
    setTestMode(false);
  };

  const testRegister = async () => {
    setTestMode(true);
    setTestResults('Testing registration...\n');
    
    try {
      const testEmail = `test${Date.now()}@example.com`;
      await register('Test User', testEmail, 'password123', 'us', 'en');
      setTestResults(prev => prev + '✅ Registration successful!\n');
      toast.success('Test registration successful!');
    } catch (error) {
      setTestResults(prev => prev + `❌ Registration failed: ${error.message}\n`);
      setTestResults(prev => prev + `Error details: ${JSON.stringify(error.response?.data, null, 2)}\n`);
      toast.error('Test registration failed');
    }
    
    setTestMode(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '300px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      fontSize: '14px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#007bff' }}>🔐 Auth Status</h4>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong> {loading ? '⏳ Loading...' : user ? '✅ Logged In' : '❌ Not Logged In'}
      </div>
      
      {user && (
        <div style={{ marginBottom: '12px', fontSize: '12px', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Country:</strong> {user.country}</div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={testRegister}
          disabled={testMode}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: testMode ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Test Register
        </button>
        
        <button
          onClick={testLogin}
          disabled={testMode}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: testMode ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Test Login
        </button>
        
        {user && (
          <button
            onClick={logout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        )}
      </div>
      
      {testResults && (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: '150px',
          overflow: 'auto'
        }}>
          {testResults}
        </div>
      )}
      
      <div style={{ fontSize: '10px', color: '#6c757d', marginTop: '8px' }}>
        Backend: https://worldtoday.onrender.com
      </div>
    </div>
  );
};

export default AuthStatus;