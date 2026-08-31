import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'terracotta' | 'sage' | 'success' | 'warning' | 'danger' | 'neutral' | 'sand' | 'cyan' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1 font-medium',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    primary: 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300/80',
    terracotta: 'bg-terracotta-100 text-terracotta-800 border border-terracotta-300/80',
    cyan: 'bg-sage-100 text-sage-800 border border-sage-300/80',
    sage: 'bg-sage-100 text-sage-800 border border-sage-300/80',
    success: 'bg-sage-100 text-sage-800 border border-sage-300/80',
    warning: 'bg-sand-100 text-sand-800 border border-sand-300/80',
    sand: 'bg-sand-100 text-sand-800 border border-sand-300/80',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    neutral: 'bg-[#F2ECE4] text-charcoal-700 border border-softBorder',
    outline: 'bg-white text-charcoal-700 border border-softBorder shadow-warm-sm',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
