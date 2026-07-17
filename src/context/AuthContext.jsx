// context/AuthContext.jsx – global auth state
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(() => {
    // Restore cached user from localStorage on first load
    try {
      const cached = localStorage.getItem('ekthaa_user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);

  // ── Verify session on mount (JWT cookie check) ──
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('ekthaa_user', JSON.stringify(data.user));
      }
    } catch {
      // Cookie invalid / expired → clear local cache
      setUser(null);
      localStorage.removeItem('ekthaa_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  // ── Login ──
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.requiresVerification) return data; // unverified → OTP flow
    setUser(data.user);
    localStorage.setItem('ekthaa_user', JSON.stringify(data.user));
    return data;
  };

  // ── Register ──
  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data; // caller navigates to OTP page
  };

  // ── Verify OTP ──
  const verifyOtp = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('ekthaa_user', JSON.stringify(data.user));
    }
    return data;
  };

  // ── Logout ──
  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
    localStorage.removeItem('ekthaa_user');
  };

  // ── Update local user cache (e.g. after profile edit) ──
  const updateUser = (partial) => {
    setUser(prev => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('ekthaa_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyOtp, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
