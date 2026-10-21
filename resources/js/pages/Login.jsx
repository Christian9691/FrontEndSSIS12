import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';
import { LogIn, KeyRound, Shield, AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(identifier, password);
      const roleConfig = ROLES[user?.role] || ROLES.student;
      navigate(roleConfig.basePath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="university-crest">CTU</div>
          <h1>CuyoTech University</h1>
          <p>Student Services Information System (SSIS)</p>
        </div>

        {error && (
          <div className="login-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="login-identifier">Student Number or Institutional Email</label>
            <input
              id="login-identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 2026-00123 or user@cuyotech.edu.ph"
              autoComplete="username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.75rem' }}
            disabled={loading}
          >
            <LogIn size={16} />
            {loading ? 'Authenticating...' : 'Sign In to SSIS'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.45', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            <Shield size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Protected by Role-Based Access Control & bcrypt credential hashing.
          </p>
        </div>
      </div>
    </div>
  );
}
