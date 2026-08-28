import React from 'react';
import { motion } from 'framer-motion';

export default function ProfileSelector({ profiles, onSelect }) {
  if (!profiles || profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <p className="text-lg text-[var(--text-secondary)] font-medium">Brak zarejestrowanych kont</p>
        <button className="px-6 py-3 rounded-full bg-[var(--accent)] text-white font-bold shadow-[0_0_15px_var(--accent-glow)] hover:scale-105 transition-transform">
          Zarejestruj się
        </button>
      </div>
    );
  }

  const getEmoji = (name) => {
    return name?.toLowerCase().includes('miki') ? '👩' : '👨';
  };

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {profiles.map((profile) => (
        <motion.button
          key={profile.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(profile)}
          className="w-40 h-48 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] flex flex-col items-center justify-center gap-4 hover:border-[var(--accent)] hover:shadow-[0_0_20px_var(--accent-glow)] transition-all group"
        >
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {profile.avatar || getEmoji(profile.name)}
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {profile.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
