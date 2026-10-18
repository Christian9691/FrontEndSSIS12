import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';

export function BannerAlert({ type = 'info', title, message, children, style = {} }) {
  const renderIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-600" />;
      case 'danger':
        return <AlertOctagon size={20} className="text-red-600" />;
      case 'success':
        return <CheckCircle2 size={20} className="text-emerald-600" />;
      case 'info':
      default:
        return <Info size={20} className="text-sky-600" />;
    }
  };

  return (
    <div className={`banner-alert ${type}`} style={style}>
      <div className="banner-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderIcon()}
      </div>
      <div className="banner-content">
        {title && <h4>{title}</h4>}
        {message && <p>{message}</p>}
        {children}
      </div>
    </div>
  );
}
