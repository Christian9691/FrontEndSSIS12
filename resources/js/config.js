/**
 * Application Constants and Role Definitions
 * Aligned with SSIS Context Diagram and Unified Class Diagram
 */
export const ROLES = {
  student: {
    key: 'student',
    label: 'Student Portal',
    badge: 'Student',
    basePath: '/student',
    routes: [
      { path: '/student', label: 'Dashboard' },
      { path: '/student/grades', label: 'Grades & Subjects' },
      { path: '/student/clearance', label: 'Clearance Status' },
      { path: '/student/requests', label: 'Document Requests' },
    ],
  },
  registrar: {
    key: 'registrar',
    label: 'Registrar Module',
    badge: 'Registrar',
    basePath: '/registrar',
    routes: [
      { path: '/registrar', label: 'Document Queue' },
      { path: '/registrar/grades', label: 'Grades Encoding' },
      { path: '/registrar/enrollment', label: 'Enrollment' },
    ],
  },
  cashier: {
    key: 'cashier',
    label: 'Cashier Module',
    badge: 'Cashier',
    basePath: '/cashier',
    routes: [
      { path: '/cashier', label: 'Payment Queue' },
      { path: '/cashier/ledger', label: 'Receipts Ledger' },
    ],
  },
  department: {
    key: 'department',
    label: 'Department Module',
    badge: 'Department Staff',
    basePath: '/department',
    routes: [
      { path: '/department', label: 'Clearance Processing' },
    ],
  },
  admin: {
    key: 'admin',
    label: 'Admin Module',
    badge: 'Administrator',
    basePath: '/admin',
    routes: [
      { path: '/admin', label: 'System Overview' },
      { path: '/admin/users', label: 'User Accounts' },
      { path: '/admin/audit', label: 'Audit Logs' },
    ],
  },
};

export const DEMO_USERS = [
  { label: 'Juan Dela Cruz (Student - BSIT 2nd Year)', id: 'student@cuyotech.edu.ph', studentNumber: '2026-00123', role: 'student', userId: 5 },
  { label: 'Maria Santos (Student - BSCS 3rd Year)', id: 'maria@cuyotech.edu.ph', studentNumber: '2026-00124', role: 'student', userId: 6 },
  { label: 'Carlos Mendoza (Student - BSCS 2nd Year)', id: 'carlos@cuyotech.edu.ph', studentNumber: '2026-00126', role: 'student', userId: 7 },
  { label: 'Pedro Reyes (Student - Has Clearance Hold)', id: 'pedro@cuyotech.edu.ph', studentNumber: '2026-00125', role: 'student', userId: 8 },
  { label: 'Dr. Elena Ramos (Registrar)', id: 'registrar@cuyotech.edu.ph', role: 'registrar', userId: 2 },
  { label: 'Ben Cruz (Cashier Officer)', id: 'cashier@cuyotech.edu.ph', role: 'cashier', userId: 3 },
  { label: 'Prof. Rolando Diaz (CCS Dept Head)', id: 'department@cuyotech.edu.ph', role: 'department', userId: 4 },
  { label: 'System Administrator (Admin)', id: 'admin@cuyotech.edu.ph', role: 'admin', userId: 1 },
];

export const DOC_TYPE_FEES = {
  TOR: 150.00,
  COR: 75.00,
  Certification: 50.00,
};
