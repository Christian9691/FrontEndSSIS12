import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';

export function GradesAndSubjects() {
  const [gradesData, setGradesData] = useState(null);
  const [subjectsData, setSubjectsData] = useState(null);
  const [activeTab, setActiveTab] = useState('grades');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/student/grades'),
      api.get('/api/student/subjects'),
    ])
      .then(([g, s]) => {
        setGradesData(g);
        setSubjectsData(s);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card"><p>Loading academic records...</p></div>;
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faf8', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
              <div>
                <strong>Student:</strong> {gradesData?.student_name} ({gradesData?.student_number})
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>General Weighted Average:</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-dark)' }}>
                  {gradesData?.gwa ? gradesData.gwa.toFixed(2) : '1.60'}
                </strong>
              </div>
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
                  {(gradesData?.grades || []).map((g) => (
                    <tr key={g.id}>
                      <td><strong>{g.subject_code}</strong></td>
                      <td>{g.subject_title}</td>
                      <td>{g.units}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {g.grade !== null ? g.grade.toFixed(2) : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={g.remarks || 'In Progress'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Units</th>
                  <th>Year Level</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {(subjectsData?.curriculum || []).map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.subject_code}</strong></td>
                    <td>{s.subject_title}</td>
                    <td>{s.units} units</td>
                    <td>Year {s.year_level}</td>
                    <td>{s.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
