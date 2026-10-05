import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

/* ---------- Mock data (replace with API calls when the Laravel backend is ready) ---------- */
const ROLES = {
  student:    { label: 'Student',    pages: ['Dashboard', 'Document Request'] },
  registrar:  { label: 'Registrar',  pages: ['Enrollment', 'Grades Encoding', 'Document Requests'] },
  cashier:    { label: 'Cashier',    pages: ['Payments'] },
  department: { label: 'Department', pages: ['Clearance'] },
  admin:      { label: 'Admin',      pages: ['User Accounts'] },
};
const STUDENT = { id: '2026-00123', name: 'Juan Dela Cruz', course: 'BS Information Technology', year: '2nd Year', section: 'IT-2A' };
const SUBJECTS = [
  { code: 'IT201', title: 'Data Structures', units: 3, grade: 1.5 },
  { code: 'IT202', title: 'Systems Analysis and Design', units: 3, grade: 1.75 },
  { code: 'IT203', title: 'Web Development', units: 3, grade: 1.25 },
  { code: 'GE104', title: 'Ethics', units: 3, grade: 2.0 },
];
const DOC_TYPES = ['Transcript of Records (TOR)', 'Certificate of Registration (COR)', 'Certification'];
const th = (s) => <th key={s}>{s}</th>;
const Tag = ({ s }) => <span className={'tag ' + (['Pending', 'Unpaid'].includes(s) ? 'w' : ['Rejected', 'Inactive'].includes(s) ? 'b' : '')}>{s}</span>;
const Table = ({ head, children }) => <table><thead><tr>{head.map(th)}</tr></thead><tbody>{children}</tbody></table>;

/* ---------- Login ---------- */
function Login({ onLogin }) {
  const [role, setRole] = useState('student');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    if (!f.get('id') || !f.get('pw')) return setErr('Enter your ID and password.');
    onLogin(role);
  };
  return (
    <div className="login">
      <form onSubmit={submit} noValidate>
        <h1>CuyoTech University SSIS</h1>
        <p>Sign in to access student services.</p>
        <label>Sign in as
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
          </select>
        </label>
        <label>Student / Employee ID<input name="id" autoComplete="username" placeholder="2026-00123" /></label>
        <label>Password<input name="pw" type="password" autoComplete="current-password" /></label>
        {err && <span role="alert" style={{ color: 'var(--bad)', fontSize: '.85rem' }}>{err}</span>}
        <button className="btn">Sign in</button>
      </form>
    </div>
  );
}

/* ---------- Student pages ---------- */
const Dashboard = () => {
  const units = SUBJECTS.reduce((a, s) => a + s.units, 0);
  return (<>
    <h1>Welcome, {STUDENT.name}</h1>
    <div className="grid">
      <div className="card"><h3>Profile</h3>
        <div>ID: {STUDENT.id}</div><div>{STUDENT.course}</div><div>{STUDENT.year} · {STUDENT.section}</div></div>
      <div className="card"><h3>Enrollment</h3><Tag s="Enrolled" /><p>{SUBJECTS.length} subjects, {units} units</p></div>
      <div className="card"><h3>Clearance</h3><Tag s="Pending" /><p>Waiting on Library and Accounting.</p></div>
    </div>
    <div className="card"><h3>Subjects and grades</h3>
      <Table head={['Code', 'Subject', 'Units', 'Grade']}>
        {SUBJECTS.map((s) => <tr key={s.code}><td>{s.code}</td><td>{s.title}</td><td>{s.units}</td><td>{s.grade.toFixed(2)}</td></tr>)}
      </Table></div>
  </>);
};

const DocRequest = ({ requests, add }) => {
  const [type, setType] = useState(DOC_TYPES[0]);
  const [copies, setCopies] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [ok, setOk] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!purpose.trim()) return;
    add({ id: 'DR-' + (1000 + requests.length + 1), student: STUDENT.name, type, copies, purpose, status: 'Pending' });
    setPurpose(''); setCopies(1); setOk(true);
  };
  return (<>
    <h1>Request a document</h1>
    <div className="card"><form className="form" onSubmit={submit}>
      <label>Document<select value={type} onChange={(e) => setType(e.target.value)}>{DOC_TYPES.map((d) => <option key={d}>{d}</option>)}</select></label>
      <label>Number of copies<input type="number" min="1" max="5" value={copies} onChange={(e) => setCopies(+e.target.value)} /></label>
      <label>Purpose<textarea rows="3" value={purpose} onChange={(e) => { setPurpose(e.target.value); setOk(false); }} placeholder="e.g. Job application" /></label>
      <button className="btn">Submit request</button>
      {ok && <span className="msg" role="status">Request submitted. Track it below.</span>}
    </form></div>
    <div className="card"><h3>My requests</h3>
      {requests.length === 0 ? <p>No requests yet. Submit one above.</p> :
        <Table head={['Ref', 'Document', 'Copies', 'Status']}>
          {requests.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.type}</td><td>{r.copies}</td><td><Tag s={r.status} /></td></tr>)}
        </Table>}
    </div>
  </>);
};

/* ---------- Staff pages ---------- */
const Queue = ({ title, head, rows, action }) => (<>
  <h1>{title}</h1>
  <div className="card">{rows.length === 0 ? <p>Nothing waiting. You are all caught up.</p> :
    <Table head={[...head, 'Status', '']}>{rows.map((r) => (
      <tr key={r.id}>{r.cells.map((c, i) => <td key={i}>{c}</td>)}<td><Tag s={r.status} /></td>
        <td>{r.status === 'Pending' || r.status === 'Unpaid' ? <button className="btn sm" onClick={() => action(r.id)}>{r.label}</button> : null}</td></tr>))}
    </Table>}</div>
</>);

const useList = (init) => { const [l, set] = useState(init); return [l, (id, patch) => set(l.map((x) => (x.id === id ? { ...x, ...patch } : x)))]; };

function Staff({ page, requests, setReq }) {
  const [enr, upEnr] = useList([{ id: 1, n: 'Maria Santos', c: 'BSIT', y: '1st', status: 'Pending' }, { id: 2, n: 'Pedro Reyes', c: 'BSCS', y: '3rd', status: 'Pending' }]);
  const [pay, upPay] = useList([{ id: 1, n: 'Juan Dela Cruz', f: 'Tuition (1st installment)', a: 12500, status: 'Unpaid' }, { id: 2, n: 'Maria Santos', f: 'Misc. fees', a: 3200, status: 'Unpaid' }]);
  const [clr, upClr] = useList([{ id: 1, n: 'Juan Dela Cruz', d: 'Library', status: 'Pending' }, { id: 2, n: 'Pedro Reyes', d: 'Library', status: 'Pending' }]);
  const [usr, upUsr] = useList([{ id: 1, n: 'Ana Lim', r: 'Registrar', status: 'Active' }, { id: 2, n: 'Ben Cruz', r: 'Cashier', status: 'Active' }, { id: 3, n: 'Juan Dela Cruz', r: 'Student', status: 'Active' }]);
  const [grades, setGrades] = useState({});

  if (page === 'Enrollment') return <Queue title="Enrollment" head={['Student', 'Course', 'Year']} rows={enr.map((e) => ({ id: e.id, cells: [e.n, e.c, e.y], status: e.status, label: 'Approve' }))} action={(id) => upEnr(id, { status: 'Enrolled' })} />;
  if (page === 'Payments') return <Queue title="Payments" head={['Student', 'Fee', 'Amount']} rows={pay.map((p) => ({ id: p.id, cells: [p.n, p.f, '₱' + p.a.toLocaleString()], status: p.status, label: 'Issue receipt' }))} action={(id) => upPay(id, { status: 'Paid' })} />;
  if (page === 'Clearance') return <Queue title="Clearance" head={['Student', 'Department']} rows={clr.map((c) => ({ id: c.id, cells: [c.n, c.d], status: c.status, label: 'Clear' }))} action={(id) => upClr(id, { status: 'Cleared' })} />;
  if (page === 'Document Requests') return <Queue title="Document requests" head={['Ref', 'Student', 'Document']} rows={requests.map((r) => ({ id: r.id, cells: [r.id, r.student, r.type], status: r.status, label: 'Mark ready' }))} action={(id) => setReq(id, 'Ready for pickup')} />;
  if (page === 'User Accounts') return (<><h1>User accounts</h1><div className="card"><Table head={['Name', 'Role', 'Status', '']}>
    {usr.map((u) => <tr key={u.id}><td>{u.n}</td><td>{u.r}</td><td><Tag s={u.status} /></td>
      <td><button className="btn alt sm" onClick={() => upUsr(u.id, { status: u.status === 'Active' ? 'Inactive' : 'Active' })}>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button></td></tr>)}
  </Table></div></>);
  return (<><h1>Grades encoding</h1><div className="card"><Table head={['Subject', 'Student', 'Grade']}>
    {SUBJECTS.map((s) => <tr key={s.code}><td>{s.code} {s.title}</td><td>{STUDENT.name}</td>
      <td><input aria-label={'Grade for ' + s.code} style={{ width: 80 }} value={grades[s.code] ?? s.grade} onChange={(e) => setGrades({ ...grades, [s.code]: e.target.value })} /></td></tr>)}
  </Table><p><button className="btn">Save grades</button></p></div></>);
}

/* ---------- App shell ---------- */
function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState('');
  const [requests, setRequests] = useState([]);
  if (!role) return <Login onLogin={(r) => { setRole(r); setPage(ROLES[r].pages[0]); }} />;
  const setReq = (id, status) => setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  return (
    <div className="shell">
      <aside>
        <h2>CuyoTech SSIS</h2><small>{ROLES[role].label}</small>
        <nav>{ROLES[role].pages.map((p) => <button key={p} className={p === page ? 'on' : ''} onClick={() => setPage(p)}>{p}</button>)}</nav>
        <nav className="out"><button onClick={() => setRole(null)}>Sign out</button></nav>
      </aside>
      <main>
        {page === 'Dashboard' ? <Dashboard />
          : page === 'Document Request' ? <DocRequest requests={requests} add={(r) => setRequests([r, ...requests])} />
          : <Staff page={page} requests={requests} setReq={setReq} />}
      </main>
    </div>
  );
}

createRoot(document.getElementById('app')).render(<App />);