import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const iconMap: Record<string, React.ReactNode> = {
    info: <Info className="w-4 h-4 text-terracotta-600 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-sand-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
  };

  const borderMap: Record<string, string> = {
    info: 'border-terracotta-300 bg-white',
    success: 'border-sage-300 bg-white',
    warning: 'border-sand-300 bg-white',
    error: 'border-red-300 bg-white',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border ${borderMap[toast.type]} shadow-warm-lg transition-all duration-300 animate-slide-up`}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5">{iconMap[toast.type]}</div>
            <div>
              <h5 className="text-xs font-semibold text-charcoal-900">{toast.title}</h5>
              {toast.description && (
                <p className="text-[11px] text-charcoal-500 mt-0.5 leading-normal">{toast.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-charcoal-400 hover:text-charcoal-800 p-1 rounded-lg transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
