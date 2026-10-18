import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import { OfficialDocumentModal } from '../../components/OfficialDocumentModal';
import { RefreshCw, Search, Filter, Eye, CheckCircle2, Play, FileText, Check } from 'lucide-react';

export function DocumentQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');

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

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'ALL' && r.processing_status !== statusFilter) return false;
      if (courseFilter !== 'ALL' && r.course !== courseFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTracking = (r.tracking_number || '').toLowerCase().includes(q);
        const matchesName = (r.student_name || '').toLowerCase().includes(q);
        const matchesDoc = (r.document_type || '').toLowerCase().includes(q);
        if (!matchesTracking && !matchesName && !matchesDoc) return false;
      }
      return true;
    });
  }, [requests, statusFilter, courseFilter, searchQuery]);

  if (loading && requests.length === 0) {
    return <div className="card"><p>Loading request queue...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3>Registrar Document Verification & Processing Queue</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Process academic documents, verify student records, and release completed credentials
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => loadRequests(false)}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.1rem', background: '#f8faf8', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search tracking #, student name, or document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2.2rem', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Status Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'pending_payment', label: 'Pending Payment' },
                { id: 'paid', label: 'Paid' },
                { id: 'processing', label: 'Processing' },
                { id: 'ready_for_pickup', label: 'Ready' },
                { id: 'released', label: 'Released' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setStatusFilter(t.id)}
                  style={{
                    padding: '0.22rem 0.55rem',
                    fontSize: '0.76rem',
                    borderRadius: '20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: statusFilter === t.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: statusFilter === t.id ? 'var(--primary)' : '#fff',
                    color: statusFilter === t.id ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Program Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{ padding: '0.28rem 0.6rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="ALL">All Programs</option>
              <option value="BSCS">BSCS</option>
              <option value="BSIT">BSIT</option>
              <option value="BSIS">BSIS</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Tracking Number</th>
                <th style={{ width: '180px' }}>Student Name</th>
                <th style={{ width: '90px' }}>Course</th>
                <th style={{ width: '100px' }}>Document</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '140px' }}>Payment</th>
                <th style={{ width: '200px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No document requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.86rem', color: 'var(--primary-dark)' }}>
                        {r.tracking_number}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.student_name}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        {r.course}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {r.document_type}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.processing_status} />
                    </td>
                    <td>
                      {r.payment ? (
                        <span
                          className="badge badge-success"
                          style={{ fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        >
                          OR #{r.payment.official_receipt_no}
                        </span>
                      ) : (
                        <span
                          className="badge badge-warning"
                          style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        >
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', alignItems: 'center' }}>
                        {r.processing_status === 'paid' && (
                          <button
                            className="btn btn-sm btn-accent"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleUpdateStatus(r.id, 'processing')}
                          >
                            <Play size={13} />
                            Start Processing
                          </button>
                        )}
                        {r.processing_status === 'processing' && (
                          <button
                            className="btn btn-sm btn-accent"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleUpdateStatus(r.id, 'ready_for_pickup')}
                          >
                            <CheckCircle2 size={13} />
                            Mark Ready
                          </button>
                        )}
                        {r.processing_status === 'ready_for_pickup' && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleUpdateStatus(r.id, 'released')}
                          >
                            <Check size={13} />
                            Release Doc
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => setPreviewDoc(r)}
                        >
                          <Eye size={13} />
                          Preview Doc
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewDoc && <OfficialDocumentModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
