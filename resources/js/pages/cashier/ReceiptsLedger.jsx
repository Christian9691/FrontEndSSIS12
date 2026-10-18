import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { OfficialReceiptModal } from '../../components/OfficialReceiptModal';
import { Printer, Download, Search, CheckCircle2, Receipt, Filter } from 'lucide-react';

export function ReceiptsLedger() {
  const [payments, setPayments] = useState([]);
  const [totalCollections, setTotalCollections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  useEffect(() => {
    api.get('/api/payments')
      .then((res) => {
        setPayments(res.payments || []);
        setTotalCollections(res.total_collections || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const cashTotal = payments
    .filter((p) => p.payment_method === 'cash')
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const onlineTotal = payments
    .filter((p) => p.payment_method !== 'cash')
    .reduce((sum, p) => sum + p.amount_paid, 0);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (methodFilter !== 'ALL') {
        if (methodFilter === 'cash' && p.payment_method !== 'cash') return false;
        if (methodFilter === 'online' && p.payment_method === 'cash') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesOr = (p.official_receipt_no || '').toLowerCase().includes(q);
        const matchesTracking = (p.tracking_number || '').toLowerCase().includes(q);
        const matchesName = (p.student_name || '').toLowerCase().includes(q);
        if (!matchesOr && !matchesTracking && !matchesName) return false;
      }
      return true;
    });
  }, [payments, methodFilter, searchQuery]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading official receipts ledger...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Financial KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Collections Recorded
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0.2rem 0' }}>
            ₱{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} /> Reconciled against cashier drawer
          </div>
        </div>

        <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Official Receipts Issued
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0369a1', margin: '0.2rem 0' }}>
            {payments.length} Receipts
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Receipt size={13} /> Serialized CTU Official Receipts
          </div>
        </div>

        <div className="card" style={{ padding: '1.2rem', borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Payment Channels Split
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0.3rem 0', color: 'var(--text-main)' }}>
            Cash: <span style={{ color: 'var(--primary-dark)' }}>₱{cashTotal.toFixed(2)}</span>
            <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>|</span>
            Online: <span style={{ color: '#0369a1' }}>₱{onlineTotal.toFixed(2)}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Digital Banking & Over-The-Counter
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Official Receipts Transaction Ledger</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Complete audit ledger of verified student assessment collections.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href="/api/payments/export-coa"
              download
              className="btn btn-sm btn-accent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
            >
              <Download size={14} /> Export COA Audit Report (CSV)
            </a>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', background: '#f8faf8', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search OR #, tracking #, or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2.2rem', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={13} /> Method:
            </span>
            {[
              { id: 'ALL', label: 'All Receipts' },
              { id: 'cash', label: 'Cash Only' },
              { id: 'online', label: 'Online / Bank' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMethodFilter(tab.id)}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.78rem',
                  borderRadius: '20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: methodFilter === tab.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: methodFilter === tab.id ? 'var(--primary)' : '#fff',
                  color: methodFilter === tab.id ? '#fff' : 'var(--text-muted)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '130px' }}>Official Receipt No</th>
                <th style={{ minWidth: '120px' }}>Tracking Number</th>
                <th style={{ minWidth: '160px' }}>Student Name</th>
                <th style={{ minWidth: '95px' }}>Amount Paid</th>
                <th style={{ minWidth: '90px' }}>Payment Method</th>
                <th style={{ minWidth: '100px' }}>Transaction Date</th>
                <th style={{ minWidth: '120px' }}>Cashier Officer</th>
                <th style={{ minWidth: '95px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {payments.length === 0 ? 'No receipts recorded yet.' : 'No matching receipts found for current search.'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.84rem' }}>
                        {p.official_receipt_no}
                      </code>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>{p.tracking_number}</span></td>
                    <td>{p.student_name}</td>
                    <td><strong style={{ color: 'var(--primary-dark)', fontSize: '0.95rem' }}>₱{p.amount_paid.toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge ${p.payment_method === 'cash' ? 'badge-neutral' : 'badge-info'}`}>
                        {p.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.transaction_date}</td>
                    <td style={{ fontSize: '0.84rem' }}>{p.cashier_name}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem', whiteSpace: 'nowrap' }}
                        onClick={() => setPreviewReceipt({
                          tracking_number: p.tracking_number,
                          document_type: p.document_type,
                          student_name: p.student_name,
                          student_number: p.student_number,
                          payment: p,
                        })}
                      >
                        <Printer size={13} />
                        View OR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewReceipt && (
        <OfficialReceiptModal doc={previewReceipt} onClose={() => setPreviewReceipt(null)} />
      )}
    </div>
  );
}
