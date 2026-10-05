import React from 'react';

export function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={color ? { color } : {}}>{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
