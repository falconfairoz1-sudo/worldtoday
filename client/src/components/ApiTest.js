import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function ApiTest() {
  const [status, setStatus] = useState('Testing...');
  const [apiUrl, setApiUrl] = useState('');
  const [newsData, setNewsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testApi();
  }, []);

  const testApi = async () => {
    const currentApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    setApiUrl(currentApiUrl);

    try {
      // Test 1: Basic API connection
      setStatus('Testing API connection...');
      const response = await api.get('/news?limit=5');
      
      if (response.data) {
        setStatus('✅ API Connected Successfully!');
        setNewsData(response.data);
      } else {
        setStatus('❌ API returned empty data');
      }
    } catch (err) {
      setStatus('❌ API Connection Failed');
      setError(err.message);
      console.error('API Test Error:', err);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4>API Debug Info</h4>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <p><strong>Status:</strong> {status}</p>
      {error && <p style={{color: 'red'}}><strong>Error:</strong> {error}</p>}
      {newsData && (
        <div>
          <p><strong>Articles Found:</strong> {newsData.articles?.length || 0}</p>
          {newsData.articles?.[0] && (
            <p><strong>First Article:</strong> {newsData.articles[0].title?.substring(0, 50)}...</p>
          )}
        </div>
      )}
      <button onClick={testApi} style={{marginTop: '5px'}}>Retry Test</button>
    </div>
  );
}