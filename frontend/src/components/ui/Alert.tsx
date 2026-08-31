import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const iconMap = {
    info: <Info className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-sand-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
  };

  const styleMap = {
    info: 'bg-terracotta-50/80 border-terracotta-200 text-charcoal-800',
    success: 'bg-sage-50 border-sage-200 text-charcoal-800',
    warning: 'bg-sand-50 border-sand-200 text-charcoal-800',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={`flex gap-3 p-4 rounded-2xl border shadow-warm-sm ${styleMap[variant]} ${className}`} role="alert">
      {iconMap[variant]}
      <div className="text-xs sm:text-sm">
        {title && <h5 className="font-semibold mb-1 text-charcoal-900">{title}</h5>}
        <div className="opacity-95 leading-relaxed text-charcoal-700">{children}</div>
      </div>
    </div>
  );
};
