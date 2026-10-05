import React from 'react';

export function BannerAlert({ type = 'info', title, message, children, style = {} }) {
  const iconMap = {
    warning: '⚠️',
    danger: '⛔',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div className={`banner-alert ${type}`} style={style}>
      <div className="banner-icon">{iconMap[type] || 'ℹ️'}</div>
      <div className="banner-content">
        {title && <h4>{title}</h4>}
        {message && <p>{message}</p>}
        {children}
      </div>
    </div>
  );
}
