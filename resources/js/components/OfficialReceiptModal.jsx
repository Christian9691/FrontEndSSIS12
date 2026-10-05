import React from 'react';

export function OfficialReceiptModal({ doc, onClose }) {
  if (!doc) return null;
  const payment = doc.payment || {};

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3>Official University Receipt</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ background: '#f8faf8' }}>
          <div className="official-receipt-paper" style={{ background: '#fff', border: '1px solid #ddd', padding: '1.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #444', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>CUYOTECH UNIVERSITY</h3>
              <div style={{ fontSize: '0.8rem' }}>Cashier & Treasury Office</div>
              <div style={{ fontSize: '0.8rem' }}>City of Cabuyao, Laguna</div>
              <h4 style={{ margin: '0.5rem 0 0', textDecoration: 'underline' }}>OFFICIAL RECEIPT</h4>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
              <div>Receipt No: <strong>{payment.official_receipt_no || 'OR-2026-XXXXX'}</strong></div>
              <div>Tracking No: <strong>{doc.tracking_number}</strong></div>
              <div>Payor: <strong>{doc.student_name}</strong></div>
              <div>Date: <strong>{payment.transaction_date || new Date().toLocaleString()}</strong></div>
              <div>Payment Method: <strong>{(payment.payment_method || 'CASH').toUpperCase()}</strong></div>
            </div>

            <div style={{ borderTop: '1px solid #444', borderBottom: '1px solid #444', padding: '0.6rem 0', margin: '0.8rem 0', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>PARTICULARS ({doc.document_type})</span>
              <span>₱{(payment.amount_paid || doc.assessment_fee || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', margin: '0.8rem 0' }}>
              <span>TOTAL AMOUNT PAID:</span>
              <span>₱{(payment.amount_paid || doc.assessment_fee || 0).toFixed(2)}</span>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
              <div>Collecting Officer: {payment.cashier_name || 'BEN CRUZ'}</div>
              <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '0.4rem' }}>
                Thank you. Valid as official proof of payment.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-accent" onClick={() => window.print()}>Print Receipt</button>
        </div>
      </div>
    </div>
  );
}
