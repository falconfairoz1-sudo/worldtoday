import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const NewsContext = createContext();

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within NewsProvider');
  }
  return context;
};

export const NewsProvider = ({ children }) => {
  const [country, setCountry] = useState(() => {
    return localStorage.getItem('country') || 'us';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [categories] = useState([
    { id: 'all', name: 'All News' },
    { id: 'politics', name: 'Politics' },
    { id: 'technology', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'health', name: 'Health' },
    { id: 'science', name: 'Science' }
  ]);

  const [countries] = useState([
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'in', name: 'India', flag: '🇮🇳' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'de', name: 'Germany', flag: '🇩🇪' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'jp', name: 'Japan', flag: '🇯🇵' },
    { code: 'cn', name: 'China', flag: '🇨🇳' },
    { code: 'br', name: 'Brazil', flag: '🇧🇷' }
  ]);

  useEffect(() => {
    localStorage.setItem('country', country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Auto-detect user location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await axios.get('https://ipapi.co/json/');
        const countryCode = res.data.country_code.toLowerCase();
        if (countries.find(c => c.code === countryCode)) {
          setCountry(countryCode);
        }
      } catch (error) {
        console.log('Location detection failed, using default');
      }
    };

    if (!localStorage.getItem('country')) {
      detectLocation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    country,
    setCountry,
    language,
    setLanguage,
    categories,
    countries
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};
