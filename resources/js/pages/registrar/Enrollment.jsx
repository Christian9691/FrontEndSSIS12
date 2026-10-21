import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import { 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

const TERMS = [
  { id: 'prev', label: 'AY 2025-2026 · 2nd Sem', tag: 'Previous Term' },
  { id: 'current', label: 'AY 2026-2027 · 1st Sem', tag: 'Current Term', isDefault: true },
  { id: 'next', label: 'AY 2026-2027 · 2nd Sem', tag: 'Next Term' },
];

export function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Term Navigation State ('prev' | 'current' | 'next')
  const [selectedTermId, setSelectedTermId] = useState('current');

  // Filters State
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [clearanceFilter, setClearanceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadEnrollments = () => {
    setLoading(true);
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

  // Extract distinct programs
  const programs = useMemo(() => {
    const set = new Set();
    enrollments.forEach((s) => {
      if (s.course) set.add(s.course);
    });
    return Array.from(set).sort();
  }, [enrollments]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return enrollments.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        s.student_number?.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q);

      const matchesProgram = programFilter === 'all' || s.course === programFilter;
      
      const matchesClearance = clearanceFilter === 'all' ||
        (clearanceFilter === 'cleared' && s.clearance_status) ||
        (clearanceFilter === 'hold' && !s.clearance_status);

      const matchesStatus = statusFilter === 'all' ||
        s.enrollment_status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesProgram && matchesClearance && matchesStatus;
    });
  }, [enrollments, search, programFilter, clearanceFilter, statusFilter]);

  // Pagination calculations
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, programFilter, clearanceFilter, statusFilter, pageSize]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Term switcher navigation handlers
  const currentTermIndex = TERMS.findIndex((t) => t.id === selectedTermId);
  const activeTerm = TERMS[currentTermIndex] || TERMS[1];

  const handlePrevTerm = () => {
    if (currentTermIndex > 0) {
      setSelectedTermId(TERMS[currentTermIndex - 1].id);
    }
  };

  const handleCurrentTerm = () => {
    setSelectedTermId('current');
  };

  const handleNextTerm = () => {
    if (currentTermIndex < TERMS.length - 1) {
      setSelectedTermId(TERMS[currentTermIndex + 1].id);
    }
  };

  if (loading && enrollments.length === 0) {
    return <div className="card"><p>Loading enrollment records...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3>Student Enrollment Management</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Review and officially certify enrolled students for academic term
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button className="btn btn-sm btn-secondary" onClick={loadEnrollments} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Academic Term Switcher (Previous, Current, Next Buttons) */}
        <div className="registrar-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} />
              Term Period:
            </span>
            <div className="term-nav-container">
              <button
                className={`term-nav-btn ${selectedTermId === 'prev' ? 'active' : ''}`}
                onClick={handlePrevTerm}
                title="Go to Previous Academic Term"
              >
                <ChevronLeft size={14} />
                Previous Term
              </button>
              <button
                className={`term-nav-btn ${selectedTermId === 'current' ? 'active' : ''}`}
                onClick={handleCurrentTerm}
                title="Return to Current Academic Term"
              >
                ● Current Term (AY 2026-2027 · 1st Sem)
              </button>
              <button
                className={`term-nav-btn ${selectedTermId === 'next' ? 'active' : ''}`}
                onClick={handleNextTerm}
                title="Go to Next Academic Term"
              >
                Next Term
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Active View:</span>
            <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
              {activeTerm.label} ({activeTerm.tag})
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', background: '#f8faf8', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search name or student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '0.35rem 0.6rem 0.35rem 1.9rem', fontSize: '0.82rem', width: '210px' }}
              />
            </div>

            {/* Program Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Program:</label>
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
              >
                <option value="all">All Programs</option>
                {programs.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Clearance Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Clearance:</label>
              <select
                value={clearanceFilter}
                onChange={(e) => setClearanceFilter(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
              >
                <option value="all">All</option>
                <option value="cleared">Cleared Only</option>
                <option value="hold">On Hold Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
              >
                <option value="all">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(search || programFilter !== 'all' || clearanceFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
              onClick={() => {
                setSearch('');
                setProgramFilter('all');
                setClearanceFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Enrollment Table */}
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
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No student enrollment records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.student_number}</strong></td>
                    <td>{s.name}</td>
                    <td><span className="badge badge-neutral" style={{ fontWeight: 700 }}>{s.course}</span></td>
                    <td>Year {s.year_level}</td>
                    <td>{s.total_units} units</td>
                    <td><StatusBadge status={s.clearance_status ? 'cleared' : 'hold'} /></td>
                    <td><StatusBadge status={s.enrollment_status} /></td>
                    <td>
                      {s.enrollment_status === 'Pending' ? (
                        <button
                          className="btn btn-sm btn-accent"
                          style={{ padding: '0.3rem 0.65rem' }}
                          onClick={() => handleApproveEnrollment(s.id)}
                        >
                          <CheckCircle2 size={13} />
                          Approve Enrollment
                        </button>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                          <CheckCircle2 size={14} />
                          Enrolled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer with Next / Current / Previous Buttons */}
        <div className="table-pagination-footer">
          <div>
            Showing <strong>{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
            <strong>{totalItems}</strong> students
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem' }}>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-controls">
              <button
                className="btn btn-sm btn-secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                title="Previous Page"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <span className="badge badge-neutral" style={{ padding: '0.3rem 0.65rem', fontWeight: 600 }}>
                Page {currentPage} of {totalPages} (Current)
              </span>

              <button
                className="btn btn-sm btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                title="Next Page"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
