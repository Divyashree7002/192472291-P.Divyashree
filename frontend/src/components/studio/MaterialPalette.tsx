import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

export interface MaterialOption {
  id: string;
  category: 'flooring' | 'wall' | 'accent';
  name: string;
  finish: string;
  colorHex: string;
  textureHint: string;
}

export const SAMPLE_MATERIALS: MaterialOption[] = [
  // Flooring
  { id: 'mat-f1', category: 'flooring', name: 'White Oak Planks', finish: 'Natural Matte', colorHex: '#DDC2A2', textureHint: 'Hardwood Grain' },
  { id: 'mat-f2', category: 'flooring', name: 'Travertine Stone', finish: 'Honed Warm Ivory', colorHex: '#EAE1D3', textureHint: 'Mineral Stone' },
  { id: 'mat-f3', category: 'flooring', name: 'Italian Smoked Walnut', finish: 'Satin Grain', colorHex: '#6E4E37', textureHint: 'Rich Timber' },
  
  // Wall Finish
  { id: 'mat-w1', category: 'wall', name: 'Warm Alabaster', finish: 'Chalk Plaster', colorHex: '#FAF7F0', textureHint: 'Soft Matte' },
  { id: 'mat-w2', category: 'wall', name: 'Nordic Sage Mineral', finish: 'Velvet Wash', colorHex: '#B8C9BA', textureHint: 'Muted Earth' },
  { id: 'mat-w3', category: 'wall', name: 'Terracotta Lime Wash', finish: 'Artisan Clay', colorHex: '#DDA896', textureHint: 'Warm Wash' },

  // Accent Metals & Textiles
  { id: 'mat-a1', category: 'accent', name: 'Warm Brushed Brass', finish: 'Champagne Luster', colorHex: '#D4A373', textureHint: 'Brushed Metal' },
  { id: 'mat-a2', category: 'accent', name: 'Natural Raw Bouclé', finish: 'Textured Weave', colorHex: '#F0EBE1', textureHint: 'Heavy Wool' },
  { id: 'mat-a3', category: 'accent', name: 'Muted Clay Ceramic', finish: 'Matte Glaze', colorHex: '#C86D51', textureHint: 'Handmade Glaze' },
];

export const MaterialPalette: React.FC = () => {
  const [selectedFlooring, setSelectedFlooring] = useState('mat-f1');
  const [selectedWall, setSelectedWall] = useState('mat-w1');
  const [selectedAccent, setSelectedAccent] = useState('mat-a1');

  const renderSection = (
    title: string,
    category: 'flooring' | 'wall' | 'accent',
    selectedId: string,
    onSelect: (id: string) => void
  ) => {
    const items = SAMPLE_MATERIALS.filter((m) => m.category === category);

    return (
      <div className="space-y-2">
        <span className="text-xs font-bold text-charcoal-800 block">{title}</span>
        <div className="grid grid-cols-3 gap-2.5">
          {items.map((mat) => {
            const isSelected = selectedId === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => onSelect(mat.id)}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-terracotta-50/60 border-terracotta-400 shadow-warm-md ring-1 ring-terracotta-300'
                    : 'bg-[#FCFBF9] border-softBorder hover:border-softBorder-dark hover:bg-white shadow-warm-sm'
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg mb-2 flex items-center justify-center border border-softBorder shadow-inner"
                  style={{ backgroundColor: mat.colorHex }}
                >
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white/90 shadow-warm-sm flex items-center justify-center text-terracotta-700">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-bold text-charcoal-900 text-center truncate w-full">
                  {mat.name}
                </span>
                <span className="text-[9px] text-charcoal-500 text-center truncate w-full font-medium">
                  {mat.finish}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-softBorder shadow-warm-md space-y-4">
      <div className="flex items-center justify-between border-b border-softBorder pb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-terracotta-600" />
          <h3 className="text-sm font-bold text-charcoal-900">Material & Texture Finishes</h3>
        </div>
        <span className="text-[10px] font-mono text-sage-800 bg-sage-100 px-2 py-0.5 rounded-lg border border-sage-300 font-semibold">
          PBR Textures
        </span>
      </div>

      <div className="space-y-4">
        {renderSection('Flooring Surface', 'flooring', selectedFlooring, setSelectedFlooring)}
        {renderSection('Wall Elevation Finish', 'wall', selectedWall, setSelectedWall)}
        {renderSection('Fixture & Textile Accents', 'accent', selectedAccent, setSelectedAccent)}
      </div>
    </div>
  );
};
