import React from 'react';
import { Check } from 'lucide-react';

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'nordic_warm',
    name: 'Warm Nordic Linen',
    colors: ['#FAF7F2', '#EFE8DE', '#DDC2A2', '#8A8079', '#453C39'],
  },
  {
    id: 'sage_mineral',
    name: 'Sage & Soft Alabaster',
    colors: ['#F7FAF7', '#E8EFE9', '#B8C9BA', '#607B66', '#3D5443'],
  },
  {
    id: 'terracotta_clay',
    name: 'Terracotta & Warm Ochre',
    colors: ['#FDF6F3', '#F9EDE8', '#E8BBAA', '#C86D51', '#7F3D2B'],
  },
  {
    id: 'sand_travertine',
    name: 'Travertine & Warm Sand',
    colors: ['#FCFBF9', '#F4EDE2', '#EAD8C3', '#C59B6D', '#5E5450'],
  },
  {
    id: 'earthy_harmony',
    name: 'Earthy Clay & Sage Trio',
    colors: ['#FAF8F5', '#EAE1D3', '#C86D51', '#607B66', '#2C2523'],
  },
];

interface ColorPalettePickerProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  selectedColors,
  onChange,
}) => {
  const isPaletteSelected = (palette: ColorPalette) => {
    return palette.colors.every((c) => selectedColors.includes(c));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {PRESET_PALETTES.map((pal) => {
          const isSelected = isPaletteSelected(pal);
          return (
            <div
              key={pal.id}
              onClick={() => onChange(pal.colors)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-terracotta-50/80 border-terracotta-400 ring-1 ring-terracotta-300 shadow-warm-md'
                  : 'bg-white border-softBorder hover:border-softBorder-dark shadow-warm-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-charcoal-900">{pal.name}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-terracotta-500 flex items-center justify-center text-white text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Color Swatch Bar */}
              <div className="flex rounded-xl overflow-hidden h-7 border border-softBorder shadow-inner">
                {pal.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="flex-1 transition-transform hover:scale-105"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
