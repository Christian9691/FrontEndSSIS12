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
    if (demo) {
      const optimisticUser = {
        id: demo.id === '2026-00123' ? 1 : demo.id === '2026-00125' ? 2 : targetRole === 'registrar' ? 3 : targetRole === 'cashier' ? 4 : targetRole === 'department' ? 5 : 6,
        name: demo.label.split(' (')[0],
        email: demo.id.includes('@') ? demo.id : `${demo.id}@cuyotech.edu.ph`,
        role: demo.role,
        student: demo.role === 'student' ? {
          id: demo.id === '2026-00123' ? 1 : 2,
          student_number: demo.id,
          course_code: 'BSIT',
          course_title: 'Bachelor of Science in Information Technology',
          year_level: 3,
          clearance_status: demo.id === '2026-00123',
        } : null,
      };

      // Set state and storage immediately so UI components switch on the exact frame
      setCurrentUser(optimisticUser);
      localStorage.setItem('ssis_user', JSON.stringify(optimisticUser));

      try {
        const res = await api.post('/api/auth/login', {
          identifier: demo.id,
          password: 'password',
          role: demo.role,
        });
        if (res.user) {
          setCurrentUser(res.user);
          localStorage.setItem('ssis_user', JSON.stringify(res.user));
          return res.user;
        }
      } catch (err) {
        console.error('Role switch sync error:', err);
      }
      return optimisticUser;
    }
    return null;
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
