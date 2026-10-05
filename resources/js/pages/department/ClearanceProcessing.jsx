import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';

export function ClearanceProcessing() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holdModalStudent, setHoldModalStudent] = useState(null);
  const [holdReason, setHoldReason] = useState('');
  const [signatoryName, setSignatoryName] = useState('College Department Office');
  const [msg, setMsg] = useState(null);

  const loadData = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    api.get('/api/department/clearances')
      .then((res) => setStudents(res.students || []))
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 3500);
    const onFocus = () => loadData(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleUpdateRecord = async (recordId, status) => {
    try {
      const res = await api.patch(`/api/department/clearances/${recordId}`, { status });
      setMsg({ type: 'success', text: res.message });
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Update failed.' });
    }
  };

  const handleAddHold = async (e) => {
    e.preventDefault();
    if (!holdModalStudent || !holdReason.trim()) return;

    try {
      const res = await api.post('/api/department/clearances/hold', {
        student_id: holdModalStudent.id,
        signatory_name: signatoryName,
        hold_reason: holdReason,
      });

      setMsg({ type: 'success', text: res.message });
      setHoldModalStudent(null);
      setHoldReason('');
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Failed to place hold.' });
    }
  };

  if (loading) {
    return <div className="card"><p>Loading clearance records...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Departmental Student Clearance Processing</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Manage student accountability holds. Toggling a hold here immediately affects student document eligibility in the swimlane diagram.
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={loadData}>
            🔄 Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Overall Status</th>
                <th>Active Department Records</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.student_number}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td><StatusBadge status={s.clearance_status ? 'cleared' : 'hold'} /></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {s.clearance_records.map((r) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <StatusBadge status={r.status} />
                          <span>{r.signatory}: {r.hold_reason || 'Cleared'}</span>
                          {r.status === 'hold' ? (
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}
                              onClick={() => handleUpdateRecord(r.id, 'cleared')}
                            >
                              Mark Cleared
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}
                              onClick={() => handleUpdateRecord(r.id, 'hold')}
                            >
                              Place Hold
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-accent" onClick={() => setHoldModalStudent(s)}>
                      + Add Obligation Hold
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD HOLD MODAL */}
      {holdModalStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Place Clearance Hold on Student</h3>
              <button className="modal-close-btn" onClick={() => setHoldModalStudent(null)}>×</button>
            </div>
            <form onSubmit={handleAddHold}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
                  Student: <strong>{holdModalStudent.name} ({holdModalStudent.student_number})</strong>
                </p>

                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label>Department / Signatory Office</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Reason for Hold (Accountability / Dues)</label>
                  <textarea
                    rows="3"
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="e.g. Unreturned laboratory equipment, Overdue library book, Departmental uniform fee"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setHoldModalStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Clearance Hold</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
