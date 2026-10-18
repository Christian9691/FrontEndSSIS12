import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { StatCard } from '../../components/StatCard';
import { BannerAlert } from '../../components/BannerAlert';
import { OfficialReceiptModal } from '../../components/OfficialReceiptModal';
import { RefreshCw, Search, CheckCircle2, CreditCard, Filter, Calendar, FileText } from 'lucide-react';

export function PaymentQueue() {
  const [payments, setPayments] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [totalCollections, setTotalCollections] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [docFilter, setDocFilter] = useState('ALL');

  const [receiptModal, setReceiptModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customReceiptNo, setCustomReceiptNo] = useState('');
  const [msg, setMsg] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const loadData = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    api.get('/api/payments')
      .then((res) => {
        setPayments(res.payments || []);
        setPendingReqs(res.pending_requests || []);
        setTotalCollections(res.total_collections || 0);
      })
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

  const handleIssueReceipt = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/payments/issue-receipt', {
        document_request_id: receiptModal.id,
        payment_method: paymentMethod,
        official_receipt_no: customReceiptNo || undefined,
      });

      setMsg({ type: 'success', text: res.message });
      setReceiptModal(null);
      setCustomReceiptNo('');
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Receipt issuance failed.' });
    }
  };

  const filteredRequests = useMemo(() => {
    return pendingReqs.filter((r) => {
      if (docFilter !== 'ALL' && r.document_type !== docFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTracking = (r.tracking_number || '').toLowerCase().includes(q);
        const matchesName = (r.student_name || '').toLowerCase().includes(q);
        const matchesNumber = (r.student_number || '').toLowerCase().includes(q);
        if (!matchesTracking && !matchesName && !matchesNumber) return false;
      }
      return true;
    });
  }, [pendingReqs, docFilter, searchQuery]);

  if (loading && pendingReqs.length === 0) {
    return <div className="card"><p>Loading cashier queue...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="grid-cols-4">
        <StatCard
          label="Total Verified Collections"
          value={`₱${totalCollections.toLocaleString()}`}
          sub="Official university treasury receipts"
          color="var(--success)"
        />
        <StatCard
          label="Pending Payment Requests"
          value={pendingReqs.length}
          sub="Assessment fees waiting settlement"
        />
        <StatCard
          label="Issued Receipts"
          value={payments.length}
          sub="Transactions on record"
        />
        <StatCard
          label="Current Cashier Session"
          value="Active"
          sub="Station Desk #1"
        />
      </div>

      <div className="card">
        <div className="card-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h3>Assessment Fee Billing & Payment Verification Queue</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Swimlane Step: Verify student payment and issue Official Receipt to advance document request to processing
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => loadData(false)}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', background: '#f8faf8', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search tracking #, student name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2.2rem', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={13} /> Document:
            </span>
            {['ALL', 'TOR', 'COR', 'Certification'].map((doc) => (
              <button
                key={doc}
                type="button"
                onClick={() => setDocFilter(doc)}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  borderRadius: '20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: docFilter === doc ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: docFilter === doc ? 'var(--primary)' : '#fff',
                  color: docFilter === doc ? '#fff' : 'var(--text-muted)',
                }}
              >
                {doc}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
            {pendingReqs.length === 0 ? 'No pending payments in queue. All assessments are settled.' : 'No matching pending requests found for the selected filter.'}
          </p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '130px' }}>Tracking Number</th>
                  <th style={{ minWidth: '160px' }}>Student Name</th>
                  <th style={{ minWidth: '110px' }}>Student Number</th>
                  <th style={{ minWidth: '90px' }}>Document</th>
                  <th style={{ minWidth: '100px' }}>Assessment Fee</th>
                  <th style={{ minWidth: '100px' }}>Date Filed</th>
                  <th style={{ minWidth: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r) => (
                  <tr key={r.id}>
                    <td><strong style={{ fontFamily: 'monospace', fontSize: '0.86rem' }}>{r.tracking_number}</strong></td>
                    <td>{r.student_name}</td>
                    <td><code style={{ fontSize: '0.82rem' }}>{r.student_number}</code></td>
                    <td><span className="badge badge-info">{r.document_type}</span></td>
                    <td><strong style={{ color: 'var(--primary-dark)', fontSize: '0.95rem' }}>₱{r.assessment_fee.toFixed(2)}</strong></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.requested_date}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-accent"
                        style={{ whiteSpace: 'nowrap', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setReceiptModal(r)}
                      >
                        <CheckCircle2 size={14} />
                        Issue Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE RECEIPT MODAL */}
      {receiptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={18} color="var(--primary)" />
                Issue Official University Receipt
              </h3>
              <button className="modal-close-btn" onClick={() => setReceiptModal(null)}>×</button>
            </div>
            <form onSubmit={handleIssueReceipt}>
              <div className="modal-body">
                <div style={{ background: '#f8faf8', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.88rem' }}>
                    <div>Student: <strong>{receiptModal.student_name}</strong></div>
                    <div>Student ID: <strong>{receiptModal.student_number}</strong></div>
                    <div>Request: <strong>{receiptModal.document_type} ({receiptModal.tracking_number})</strong></div>
                    <div>Assessment Fee: <strong style={{ color: 'var(--primary-dark)', fontSize: '1.1rem' }}>₱{receiptModal.assessment_fee.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash (Over the counter)</option>
                    <option value="online">Online Payment (GCash / Maya)</option>
                    <option value="bank_transfer">Bank Transfer (Landbank / LBP)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Official Receipt Number (Leave blank to auto-generate OR-2026-XXXXX)</label>
                  <input
                    type="text"
                    value={customReceiptNo}
                    onChange={(e) => setCustomReceiptNo(e.target.value)}
                    placeholder="Auto-generated e.g. OR-2026-00845"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReceiptModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={15} />
                  Confirm & Issue Official Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewReceipt && (
        <OfficialReceiptModal doc={previewReceipt} onClose={() => setPreviewReceipt(null)} />
      )}
    </div>
  );
}
