import React from 'react';

export default function MetricStat({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  variant = 'default', // 'default' | 'success' | 'warning' | 'danger'
  style = {},
  className = '',
}) {
  const borderStyles = {
    default: undefined,
    success: '4px solid var(--color-status-success)',
    warning: '4px solid var(--color-status-warning)',
    danger: '4px solid var(--color-status-danger)',
  };

  const iconColors = {
    default: 'var(--color-blue-primary)',
    success: 'var(--color-status-success)',
    warning: 'var(--color-status-warning)',
    danger: 'var(--color-status-danger)',
  };

  return (
    <div
      className={`metric-card ${className}`}
      style={{
        borderLeft: borderStyles[variant],
        ...style,
      }}
    >
      <div className="metric-card-header">
        <span className="metric-card-title">{label}</span>
        {Icon && (
          <div
            className="metric-card-icon"
            style={{
              color: iconColors[variant],
              backgroundColor: variant === 'default' ? 'var(--color-blue-surface)' : undefined,
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span className="text-stat-md" style={{ color: variant === 'danger' ? 'var(--color-status-danger)' : undefined }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
