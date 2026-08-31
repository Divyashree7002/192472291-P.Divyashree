import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-charcoal-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative shadow-warm-sm">
        <select
          id={selectId}
          className={`w-full appearance-none bg-white border ${
            error ? 'border-red-400' : 'border-softBorder focus:border-terracotta-500'
          } rounded-xl px-3.5 py-2.5 pr-10 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-terracotta-200 transition-all ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-charcoal-900">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-charcoal-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-charcoal-500">{helperText}</p>
      ) : null}
    </div>
  );
};
