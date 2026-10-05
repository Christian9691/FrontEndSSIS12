import React, { useState, useEffect } from 'react';
import { api } from '../../api';

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    api.get('/api/admin/dashboard')
      .then((res) => setLogs(res.audit_logs || []))
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs(false);
    const interval = setInterval(() => loadLogs(true), 3500);
    const onFocus = () => loadLogs(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <div>
      <div className="card">
        <div className="card-header-bar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ margin: 0 }}>Security & Transaction Audit Trail</h3>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>● Live DB Sync</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Real-time audit log synchronized with the database for all system events and transactions
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => loadLogs(false)} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh Logs'}
          </button>
        </div>

        {loading && logs.length === 0 ? (
          <p>Loading security audit logs...</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User Account</th>
                  <th>Action</th>
                  <th>Event Details</th>
                  <th>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{l.created_at}</td>
                    <td><strong>{l.user_name}</strong></td>
                    <td><span className="badge badge-neutral">{l.action}</span></td>
                    <td>{l.details}</td>
                    <td><code>{l.ip_address || '127.0.0.1'}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
