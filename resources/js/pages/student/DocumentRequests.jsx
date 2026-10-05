import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { OfficialDocumentModal } from '../../components/OfficialDocumentModal';
import { OfficialReceiptModal } from '../../components/OfficialReceiptModal';
import { DOC_TYPE_FEES } from '../../config';

export function DocumentRequests() {
  const [requests, setRequests] = useState([]);
  const [docType, setDocType] = useState('TOR');
  const [copies, setCopies] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [holdModal, setHoldModal] = useState(null);

  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const loadRequests = () => {
    api.get('/api/document-requests')
      .then((res) => setRequests(res.requests || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 3500);
    const onFocus = () => loadRequests();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    setHoldModal(null);

    try {
      const res = await api.post('/api/document-requests', {
        document_type: docType,
        purpose,
        copies,
      });

      if (res.success) {
        setMsg({ type: 'success', text: res.message });
        setPurpose('');
        setCopies(1);
        loadRequests();
      }
    } catch (err) {
      if (err.has_hold) {
        // --- SWIMLANE DECISION BRANCH: Has Hold? -> Yes/Uncleared -> View Clearance Hold ---
        setHoldModal({
          summary: err.hold_summary,
          holds: err.holds || [],
        });
      } else {
        setMsg({ type: 'danger', text: err.message || 'Submission failed.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const currentFee = (DOC_TYPE_FEES[docType] || 50) * copies;

  return (
    <div>
      {/* Swimlane Flow Section */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header-bar">
            <h3>Request an Official School Document</h3>
          </div>

          {msg && (
            <div className={`banner-alert ${msg.type}`} style={{ padding: '0.6rem 0.8rem', marginBottom: '1rem' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '0.9rem' }}>
              <label>Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="TOR">Transcript of Records (TOR) - ₱150.00 / copy</option>
                <option value="COR">Certificate of Registration (COR) - ₱75.00 / copy</option>
                <option value="Certification">Certificate of Grades / Good Moral - ₱50.00 / copy</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: '0.9rem' }}>
              <label>Number of Copies</label>
              <input
                type="number"
                min="1"
                max="5"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '0.9rem' }}>
              <label>Purpose of Request</label>
              <textarea
                rows="3"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Scholarship application, Employment, Board exam filing"
                required
              />
            </div>

            <div style={{ background: '#f8faf8', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Calculated Assessment Fee:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                ₱{currentFee.toFixed(2)}
              </span>
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Verifying Clearance & Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Workflow Explainer */}
        <div className="card">
          <div className="card-header-bar">
            <h3>Document Processing Workflow (Swimlane)</h3>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Submit Request:</strong> Select document & submit.</li>
              <li><strong>Clearance Verification:</strong> System checks if student has clearance holds. Uncleared requests are blocked.</li>
              <li><strong>Assessment Fee:</strong> Pay fee to Cashier (Cash / Online / Bank Transfer).</li>
              <li><strong>Official Receipt:</strong> Cashier verifies payment and issues official receipt.</li>
              <li><strong>Registrar Processing:</strong> Registrar encodes and verifies records.</li>
              <li><strong>Document Release:</strong> Download official document with verification seal and QR code.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Requests Tracking Table */}
      <div className="card">
        <div className="card-header-bar">
          <h3>My Document Requests & Official Documents</h3>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Document</th>
                <th>Purpose</th>
                <th>Assessment Fee</th>
                <th>Status</th>
                <th>Receipt / Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.tracking_number}</strong></td>
                  <td>{r.document_type}</td>
                  <td style={{ maxWidth: '200px' }}>{r.purpose}</td>
                  <td>₱{r.assessment_fee.toFixed(2)}</td>
                  <td><StatusBadge status={r.processing_status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {r.payment && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setActiveReceipt(r)}>
                          Official Receipt
                        </button>
                      )}
                      {r.processing_status === 'released' && (
                        <button className="btn btn-sm" onClick={() => setActivePreviewDoc(r)}>
                          View / Print Document
                        </button>
                      )}
                      {r.processing_status === 'pending_payment' && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                          Awaiting Cashier Settlement
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SWIMLANE MODAL: Clearance Hold Notice */}
      {holdModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ borderBottomColor: '#fecaca', background: '#fef2f2' }}>
              <h3 style={{ color: 'var(--danger)' }}>⚠️ Request Blocked by Clearance Hold</h3>
              <button className="modal-close-btn" onClick={() => setHoldModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem', fontSize: '0.92rem' }}>
                Your document request cannot be processed because you have active clearance holds.
                In compliance with CuyoTech University policy, all financial and property accountability must be settled:
              </p>
              <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                <strong>Active Hold Reasons:</strong>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', color: '#9b2c2c' }}>
                  {holdModal.holds.map((h, i) => (
                    <li key={i}><strong>{h.signatory_name}:</strong> {h.hold_reason}</li>
                  ))}
                </ul>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please proceed to the respective offices to resolve these holds. Once cleared, you may re-submit your request.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setHoldModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {activePreviewDoc && (
        <OfficialDocumentModal doc={activePreviewDoc} onClose={() => setActivePreviewDoc(null)} />
      )}

      {activeReceipt && (
        <OfficialReceiptModal doc={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}
