import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import { CheckCircle2, AlertTriangle, RefreshCw, Clock, Send } from 'lucide-react';

export function ClearanceStatus() {
  const [clearanceData, setClearanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appealModalRecord, setAppealModalRecord] = useState(null);
  const [appealNotes, setAppealNotes] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchClearance = () => {
    api.get('/api/student/clearance')
      .then((data) => setClearanceData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClearance();
  }, []);

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!appealModalRecord || !appealNotes.trim()) return;

    setSubmittingAppeal(true);
    try {
      const res = await api.post('/api/student/clearance/appeal', {
        clearance_record_id: appealModalRecord.id,
        appeal_notes: appealNotes,
      });

      setFeedback({ type: 'success', text: res.message });
      setAppealModalRecord(null);
      setAppealNotes('');
      fetchClearance();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to submit clearance appeal.' });
    } finally {
      setSubmittingAppeal(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading departmental clearance records...</p>
      </div>
    );
  }

  return (
    <div>
      {feedback && (
        <BannerAlert
          type={feedback.type}
          message={feedback.text}
          style={{ marginBottom: '1.25rem' }}
        />
      )}

      {/* Top Overview Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          background: clearanceData?.is_cleared
            ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
            : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
          borderLeft: `5px solid ${clearanceData?.is_cleared ? '#10b981' : '#ef4444'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Official Institutional Standing
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {clearanceData?.is_cleared ? (
                <>
                  <CheckCircle2 size={24} className="text-emerald-600" />
                  Academic Clearance Fully Satisfied
                </>
              ) : (
                <>
                  <AlertTriangle size={24} className="text-red-600" />
                  Outstanding Departmental Holds Found
                </>
              )}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {clearanceData?.is_cleared
                ? 'You have zero pending accountabilities. You are fully eligible for document requests and enrollment.'
                : 'You have one or more unresolved department obligations. Settle them or submit an appeal below.'}
            </p>
          </div>
          <StatusBadge status={clearanceData?.is_cleared ? 'cleared' : 'hold'} />
        </div>
      </div>

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Departmental Clearance Checklist</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Cross-department swimlane requirements: Signatories must validate account standing.
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={fetchClearance}>
            <RefreshCw size={14} />
            Refresh Status
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Department / Unit</th>
                <th>Signatory Authority</th>
                <th>Status</th>
                <th>Accountability Reason / Appeal Status</th>
                <th>Cleared Date</th>
                <th>Action</th>
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
                      <div>
                        <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.86rem' }}>
                          {c.hold_reason}
                        </div>
                        {c.appeal_status === 'pending' && (
                          <div style={{ marginTop: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            <Clock size={12} /> Appeal Under Review ({c.appeal_submitted_at})
                          </div>
                        )}
                        {c.appeal_notes && c.appeal_status === 'pending' && (
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem', fontStyle: 'italic' }}>
                            "{c.appeal_notes}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', fontWeight: 500, fontSize: '0.86rem' }}>
                        <CheckCircle2 size={14} /> Account in good standing
                      </span>
                    )}
                  </td>
                  <td>{c.cleared_at || '—'}</td>
                  <td>
                    {c.status === 'hold' && (
                      <button
                        className="btn btn-sm btn-accent"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        onClick={() => {
                          setAppealModalRecord(c);
                          setAppealNotes(c.appeal_notes || '');
                        }}
                      >
                        {c.appeal_status === 'pending' ? 'Edit Appeal' : 'Submit Appeal / Proof'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUBMIT APPEAL MODAL */}
      {appealModalRecord && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Clearance Appeal / Proof of Return</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Submit resolution details to {appealModalRecord.signatory}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setAppealModalRecord(null)}>×</button>
            </div>

            <form onSubmit={handleSubmitAppeal}>
              <div className="modal-body">
                <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#991b1b' }}>
                  <strong>Current Hold:</strong> {appealModalRecord.hold_reason}
                </div>

                <div className="input-group">
                  <label>Resolution Explanation & Reference (e.g. Receipt #, Return Slip ID, or Explanation)</label>
                  <textarea
                    rows="4"
                    value={appealNotes}
                    onChange={(e) => setAppealNotes(e.target.value)}
                    placeholder="e.g. Returned borrowed book to Counter 2 on October 15. Acknowledged by staff with receipt slip #LIB-2026-9912."
                    style={{ resize: 'none' }}
                    required
                  />
                  <small style={{ color: 'var(--text-subtle)', marginTop: '0.35rem', display: 'block' }}>
                    Department officers will review your submission and can clear the hold directly from their dashboard.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAppealModalRecord(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  disabled={submittingAppeal}
                >
                  <Send size={14} />
                  {submittingAppeal ? 'Submitting...' : 'Submit Appeal to Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
