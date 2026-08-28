import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profiles`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (error) {
      console.error('Błąd pobierania profili:', error);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pnz-token');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const decoded = JSON.parse(jsonPayload);
          setUser(decoded);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Nieprawidłowy token', err);
          localStorage.removeItem('pnz-token');
        }
      }
      await fetchProfiles();
      setLoading(false);
    };

    initAuth();
  }, [fetchProfiles]);

  const register = async (name, email, password, pin) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, pin })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Błąd rejestracji');
    }
    const data = await res.json();
    localStorage.setItem('pnz-token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    await fetchProfiles();
  };

  const loginWithPin = async (userId, pin) => {
    const res = await fetch(`${API_URL}/auth/login-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pin })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Błędny PIN');
    }
    const data = await res.json();
    localStorage.setItem('pnz-token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('pnz-token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  const deleteAccount = async (pin) => {
    const token = localStorage.getItem('pnz-token');
    const res = await fetch(`${API_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pin })
    });
    if (!res.ok) throw new Error('Nie udało się usunąć konta');
    logout();
    await fetchProfiles();
  };

  return (
    <AuthContext.Provider value={{ user, profiles, isAuthenticated, loading, register, loginWithPin, logout, deleteAccount, fetchProfiles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
