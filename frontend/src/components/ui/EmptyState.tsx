import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-dashed border-softBorder-dark ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#F6F1EA] border border-softBorder flex items-center justify-center text-terracotta-600 mb-4 shadow-warm-sm">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-charcoal-900 mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="secondary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
