import React from 'react';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DesignCustomizationState, DesignStyle } from '../../types';
import { STYLE_PRESETS } from '../../utils/roomArchetypes';

interface StyleCompareModalProps {
  customization: DesignCustomizationState;
  onChangeCustomization: (updated: Partial<DesignCustomizationState>) => void;
  onClose: () => void;
}

export const StyleCompareModal: React.FC<StyleCompareModalProps> = ({
  customization,
  onChangeCustomization,
  onClose,
}) => {
  const stylesList: DesignStyle[] = ['modern', 'scandinavian', 'luxury', 'industrial', 'minimalist'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-softBorder shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terracotta-600" />
              <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                Compare Design Styles on Your Room
              </h3>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Your scanned room geometry and furniture layout remain identical. Only surface finishes and aesthetics change.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Style Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stylesList.map((st) => {
            const preset = STYLE_PRESETS[st] || STYLE_PRESETS.modern;
            const isSelected = customization.style === st;

            return (
              <div
                key={st}
                onClick={() => {
                  onChangeCustomization({
                    style: st,
                    colors: {
                      ...customization.colors,
                      wall: preset.palette.wall,
                      floor: preset.palette.floor,
                      furniture: preset.palette.furniture,
                      accent: preset.palette.accent,
                    },
                  });
                }}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-terracotta-500 shadow-warm-md ring-2 ring-terracotta-400'
                    : 'bg-[#FCFBF9] hover:bg-white border-softBorder hover:border-terracotta-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={isSelected ? 'terracotta' : 'sage'} size="sm">
                      {preset.badge}
                    </Badge>
                    {isSelected && <Check className="w-4 h-4 text-terracotta-600 font-bold" />}
                  </div>

                  <h4 className="font-bold text-base text-charcoal-900 capitalize">
                    {preset.label}
                  </h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {preset.description}
                  </p>

                  {/* Surface Palette Swatches */}
                  <div className="space-y-1.5 pt-2 border-t border-softBorder text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-charcoal-500 block">Surface Swatches:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: preset.palette.wall }} title="Wall" />
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: preset.palette.floor }} title="Floor" />
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: preset.palette.furniture }} title="Furniture" />
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: preset.palette.accent }} title="Accent" />
                    </div>
                  </div>
                </div>

                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full mt-2 font-semibold"
                >
                  {isSelected ? 'Active Style' : 'Apply Style'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
