import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLES } from './config';
import { RotateCcw, KeyRound } from 'lucide-react';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { VerifyDocument } from './pages/VerifyDocument';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { GradesAndSubjects } from './pages/student/GradesAndSubjects';
import { ClearanceStatus } from './pages/student/ClearanceStatus';
import { DocumentRequests } from './pages/student/DocumentRequests';

// Registrar Pages
import { DocumentQueue } from './pages/registrar/DocumentQueue';
import { GradesEncoding } from './pages/registrar/GradesEncoding';
import { Enrollment } from './pages/registrar/Enrollment';

// Cashier Pages
import { PaymentQueue } from './pages/cashier/PaymentQueue';
import { ReceiptsLedger } from './pages/cashier/ReceiptsLedger';

// Department Pages
import { ClearanceProcessing } from './pages/department/ClearanceProcessing';

// Admin Pages
import { SystemOverview } from './pages/admin/SystemOverview';
import { UserAccounts } from './pages/admin/UserAccounts';
import { AuditLogs } from './pages/admin/AuditLogs';

import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MustChangePasswordModal } from './components/MustChangePasswordModal';

function RoleRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles.includes(currentUser.role)) {
    return children;
  }
  return <UnauthorizedPage />;
}

function AppLayout() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try {
      return localStorage.getItem('ssis_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ssis_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Public verification portal is directly accessible without authentication
  if (location.pathname.startsWith('/verify')) {
    return (
      <Routes>
        <Route path="/verify/:token" element={<VerifyDocument />} />
        <Route path="/verify" element={<VerifyDocument />} />
      </Routes>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="university-crest">CTU</div>
          <p style={{ marginTop: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
            Loading CuyoTech University SSIS...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const roleConfig = ROLES[currentUser.role] || ROLES.student;

  // Derive active page title from current route
  const currentRoute = roleConfig.routes?.find((r) => r.path === location.pathname);
  const pageTitle = currentRoute ? currentRoute.label : roleConfig.label;

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <main className="app-main">
        <Navbar
          title={pageTitle}
          collapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        <div className="content-container">
          <Routes>
            {/* Student Portal Routes */}
            <Route path="/student" element={<RoleRoute allowedRoles={['student']}><StudentDashboard /></RoleRoute>} />
            <Route path="/student/grades" element={<RoleRoute allowedRoles={['student']}><GradesAndSubjects /></RoleRoute>} />
            <Route path="/student/clearance" element={<RoleRoute allowedRoles={['student']}><ClearanceStatus /></RoleRoute>} />
            <Route path="/student/requests" element={<RoleRoute allowedRoles={['student']}><DocumentRequests /></RoleRoute>} />

            {/* Registrar Module Routes */}
            <Route path="/registrar" element={<RoleRoute allowedRoles={['registrar']}><DocumentQueue /></RoleRoute>} />
            <Route path="/registrar/grades" element={<RoleRoute allowedRoles={['registrar']}><GradesEncoding /></RoleRoute>} />
            <Route path="/registrar/enrollment" element={<RoleRoute allowedRoles={['registrar']}><Enrollment /></RoleRoute>} />

            {/* Cashier Module Routes */}
            <Route path="/cashier" element={<RoleRoute allowedRoles={['cashier']}><PaymentQueue /></RoleRoute>} />
            <Route path="/cashier/ledger" element={<RoleRoute allowedRoles={['cashier']}><ReceiptsLedger /></RoleRoute>} />

            {/* Department Module Routes */}
            <Route path="/department" element={<RoleRoute allowedRoles={['department']}><ClearanceProcessing /></RoleRoute>} />

            {/* Admin Module Routes */}
            <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><SystemOverview /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><UserAccounts /></RoleRoute>} />
            <Route path="/admin/audit" element={<RoleRoute allowedRoles={['admin']}><AuditLogs /></RoleRoute>} />

            {/* Security Access Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Root & Fallback Redirects */}
            <Route path="/login" element={<Navigate to={roleConfig.basePath} replace />} />
            <Route path="/" element={<Navigate to={roleConfig.basePath} replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>

      {/* Mandatory First-Time Login Password Change Guard */}
      <MustChangePasswordModal isOpen={Boolean(currentUser?.must_change_password)} />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SSIS App Error Boundary Caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('ssis_user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '2rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2rem' }}>
            <div className="university-crest" style={{ margin: '0 auto 1rem' }}>CTU</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              System Interface Notice
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              An interface error was caught. You can reload the page or reset the current portal session.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => window.location.reload()}>
                <RotateCcw size={14} />
                Reload Page
              </button>
              <button className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={this.handleReset}>
                <KeyRound size={14} />
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppRouter() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
