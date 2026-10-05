import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';

export function Navbar({ title }) {
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = async (e) => {
    const targetRole = e.target.value;
    if (ROLES[targetRole]) {
      navigate(ROLES[targetRole].basePath);
    }
    const user = await switchRole(targetRole);
    if (user && ROLES[user.role]) {
      navigate(ROLES[user.role].basePath);
    }
  };

  return (
    <header className="top-navbar">
      <div className="top-nav-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="top-nav-right">
        <div className="role-switcher-dropdown">
          <span>Switch Module:</span>
          <select value={currentUser?.role || 'student'} onChange={handleRoleChange}>
            {Object.entries(ROLES).map(([key, r]) => (
              <option key={key} value={key}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
