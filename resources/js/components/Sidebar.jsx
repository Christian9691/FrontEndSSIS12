import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';
import { ChangePasswordModal } from './ChangePasswordModal';
import {
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  FileText,
  Inbox,
  UserCheck,
  CreditCard,
  Receipt,
  Users,
  ScrollText,
  Building2,
  LogOut,
  FolderOpen,
  KeyRound,
  ChevronLeft,
} from 'lucide-react';

export function Sidebar({ collapsed = false, onToggle }) {
  const { currentUser, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const roleConfig = ROLES[currentUser?.role] || ROLES.student;

  const getRouteIcon = (path) => {
    if (path.includes('/grades')) return <GraduationCap size={19} className="sidebar-svg-icon" />;
    if (path.includes('/clearance')) return <ShieldCheck size={19} className="sidebar-svg-icon" />;
    if (path.includes('/requests')) return <FileText size={19} className="sidebar-svg-icon" />;
    if (path.includes('/enrollment')) return <UserCheck size={19} className="sidebar-svg-icon" />;
    if (path.includes('/ledger')) return <Receipt size={19} className="sidebar-svg-icon" />;
    if (path.includes('/users')) return <Users size={19} className="sidebar-svg-icon" />;
    if (path.includes('/audit')) return <ScrollText size={19} className="sidebar-svg-icon" />;
    if (path === '/student' || path === '/admin') return <LayoutDashboard size={19} className="sidebar-svg-icon" />;
    if (path === '/registrar') return <Inbox size={19} className="sidebar-svg-icon" />;
    if (path === '/cashier') return <CreditCard size={19} className="sidebar-svg-icon" />;
    if (path === '/department') return <Building2 size={19} className="sidebar-svg-icon" />;
    return <FolderOpen size={19} className="sidebar-svg-icon" />;
  };

  const getInitials = (name) => {
    if (!name) return 'CU';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className={`app-sidebar floating-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div
          className="brand-crest"
          onClick={collapsed ? onToggle : undefined}
          style={{ cursor: collapsed ? 'pointer' : 'default' }}
          title={collapsed ? 'Click to expand sidebar' : 'CuyoTech SSIS'}
        >
          CTU
        </div>
        {!collapsed && (
          <div className="brand-info">
            <h2>CuyoTech SSIS</h2>
            <p>Pamantasan ng Cabuyao</p>
          </div>
        )}
        {!collapsed && onToggle && (
          <button
            type="button"
            className="sidebar-inline-collapse-btn"
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <div className="sidebar-user" title={collapsed ? `${currentUser?.name} (${roleConfig.label})` : undefined}>
        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', marginBottom: collapsed ? '0' : '0.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
          >
            {getInitials(currentUser?.name)}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name}
              </div>
              <span className="user-role">{roleConfig.badge}</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="user-sub">
            {currentUser?.role === 'student' && currentUser.student
              ? `${currentUser.student.student_number} · ${currentUser.student.course_code}`
              : currentUser?.email}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && (
          <div className="sidebar-nav-heading" style={{ padding: '0 0.8rem 0.4rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
            Navigation
          </div>
        )}
        {roleConfig.routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end={r.path === roleConfig.basePath}
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            title={collapsed ? r.label : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? '0' : '0.65rem',
              padding: collapsed ? '0.75rem 0' : '0.75rem 1.4rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getRouteIcon(r.path)}
            </span>
            {!collapsed && <span className="nav-label">{r.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', padding: collapsed ? '0.75rem 0.4rem' : '1rem 1.2rem' }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setShowPasswordModal(true)}
          title="Change Password"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            fontSize: '0.78rem',
            padding: collapsed ? '0.5rem 0' : '0.42rem 0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
        >
          <KeyRound size={15} />
          {!collapsed && <span>Change Password</span>}
        </button>
        <button
          className="signout-btn"
          onClick={logout}
          title="Sign Out"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: collapsed ? '0.5rem 0' : '0.6rem 1rem',
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </aside>
  );
}
