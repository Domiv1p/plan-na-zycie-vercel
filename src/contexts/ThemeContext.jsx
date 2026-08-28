import React, { createContext, useState, useEffect, useContext } from 'react';
import { applyTheme, THEME_NAMES } from '../utils/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('purple');

  useEffect(() => {
    const savedTheme = localStorage.getItem('pnz-theme') || 'purple';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('pnz-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeName: THEME_NAMES[theme] || THEME_NAMES.purple }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
