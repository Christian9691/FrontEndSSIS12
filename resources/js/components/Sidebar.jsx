import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const roleConfig = ROLES[currentUser?.role] || ROLES.student;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-crest">CTU</div>
        <div className="brand-info">
          <h2>CuyoTech SSIS</h2>
          <p>University Student Services</p>
        </div>
      </div>

      <div className="sidebar-user">
        <span className="user-role">{roleConfig.badge}</span>
        <div className="user-name">{currentUser?.name}</div>
        <div className="user-sub">
          {currentUser?.role === 'student' && currentUser.student
            ? `${currentUser.student.student_number} · ${currentUser.student.course_code}`
            : currentUser?.email}
        </div>
      </div>

      <nav className="sidebar-nav">
        {roleConfig.routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end={r.path === roleConfig.basePath}
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          >
            <span>{r.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="signout-btn" onClick={logout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
