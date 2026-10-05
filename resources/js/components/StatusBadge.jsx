import React from 'react';

export function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  let cls = 'badge-neutral';

  if (['released', 'verified', 'passed', 'enrolled', 'cleared', 'active'].includes(s)) {
    cls = 'badge-success';
  } else if (['pending', 'pending_payment', 'unpaid', 'processing', 'in progress'].includes(s)) {
    cls = 'badge-warning';
  } else if (['ready_for_pickup'].includes(s)) {
    cls = 'badge-info';
  } else if (['rejected', 'failed', 'inactive', 'suspended', 'hold'].includes(s)) {
    cls = 'badge-danger';
  }

  const label = (status || '').replace(/_/g, ' ').toUpperCase();
  return <span className={`badge ${cls}`}>{label}</span>;
}
