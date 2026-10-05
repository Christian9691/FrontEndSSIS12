import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ROLES, DEMO_USERS } from '../config';

export function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('2026-00123');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickSelect = (demo) => {
    setIdentifier(demo.id);
    setRole(demo.role);
    setPassword('password');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(identifier, password, role);
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

        <div className="quick-switch-section">
          <small>Fast Demo Switcher (Click to auto-fill):</small>
          <div className="quick-chips">
            {DEMO_USERS.map((d, i) => (
              <button
                key={i}
                type="button"
                className={`chip-btn ${identifier === d.id ? 'active' : ''}`}
                onClick={() => handleQuickSelect(d)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Select Portal / Module Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.entries(ROLES).map(([key, r]) => (
                <option key={key} value={key}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Student Number or Institutional Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 2026-00123 or user@cuyotech.edu.ph"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to SSIS'}
          </button>
        </form>
      </div>
    </div>
  );
}
