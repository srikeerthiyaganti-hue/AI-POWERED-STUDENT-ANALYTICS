import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  style = {},
  ...rest
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="form-group" style={{ width: '100%', ...style }}>
      {label && (
        <label htmlFor={inputId} className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{label}</span>
          {required && <span style={{ color: 'var(--color-status-danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-secondary)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input ${className}`}
          style={{
            paddingLeft: Icon ? '2.45rem' : '0.75rem',
            borderColor: error ? 'var(--color-status-danger)' : undefined,
          }}
          {...rest}
        />
      </div>

      {error ? (
        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-status-danger)', marginTop: '2px' }}>
          {error}
        </div>
      ) : helperText ? (
        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
