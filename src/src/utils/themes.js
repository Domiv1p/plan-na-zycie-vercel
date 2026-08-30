export const THEMES = {
  purple: {
    '--bg-primary': '#030712',
    '--bg-card': 'rgba(139,92,246,0.08)',
    '--bg-card-hover': 'rgba(139,92,246,0.15)',
    '--accent': '#a78bfa',
    '--accent-bright': '#c4b5fd',
    '--accent-glow': '#7c3aed',
    '--accent-dim': '#6d28d9',
    '--border-color': 'rgba(139,92,246,0.2)',
    '--border-bright': 'rgba(139,92,246,0.4)',
    '--text-primary': '#f8fafc',
    '--text-secondary': '#94a3b8',
    '--text-muted': '#64748b',
    '--neon-shadow': '0 0 20px rgba(139,92,246,0.3)',
    '--glass-bg': 'rgba(139,92,246,0.06)',
    '--glass-border': 'rgba(139,92,246,0.15)',
    '--danger': '#ef4444',
    '--success': '#22c55e',
    '--warning': '#f59e0b'
  },
  yellow: {
    '--bg-primary': '#0a0a00',
    '--bg-card': 'rgba(234,179,8,0.08)',
    '--bg-card-hover': 'rgba(234,179,8,0.15)',
    '--accent': '#facc15',
    '--accent-bright': '#fde047',
    '--accent-glow': '#eab308',
    '--accent-dim': '#ca8a04',
    '--border-color': 'rgba(234,179,8,0.2)',
    '--border-bright': 'rgba(234,179,8,0.4)',
    '--text-primary': '#fefce8',
    '--text-secondary': '#a3a385',
    '--text-muted': '#71717a',
    '--neon-shadow': '0 0 20px rgba(234,179,8,0.3)',
    '--glass-bg': 'rgba(234,179,8,0.06)',
    '--glass-border': 'rgba(234,179,8,0.15)',
    '--danger': '#ef4444',
    '--success': '#22c55e',
    '--warning': '#f59e0b'
  },
  green: {
    '--bg-primary': '#050a05',
    '--bg-card': 'rgba(34,197,94,0.08)',
    '--bg-card-hover': 'rgba(34,197,94,0.15)',
    '--accent': '#22c55e',
    '--accent-bright': '#4ade80',
    '--accent-glow': '#16a34a',
    '--accent-dim': '#15803d',
    '--border-color': 'rgba(34,197,94,0.2)',
    '--border-bright': 'rgba(34,197,94,0.4)',
    '--text-primary': '#f0fdf4',
    '--text-secondary': '#86efac',
    '--text-muted': '#6b7280',
    '--neon-shadow': '0 0 20px rgba(34,197,94,0.3)',
    '--glass-bg': 'rgba(34,197,94,0.06)',
    '--glass-border': 'rgba(34,197,94,0.15)',
    '--danger': '#ef4444',
    '--success': '#22c55e',
    '--warning': '#f59e0b'
  },
  red: {
    '--bg-primary': '#0a0000',
    '--bg-card': 'rgba(239,68,68,0.08)',
    '--bg-card-hover': 'rgba(239,68,68,0.15)',
    '--accent': '#ef4444',
    '--accent-bright': '#f87171',
    '--accent-glow': '#dc2626',
    '--accent-dim': '#b91c1c',
    '--border-color': 'rgba(239,68,68,0.2)',
    '--border-bright': 'rgba(239,68,68,0.4)',
    '--text-primary': '#fef2f2',
    '--text-secondary': '#fca5a5',
    '--text-muted': '#71717a',
    '--neon-shadow': '0 0 20px rgba(239,68,68,0.3)',
    '--glass-bg': 'rgba(239,68,68,0.06)',
    '--glass-border': 'rgba(239,68,68,0.15)',
    '--danger': '#ef4444',
    '--success': '#22c55e',
    '--warning': '#f59e0b'
  }
};

export const THEME_NAMES = {
  purple: 'Neonowy Fiolet',
  yellow: 'Cyber Żółty',
  green: 'Matrixowa Zieleń',
  red: 'Krwawa Czerwień'
};

export const THEME_EMOJIS = {
  purple: '💜',
  yellow: '💛',
  green: '💚',
  red: '❤️'
};

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey] || THEMES.purple;
  for (const [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(key, value);
  }
  // Update meta theme color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme['--bg-primary']);
  }
}
