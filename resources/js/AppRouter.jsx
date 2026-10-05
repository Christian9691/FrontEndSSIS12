import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLES } from './config';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';

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

export function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
