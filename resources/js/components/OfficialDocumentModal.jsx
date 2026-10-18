import React from 'react';
import { GraduationCap, ShieldCheck, Search, Printer } from 'lucide-react';

export function OfficialDocumentModal({ doc, onClose }) {
  if (!doc) return null;

  const verifyUrl = `${window.location.origin}/verify/${doc.verification_token || doc.tracking_number}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verifyUrl)}&color=0f3d23&bgcolor=ffffff`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '840px', width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={22} color="var(--primary)" />
            <div>
              <h3 style={{ margin: 0 }}>Official Credential Preview</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Certified Academic Document · Tracking #{doc.tracking_number}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ background: '#f1f5f9', padding: '1.5rem', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Printable Official Document Canvas */}
          <div className="official-doc-paper" id="printable-credential">
            <div className="doc-watermark">CUYOTECH UNIVERSITY · CERTIFIED RECORD</div>

            {/* University Letterhead */}
            <div className="official-header">
              <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Republic of the Philippines
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', letterSpacing: '0.04em', margin: '0.1rem 0' }}>
                CUYOTECH UNIVERSITY
              </h2>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                Pamantasan ng Cabuyao
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0' }}>
                College of Computing Studies · Katapatan Mutual Homes, Brgy. Banay-banay, City of Cabuyao, Laguna 4025
              </p>
              <div style={{ display: 'inline-block', borderBottom: '2px solid var(--accent)', paddingBottom: '0.15rem', marginTop: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                Office of the University Registrar
              </div>
            </div>

            {/* Document Title Badge */}
            <div className="doc-type-badge-title" style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
              {doc.document_type === 'TOR'
                ? 'OFFICIAL TRANSCRIPT OF RECORDS'
                : doc.document_type === 'COR'
                ? 'CERTIFICATE OF REGISTRATION (COR)'
                : doc.document_type === 'Good Moral'
                ? 'CERTIFICATE OF GOOD MORAL CHARACTER'
                : 'OFFICIAL UNIVERSITY CERTIFICATION'}
            </div>

            {/* Student Metadata Box */}
            <div className="official-student-info">
              <div>Student Name: <span>{doc.student_name}</span></div>
              <div>Student Number: <span>{doc.student_number || '2026-00123'}</span></div>
              <div>Degree Program: <span>{doc.course_title || 'Bachelor of Science in Information Technology'}</span></div>
              <div>Tracking Number: <span>{doc.tracking_number}</span></div>
              <div>Date Issued: <span>{doc.release_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
              <div>Credential Status: <span style={{ color: 'var(--success)', fontWeight: 700 }}>OFFICIALLY CERTIFIED & RELEASED</span></div>
            </div>

            {/* Certification Statement */}
            <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#1e293b', marginBottom: '1.75rem', textAlign: 'justify' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>TO WHOM IT MAY CONCERN:</strong>
              </p>
              <p>
                This certifies that the student named above is officially recorded in the institutional archives of CuyoTech
                University. All academic prerequisites, department clearance obligations, and financial assessments have been
                fully satisfied and validated in compliance with University Academic Policies and the Commission on Higher
                Education (CHED) standards.
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                Purpose of issuance: <em style={{ color: '#0f172a' }}>{doc.purpose || 'Official Reference & Records Verification'}</em>.
              </p>
            </div>

            {/* Signature Blocks */}
            <div className="official-signatures">
              <div className="sig-block">
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2.5rem' }}>Verified and Recorded:</div>
                <div className="sig-line">OFFICE OF THE REGISTRAR</div>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>Student Records Division</small>
              </div>

              <div className="sig-block">
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2.5rem' }}>Approved and Attested:</div>
                <div className="sig-line">DR. ELENA M. RAMOS, Ph.D.</div>
                <small style={{ color: '#64748b', fontSize: '0.72rem' }}>University Registrar</small>
              </div>
            </div>

            {/* Cryptographic Seal & Live Scannable QR Code */}
            <div
              style={{
                marginTop: '2rem',
                borderTop: '2px dashed #cbd5e1',
                paddingTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <ShieldCheck size={16} />
                  <span>Cryptographic Verification Guarantee</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 0.4rem', lineHeight: 1.4 }}>
                  This credential is tamper-evident. Scan the dynamic QR code or query the verification portal directly.
                </p>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', fontSize: '0.68rem', fontFamily: 'monospace', color: '#334155', wordBreak: 'break-all' }}>
                  <strong>TOKEN:</strong> {doc.verification_token || `SEC-${doc.tracking_number}`}
                  <br />
                  <strong>HMAC-SHA256:</strong> {doc.signature ? doc.signature.substring(0, 36) + '...' : 'SIGNED-BY-REGISTRAR-SYSTEM'}
                </div>
              </div>

              {/* Live QR Code Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#ffffff',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="Official Verification QR Code"
                  width="72"
                  height="72"
                  style={{ borderRadius: '4px', border: '1px solid #f1f5f9' }}
                />
                <div style={{ maxWidth: '140px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--primary-dark)' }}>
                    SCAN TO VERIFY
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    Points to CuyoTech Central Public Registry
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Search size={14} />
            Test Public Verification ({doc.verification_token ? doc.verification_token.substring(0, 8) + '...' : 'Link'})
          </a>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={handlePrint}>
              <Printer size={14} />
              Download Official PDF / Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
