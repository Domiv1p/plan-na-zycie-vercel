import React from 'react';
import { motion } from 'framer-motion';
import { THEMES, THEME_NAMES, THEME_EMOJIS } from '../utils/themes';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.keys(THEMES).map((themeKey) => {
        const isActive = theme === themeKey;
        const currentThemeColors = THEMES[themeKey];

        return (
          <motion.button
            key={themeKey}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(themeKey)}
            className={`relative p-4 rounded-2xl flex flex-col items-center gap-3 bg-[var(--glass-bg)] backdrop-blur-md transition-all ${
              isActive 
                ? 'border-2 border-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]' 
                : 'border border-[var(--glass-border)] hover:border-[var(--text-muted)]'
            }`}
            style={{
              '--local-accent': currentThemeColors['--accent'],
              '--local-bright': currentThemeColors['--accent-bright'],
            }}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme-check"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs shadow-lg z-10"
              >
                ✓
              </motion.div>
            )}
            
            <div className="text-3xl">{THEME_EMOJIS[themeKey]}</div>
            
            <span className={`text-sm font-medium ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
              {THEME_NAMES[themeKey]}
            </span>
            
            <div className="flex gap-2 mt-1">
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: currentThemeColors['--accent'] }} />
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: currentThemeColors['--accent-bright'] }} />
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: currentThemeColors['--bg-card'] }} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
