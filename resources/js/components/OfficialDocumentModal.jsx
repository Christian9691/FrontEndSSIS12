import React from 'react';

export function OfficialDocumentModal({ doc, onClose }) {
  if (!doc) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>Official Document Preview</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ background: '#eef2ee', padding: '1.5rem' }}>
          <div className="official-doc-paper">
            <div className="doc-watermark">CUYOTECH SSIS VERIFIED</div>

            <div className="official-header">
              <h4>REPUBLIC OF THE PHILIPPINES</h4>
              <h2>CUYOTECH UNIVERSITY</h2>
              <h4>PAMANTASAN NG CABUYAO</h4>
              <p>College of Computing Studies · Katapatan Mutual Homes, Brgy. Banay-banay, Cabuyao, Laguna</p>
              <p>Office of the University Registrar</p>
            </div>

            <div className="doc-type-badge-title">
              {doc.document_type === 'TOR'
                ? 'OFFICIAL TRANSCRIPT OF RECORDS'
                : doc.document_type === 'COR'
                ? 'CERTIFICATE OF REGISTRATION (COR)'
                : 'OFFICIAL UNIVERSITY CERTIFICATION'}
            </div>

            <div className="official-student-info">
              <div>Student Name: <span>{doc.student_name}</span></div>
              <div>Student Number: <span>{doc.student_number || '2026-00123'}</span></div>
              <div>Degree Program: <span>{doc.course_title || 'Bachelor of Science in Information Technology'}</span></div>
              <div>Tracking Number: <span>{doc.tracking_number}</span></div>
              <div>Date Issued: <span>{doc.release_date || new Date().toLocaleDateString()}</span></div>
              <div>Processing Status: <span>OFFICIALLY RELEASED</span></div>
            </div>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              This certifies that the above-named student is officially registered in this institution with all academic
              prerequisites, departmental clearings, and fee assessments fully validated and complied with in accordance
              with University Regulations. Purpose of issuance: <em>{doc.purpose}</em>.
            </p>

            <div className="official-signatures">
              <div className="sig-block">
                <div style={{ fontSize: '0.78rem', color: '#666' }}>Checked & Verified by:</div>
                <div className="sig-line">Office of the Registrar</div>
                <small>Records Division</small>
              </div>

              <div className="sig-block">
                <div style={{ fontSize: '0.78rem', color: '#666' }}>Approved & Released by:</div>
                <div className="sig-line">DR. ELENA RAMOS</div>
                <small>University Registrar</small>
              </div>
            </div>

            <div style={{ marginTop: '2rem', borderTop: '1px dashed #999', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#555' }}>
              <div>Security Verification Hash: <code>SHA256-{doc.tracking_number}-VERIFIED</code></div>
              <div>Official Document Seal Attached</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-accent" onClick={handlePrint}>🖨️ Print / Save as PDF</button>
        </div>
      </div>
    </div>
  );
}
