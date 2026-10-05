import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { OfficialReceiptModal } from '../../components/OfficialReceiptModal';

export function ReceiptsLedger() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  useEffect(() => {
    api.get('/api/payments')
      .then((res) => setPayments(res.payments || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card"><p>Loading receipts ledger...</p></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header-bar">
          <h3>Official Receipts Transaction Ledger</h3>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Official Receipt No</th>
                <th>Tracking Number</th>
                <th>Student Name</th>
                <th>Amount Paid</th>
                <th>Payment Method</th>
                <th>Transaction Date</th>
                <th>Cashier</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.official_receipt_no}</strong></td>
                  <td>{p.tracking_number}</td>
                  <td>{p.student_name}</td>
                  <td>₱{p.amount_paid.toFixed(2)}</td>
                  <td><span className="badge badge-neutral">{p.payment_method.toUpperCase()}</span></td>
                  <td>{p.transaction_date}</td>
                  <td>{p.cashier_name}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewReceipt({
                        tracking_number: p.tracking_number,
                        document_type: p.document_type,
                        student_name: p.student_name,
                        student_number: p.student_number,
                        payment: p,
                      })}
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
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
