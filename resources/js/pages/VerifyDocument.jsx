import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RefreshCw, XCircle, CheckCircle2, Lock, Printer, ArrowLeft } from 'lucide-react';

export function VerifyDocument() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/verify/${encodeURIComponent(token)}`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.valid) {
          throw json;
        }
        setData(json);
      })
      .catch((err) => {
        setError(err.message || 'No official document found matching this verification token.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="login-wrapper" style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '640px', width: '100%', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Republic of the Philippines
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)', margin: '0.2rem 0' }}>
            CUYOTECH UNIVERSITY
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Pamantasan ng Cabuyao · Office of the University Registrar
          </div>
          <div style={{ marginTop: '0.75rem', display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
            Public Document Verification Portal
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <RefreshCw size={28} className="animate-spin text-emerald-700" />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Validating cryptographic credential token against central ledger...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '64px', height: '64px', background: '#fee2e2', color: '#b91c1c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <XCircle size={32} />
            </div>
            <h3 style={{ color: '#b91c1c', marginBottom: '0.5rem' }}>Unverified Credential</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Token queried: <code>{token}</code>
            </div>
            <Link to="/login" className="btn btn-secondary">
              Back to Portal Login
            </Link>
          </div>
        )}

        {data && !loading && (
          <div>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 style={{ color: '#065f46', margin: 0, fontSize: '0.95rem' }}>Authentic Official Academic Record</h4>
                <p style={{ color: '#047857', margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
                  Cryptographically verified against CuyoTech University central archives.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)' }}>Document Type:</span>
                <strong>{data.document_type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Name (Masked):</span>
                <strong>{data.student_name_masked}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)' }}>Degree Program:</span>
                <span>{data.degree_program}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)' }}>College Unit:</span>
                <span>{data.college}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tracking Number:</span>
                <code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{data.tracking_number}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date Certified & Released:</span>
                <strong>{data.release_date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-success">{data.status}</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
              <Lock size={15} style={{ flexShrink: 0, marginTop: '0.1rem', color: 'var(--accent)' }} />
              <div>
                <strong>Data Privacy Notice:</strong> In compliance with the Philippine Data Privacy Act of 2012 (RA 10173), student identifying information is masked to protect data privacy while guaranteeing credential authenticity.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowLeft size={14} />
                Portal Login
              </Link>
              <button className="btn btn-accent btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => window.print()}>
                <Printer size={14} />
                Print Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
