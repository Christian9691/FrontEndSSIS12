import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import {
  Users,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  Check,
  UserPlus,
  GraduationCap,
} from 'lucide-react';

export function ClearanceProcessing() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [nextStudentNumber, setNextStudentNumber] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'holds', 'appeals'
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Clearance Hold State
  const [holdModalStudent, setHoldModalStudent] = useState(null);
  const [holdReason, setHoldReason] = useState('');
  const [signatoryName, setSignatoryName] = useState('College Department Office');
  const [msg, setMsg] = useState(null);

  // Department Student Admission / Enrollment State
  const [enrollModal, setEnrollModal] = useState(false);
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState(1);
  const [enrollYearLevel, setEnrollYearLevel] = useState(1);

  const loadData = (isBackground = false) => {
    if (!isBackground) setLoading(true);
    api.get('/api/department/clearances')
      .then((res) => {
        setStudents(res.students || []);
        setCourses(res.courses || []);
        if (res.next_student_number) {
          setNextStudentNumber(res.next_student_number);
        }
        if (res.courses && res.courses.length > 0 && !enrollCourseId) {
          setEnrollCourseId(res.courses[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isBackground) setLoading(false);
      });
  };

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 4000);
    const onFocus = () => loadData(true);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleUpdateRecord = async (recordId, status) => {
    try {
      const res = await api.patch(`/api/department/clearances/${recordId}`, { status });
      setMsg({ type: 'success', text: res.message });
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Update failed.' });
    }
  };

  const handleAddHold = async (e) => {
    e.preventDefault();
    if (!holdModalStudent || !holdReason.trim()) return;

    try {
      const res = await api.post('/api/department/clearances/hold', {
        student_id: holdModalStudent.id,
        signatory_name: signatoryName,
        hold_reason: holdReason,
      });

      setMsg({ type: 'success', text: res.message });
      setHoldModalStudent(null);
      setHoldReason('');
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Failed to place hold.' });
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollEmail.trim()) return;

    try {
      const res = await api.post('/api/department/students', {
        name: enrollName,
        email: enrollEmail,
        course_id: enrollCourseId,
        year_level: enrollYearLevel,
      });

      setMsg({ type: 'success', text: res.message });
      setEnrollModal(false);
      setEnrollName('');
      setEnrollEmail('');
      setEnrollYearLevel(1);
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Failed to enroll student.' });
    }
  };

  const filteredStudents = students.filter((s) => {
    // Tab filter
    if (filter === 'holds' && s.clearance_status) return false;
    if (filter === 'appeals' && !s.clearance_records.some((r) => r.appeal_status === 'pending')) return false;

    // Course filter
    if (courseFilter !== 'all' && s.course !== courseFilter) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = s.student_number?.toLowerCase().includes(q);
      const matchName = s.name?.toLowerCase().includes(q);
      const matchCourse = s.course?.toLowerCase().includes(q);
      return matchNum || matchName || matchCourse;
    }

    return true;
  });

  const totalAppeals = students.reduce(
    (acc, s) => acc + s.clearance_records.filter((r) => r.appeal_status === 'pending').length,
    0
  );
  const totalHolds = students.filter((s) => !s.clearance_status).length;

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading departmental clearance records...</p>
      </div>
    );
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      {/* Filter & Metric Header Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div
          className="card"
          onClick={() => setFilter('all')}
          style={{
            cursor: 'pointer',
            border: filter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
            padding: '1rem',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={14} color="var(--primary)" />
            <span>Total Enrolled Students</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {students.length}
          </div>
        </div>

        <div
          className="card"
          onClick={() => setFilter('holds')}
          style={{
            cursor: 'pointer',
            border: filter === 'holds' ? '2px solid var(--danger)' : '1px solid var(--border)',
            padding: '1rem',
            background: filter === 'holds' ? '#fef2f2' : '#ffffff',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={14} color="#dc2626" />
            <span>Students with Active Holds</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.2rem' }}>
            {totalHolds}
          </div>
        </div>

        <div
          className="card"
          onClick={() => setFilter('appeals')}
          style={{
            cursor: 'pointer',
            border: filter === 'appeals' ? '2px solid #d97706' : '1px solid var(--border)',
            padding: '1rem',
            background: filter === 'appeals' ? '#fffbeb' : '#ffffff',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} color="#d97706" />
            <span>Pending Appeals Submitted</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem' }}>
            {totalAppeals}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Departmental Student Clearance Processing</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Manage student accountability holds, review clearance appeals, and admit departmental students
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-sm btn-accent"
              onClick={() => setEnrollModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={14} />
              <span>Admit Student</span>
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => loadData(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <RotateCcw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Course Filter Controls Row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student number or name..."
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: 'var(--text-main)',
              }}
            >
              <option value="all">All Degree Programs</option>
              <option value="BSCS">BSCS - Computer Science</option>
              <option value="BSIT">BSIT - Information Tech</option>
              <option value="BSIS">BSIS - Information Systems</option>
            </select>
          </div>

          {(searchTerm || courseFilter !== 'all' || filter !== 'all') && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setCourseFilter('all');
                setFilter('all');
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredStudents.length}</strong> of {students.length} students
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: '115px' }}>Student #</th>
                <th>Student Name</th>
                <th style={{ width: '70px' }}>Program</th>
                <th style={{ width: '100px' }}>Standing</th>
                <th>Department Accountability Records & Appeals</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No students matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} style={{ verticalAlign: 'middle' }}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong>{s.student_number}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                        {s.course}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={s.clearance_status ? 'cleared' : 'hold'} />
                    </td>
                    <td>
                      {/* Compact Clearance Records List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {s.clearance_records.map((r) => (
                          <div
                            key={r.id}
                            style={{
                              background: r.status === 'hold' ? '#fff5f5' : '#f0fdf4',
                              border: `1px solid ${r.status === 'hold' ? '#fecaca' : '#bbf7d0'}`,
                              borderRadius: '5px',
                              padding: '0.35rem 0.55rem',
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: '180px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.signatory}:</span>
                              <span style={{ color: r.status === 'hold' ? '#b91c1c' : '#047857' }}>
                                {r.hold_reason || 'Good standing (Cleared)'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <StatusBadge status={r.status} />
                              {r.status === 'cleared' ? (
                                <button
                                  className="btn btn-sm btn-secondary"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', color: '#b91c1c', whiteSpace: 'nowrap' }}
                                  onClick={() => handleUpdateRecord(r.id, 'hold')}
                                  title="Add clearance accountability hold"
                                >
                                  Reinstate Hold
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-secondary"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', color: '#047857', whiteSpace: 'nowrap' }}
                                  onClick={() => handleUpdateRecord(r.id, 'cleared')}
                                  title="Clear hold"
                                >
                                  Clear Hold
                                </button>
                              )}
                            </div>

                            {/* Pending Student Appeal Box */}
                            {r.appeal_status === 'pending' && (
                              <div
                                style={{
                                  width: '100%',
                                  marginTop: '0.25rem',
                                  background: '#fffbeb',
                                  border: '1px solid #fde68a',
                                  borderRadius: '4px',
                                  padding: '0.35rem 0.5rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '0.5rem',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <div style={{ fontSize: '0.74rem', color: '#92400e' }}>
                                  <strong>Appeal ({r.appeal_submitted_at}):</strong> "{r.appeal_notes}"
                                </div>
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
                                  onClick={() => handleUpdateRecord(r.id, 'cleared')}
                                >
                                  <Check size={12} /> Approve & Clear
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-accent"
                        onClick={() => setHoldModalStudent(s)}
                        style={{
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.65rem',
                        }}
                      >
                        <Plus size={14} />
                        <span>Place New Hold</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLACE HOLD MODAL */}
      {holdModalStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <AlertTriangle size={18} color="#dc2626" />
                Place Clearance Hold
              </h3>
              <button className="modal-close-btn" onClick={() => setHoldModalStudent(null)}>×</button>
            </div>
            <form onSubmit={handleAddHold}>
              <div className="modal-body">
                <div style={{ background: '#f8faf8', padding: '0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <div>Student: <strong>{holdModalStudent.name}</strong></div>
                  <div>Student Number: <strong>{holdModalStudent.student_number}</strong></div>
                  <div>Program: <strong>{holdModalStudent.course}</strong></div>
                </div>

                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label>Department / Office Signatory</label>
                  <select value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)}>
                    <option value="CCS Department Office">College of Computing Studies (CCS) Office</option>
                    <option value="University Library">University Library Services</option>
                    <option value="Laboratory Custodian">Computer Laboratory Custodian</option>
                    <option value="Prefect of Discipline">Prefect of Student Discipline</option>
                    <option value="Dean's Office">Office of the College Dean</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Reason for Hold (Accountability / Obligation)</label>
                  <input
                    type="text"
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="e.g. Unreturned laboratory equipment, Overdue library books"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setHoldModalStudent(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dc2626', borderColor: '#dc2626' }}
                >
                  <AlertTriangle size={14} />
                  <span>Confirm Accountability Hold</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIT STUDENT MODAL */}
      {enrollModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <UserPlus size={18} color="var(--primary)" />
                Admit Student to Department
              </h3>
              <button className="modal-close-btn" onClick={() => setEnrollModal(false)}>×</button>
            </div>
            <form onSubmit={handleEnrollStudent}>
              <div className="modal-body">
                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    placeholder="e.g. Christine Alcantara"
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>Institutional Email</label>
                  <input
                    type="email"
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    placeholder="student@cuyotech.edu.ph"
                    required
                  />
                </div>

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
                    The system sequentially generates student IDs (YYYY-XXXXX format) automatically.
                  </small>
                </div>

                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>Department Degree Program</label>
                  <select value={enrollCourseId} onChange={(e) => setEnrollCourseId(parseInt(e.target.value) || 1)}>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.course_code} - {c.course_title}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label>Year Level</label>
                  <select value={enrollYearLevel} onChange={(e) => setEnrollYearLevel(parseInt(e.target.value) || 1)}>
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>

                {enrollYearLevel > 1 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#166534', marginTop: '0.5rem' }}>
                    <strong>✨ Curriculum Crediting Enabled:</strong> Because this student is admitted as a Regular Year {enrollYearLevel} student, all subjects from prior years (Years 1 to {enrollYearLevel - 1}) in this curriculum will be automatically credited with passing grades.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEnrollModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserPlus size={15} />
                  <span>Admit & Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
