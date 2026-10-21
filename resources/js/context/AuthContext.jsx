import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ssis_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate or synchronize session with backend
  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => {
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem('ssis_user', JSON.stringify(res.user));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('ssis_user');
        }
      })
      .catch(() => {
        setCurrentUser(null);
        localStorage.removeItem('ssis_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/api/auth/login', { identifier, password });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('ssis_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.message || 'Login failed.');
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch (e) {}
    localStorage.removeItem('ssis_user');
    setCurrentUser(null);
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('ssis_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
