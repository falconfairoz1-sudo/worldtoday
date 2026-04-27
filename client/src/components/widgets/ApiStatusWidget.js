import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function ApiStatusWidget() {
  const [status, setStatus] = useState('Checking...');
  const [apiUrl, setApiUrl] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    const currentApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    setApiUrl(currentApiUrl);
    setLastCheck(new Date());

    try {
      const response = await api.get('/news?limit=1');
      if (response.data) {
        setStatus('Online');
        setIsOnline(true);
      } else {
        setStatus('No Data');
        setIsOnline(false);
      }
    } catch (err) {
      setStatus('Offline');
      setIsOnline(false);
    }
  };

  const getStatusColor = () => {
    if (isOnline) return '#22c55e'; // green
    return '#ef4444'; // red
  };

  const getStatusIcon = () => {
    if (isOnline) return '✅';
    return '❌';
  };

  return (
    <div className="widget">
      <div className="widget__header">
        <span className="widget__title">🔧 API Status</span>
      </div>
      <div style={{ padding: '12px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>{getStatusIcon()}</span>
          <span style={{ 
            color: getStatusColor(), 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {status}
          </span>
        </div>
        
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
          <strong>Endpoint:</strong><br />
          {apiUrl.replace('https://', '').replace('http://', '').substring(0, 25)}...
        </div>
        
        {lastCheck && (
          <div style={{ fontSize: '10px', color: '#888' }}>
            Last check: {lastCheck.toLocaleTimeString()}
          </div>
        )}
        
        <button 
          onClick={checkApiStatus}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}