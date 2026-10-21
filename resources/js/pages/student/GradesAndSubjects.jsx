import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';

import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Target, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Table as TableIcon,
  Award
} from 'lucide-react';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Subjects' },
  { key: 'passed', label: 'Passed' },
  { key: 'in progress', label: 'In Progress' },
  { key: 'not taken', label: 'Not Yet Taken' },
];

function ProgressSummary({ summary }) {
  const kpis = [
    {
      label: 'Units Passed',
      value: `${summary.passed_units} / ${summary.total_units}`,
      sub: `${summary.total_units ? Math.round((summary.passed_units / summary.total_units) * 100) : 0}% of required units`,
      icon: <Award size={20} />,
      iconClass: 'kpi-icon-success',
    },
    {
      label: 'Subjects Passed',
      value: `${summary.passed_subjects} / ${summary.total_subjects}`,
      sub: `${summary.total_subjects - summary.passed_subjects} remaining`,
      icon: <BookOpen size={20} />,
      iconClass: 'kpi-icon-primary',
    },
    {
      label: 'In Progress',
      value: `${summary.in_progress_units} units`,
      sub: 'Currently enrolled',
      icon: <Clock size={20} />,
      iconClass: 'kpi-icon-warning',
    },
    {
      label: 'Remaining Units',
      value: `${summary.remaining_units} units`,
      sub: 'Units needed to complete',
      icon: <Target size={20} />,
      iconClass: 'kpi-icon-info',
    },
  ];

  return (
    <div className="curriculum-summary-panel">
      <div className="curriculum-progress-header">
        <div className="curriculum-progress-title">
          <GraduationCap size={20} color="var(--primary)" />
          <span>Curriculum Completion Progress</span>
        </div>
        <span className="curriculum-progress-percentage">
          {summary.percent_complete}% Complete
        </span>
      </div>

      <div className="progress-track-modern">
        <div
          className="progress-fill-modern"
          style={{ width: `${Math.min(100, Math.max(0, summary.percent_complete))}%` }}
        />
      </div>

      <div className="curriculum-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="curriculum-kpi-card">
            <div className={`curriculum-kpi-icon ${kpi.iconClass}`}>
              {kpi.icon}
            </div>
            <div className="curriculum-kpi-meta">
              <span className="curriculum-kpi-label">{kpi.label}</span>
              <span className="curriculum-kpi-value">{kpi.value}</span>
              <span className="curriculum-kpi-sub">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemesterTable({ term, filter }) {
  const rows = term.subjects.filter((s) => filter === 'all' || s.status === filter);
  if (rows.length === 0) return null;

  return (
    <div className="semester-block">
      <div className="semester-head">
        <span>{term.semester}</span>
        <span className="semester-units">
          {term.passed_units} / {term.total_units} units passed
        </span>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Description</th>
              <th>Units</th>
              <th>Final Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.subject_code}</strong></td>
                <td>
                  {s.subject_title}
                  {s.attempts > 1 && (
                    <span className="retake-note"> · {s.attempts} attempts</span>
                  )}
                </td>
                <td>{s.units}</td>
                <td style={{ fontWeight: 700 }}>
                  {s.grade !== null ? s.grade.toFixed(2) : '—'}
                </td>
                <td><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Full Flat Curriculum View (like the previous curriculum table requested by user)
function FullCurriculumTable({ data, filter }) {
  const allSubjects = useMemo(() => {
    const list = [];
    data.years.forEach((y) => {
      y.semesters.forEach((term) => {
        term.subjects.forEach((s) => {
          if (filter === 'all' || s.status === filter) {
            list.push({
              ...s,
              year_level: y.year_level,
              year_label: y.label,
              semester: term.semester,
            });
          }
        });
      });
    });
    return list;
  }, [data, filter]);

  if (allSubjects.length === 0) {
    return <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No subjects matching the current filter.</p>;
  }

  return (
    <div className="table-responsive" style={{ marginTop: '0.5rem' }}>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Subject Description</th>
            <th>Units</th>
            <th>Year Level</th>
            <th>Semester</th>
            <th>Final Grade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allSubjects.map((s) => (
            <tr key={`${s.year_level}-${s.semester}-${s.id}`}>
              <td><strong>{s.subject_code}</strong></td>
              <td>{s.subject_title}</td>
              <td>{s.units} units</td>
              <td>{s.year_label}</td>
              <td>{s.semester}</td>
              <td style={{ fontWeight: 700 }}>
                {s.grade !== null ? s.grade.toFixed(2) : '—'}
              </td>
              <td><StatusBadge status={s.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Curriculum({ data }) {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'matrix'
  const [open, setOpen] = useState(() => {
    const current = data.years.find((y) => y.is_current);
    return new Set(current ? [current.year_level] : [data.years[0]?.year_level]);
  });

  const toggle = (level) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(level) ? next.delete(level) : next.add(level);
      return next;
    });

  const expandAll = () => {
    setOpen(new Set(data.years.map((y) => y.year_level)));
  };

  const collapseAll = () => {
    setOpen(new Set());
  };

  if (!data || data.years.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No curriculum has been set up for this program yet.</p>;
  }

  return (
    <div>
      <ProgressSummary summary={data.summary} />

      <div className="curriculum-toolbar">
        <div className="curriculum-filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${filter === f.key ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {viewMode === 'grouped' && (
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button className="btn btn-sm btn-secondary" style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }} onClick={expandAll}>
                Expand All
              </button>
              <button className="btn btn-sm btn-secondary" style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }} onClick={collapseAll}>
                Collapse All
              </button>
            </div>
          )}

          <div className="curriculum-view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setViewMode('grouped')}
              title="Organized by Year Level & Semester"
            >
              <Layers size={13} />
              Year & Term View
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
              title="Complete Curriculum Matrix (Previous Table View)"
            >
              <TableIcon size={13} />
              Full Curriculum Table
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <FullCurriculumTable data={data} filter={filter} />
      ) : (
        data.years.map((year) => {
          const isOpen = open.has(year.year_level) || filter !== 'all';
          return (
            <div key={year.year_level} className={`year-block ${isOpen ? 'is-open' : ''}`}>
              <button className="year-head" onClick={() => toggle(year.year_level)}>
                <div className="year-title-wrap">
                  {isOpen ? <ChevronDown size={18} color="var(--primary)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                  <strong>{year.label}</strong>
                  {year.is_current && <span className="year-current">Current Year</span>}
                </div>
                <span className="semester-units">
                  {year.passed_units} / {year.total_units} units passed
                </span>
              </button>
              {isOpen && year.semesters.map((term) => (
                <SemesterTable key={term.semester} term={term} filter={filter} />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}


function GradesByTerm({ grades }) {
  const terms = useMemo(() => {
    const map = new Map();
    grades.forEach((g) => {
      const key = `${g.academic_year}|${g.semester}`;
      if (!map.has(key)) map.set(key, { academic_year: g.academic_year, semester: g.semester, rows: [] });
      map.get(key).rows.push(g);
    });
    return [...map.values()];
  }, [grades]);

  if (terms.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No enrolled subjects yet.</p>;
  }

  return terms.map((t) => {
    const graded = t.rows.filter((r) => r.grade !== null && r.remarks !== 'Dropped');
    const units = graded.reduce((n, r) => n + r.units, 0);
    const termGwa = units ? graded.reduce((n, r) => n + r.grade * r.units, 0) / units : null;
    return (
      <div key={`${t.academic_year}-${t.semester}`} className="semester-block">
        <div className="semester-head">
          <span>AY {t.academic_year} · {t.semester}</span>
          <span className="semester-units">Term GWA: {termGwa ? termGwa.toFixed(2) : '—'}</span>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Description</th>
                <th>Units</th>
                <th>Final Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.subject_code}</strong></td>
                  <td>{g.subject_title}</td>
                  <td>{g.units}</td>
                  <td style={{ fontWeight: 700 }}>{g.grade !== null ? g.grade.toFixed(2) : 'Pending'}</td>
                  <td><StatusBadge status={g.remarks || 'In Progress'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  });
}

export function GradesAndSubjects() {
  const [gradesData, setGradesData] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [activeTab, setActiveTab] = useState('grades');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/api/student/grades'), api.get('/api/student/curriculum')])
      .then(([g, c]) => {
        setGradesData(g);
        setCurriculum(c);
      })
      .catch((err) => setError(err?.message || err?.error || 'Unable to load academic records.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card"><p>Loading academic records...</p></div>;
  }
  if (error) {
    return <div className="card"><p style={{ color: 'var(--danger)' }}>{error}</p></div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header-bar">
          <div>
            <h3>Academic Grade & Subject Record</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Official grades recorded by the University Registrar Office
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className={`btn btn-sm ${activeTab === 'grades' ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => setActiveTab('grades')}
            >
              Enrolled Grades
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'curriculum' ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => setActiveTab('curriculum')}
            >
              Program Curriculum
            </button>
          </div>
        </div>

        {activeTab === 'grades' ? (
          <>
            <div className="grades-student-bar">
              <div>
                <strong>Student:</strong> {gradesData?.student_name} ({gradesData?.student_number})
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{gradesData?.academic_standing}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>General Weighted Average:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
                  {gradesData?.gwa ? gradesData.gwa.toFixed(2) : '—'}
                </strong>
              </div>
            </div>
            <GradesByTerm grades={gradesData?.grades || []} />
          </>
        ) : (
          <Curriculum data={curriculum} />
        )}
      </div>
    </div>
  );
}