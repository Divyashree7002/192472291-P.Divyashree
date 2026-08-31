import React from 'react';
import { formatIndianNumber } from '../../utils/currency';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  valuePrefix?: string;
  valueSuffix?: string;
  onChangeValue?: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  valuePrefix = '',
  valueSuffix = '',
  onChangeValue,
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {label && <span className="text-xs font-semibold text-charcoal-700">{label}</span>}
        <span className="text-xs font-semibold text-terracotta-700 bg-terracotta-100 px-2.5 py-0.5 rounded-lg border border-terracotta-300">
          {valuePrefix}{formatIndianNumber(value)}{valueSuffix}
        </span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            onChangeValue?.(Number(e.target.value));
            props.onChange?.(e);
          }}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-terracotta-500 focus:outline-none ${className}`}
          style={{
            background: `linear-gradient(to right, #C86D51 0%, #C86D51 ${percentage}%, #E6DFD5 ${percentage}%, #E6DFD5 100%)`,
          }}
          {...props}
        />
      </div>
      <div className="flex justify-between text-[11px] text-charcoal-400 mt-1 font-medium">
        <span>{valuePrefix}{formatIndianNumber(min)}{valueSuffix}</span>
        <span>{valuePrefix}{formatIndianNumber(max)}{valueSuffix}</span>
      </div>
    </div>
  );
};
