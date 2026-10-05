import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';

export function ClearanceStatus() {
  const [clearanceData, setClearanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/student/clearance')
      .then((data) => setClearanceData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card"><p>Loading clearance records...</p></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Departmental Clearance Checklist</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Swimlane requirement: Academic clearance must be satisfied before document processing and enrollment
            </p>
          </div>
          <StatusBadge status={clearanceData?.is_cleared ? 'cleared' : 'hold'} />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Department / Office</th>
                <th>Signatory Authority</th>
                <th>Status</th>
                <th>Details / Accountability Reason</th>
                <th>Cleared Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(clearanceData?.records || []).map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.department_code}</strong></td>
                  <td>{c.signatory}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {c.status === 'hold' ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{c.hold_reason}</span>
                    ) : (
                      <span style={{ color: 'var(--success)' }}>Account in good standing</span>
                    )}
                  </td>
                  <td>{c.cleared_at || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
