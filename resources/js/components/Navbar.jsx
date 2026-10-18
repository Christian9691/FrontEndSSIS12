import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar({ title }) {
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleRoleChange = async (e) => {
    const targetRole = e.target.value;
    if (targetRole === currentUser?.role) return;
    setSwitching(true);
    try {
      const user = await switchRole(targetRole);
      const destination = (user && ROLES[user.role]) ? ROLES[user.role].basePath : ROLES[targetRole]?.basePath;
      if (destination) {
        navigate(destination);
      }
    } catch (err) {
      console.error('Portal switch error:', err);
    } finally {
      setSwitching(false);
    }
  };

  const roleConfig = ROLES[currentUser?.role] || ROLES.student;

  return (
    <header className="top-navbar">
      <div className="top-nav-left">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', fontWeight: 600 }}>
              CuyoTech SSIS · {roleConfig.label}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ecfdf5', color: '#047857', fontSize: '0.68rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              Online
            </span>
          </div>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>

      <div className="top-nav-right">
        {/* Academic Term Indicator Pill */}
        <div className="term-badge">
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>AY 2026–2027</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span>1st Term</span>
        </div>

        {/* Real-Time In-App Notification Center */}
        <NotificationDropdown />

        {/* Quick Demo Role Switcher */}
        <div className="role-switcher-dropdown">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {switching ? 'Switching...' : 'Portal:'}
          </span>
          <select value={currentUser?.role || 'student'} onChange={handleRoleChange} disabled={switching}>
            {Object.entries(ROLES).map(([key, r]) => (
              <option key={key} value={key}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
