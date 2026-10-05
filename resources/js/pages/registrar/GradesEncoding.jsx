import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { BannerAlert } from '../../components/BannerAlert';

export function GradesEncoding() {
  const [gradesSheet, setGradesSheet] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(1);
  const [gradeInputs, setGradeInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const loadGrades = (subjectId) => {
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

  useEffect(() => {
    loadGrades(selectedSubjectId);
  }, [selectedSubjectId]);

  const handleSaveGrade = async (enrollmentId) => {
    const val = parseFloat(gradeInputs[enrollmentId]);
    if (isNaN(val) || val < 1.0 || val > 5.0) {
      setMsg({ type: 'danger', text: 'Grade must be between 1.00 and 5.00' });
      return;
    }

    try {
      const res = await api.post('/api/registrar/grades', {
        enrollment_id: enrollmentId,
        grade: val,
      });
      setMsg({ type: 'success', text: res.message });
      loadGrades(selectedSubjectId);
    } catch (err) {
      setMsg({ type: 'danger', text: err.message || 'Failed to save grade.' });
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
              Encode grades into the student official academic transcript (scale: 1.00 to 5.00)
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{ padding: '0.4rem 0.6rem' }}
            >
              {(gradesSheet?.subjects || []).map((s) => (
                <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Name</th>
                <th>Program</th>
                <th>Final Grade (1.00 - 5.00)</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(gradesSheet?.grades || []).map((g) => (
                <tr key={g.id}>
                  <td><strong>{g.student_number}</strong></td>
                  <td>{g.student_name}</td>
                  <td>{g.course}</td>
                  <td>
                    <input
                      type="number"
                      step="0.25"
                      min="1.00"
                      max="5.00"
                      value={gradeInputs[g.id] ?? ''}
                      onChange={(e) => setGradeInputs({ ...gradeInputs, [g.id]: e.target.value })}
                      style={{ width: '90px', padding: '0.35rem 0.5rem' }}
                    />
                  </td>
                  <td><StatusBadge status={g.remarks || 'Pending'} /></td>
                  <td>
                    <button className="btn btn-sm" onClick={() => handleSaveGrade(g.id)}>
                      Save Grade
                    </button>
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
