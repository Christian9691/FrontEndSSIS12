import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatCard } from '../../components/StatCard';
import { BannerAlert } from '../../components/BannerAlert';
import { OfficialReceiptModal } from '../../components/OfficialReceiptModal';

export function PaymentQueue() {
  const [payments, setPayments] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [totalCollections, setTotalCollections] = useState(0);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
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
        <div className="card-header-bar">
          <div>
            <h3>Assessment Fee Billing & Payment Verification Queue</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Swimlane Step: Verify student payment and issue Official Receipt to advance document request to processing
            </p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={loadData}>
            🔄 Refresh
          </button>
        </div>

        {pendingReqs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending payments in queue. All assessments are settled.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Student Name</th>
                  <th>Student Number</th>
                  <th>Document</th>
                  <th>Assessment Fee</th>
                  <th>Date Filed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReqs.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.tracking_number}</strong></td>
                    <td>{r.student_name}</td>
                    <td>{r.student_number}</td>
                    <td>{r.document_type}</td>
                    <td><strong style={{ color: 'var(--primary-dark)' }}>₱{r.assessment_fee.toFixed(2)}</strong></td>
                    <td>{r.requested_date}</td>
                    <td>
                      <button className="btn btn-sm btn-accent" onClick={() => setReceiptModal(r)}>
                        Verify & Issue Official Receipt
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
              <h3>Issue Official University Receipt</h3>
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
                <button type="submit" className="btn btn-accent">Confirm & Issue Official Receipt</button>
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
