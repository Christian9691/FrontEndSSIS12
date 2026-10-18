import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';
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
} from 'lucide-react';

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const roleConfig = ROLES[currentUser?.role] || ROLES.student;

  const getRouteIcon = (path) => {
    if (path.includes('/grades')) return <GraduationCap size={18} className="sidebar-svg-icon" />;
    if (path.includes('/clearance')) return <ShieldCheck size={18} className="sidebar-svg-icon" />;
    if (path.includes('/requests')) return <FileText size={18} className="sidebar-svg-icon" />;
    if (path.includes('/enrollment')) return <UserCheck size={18} className="sidebar-svg-icon" />;
    if (path.includes('/ledger')) return <Receipt size={18} className="sidebar-svg-icon" />;
    if (path.includes('/users')) return <Users size={18} className="sidebar-svg-icon" />;
    if (path.includes('/audit')) return <ScrollText size={18} className="sidebar-svg-icon" />;
    if (path === '/student' || path === '/admin') return <LayoutDashboard size={18} className="sidebar-svg-icon" />;
    if (path === '/registrar') return <Inbox size={18} className="sidebar-svg-icon" />;
    if (path === '/cashier') return <CreditCard size={18} className="sidebar-svg-icon" />;
    if (path === '/department') return <Building2 size={18} className="sidebar-svg-icon" />;
    return <FolderOpen size={18} className="sidebar-svg-icon" />;
  };

  const getInitials = (name) => {
    if (!name) return 'CU';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-crest">CTU</div>
        <div className="brand-info">
          <h2>CuyoTech SSIS</h2>
          <p>Pamantasan ng Cabuyao</p>
        </div>
      </div>

      <div className="sidebar-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
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
            }}
          >
            {getInitials(currentUser?.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name}
            </div>
            <span className="user-role">{roleConfig.badge}</span>
          </div>
        </div>

        <div className="user-sub">
          {currentUser?.role === 'student' && currentUser.student
            ? `${currentUser.student.student_number} · ${currentUser.student.course_code}`
            : currentUser?.email}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ padding: '0 0.8rem 0.4rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
          Navigation
        </div>
        {roleConfig.routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            end={r.path === roleConfig.basePath}
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{getRouteIcon(r.path)}</span>
            <span>{r.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="signout-btn" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
