import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import { 
  RefreshCw, 
  Calendar, 
  ArrowUpDown, 
  Search, 
  Filter, 
  ShieldAlert, 
  Clock, 
  ListFilter 
} from 'lucide-react';

const DATE_PRESETS = [
  { key: 'all', label: 'All Dates' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
];

export function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [limit, setLimit] = useState(50);
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' (newest first) or 'asc' (oldest first)
  const [datePreset, setDatePreset] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [search, setSearch] = useState('');

  const loadLogs = useCallback((isBackground = false) => {
    if (!isBackground) setLoading(true);

    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (sortDirection) params.set('sort', sortDirection);
    if (customDate) {
      params.set('date', customDate);
    } else if (datePreset && datePreset !== 'all') {
      params.set('date_preset', datePreset);
    }
    if (search.trim()) {
      params.set('search', search.trim());
    }

    api.get(`/api/admin/audit-logs?${params.toString()}`)
      .then((res) => {
        setLogs(res.audit_logs || []);
        setTotalCount(res.total_count ?? (res.audit_logs?.length || 0));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  }, [limit, sortDirection, datePreset, customDate, search]);

  useEffect(() => {
    loadLogs(false);
  }, [loadLogs]);

  // Periodic background refresh every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => loadLogs(true), 6000);
    const onFocus = () => loadLogs(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadLogs]);

  const handleDatePresetClick = (key) => {
    setDatePreset(key);
    setCustomDate('');
  };

  const handleCustomDateChange = (val) => {
    setCustomDate(val);
    if (val) {
      setDatePreset('custom');
    } else {
      setDatePreset('all');
    }
  };

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleResetFilters = () => {
    setLimit(50);
    setSortDirection('desc');
    setDatePreset('all');
    setCustomDate('');
    setSearch('');
  };

  return (
    <div>
      <div className="card">
        <div className="card-header-bar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ margin: 0 }}>Security & Transaction Audit Trail</h3>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>● Live DB Sync</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Immutable system audit log synchronized with the database for all administrative events, enrollments, and transactions
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{logs.length}</strong> of <strong>{totalCount}</strong> logs
            </span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => loadLogs(false)}
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh Logs'}
            </button>
          </div>
        </div>

        {/* Audit Filter Toolbar */}
        <div className="audit-toolbar">
          <div className="audit-controls">
            {/* Quick Date Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} />
                Date:
              </span>
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  className={`btn btn-sm ${datePreset === preset.key && !customDate ? 'btn-accent' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                  onClick={() => handleDatePresetClick(preset.key)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input
                type="date"
                value={customDate}
                onChange={(e) => handleCustomDateChange(e.target.value)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                title="Filter by specific date"
              />
            </div>
          </div>

          {/* Right Side Controls: Search, Sort by Date, Limit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Search Filter */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search action, user, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '0.3rem 0.5rem 0.3rem 1.8rem', fontSize: '0.8rem', width: '190px' }}
              />
            </div>

            {/* Sort by Date Toggle */}
            <button
              className="btn btn-sm btn-secondary"
              onClick={toggleSort}
              title={`Sorted by date: ${sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}. Click to toggle.`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
            >
              <ArrowUpDown size={13} />
              Sort: <strong>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</strong>
            </button>

            {/* Limit Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Limit:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Clear Filters Button if any applied */}
            {(datePreset !== 'all' || customDate || search || limit !== 50 || sortDirection !== 'desc') && (
              <button
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                onClick={handleResetFilters}
                title="Reset all filters to defaults"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Audit Logs Table */}
        {loading && logs.length === 0 ? (
          <p style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading security audit logs...
          </p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      Timestamp ({sortDirection === 'desc' ? '↓ Newest' : '↑ Oldest'})
                    </div>
                  </th>
                  <th>User Account</th>
                  <th>Action</th>
                  <th>Event Details</th>
                  <th>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No audit logs found matching the selected date and criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{l.created_at}</td>
                      <td><strong>{l.user_name}</strong></td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                          {l.action}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-main)' }}>{l.details}</td>
                      <td>
                        <code style={{ fontSize: '0.8rem', background: '#f1f5f1', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {l.ip_address || '127.0.0.1'}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
