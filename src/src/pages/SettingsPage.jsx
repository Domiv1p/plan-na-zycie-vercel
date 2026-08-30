import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import useApi from '../hooks/useApi';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { playPlum } from '../utils/sounds';
import { Bell, ShieldAlert, X, Heart, LogOut, Volume2, VolumeX, Settings } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { subscribeToPush, unsubscribeFromPush } from '../utils/pushManager';

export default function SettingsPage() {
  const { user, deleteAccount, logout } = useAuth();
  const { themeName, setTheme } = useTheme();
  const api = useApi();
  const [pushEnabled, setPushEnabled] = useState(false);
  
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setPushEnabled(!!subscription);
        });
      });
    }
  }, []);
  const [soundsEnabled, setSoundsEnabled] = useState(localStorage.getItem('pnz-sounds') !== 'off');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const themes = [
    { id: 'neon-purple', name: 'Neonowy Fiolet', emoji: '🟣', accent: '#a855f7' },
    { id: 'cyber-yellow', name: 'Cyber Żółty', emoji: '🟡', accent: '#eab308' },
    { id: 'matrix-green', name: 'Matrix Zielony', emoji: '🟢', accent: '#22c55e' },
    { id: 'synth-pink', name: 'Synthwave Róż', emoji: '💖', accent: '#ec4899' }
  ];

  const handleToggleSounds = () => { const newState = !soundsEnabled; setSoundsEnabled(newState); if (newState) { localStorage.removeItem('pnz-sounds'); playPlum(); } else { localStorage.setItem('pnz-sounds', 'off'); } };

  const handlePushToggle = async () => {
    if (!pushEnabled) {
      if (Notification.permission === 'denied') {
        alert('Musisz zezwolić na powiadomienia w ustawieniach przeglądarki.');
        return;
      }
      const success = await subscribeToPush();
      if (success) setPushEnabled(true);
    } else {
      const success = await unsubscribeFromPush();
      if (success) setPushEnabled(false);
    }
  };

  const handleTestPush = async () => {
    try {
      await api.post('/push/test');
      alert('Wysłano powiadomienie testowe!');
    } catch (error) {
      console.error('Failed to send push', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (deletePin.length !== 4) {
      setDeleteError('PIN musi mieć 4 cyfry');
      return;
    }
    try {
      await deleteAccount(deletePin);
      logout();
    } catch (error) {
      setDeleteError('Nieprawidłowy PIN lub błąd serwera');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}><Settings className="w-8 h-8 text-[var(--accent)]" /></motion.div>Ustawienia</h1>

      {/* Profile Info */}
      <section className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Twój Profil</h2>
          <div className="flex items-center gap-6">
            <div className="text-6xl bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--glass-border)]">
              {user?.name?.toLowerCase().includes('miki') ? '👩' : user?.name?.toLowerCase().includes('adi') ? '👨' : '👤'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--accent)]">{user?.name}</h3>
              <p className="text-[var(--text-secondary)]">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--glass-bg)] hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Wyloguj się
        </button>
      </section>

      {/* Theme Switcher */}
      <section className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Motyw kolorystyczny</h2>
        <ThemeSwitcher />
      </section>

      {/* Sounds */}
      <section className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          {soundsEnabled ? <Volume2 className="w-6 h-6 text-[var(--accent)]" /> : <VolumeX className="w-6 h-6 text-[var(--text-muted)]" />} Dźwięki aplikacji
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[var(--text-primary)] font-medium">Efekty dźwiękowe</p>
            <p className="text-[var(--text-muted)] text-sm">Odtwarzaj dźwięki przy akcjach (zaznaczanie, zmiana motywu)</p>
          </div>
          <button onClick={handleToggleSounds} className={`px-6 py-2 rounded-xl font-bold transition-all ${soundsEnabled ? 'bg-[var(--accent)] text-white shadow-[var(--neon-shadow)]' : 'bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {soundsEnabled ? 'Włączone' : 'Wyłączone'}
          </button>
        </div>
      </section>

      {/* Push Notifications */}
      <section className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-[var(--accent)]" /> Powiadomienia
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[var(--text-primary)] font-medium">Powiadomienia Push</p>
            <p className="text-[var(--text-muted)] text-sm">Otrzymuj przypomnienia o zadaniach i wydarzeniach</p>
          </div>
          <button 
            onClick={handlePushToggle}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${pushEnabled ? 'bg-[var(--accent)] text-white shadow-[var(--neon-shadow)]' : 'bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {pushEnabled ? 'Włączone' : 'Wyłączone'}
          </button>
        </div>
        {pushEnabled && (
          <button onClick={handleTestPush} className="mt-4 text-sm text-[var(--accent)] underline hover:text-[var(--accent-bright)]">
            Wyślij testowe powiadomienie
          </button>
        )}
      </section>

      {/* Danger Zone */}
      <section className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-32 h-32 text-red-500" /></div>
        <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
          Strefa niebezpieczna
        </h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md">
          Usunięcie konta jest nieodwracalne. Wszystkie Twoje zadania, notatki i wydarzenia zostaną trwale usunięte.
        </p>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-6 rounded-xl border border-red-500/50 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
        >
          Usuń konto
        </button>
      </section>

      <div className="text-center text-[var(--text-muted)] py-8 flex items-center justify-center gap-2 text-sm">
        Plan na życie v1.0.0 • Made with <Heart className="w-4 h-4 text-red-500 animate-pulse" />
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--glass-bg)] border-2 border-red-500/50 rounded-2xl p-8 w-full max-w-md text-center"
            >
              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Czy na pewno?</h3>
              <p className="text-[var(--text-secondary)] mb-6">Ta operacja jest nieodwracalna. Wprowadź swój 4-cyfrowy PIN, aby potwierdzić.</p>
              
              <input 
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={deletePin}
                onChange={e => setDeletePin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-4 text-center text-2xl tracking-[1em] text-[var(--text-primary)] focus:outline-none focus:border-red-500 mb-2"
                placeholder="••••"
              />
              {deleteError && <p className="text-red-500 text-sm mb-4">{deleteError}</p>}
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => { setShowDeleteModal(false); setDeletePin(''); setDeleteError(''); }}
                  className="flex-1 py-3 rounded-xl border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  onClick={() => setIsDeletingAccount(true)}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-colors"
                >
                  Usuń bezpowrotnie
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
          <ConfirmDeleteModal isOpen={isDeletingAccount} onClose={() => setIsDeletingAccount(false)} onConfirm={handleDeleteAccount} title="Usuń konto" message="Czy na pewno chcesz usunąć swoje konto? Wszystkie zadania, notatki i wydarzenia zostaną trwale usunięte." />
    </div>
  );
}