import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';

export function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const loadEnrollments = () => {
    api.get('/api/registrar/enrollments')
      .then((res) => setEnrollments(res.students || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleApproveEnrollment = async (studentId) => {
    try {
      const res = await api.post(`/api/registrar/enrollments/${studentId}/approve`, {});
      setMsg({ type: 'success', text: res.message });
      loadEnrollments();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Approval failed.' });
    }
  };

  if (loading) {
    return <div className="card"><p>Loading enrollment records...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Student Enrollment Management</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Review and officially certify enrolled students for current term
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Degree Program</th>
                <th>Year Level</th>
                <th>Total Units</th>
                <th>Clearance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.student_number}</strong></td>
                  <td>{s.name}</td>
                  <td>{s.course}</td>
                  <td>Year {s.year_level}</td>
                  <td>{s.total_units} units</td>
                  <td><StatusBadge status={s.clearance_status ? 'cleared' : 'hold'} /></td>
                  <td><StatusBadge status={s.enrollment_status} /></td>
                  <td>
                    {s.enrollment_status === 'Pending' ? (
                      <button className="btn btn-sm btn-accent" onClick={() => handleApproveEnrollment(s.id)}>
                        Approve Enrollment
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✓ Enrolled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
