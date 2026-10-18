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

function AppLayout() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect immediately if the current URL does not belong to the user's role
  useEffect(() => {
    if (currentUser) {
      if (location.pathname.startsWith('/verify')) {
        return;
      }
      // System administrators have full oversight across all SSIS modules
      if (currentUser.role === 'admin') {
        return;
      }
      const roleConfig = ROLES[currentUser.role];
      if (roleConfig) {
        const isPathAllowed = roleConfig.routes.some(
          (r) => location.pathname === r.path || location.pathname.startsWith(r.path + '/')
        );
        if (!isPathAllowed) {
          navigate(roleConfig.basePath, { replace: true });
        }
      }
    }
  }, [currentUser?.role, currentUser?.id, location.pathname, navigate]);

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
    return <Login />;
  }

  const roleConfig = ROLES[currentUser.role] || ROLES.student;

  // Derive active page title from current route
  const currentRoute = roleConfig.routes.find((r) => r.path === location.pathname);
  const pageTitle = currentRoute ? currentRoute.label : roleConfig.label;

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <Navbar title={pageTitle} />

        <div className="content-container">
          <Routes>
            {/* Student Portal Routes */}
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/grades" element={<GradesAndSubjects />} />
            <Route path="/student/clearance" element={<ClearanceStatus />} />
            <Route path="/student/requests" element={<DocumentRequests />} />

            {/* Registrar Module Routes */}
            <Route path="/registrar" element={<DocumentQueue />} />
            <Route path="/registrar/grades" element={<GradesEncoding />} />
            <Route path="/registrar/enrollment" element={<Enrollment />} />

            {/* Cashier Module Routes */}
            <Route path="/cashier" element={<PaymentQueue />} />
            <Route path="/cashier/ledger" element={<ReceiptsLedger />} />

            {/* Department Module Routes */}
            <Route path="/department" element={<ClearanceProcessing />} />

            {/* Admin Module Routes */}
            <Route path="/admin" element={<SystemOverview />} />
            <Route path="/admin/users" element={<UserAccounts />} />
            <Route path="/admin/audit" element={<AuditLogs />} />

            {/* Root & Fallback Redirects */}
            <Route path="/" element={<Navigate to={roleConfig.basePath} replace />} />
            <Route path="*" element={<Navigate to={roleConfig.basePath} replace />} />
          </Routes>
        </div>
      </main>
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
    window.location.href = '/';
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
