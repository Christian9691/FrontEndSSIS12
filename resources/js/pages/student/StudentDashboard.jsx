import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { StatusBadge } from '../../components/StatusBadge';
import { StatCard } from '../../components/StatCard';
import { BannerAlert } from '../../components/BannerAlert';
import { OfficialDocumentModal } from '../../components/OfficialDocumentModal';
import { OfficialReceiptModal } from '../../components/OfficialReceiptModal';

import { useAuth } from '../../context/AuthContext';

export function StudentDashboard() {
  const { currentUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/student/dashboard'),
      api.get('/api/document-requests'),
    ])
      .then(([dash, reqs]) => {
        setDashboard(dash);
        setRequests(reqs.requests || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  if (loading) {
    return <div className="card"><p>Loading student dashboard...</p></div>;
  }

  const student = dashboard?.student || {};

  return (
    <div>
      {/* Clearance Hold Alert Banner if Student is Uncleared */}
      {!student.clearance_status && (
        <BannerAlert
          type="danger"
          title="Academic Clearance Hold Detected"
          message="Your account currently has active clearance hold(s). In accordance with CuyoTech academic policies, official document requests and enrollment are restricted until cleared with the respective department."
        >
          <Link
            to="/student/clearance"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.6rem', display: 'inline-block' }}
          >
            View Clearance Hold Details
          </Link>
        </BannerAlert>
      )}

      {/* Student Profile Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '0.4rem' }}>
              {student.student_number || '2026-XXXXX'}
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0' }}>{student.name}</h2>
            <p style={{ opacity: 0.85, fontSize: '0.95rem' }}>
              {student.course_title} ({student.course_code}) · Year {student.year_level}
            </p>
            <p style={{ opacity: 0.75, fontSize: '0.82rem' }}>{student.department_name}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Clearance Eligibility</div>
            <div style={{ marginTop: '0.3rem' }}>
              {student.clearance_status ? (
                <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem' }}>
                  ✓ Cleared for Services
                </span>
              ) : (
                <span className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem' }}>
                  ✕ Clearance Hold Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-cols-4">
        <StatCard
          label="General Weighted Avg (GWA)"
          value={student.gwa ? student.gwa.toFixed(2) : '1.60'}
          sub="Academic Standing: Regular"
        />
        <StatCard
          label="Enrolled Subjects"
          value={student.enrolled_subjects_count || 5}
          sub="1st Semester 2026-2027"
        />
        <StatCard
          label="Total Units"
          value={student.total_units || 15}
          sub="Credited academic load"
        />
        <StatCard
          label="Document Requests"
          value={requests.length}
          sub="Lifetime applications"
        />
      </div>

      {/* Recent Requests Table */}
      <div className="card">
        <div className="card-header-bar">
          <h3>Recent Document Requests & Status Tracking</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-sm btn-secondary" onClick={loadData}>
              🔄 Refresh
            </button>
            <Link to="/student/requests" className="btn btn-sm btn-accent">
              + New Document Request
            </Link>
          </div>
        </div>

        {requests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No requests filed yet.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Tracking Number</th>
                  <th>Document</th>
                  <th>Fee</th>
                  <th>Date Filed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 5).map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.tracking_number}</strong></td>
                    <td>{r.document_type}</td>
                    <td>₱{r.assessment_fee.toFixed(2)}</td>
                    <td>{r.requested_date}</td>
                    <td><StatusBadge status={r.processing_status} /></td>
                    <td>
                      {r.processing_status === 'released' ? (
                        <button className="btn btn-sm" onClick={() => setActivePreviewDoc(r)}>
                          Download Document
                        </button>
                      ) : r.payment ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => setActiveReceipt(r)}>
                          View Receipt
                        </button>
                      ) : (
                        <Link to="/student/requests" className="btn btn-secondary btn-sm">
                          Pay / Track
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activePreviewDoc && (
        <OfficialDocumentModal doc={activePreviewDoc} onClose={() => setActivePreviewDoc(null)} />
      )}

      {activeReceipt && (
        <OfficialReceiptModal doc={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}
