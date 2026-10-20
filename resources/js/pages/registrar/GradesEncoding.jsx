import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';
import { Save, Filter, Search, BookOpen, Layers, GraduationCap } from 'lucide-react';

export function GradesEncoding() {
  const [gradesSheet, setGradesSheet] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [gradeInputs, setGradeInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState(null);

  const loadGrades = (subjectId) => {
    if (!subjectId) return;
    api.get(`/api/registrar/grades?subject_id=${subjectId}`)
      .then((res) => {
        setGradesSheet(res);
        const map = {};
        (res.grades || []).forEach((g) => { map[g.id] = g.grade ?? ''; });
        setGradeInputs(map);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Initial load
  useEffect(() => {
    api.get('/api/registrar/grades')
      .then((res) => {
        setGradesSheet(res);
        const firstId = res.selected_subject_id || res.subjects?.[0]?.id || 1;
        setSelectedSubjectId(firstId);
        const map = {};
        (res.grades || []).forEach((g) => { map[g.id] = g.grade ?? ''; });
        setGradeInputs(map);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // When selectedSubjectId changes
  useEffect(() => {
    if (selectedSubjectId) {
      loadGrades(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  // Extract program list
  const programs = useMemo(() => {
    if (!gradesSheet?.subjects) return [];
    const map = new Map();
    gradesSheet.subjects.forEach((s) => {
      const code = s.course_code || 'General';
      const title = s.course_title || 'General Subject';
      if (!map.has(code)) {
        map.set(code, { code, title });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [gradesSheet?.subjects]);

  // Filter subjects by program and search query
  const filteredSubjects = useMemo(() => {
    if (!gradesSheet?.subjects) return [];
    return gradesSheet.subjects.filter((s) => {
      const matchesProgram = selectedProgram === 'all' || s.course_code === selectedProgram;
      const q = subjectSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        s.subject_code?.toLowerCase().includes(q) || 
        s.subject_title?.toLowerCase().includes(q);
      return matchesProgram && matchesSearch;
    });
  }, [gradesSheet?.subjects, selectedProgram, subjectSearch]);

  // Group filtered subjects by program for optgroup
  const groupedSubjects = useMemo(() => {
    const groups = {};
    filteredSubjects.forEach((s) => {
      const prog = s.course_code || 'General Requirements';
      if (!groups[prog]) groups[prog] = [];
      groups[prog].push(s);
    });
    return groups;
  }, [filteredSubjects]);

  // When user changes program filter, update subject selection if current doesn't match
  const handleProgramChange = (prog) => {
    setSelectedProgram(prog);
    if (!gradesSheet?.subjects) return;
    const available = gradesSheet.subjects.filter((s) => prog === 'all' || s.course_code === prog);
    if (available.length > 0) {
      const currentExists = available.some((s) => s.id === Number(selectedSubjectId));
      if (!currentExists) {
        setSelectedSubjectId(available[0].id);
      }
    }
  };

  // Find currently selected subject details
  const activeSubject = useMemo(() => {
    return gradesSheet?.subjects?.find((s) => s.id === Number(selectedSubjectId));
  }, [gradesSheet?.subjects, selectedSubjectId]);

  const handleSaveGrade = async (enrollmentId) => {
    const val = parseFloat(gradeInputs[enrollmentId]);
    if (isNaN(val) || val < 1.0 || val > 5.0) {
      setMsg({ type: 'danger', text: 'Grade must be a valid numeric grade between 1.00 (highest) and 5.00 (failed).' });
      return;
    }

    setSavingId(enrollmentId);
    try {
      const res = await api.post('/api/registrar/grades', {
        enrollment_id: enrollmentId,
        grade: val,
      });
      setMsg({ type: 'success', text: res.message });
      loadGrades(selectedSubjectId);
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Failed to save grade.' });
    } finally {
      setSavingId(null);
    }
  };

  if (loading && !gradesSheet) {
    return <div className="card"><p>Loading grade encoding sheet...</p></div>;
  }

  return (
    <div>
      {msg && <BannerAlert type={msg.type} message={msg.text} style={{ marginBottom: '1.2rem' }} />}

      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Official Grades Encoding Sheet</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Encode final grades into the student official academic transcript (1.00 to 5.00)
            </p>
          </div>
        </div>

        {/* Program Filter Bar & Search */}
        <div className="registrar-toolbar">
          <div className="registrar-filter-group">
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={15} />
              Program:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <button
                className={`btn btn-sm ${selectedProgram === 'all' ? 'btn-accent' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                onClick={() => handleProgramChange('all')}
              >
                All Programs
              </button>
              {programs.map((p) => (
                <button
                  key={p.code}
                  className={`btn btn-sm ${selectedProgram === p.code ? 'btn-accent' : 'btn-secondary'}`}
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                  onClick={() => handleProgramChange(p.code)}
                  title={p.title}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Dropdown organized by Program and Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search subject code..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                style={{ padding: '0.35rem 0.6rem 0.35rem 1.9rem', fontSize: '0.82rem', width: '180px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Subject:</label>
              <select
                value={selectedSubjectId || ''}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                style={{ padding: '0.4rem 0.65rem', maxWidth: '300px', fontWeight: 600 }}
              >
                {Object.keys(groupedSubjects).length === 0 ? (
                  <option value="">No subjects found</option>
                ) : (
                  Object.entries(groupedSubjects).map(([prog, subs]) => (
                    <optgroup key={prog} label={`=== ${prog} Program Subjects ===`}>
                      {subs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.subject_code} - {s.subject_title} ({s.units}u)
                        </option>
                      ))}
                    </optgroup>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Subject Context Badge */}
        {activeSubject && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', background: '#f8faf8', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-neutral" style={{ fontWeight: 800 }}>{activeSubject.course_code || 'Program'}</span>
              <strong style={{ color: 'var(--primary-dark)', fontSize: '0.95rem' }}>{activeSubject.subject_code}</strong>
              <span style={{ color: 'var(--text-muted)' }}>— {activeSubject.subject_title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Units: <strong>{activeSubject.units}</strong></span>
              {activeSubject.year_level && <span>Year {activeSubject.year_level} · {activeSubject.semester}</span>}
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                {gradesSheet?.grades?.length || 0} Enrolled
              </span>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Name</th>
                <th>Degree Program</th>
                <th>Status</th>
                <th>Final Grade (1.00 - 5.00)</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(!gradesSheet?.grades || gradesSheet.grades.length === 0) ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No officially enrolled students found for <strong>{activeSubject?.subject_code || 'this subject'}</strong>.
                  </td>
                </tr>
              ) : (
                gradesSheet.grades.map((g) => (
                  <tr key={g.id}>
                    <td><strong>{g.student_number}</strong></td>
                    <td>{g.student_name}</td>
                    <td><span className="badge badge-neutral" style={{ fontWeight: 700 }}>{g.course}</span></td>
                    <td><StatusBadge status={g.status || 'enrolled'} /></td>
                    <td>
                      <input
                        type="number"
                        step="0.25"
                        min="1.00"
                        max="5.00"
                        placeholder="1.00 - 5.00"
                        value={gradeInputs[g.id] ?? ''}
                        onChange={(e) => setGradeInputs({ ...gradeInputs, [g.id]: e.target.value })}
                        style={{ width: '100px', padding: '0.35rem 0.5rem', fontWeight: 600 }}
                      />
                    </td>
                    <td><StatusBadge status={g.remarks || 'Pending'} /></td>
                    <td>
                      <button
                        className="btn btn-sm btn-accent"
                        style={{ padding: '0.3rem 0.65rem' }}
                        disabled={savingId === g.id}
                        onClick={() => handleSaveGrade(g.id)}
                      >
                        <Save size={13} />
                        {savingId === g.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
