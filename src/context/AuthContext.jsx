import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getStoredUser, setStoredUser, setToken, clearToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);   // cek token saat pertama load

  // Verifikasi token saat app pertama dibuka
  useEffect(() => {
    const verify = async () => {
      const stored = getStoredUser();
      if (!stored) { setLoading(false); return; }
      try {
        const res = await authApi.me();
        setUser(res.data);
        setStoredUser(res.data);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* abaikan */ }
    clearToken();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuth  = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
};
