import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { ROLES, DEMO_USERS } from '../config';

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
        } else if (!currentUser) {
          localStorage.removeItem('ssis_user');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password, role) => {
    const res = await api.post('/api/auth/login', { identifier, password, role });
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

  const switchRole = async (targetRole) => {
    const demo = DEMO_USERS.find((u) => u.role === targetRole);
    if (!demo) return null;

    try {
      const res = await api.post('/api/auth/login', {
        identifier: demo.id,
        password: 'password',
        role: demo.role,
      });
      if (res && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('ssis_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.error('Role switch sync error, applying fallback profile:', err);
    }

    const fallbackUser = {
      id: demo.userId || 1,
      name: demo.label.split(' (')[0],
      email: demo.id,
      role: demo.role,
      student: demo.role === 'student' ? {
        id: demo.userId === 5 ? 1 : (demo.userId === 6 ? 2 : (demo.userId === 7 ? 3 : 4)),
        student_number: demo.studentNumber || '2026-00123',
        course_code: demo.id.includes('maria') || demo.id.includes('carlos') ? 'BSCS' : (demo.id.includes('pedro') ? 'BSIS' : 'BSIT'),
        course_title: demo.id.includes('maria') || demo.id.includes('carlos') ? 'Bachelor of Science in Computer Science' : 'Bachelor of Science in Information Technology',
        year_level: demo.userId === 6 ? 3 : (demo.userId === 7 ? 2 : (demo.userId === 8 ? 1 : 2)),
        clearance_status: demo.userId !== 8,
      } : null,
    };

    setCurrentUser(fallbackUser);
    localStorage.setItem('ssis_user', JSON.stringify(fallbackUser));
    return fallbackUser;
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, switchRole }}>
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
