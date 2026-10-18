import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Bell, FileText, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Inbox, Check } from 'lucide-react';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        navigate(link);
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText size={16} color="#0284c7" />;
      case 'payment':
        return <CreditCard size={16} color="#059669" />;
      case 'clearance':
        return <ShieldCheck size={16} color="#d97706" />;
      case 'success':
        return <CheckCircle2 size={16} color="#16a34a" />;
      case 'warning':
        return <AlertTriangle size={16} color="#dc2626" />;
      default:
        return <Bell size={16} color="#64748b" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setOpen(!open)}
        title="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-main)',
          transition: 'all 0.15s ease',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px #fff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notif-popover"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.6rem',
            width: '360px',
            maxWidth: '90vw',
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-light)',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
            }}
          >
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={32} style={{ margin: '0 auto 0.5rem', color: '#94a3b8' }} />
                <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No notifications yet</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>You're all caught up with campus updates</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  style={{
                    padding: '0.8rem 1rem',
                    borderBottom: '1px solid var(--border-light)',
                    background: n.is_read ? '#ffffff' : '#f0fdf4',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (n.is_read) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (n.is_read) e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: n.is_read ? '#f1f5f9' : '#dcfce7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '0.9rem',
                    }}
                  >
                    {getTypeIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                      <h4
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: n.is_read ? 600 : 700,
                          color: 'var(--text-main)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.title}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', flexShrink: 0 }}>
                        {n.created_at}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        margin: '0.2rem 0 0',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
