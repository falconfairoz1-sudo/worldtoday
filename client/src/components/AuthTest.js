import React, { useState } from 'react';
import api from '../utils/api';

const AuthTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, { test, success, message, data, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    // Test 1: Backend Health Check
    try {
      const response = await fetch('https://worldtoday.onrender.com/health');
      const data = await response.json();
      addResult('Backend Health', true, `Backend is running: ${data.status}`, data);
    } catch (error) {
      addResult('Backend Health', false, `Backend unreachable: ${error.message}`);
    }

    // Test 2: API Root Endpoint
    try {
      const response = await fetch('https://worldtoday.onrender.com/');
      const data = await response.json();
      addResult('API Root', true, `API root accessible: ${data.message}`, data);
    } catch (error) {
      addResult('API Root', false, `API root failed: ${error.message}`);
    }

    // Test 3: Auth Register Endpoint
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpass123',
        country: 'us',
        language: 'en'
      };

      const response = await api.post('/auth/register', testUser);
      addResult('Register Test', true, 'Registration successful', response.data);

      // Test 4: Login with the same user
      try {
        const loginResponse = await api.post('/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        addResult('Login Test', true, 'Login successful', loginResponse.data);

        // Test 5: Get user profile
        if (loginResponse.data.token) {
          try {
            const profileResponse = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${loginResponse.data.token}` }
            });
            addResult('Profile Test', true, 'Profile fetch successful', profileResponse.data);
          } catch (error) {
            addResult('Profile Test', false, `Profile fetch failed: ${error.message}`);
          }
        }
      } catch (error) {
        addResult('Login Test', false, `Login failed: ${error.response?.data?.message || error.message}`);
      }
    } catch (error) {
      addResult('Register Test', false, `Registration failed: ${error.response?.data?.message || error.message}`);
    }

    setTesting(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '20px', 
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3>🔐 Auth System Test</h3>
      <button 
        onClick={runTests} 
        disabled={testing}
        style={{
          background: testing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        {testing ? 'Testing...' : 'Run Auth Tests'}
      </button>

      <div style={{ fontSize: '12px' }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '8px', 
              padding: '8px', 
              background: result.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}
          >
            <strong>{result.success ? '✅' : '❌'} {result.test}</strong>
            <div>{result.message}</div>
            {result.data && (
              <details style={{ marginTop: '4px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '11px' }}>View Data</summary>
                <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthTest;