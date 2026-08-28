import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center font-bold px-1 border-2 border-[var(--glass-bg)]">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[var(--bg-primary)] border border-[var(--border-bright)] rounded-2xl shadow-2xl z-50 flex flex-col"
                >
                  <div className="p-4 border-b border-[var(--glass-border)] flex justify-between items-center sticky top-0 bg-[var(--bg-primary)] z-10">
                    <h3 className="font-semibold text-[var(--text-primary)]">Powiadomienia</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[var(--accent)] hover:text-[var(--accent-bright)] transition-colors"
                      >
                        Oznacz wszystkie
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {notifications?.length > 0 ? (
                      <div className="flex flex-col">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={`p-4 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--glass-bg)] transition-colors cursor-pointer ${
                              !notif.is_read ? 'border-l-4 border-l-[var(--accent)]' : 'border-l-4 border-l-transparent'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-sm text-[var(--text-primary)]">{notif.title}</h4>
                              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap ml-2">
                                {timeAgo(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">{notif.body}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
                        <BellOff size={32} className="opacity-50" />
                        <p className="text-sm">Brak powiadomień</p>
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
