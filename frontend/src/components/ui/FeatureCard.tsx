import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeVariant?: 'primary' | 'terracotta' | 'sage' | 'sand' | 'neutral';
  description: string;
  bullets?: string[];
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  badge,
  badgeVariant = 'neutral',
  description,
  bullets = [],
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md flex flex-col justify-between warm-card-hover ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-softBorder">
            {icon}
          </div>
          {badge && <Badge variant={badgeVariant} size="sm">{badge}</Badge>}
        </div>
        <h3 className="text-base font-bold text-charcoal-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-xs text-charcoal-600 leading-relaxed mb-4">{description}</p>
      </div>

      {bullets.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-softBorder text-[11px] text-charcoal-700 font-medium">
          {bullets.map((b, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
