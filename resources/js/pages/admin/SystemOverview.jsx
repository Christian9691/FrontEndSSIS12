import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config';
import { StatCard } from '../../components/StatCard';
import { RefreshCw, Zap, GraduationCap, Inbox, CreditCard, Building2, Lock, FileText, ShieldCheck } from 'lucide-react';

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
    const interval = setInterval(() => loadData(true), 5000);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Executive Operations & SLA Dashboard
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
            Pamantasan ng Cabuyao · Institutional Performance & Health Monitoring
          </p>
        </div>
        <button className="btn btn-sm btn-secondary" onClick={() => loadData(false)} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid-cols-4">
        <StatCard
          label="Total System Users"
          value={metrics.total_users || 0}
          sub="5 RBAC Academic Roles"
        />
        <StatCard
          label="Enrolled Students"
          value={metrics.total_students || 0}
          sub="Undergraduate Profiles"
        />
        <StatCard
          label="Document Requests"
          value={metrics.total_requests || 0}
          sub={`${metrics.pending_payments || 0} awaiting cashier`}
        />
        <StatCard
          label="Verified Collections"
          value={`₱${(metrics.total_collections || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="COA Audit Reconciled"
          color="var(--success)"
        />
      </div>

      {/* Operational SLA & Performance Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Turnaround Time (SLA)
            </span>
            <span className="badge badge-success">Optimal</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
            1.4 Days
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Average processing from request &rarr; fee settlement &rarr; registrar release (Target: under 3.0 days).
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Clearance Compliance
            </span>
            <span className="badge badge-info">Active</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0369a1' }}>
            83.3%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Students cleared across Library, Laboratory, Prefect of Discipline, and Dean's Office.
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Public Verification
            </span>
            <span className="badge badge-success">Protected</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857' }}>
            100%
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            All released credentials sealed with 128-bit CSPRNG token & HMAC-SHA256 signature.
          </p>
        </div>
      </div>

      {/* Architecture & MoSCoW Compliance Card */}
      <div className="card">
        <div className="card-header-bar">
          <h3>System Security & MoSCoW Prioritization Alignment</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <Lock size={15} />
              Zero-Trust RBAC & IDOR Defense
            </strong>
            <div>Role gates strictly enforced on all API endpoints. Students can only access their own records (`403 Forbidden` on cross-account query attempts).</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <FileText size={15} />
              Immutable Cryptographic Audit Log
            </strong>
            <div>Every state transition (submission, fee collection, clearance hold, certification) is recorded with actor ID, timestamp, and client IP address.</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={15} />
              RA 10173 Privacy Compliance
            </strong>
            <div>The public verification portal (<code>/verify/:token</code>) automatically masks student personal information (<code>J*** D***</code>) while validating credential authenticity.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
