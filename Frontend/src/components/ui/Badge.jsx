import React from 'react';

export default function Badge({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'neutral' | 'primary'
  icon: Icon,
  dot = false,
  className = '',
  style = {},
}) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
    primary: 'badge-primary',
  };

  const dotColors = {
    success: 'var(--color-status-success)',
    warning: 'var(--color-status-warning)',
    danger: 'var(--color-status-danger)',
    neutral: 'var(--color-status-neutral)',
    primary: 'var(--color-blue-primary)',
  };

  return (
    <span
      className={`badge ${variantClasses[variant] || 'badge-neutral'} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', ...style }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[variant] || dotColors.neutral,
            display: 'inline-block',
          }}
        />
      )}
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
