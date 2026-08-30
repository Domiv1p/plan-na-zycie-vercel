import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, CheckSquare, PenLine, Settings } from 'lucide-react';

const navItems = [
  { 
    id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: BarChart3, 
    activeAnimation: { 
      y: [0, -4, 0], scale: [1, 1.15, 1], rotate: [0, -5, 5, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
    } 
  },
  { 
    id: 'calendar', path: '/calendar', label: 'Kalendarz', icon: CalendarDays, 
    activeAnimation: { 
      rotateY: [0, 180, 360], scale: [1, 0.85, 1],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } 
    } 
  },
  { 
    id: 'tasks', path: '/tasks', label: 'Zadania', icon: CheckSquare, 
    activeAnimation: { 
      scale: [1, 1.25, 0.9, 1.05, 1], rotate: [0, -12, 12, -5, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 0.5 } 
    } 
  },
  { 
    id: 'notes', path: '/notes', label: 'Notatki', icon: PenLine, 
    activeAnimation: { 
      x: [0, 3, -2, 4, -1, 0], y: [0, -3, 2, -1, 1, 0], rotate: [0, 15, -10, 12, -5, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } 
    } 
  },
  { 
    id: 'settings', path: '/settings', label: 'Ustawienia', icon: Settings, 
    activeAnimation: { 
      rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1, 1.1, 1],
      transition: { repeat: Infinity, duration: 4, ease: "linear" } 
    } 
  },
];

export default function BottomDock() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-[var(--glass-bg)] backdrop-blur-2xl border-t border-[var(--glass-border)] pb-safe sm:pb-2">
      <nav className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-full relative ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                {isActive && (
                  <motion.div
                    layoutId="dock-glow"
                    className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <motion.div animate={isActive ? item.activeAnimation : {}}>
                  <Icon size={24} />
                </motion.div>
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
