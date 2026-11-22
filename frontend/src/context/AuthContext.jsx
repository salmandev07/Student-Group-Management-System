import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('sgams_user') || 'null');
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('sgams_token'));
  const [loading, setLoading] = useState(Boolean(token));

  const persist = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem('sgams_user', JSON.stringify(nextUser));
      localStorage.setItem('sgams_token', nextToken);
    } else {
      localStorage.removeItem('sgams_user');
      localStorage.removeItem('sgams_token');
    }
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    persist(data.user, data.token);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    persist(data.user, data.token);
    return data.user;
  };

  const logout = () => persist(null, null);

  // Validate the stored token on mount and keep state in sync with 401 interceptor.
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', handleLogout);

    if (token) {
      authApi
        .me()
        .then((data) => persist(data.user, token))
        .catch(() => handleLogout())
        .finally(() => setLoading(false));
    }

    return () => window.removeEventListener('auth:logout', handleLogout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
