import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sage' | 'sand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-terracotta focus:ring-terracotta-400 border border-terracotta-600',
    secondary: 'bg-[#F2ECE4] hover:bg-[#EAE2D6] text-charcoal-800 border border-softBorder focus:ring-sand-400',
    outline: 'bg-white hover:bg-cream-100 text-charcoal-800 border border-softBorder-dark hover:border-charcoal-400 focus:ring-terracotta-300 shadow-warm-sm',
    ghost: 'bg-transparent hover:bg-cream-200 text-charcoal-600 hover:text-charcoal-900 focus:ring-charcoal-300',
    danger: 'bg-red-700 hover:bg-red-800 text-white focus:ring-red-400 border border-red-800',
    sage: 'bg-sage-500 hover:bg-sage-600 text-white shadow-sage focus:ring-sage-400 border border-sage-600',
    sand: 'bg-sand-400 hover:bg-sand-500 text-charcoal-900 font-semibold focus:ring-sand-400 border border-sand-500/40',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
