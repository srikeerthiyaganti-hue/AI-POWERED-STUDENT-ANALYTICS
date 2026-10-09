import React from 'react';

export function MetricCard({ title, value, subtitle, icon: Icon, variant = 'default' }) {
  return (
    <div className={`metric-card metric-card--${variant}`}>
      <div className="metric-card__header">
        <span className="metric-card__title">{title}</span>
        {Icon && (
          <div className="metric-card__icon-wrap">
            <Icon size={20} className="metric-card__icon" />
          </div>
        )}
      </div>
      <div className="metric-card__body">
        <span className="metric-card__value">{value}</span>
        {subtitle && <p className="metric-card__subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default MetricCard;
