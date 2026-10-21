import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const roleConfig = ROLES[currentUser?.role] || ROLES.student;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: '#f1f5f9',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <FileQuestion size={38} color="var(--primary)" />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          background: '#f8fafc',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '0.74rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}
      >
        404 · Not Found
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 0.5rem' }}>
        Page Not Found
      </h2>

      <p style={{ maxWidth: '480px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: '0 0 1.5rem' }}>
        The requested university portal URL does not exist or has been moved to a new route.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <button
          type="button"
          className="btn btn-accent"
          onClick={() => navigate(roleConfig.basePath)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Home size={16} />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
