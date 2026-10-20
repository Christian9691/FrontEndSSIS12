import React, { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

export function MustChangePasswordModal({ isOpen }) {
  const { currentUser, updateCurrentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (res.user) {
        updateCurrentUser(res.user);
      } else {
        updateCurrentUser({ ...currentUser, must_change_password: false });
      }
    } catch (err) {
      setError(err.message || 'Failed to update password. Please verify current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 20, 11, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            padding: '1.4rem 1.6rem',
            background: 'linear-gradient(135deg, var(--primary-dark) 0%, #0d2618 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(217, 119, 6, 0.2)',
              border: '1px solid rgba(217, 119, 6, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} color="var(--accent)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#ffffff' }}>
              First-Time Sign-In Security Setup
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.74rem', color: '#a4ceb5' }}>
              Action Required: Set Your Permanent Password
            </p>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: '1.45', margin: '0 0 1rem' }}>
            Welcome to CuyoTech SSIS! You are currently signed in with your temporary institutional default credentials. To safeguard your academic records, please set a new permanent password before accessing your portal.
          </p>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.82rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: '0.9rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                Current Temporary Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password (e.g. Student Number or CuyoTech2026!)"
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '0.9rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                New Permanent Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                minLength={6}
                required
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.9rem',
              }}
            >
              <KeyRound size={16} />
              {loading ? 'Updating Credentials...' : 'Save Password & Enter SSIS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
