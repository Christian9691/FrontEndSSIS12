import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import {
  Search,
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  GraduationCap,
  Inbox,
  CreditCard,
  Building2,
  Shield,
  RotateCcw,
} from 'lucide-react';

export function UserAccounts() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addUserModal, setAddUserModal] = useState(false);
  const [msg, setMsg] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [nextStudentNumber, setNextStudentNumber] = useState('');
  const [newCourseId, setNewCourseId] = useState(1);
  const [newYearLevel, setNewYearLevel] = useState(1);

  const loadUsers = () => {
    api.get('/api/admin/users')
      .then((res) => {
        setUsers(res.users || []);
        setCourses(res.courses || []);
        if (res.next_student_number) {
          setNextStudentNumber(res.next_student_number);
          setNewStudentNumber(res.next_student_number);
        }
        if (res.courses && res.courses.length > 0 && !newCourseId) {
          setNewCourseId(res.courses[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.patch(`/api/admin/users/${userId}/status`, { status: nextStatus });
      setMsg({ type: 'success', text: res.message });
      loadUsers();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Status toggle failed.' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/admin/users', {
        name: newName,
        email: newEmail,
        role: newRole,
        student_number: newRole === 'student' ? 'auto' : undefined,
        course_id: newRole === 'student' ? newCourseId : undefined,
        year_level: newRole === 'student' ? newYearLevel : undefined,
      });

      setMsg({ type: 'success', text: res.message });
      setAddUserModal(false);
      setNewName('');
      setNewEmail('');
      setNewStudentNumber('');
      loadUsers();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Failed to create user.' });
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    // Status filter
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchStudentNum = u.student_number?.toLowerCase().includes(q);
      const matchCourse = u.course?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      return matchName || matchEmail || matchStudentNum || matchCourse || matchRole;
    }
    return true;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <GraduationCap size={13} style={{ marginRight: '0.3rem' }} />;
      case 'registrar':
        return <Inbox size={13} style={{ marginRight: '0.3rem' }} />;
      case 'cashier':
        return <CreditCard size={13} style={{ marginRight: '0.3rem' }} />;
      case 'department':
        return <Building2 size={13} style={{ marginRight: '0.3rem' }} />;
      case 'admin':
        return <Shield size={13} style={{ marginRight: '0.3rem' }} />;
      default:
        return <Users size={13} style={{ marginRight: '0.3rem' }} />;
    }
  };

  const roleCounts = {
    all: users.length,
    student: users.filter((u) => u.role === 'student').length,
    registrar: users.filter((u) => u.role === 'registrar').length,
    cashier: users.filter((u) => u.role === 'cashier').length,
    department: users.filter((u) => u.role === 'department').length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading institutional user accounts...</p>
      </div>
    );
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Institutional User Account Management</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Provision, modify, and control access permissions for students and university staff
            </p>
          </div>
          <button className="btn btn-sm btn-accent" onClick={() => setAddUserModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <UserPlus size={15} />
            <span>Add New User Account</span>
          </button>
        </div>

        {/* Role Tabs Filter Bar */}
        <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Users', icon: Users },
            { key: 'student', label: 'Students', icon: GraduationCap },
            { key: 'registrar', label: 'Registrar', icon: Inbox },
            { key: 'cashier', label: 'Cashier', icon: CreditCard },
            { key: 'department', label: 'Department Staff', icon: Building2 },
            { key: 'admin', label: 'Administrators', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = roleFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: active ? 'var(--primary)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span
                  style={{
                    background: active ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: active ? '#ffffff' : 'var(--text-subtle)',
                    padding: '0.05rem 0.4rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    marginLeft: '0.15rem',
                  }}
                >
                  {roleCounts[tab.key] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Controls Row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student #, name, email, or course..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: 'var(--text-main)',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>User ID</th>
                <th>Full Name</th>
                <th>Institutional Email</th>
                <th>Role</th>
                <th>Student # / Course</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No user accounts match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><code>#{u.id}</code></td>
                    <td><strong>{u.name}</strong></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>{u.email}</span></td>
                    <td>
                      <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {getRoleIcon(u.role)}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{u.student_number ? `${u.student_number} (${u.course || 'BSIT'})` : '—'}</td>
                    <td><StatusBadge status={u.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${u.status === 'active' ? 'btn-secondary' : 'btn-accent'}`}
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                      >
                        {u.status === 'active' ? (
                          <>
                            <UserX size={13} /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={13} /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {addUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <UserPlus size={18} color="var(--primary)" />
                Create New User Account
              </h3>
              <button className="modal-close-btn" onClick={() => setAddUserModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Maria Clara Santos"
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@cuyotech.edu.ph"
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>System Role</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    <option value="student">Student Portal</option>
                    <option value="registrar">Registrar Module</option>
                    <option value="cashier">Cashier Module</option>
                    <option value="department">Department Module</option>
                    <option value="admin">Administrator Module</option>
                  </select>
                </div>

                {newRole === 'student' && (
                  <>
                    <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ margin: 0 }}>Student Number</label>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                          ⚡ Automatic
                        </span>
                      </div>
                      <input
                        type="text"
                        value={nextStudentNumber ? `${nextStudentNumber} (Auto-assigned)` : 'Auto-assigned by system'}
                        readOnly
                        disabled
                        style={{ backgroundColor: 'var(--bg-card-subtle)', cursor: 'not-allowed', color: 'var(--text-main)', fontWeight: 600 }}
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                        Sequential university student ID is generated automatically. Upperclassmen (Year 2+) will also have their prior curriculum courses automatically credited as passed.
                      </small>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                      <label>Degree Program / Course</label>
                      <select value={newCourseId} onChange={(e) => setNewCourseId(parseInt(e.target.value) || 1)}>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.course_code} - {c.course_title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                      <label>Year Level</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newYearLevel}
                        onChange={(e) => setNewYearLevel(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserPlus size={15} />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
