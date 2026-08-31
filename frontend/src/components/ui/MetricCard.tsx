import React from 'react';
import { Card } from './Card';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  accent?: 'terracotta' | 'sage' | 'sand' | 'neutral';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  description,
  icon,
  badge,
  accent = 'terracotta',
  className = '',
}) => {
  const accentIconBg = {
    terracotta: 'bg-terracotta-100 text-terracotta-700',
    sage: 'bg-sage-100 text-sage-700',
    sand: 'bg-sand-100 text-sand-800',
    neutral: 'bg-[#FAF6F0] text-charcoal-700',
  };

  return (
    <Card variant="glass" className={`p-5 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-charcoal-500">{label}</span>
          {icon && (
            <div className={`p-2 rounded-xl ${accentIconBg[accent]}`}>
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-2xl font-bold text-charcoal-900">{value}</h3>
          {subValue && (
            <span className="text-xs font-mono text-charcoal-500 font-semibold">
              {subValue}
            </span>
          )}
          {badge && <div>{badge}</div>}
        </div>
      </div>
      {description && (
        <p className="text-[11px] text-charcoal-500 mt-2 font-medium">{description}</p>
      )}
    </Card>
  );
};
