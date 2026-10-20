import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'passed', label: 'Passed' },
  { key: 'in progress', label: 'In Progress' },
  { key: 'not taken', label: 'Not Yet Taken' },
];

function ProgressSummary({ summary }) {
  const items = [
    { label: 'Units Passed', value: `${summary.passed_units} / ${summary.total_units}` },
    { label: 'In Progress', value: `${summary.in_progress_units} units` },
    { label: 'Remaining', value: `${summary.remaining_units} units` },
    { label: 'Subjects Passed', value: `${summary.passed_subjects} / ${summary.total_subjects}` },
  ];
  return (
    <div className="curriculum-summary">
      <div className="curriculum-progress-head">
        <strong>Curriculum Progress</strong>
        <span>{summary.percent_complete}% complete</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${summary.percent_complete}%` }} />
      </div>
      <div className="curriculum-stats">
        {items.map((i) => (
          <div key={i.label}>
            <div className="curriculum-stat-label">{i.label}</div>
            <div className="curriculum-stat-value">{i.value}</div>
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
        <span className="semester-units">{term.passed_units} / {term.total_units} units passed</span>
      </div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Units</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.subject_code}</strong></td>
                <td>
                  {s.subject_title}
                  {s.attempts > 1 && <span className="retake-note"> · {s.attempts} attempts</span>}
                </td>
                <td>{s.units}</td>
                <td style={{ fontWeight: 700 }}>{s.grade !== null ? s.grade.toFixed(2) : '—'}</td>
                <td><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Curriculum({ data }) {
  const [filter, setFilter] = useState('all');
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

  if (data.years.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No curriculum has been set up for this program yet.</p>;
  }

  return (
    <div>
      <ProgressSummary summary={data.summary} />

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

      {data.years.map((year) => {
        const isOpen = open.has(year.year_level) || filter !== 'all';
        return (
          <div key={year.year_level} className="year-block">
            <button className="year-head" onClick={() => toggle(year.year_level)}>
              <span>
                {isOpen ? '▾' : '▸'} <strong>{year.label}</strong>
                {year.is_current && <span className="year-current">Current</span>}
              </span>
              <span className="semester-units">{year.passed_units} / {year.total_units} units passed</span>
            </button>
            {isOpen && year.semesters.map((term) => (
              <SemesterTable key={term.semester} term={term} filter={filter} />
            ))}
          </div>
        );
      })}
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