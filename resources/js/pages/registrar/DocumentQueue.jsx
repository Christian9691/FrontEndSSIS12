import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import { OfficialDocumentModal } from '../../components/OfficialDocumentModal';

export function DocumentQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadRequests = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    api.get('/api/document-requests')
      .then((res) => setRequests(res.requests || []))
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    loadRequests(false);
    const interval = setInterval(() => loadRequests(true), 3500);
    const onFocus = () => loadRequests(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/api/document-requests/${id}/status`, { status });
      setMsg({ type: 'success', text: res.message });
      loadRequests();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Status update failed.' });
    }
  };

  if (loading) {
    return <div className="card"><p>Loading request queue...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Registrar Document Verification & Processing Queue</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Process academic documents, verify student records, and release completed credentials
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={loadRequests}>
            🔄 Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Document</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.tracking_number}</strong></td>
                  <td>{r.student_name}</td>
                  <td>{r.course}</td>
                  <td>{r.document_type}</td>
                  <td><StatusBadge status={r.processing_status} /></td>
                  <td>
                    {r.payment ? (
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        OR #{r.payment.official_receipt_no}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Unpaid</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {r.processing_status === 'paid' && (
                        <button className="btn btn-sm btn-accent" onClick={() => handleUpdateStatus(r.id, 'processing')}>
                          Start Processing
                        </button>
                      )}
                      {r.processing_status === 'processing' && (
                        <button className="btn btn-sm btn-accent" onClick={() => handleUpdateStatus(r.id, 'ready_for_pickup')}>
                          Mark Ready
                        </button>
                      )}
                      {r.processing_status === 'ready_for_pickup' && (
                        <button className="btn btn-sm" onClick={() => handleUpdateStatus(r.id, 'released')}>
                          Release Document
                        </button>
                      )}
                      <button className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(r)}>
                        Preview Doc
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewDoc && <OfficialDocumentModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
