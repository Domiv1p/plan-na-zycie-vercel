import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PinInput = ({ pin, setPin, error, onSubmit }) => {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    if (value && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        inputs.current[index - 1].focus();
      }
      const newPin = [...pin];
      newPin[index] = '';
      setPin(newPin);
    } else if (e.key === 'Enter' && pin.every(p => p !== '')) {
      onSubmit();
    }
  };

  useEffect(() => {
    if (pin.every(p => p !== '')) {
      const timeout = setTimeout(() => {
        onSubmit();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [pin, onSubmit]);

  return (
    <motion.div 
      className="flex gap-4 justify-center my-6"
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={el => inputs.current[index] = el}
          type="password"
          inputMode="numeric"
          className={`w-14 h-14 text-center text-2xl bg-[var(--glass-bg)] backdrop-blur-xl border ${error ? 'border-[var(--danger)] text-[var(--danger)]' : 'border-[var(--glass-border)] text-[var(--text-primary)]'} rounded-xl focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--neon-shadow)] transition-all`}
          value={pin[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
        />
      ))}
    </motion.div>
  );
};

export default function LoginPage() {
  const { profiles, register, loginWithPin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState(profiles && profiles.length > 0 ? 'select' : 'register');
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Login state
  const [pin, setPin] = useState(['', '', '', '']);
  const [loginError, setLoginError] = useState('');
  
  // Register state
  const [regData, setRegData] = useState({ name: '', email: '', password: '', pin: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setPin(['', '', '', '']);
    setLoginError('');
  };

  const handleLoginSubmit = async () => {
    const fullPin = pin.join('');
    if (fullPin.length !== 4) return;
    
    try {
      await loginWithPin(selectedProfile.id, fullPin);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Nieprawidłowy PIN');
      setPin(['', '', '', '']);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regData.name || !regData.email || !regData.password || regData.pin.length !== 4) {
      setRegError('Wypełnij wszystkie pola, PIN musi mieć 4 cyfry');
      return;
    }
    
    try {
      await register(regData.name, regData.email, regData.password, regData.pin);
      navigate('/dashboard');
    } catch (err) {
      setRegError(err.message || 'Błąd rejestracji. Spróbuj ponownie.');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-[var(--accent)] drop-shadow-[0_0_15px_var(--accent-glow)] mb-2">
          Plan na życie
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          {mode === 'select' && !selectedProfile ? 'Wybierz swój profil' : 
           mode === 'select' && selectedProfile ? 'Podaj swój PIN' : 
           'Załóż nowe konto'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'select' && !selectedProfile && (
          <motion.div 
            key="profiles"
            initial="initial" animate="in" exit="out" variants={pageVariants}
            className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center"
          >
            {profiles && profiles.map(profile => (
              <div 
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-8 flex flex-col items-center cursor-pointer hover:border-[var(--accent)] hover:shadow-[var(--neon-shadow)] transition-all flex-1 min-w-[200px]"
              >
                <div className="text-6xl mb-4">{profile.name.toLowerCase().includes('miki') ? '👩' : profile.name.toLowerCase().includes('adi') ? '👨' : '👤'}</div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">{profile.name}</h3>
              </div>
            ))}
            
            <div className="w-full mt-6 text-center sm:hidden">
               <button onClick={() => setMode('register')} className="text-[var(--accent)] hover:text-[var(--accent-bright)] underline">Utwórz nowe konto</button>
            </div>
          </motion.div>
        )}

        {mode === 'select' && selectedProfile && (
          <motion.div 
            key="pin"
            initial="initial" animate="in" exit="out" variants={pageVariants}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-8 w-full max-w-md flex flex-col items-center"
          >
            <div className="text-5xl mb-4">{selectedProfile.name.toLowerCase().includes('miki') ? '👩' : selectedProfile.name.toLowerCase().includes('adi') ? '👨' : '👤'}</div>
            <h2 className="text-xl text-[var(--text-primary)] mb-2">Witaj, {selectedProfile.name}</h2>
            
            <PinInput pin={pin} setPin={setPin} error={loginError} onSubmit={handleLoginSubmit} />
            
            {loginError && <p className="text-[var(--danger)] text-sm mb-4">{loginError}</p>}
            
            <button 
              onClick={() => setSelectedProfile(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mt-4"
            >
              ← Zmień profil
            </button>
          </motion.div>
        )}

        {mode === 'register' && (
          <motion.div 
            key="register"
            initial="initial" animate="in" exit="out" variants={pageVariants}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-8 w-full max-w-md"
          >
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[var(--text-secondary)] text-sm mb-1 block">Imię</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                  <input 
                    type="text" 
                    value={regData.name}
                    onChange={e => setRegData({...regData, name: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_10px_var(--accent-dim)] transition-all"
                    placeholder="Twoje imię"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[var(--text-secondary)] text-sm mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                  <input 
                    type="email" 
                    value={regData.email}
                    onChange={e => setRegData({...regData, email: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_10px_var(--accent-dim)] transition-all"
                    placeholder="twoj@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)] text-sm mb-1 block">Hasło</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={regData.password}
                    onChange={e => setRegData({...regData, password: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-12 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_10px_var(--accent-dim)] transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[var(--text-secondary)] text-sm mb-1 block">PIN (4 cyfry do szybkiego logowania)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                  <input 
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={regData.pin}
                    onChange={e => setRegData({...regData, pin: e.target.value.replace(/[^0-9]/g, '')})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_10px_var(--accent-dim)] transition-all tracking-[0.5em]"
                    placeholder="1234"
                  />
                </div>
              </div>

              {regError && <p className="text-[var(--danger)] text-sm">{regError}</p>}

              <button 
                type="submit"
                className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-3 rounded-xl shadow-[var(--neon-shadow)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Zarejestruj się
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'select' && !selectedProfile && profiles && profiles.length > 0 && (
        <div className="mt-12 hidden sm:block">
          <button onClick={() => setMode('register')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors underline">
            Utwórz nowe konto
          </button>
        </div>
      )}

      {mode === 'register' && profiles && profiles.length > 0 && (
        <div className="mt-8">
          <button onClick={() => setMode('select')} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors underline">
            Mam już konto
          </button>
        </div>
      )}
    </div>
  );
}
