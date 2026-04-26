import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('worldtoday_darkmode') === 'true';
  });

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('worldtoday_fontsize') || 'medium';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('worldtoday_darkmode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-fontsize', fontSize);
    localStorage.setItem('worldtoday_fontsize', fontSize);
  }, [fontSize]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const setFontSize = (size) => {
    if (['small', 'medium', 'large'].includes(size)) {
      setFontSizeState(size);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}
