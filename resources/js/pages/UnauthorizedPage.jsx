import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';
import { ShieldX, ArrowLeft, Home, Lock } from 'lucide-react';

export function UnauthorizedPage() {
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
          background: '#fee2e2',
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.15)',
        }}
      >
        <ShieldX size={38} color="#dc2626" />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          fontSize: '0.74rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}
      >
        <Lock size={12} />
        403 · Access Forbidden
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 0.5rem' }}>
        Restricted Academic Subsystem
      </h2>

      <p style={{ maxWidth: '520px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.55', margin: '0 0 1.5rem' }}>
        You do not have security authorization or clearance to access this module. Your current authenticated role is <strong>{roleConfig.label}</strong> ({currentUser?.email}).
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
          Return to {roleConfig.label}
        </button>
      </div>
    </div>
  );
}
