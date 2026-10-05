import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';

export function UserAccounts() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addUserModal, setAddUserModal] = useState(false);
  const [msg, setMsg] = useState(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [newCourseId, setNewCourseId] = useState(1);
  const [newYearLevel, setNewYearLevel] = useState(1);

  const loadUsers = () => {
    api.get('/api/admin/users')
      .then((res) => {
        setUsers(res.users || []);
        setCourses(res.courses || []);
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
        student_number: newRole === 'student' ? newStudentNumber : undefined,
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

  if (loading) {
    return <div className="card"><p>Loading user accounts...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Institutional User Account Management</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Provision, modify, and control access permissions for students and university staff
            </p>
          </div>
          <button className="btn btn-sm btn-accent" onClick={() => setAddUserModal(true)}>
            + Add New User Account
          </button>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Institutional Email</th>
                <th>Role</th>
                <th>Student # / Course</th>
                <th>Account Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-neutral">{u.role.toUpperCase()}</span></td>
                  <td>{u.student_number ? `${u.student_number} (${u.course || 'BSIT'})` : '—'}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.status === 'active' ? 'btn-secondary' : 'btn-accent'}`}
                      onClick={() => handleToggleStatus(u.id, u.status)}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {addUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New User Account</h3>
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
                      <label>Student Number</label>
                      <input
                        type="text"
                        value={newStudentNumber}
                        onChange={(e) => setNewStudentNumber(e.target.value)}
                        placeholder="2026-00126"
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                      <label>Program / Course</label>
                      <select value={newCourseId} onChange={(e) => setNewCourseId(e.target.value)}>
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
                <button type="submit" className="btn btn-accent">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
