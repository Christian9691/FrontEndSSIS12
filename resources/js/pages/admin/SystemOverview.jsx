import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatCard } from '../../components/StatCard';

export function SystemOverview() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    api.get('/api/admin/dashboard')
      .then((res) => setDashboard(res))
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 4000);
    const onFocus = () => loadData(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const metrics = dashboard?.metrics || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="btn btn-sm btn-secondary" onClick={loadData} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Metrics'}
        </button>
      </div>

      <div className="grid-cols-4">
        <StatCard
          label="Total System Users"
          value={metrics.total_users || 0}
          sub="Across 5 academic roles"
        />
        <StatCard
          label="Enrolled Students"
          value={metrics.total_students || 0}
          sub="Active academic profiles"
        />
        <StatCard
          label="Document Requests"
          value={metrics.total_requests || 0}
          sub={`${metrics.pending_payments || 0} awaiting payment`}
        />
        <StatCard
          label="Total Collections"
          value={`₱${(metrics.total_collections || 0).toLocaleString()}`}
          sub="Audit verified receipts"
          color="var(--success)"
        />
      </div>

      <div className="card">
        <div className="card-header-bar">
          <h3>System Security & Architectural Compliance</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The CuyoTech Student Services Information System is implemented with 3NF normalized relational schema
          (Departments, Courses, Users, Students, DocumentRequests, Payments) and enforces role-based access control
          covering Student, Registrar, Cashier, Department, and Administrator workflows.
        </p>
      </div>
    </div>
  );
}
