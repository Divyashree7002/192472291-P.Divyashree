import React from 'react';
import { Check } from 'lucide-react';
import { DesignStyle } from '../../types';

interface StyleSelectorProps {
  selectedStyles: DesignStyle[];
  onChange: (styles: DesignStyle[]) => void;
}

interface StyleMeta {
  id: DesignStyle;
  name: string;
  tagline: string;
  accentColor: string;
}

const STYLES_LIST: StyleMeta[] = [
  { id: 'modern', name: 'Modern', tagline: 'Sleek profiles, geometric clarity, warm neutrals', accentColor: '#C86D51' },
  { id: 'minimalist', name: 'Minimalist', tagline: 'Uncluttered open space, essential functional pieces', accentColor: '#8A8079' },
  { id: 'contemporary', name: 'Contemporary', tagline: 'Current design trends, soft curves, sophisticated finishes', accentColor: '#607B66' },
  { id: 'traditional', name: 'Traditional', tagline: 'Classic silhouettes, rich timber grains, timeless symmetry', accentColor: '#7F3D2B' },
  { id: 'scandinavian', name: 'Scandinavian', tagline: 'Light woods, airy textiles, organic natural daylight', accentColor: '#8EB194' },
  { id: 'industrial', name: 'Industrial', tagline: 'Raw metal accents, exposed textures, structural boldness', accentColor: '#5E5450' },
  { id: 'luxury', name: 'Luxury', tagline: 'Honed stone, brushed brass fixtures, high-end upholstery', accentColor: '#D4A373' },
  { id: 'bohemian', name: 'Bohemian', tagline: 'Artisanal weaves, warm layered textures, vibrant accents', accentColor: '#C59B6D' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyles,
  onChange,
}) => {
  const toggleStyle = (style: DesignStyle) => {
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        onChange(selectedStyles.filter((s) => s !== style));
      }
    } else {
      onChange([...selectedStyles, style]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {STYLES_LIST.map((style) => {
        const isSelected = selectedStyles.includes(style.id);
        return (
          <div
            key={style.id}
            onClick={() => toggleStyle(style.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'bg-terracotta-50/80 border-terracotta-400 ring-1 ring-terracotta-300 shadow-warm-md'
                : 'bg-white border-softBorder hover:border-softBorder-dark shadow-warm-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-warm-sm"
                  style={{ backgroundColor: style.accentColor }}
                />
                <h4 className="text-xs font-bold text-charcoal-900">{style.name}</h4>
              </div>
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-terracotta-500 border-terracotta-600 text-white' : 'border-softBorder-dark bg-[#FAF7F2]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed font-medium">{style.tagline}</p>
          </div>
        );
      })}
    </div>
  );
};
