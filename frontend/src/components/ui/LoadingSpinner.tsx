import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeMap[size]} text-terracotta-500 animate-spin`} />
        <div className="absolute inset-0 rounded-full blur-sm bg-terracotta-500/20 animate-pulse" />
      </div>
      {label && <p className="text-xs text-charcoal-600 font-medium tracking-wide">{label}</p>}
    </div>
  );
};
