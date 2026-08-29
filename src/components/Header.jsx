import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useClickOutside } from '../hooks/useClickOutside';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Przed chwilą';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dn. temu`;
  return date.toLocaleDateString('pl-PL');
}

export default function Header() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const getEmoji = (name) => {
    return name?.toLowerCase().includes('miki') ? '👩' : '👨';
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 z-40 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)]">
      <div className="h-full flex items-center justify-between px-6">
        
        <h1 className="text-xl font-bold text-[var(--accent)] drop-shadow-[0_0_8px_var(--accent-glow)]">
          Plan na życie
        </h1>

        <div className="flex items-center gap-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative p-2 rounded-full hover:bg-[var(--bg-card)] transition-colors text-[var(--text-primary)]"
            >
              <motion.div
                animate={
                  unreadCount > 0
                    ? { rotate: [-15, 15, -10, 10, 0] }
                    : { rotate: 0 }
                }
                transition={{ repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2, duration: 0.5 }}
              >
                <Bell size={24} />
              </motion.div>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center font-bold px-1 border-2 border-[var(--glass-bg)]"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.2, y: -40, x: 120, borderRadius: 100 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0, borderRadius: 24 }}
                  exit={{ opacity: 0, scale: 0.2, y: -40, x: 120, borderRadius: 100 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.8 }}
                  style={{ transformOrigin: 'top right' }}
                  className="absolute right-0 top-full mt-2 w-[90vw] max-w-sm sm:w-80 max-h-[80vh] overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-bright)] rounded-[2rem] shadow-2xl z-50 flex flex-col"
                >
                  <div className="p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--bg-card)] backdrop-blur-md">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">Powiadomienia</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold px-3 py-1 bg-[var(--accent)] text-white rounded-full hover:brightness-110 transition-all shadow-[var(--neon-shadow)]"
                      >
                        Przeczytane
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2">
                    {notifications?.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {notifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={`p-4 rounded-2xl transition-all cursor-pointer ${
                              !notif.is_read ? 'bg-[var(--glass-bg)] border border-[var(--accent)] shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-transparent border border-transparent hover:bg-[var(--glass-bg)]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}`}>{notif.title}</h4>
                              <span className="text-[10px] font-medium text-[var(--text-muted)] whitespace-nowrap ml-2 bg-[var(--bg-primary)] px-2 py-0.5 rounded-full">
                                {timeAgo(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-2">{notif.body}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
                        <BellOff size={40} className="opacity-30" />
                        <p className="text-sm font-medium">Brak powiadomień</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-sm font-medium hidden sm:block text-[var(--text-primary)]">
              {user?.name || 'Gość'}
            </span>
            <div className="w-8 h-8 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-lg shadow-[0_0_8px_var(--glass-border)]">
              {getEmoji(user?.name)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
