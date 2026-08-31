import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'subtle' | 'bordered' | 'interactive';
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  header,
  footer,
  className = '',
  ...props
}) => {
  const variantStyles = {
    glass: 'bg-white border border-softBorder rounded-2xl shadow-warm-sm',
    subtle: 'bg-[#F9F6F0] border border-softBorder rounded-2xl',
    bordered: 'bg-white border border-softBorder-dark rounded-2xl',
    interactive: 'bg-white border border-softBorder rounded-2xl shadow-warm-sm warm-card-hover cursor-pointer',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {header && <div className="px-6 py-4 border-b border-softBorder">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-softBorder bg-[#FAF7F2] rounded-b-2xl">{footer}</div>}
    </div>
  );
};
