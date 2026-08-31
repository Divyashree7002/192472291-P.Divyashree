import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Disc } from 'lucide-react';

export interface StatusIndicatorProps {
  label: string;
  status: 'ready' | 'not_connected' | 'pending' | 'active' | 'warning';
  customText?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  label,
  status,
  customText,
  className = '',
}) => {
  const configs = {
    ready: {
      text: customText || 'Ready',
      bgColor: 'bg-sage-100',
      textColor: 'text-sage-800',
      borderColor: 'border-sage-300',
      dotColor: 'bg-sage-600',
      icon: <CheckCircle2 className="w-3 h-3 text-sage-600" />,
    },
    active: {
      text: customText || 'Active',
      bgColor: 'bg-terracotta-100',
      textColor: 'text-terracotta-800',
      borderColor: 'border-terracotta-300',
      dotColor: 'bg-terracotta-600',
      icon: <Disc className="w-3 h-3 text-terracotta-600 animate-spin" />,
    },
    not_connected: {
      text: customText || 'Not connected',
      bgColor: 'bg-[#F2ECE4]',
      textColor: 'text-charcoal-700',
      borderColor: 'border-softBorder',
      dotColor: 'bg-charcoal-400',
      icon: <AlertCircle className="w-3 h-3 text-charcoal-500" />,
    },
    pending: {
      text: customText || 'Integration pending',
      bgColor: 'bg-sand-100',
      textColor: 'text-sand-800',
      borderColor: 'border-sand-300',
      dotColor: 'bg-sand-500',
      icon: <Clock className="w-3 h-3 text-sand-600" />,
    },
    warning: {
      text: customText || 'Attention',
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      dotColor: 'bg-red-500',
      icon: <AlertCircle className="w-3 h-3 text-red-600" />,
    },
  };

  const current = configs[status];

  return (
    <div className={`flex items-center justify-between p-2.5 rounded-xl border bg-white ${className}`}>
      <span className="text-xs font-semibold text-charcoal-700">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${current.bgColor} ${current.textColor} ${current.borderColor}`}
      >
        {current.icon}
        <span>{current.text}</span>
      </span>
    </div>
  );
};
