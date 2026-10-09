import React from 'react';

export default function Card({
  children,
  header,
  footer,
  interactive = false,
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  return (
    <div
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...rest}
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body" style={{ flex: '1 1 auto' }}>
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
