import React from 'react';
import { Sparkles, X, Palette, Image as ImageIcon, Sun, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DesignCustomizationState } from '../../types';
import { STYLE_PRESETS } from '../../utils/roomArchetypes';

interface MoodboardModalProps {
  customization: DesignCustomizationState;
  onClose: () => void;
}

export const MoodboardModal: React.FC<MoodboardModalProps> = ({
  customization,
  onClose,
}) => {
  const { style = 'modern', colors, floorMaterial = 'light_oak', placedFurniture } = customization;
  const stylePreset = STYLE_PRESETS[(style || 'modern') as keyof typeof STYLE_PRESETS] || STYLE_PRESETS.modern;
  const activeItems = placedFurniture.filter((i) => i.isVisible !== false).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-softBorder shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-terracotta-600" />
            <div>
              <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                🖼️ Room Moodboard Generator
              </h3>
              <p className="text-xs text-charcoal-500">Visual material palette, color composition, and furniture mood.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moodboard Collage Board */}
        <div className="bg-white p-6 rounded-3xl border border-softBorder shadow-warm-lg space-y-6">
          {/* Top Banner: Style & Theme */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Design Theme</span>
              <h4 className="text-xl font-bold text-charcoal-900 capitalize">{stylePreset.label} Interior</h4>
            </div>
            <Badge variant="terracotta" size="sm">
              {stylePreset.badge}
            </Badge>
          </div>

          {/* Color & Surface Palette Tiles */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">Color & Texture Harmony</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-2xl border border-softBorder bg-[#FAF7F2] space-y-1.5">
                <div className="h-12 rounded-xl border border-softBorder shadow-xs" style={{ backgroundColor: colors.wall }} />
                <span className="text-[10px] text-charcoal-500 font-bold block">Wall Palette</span>
                <span className="font-mono text-[11px] text-charcoal-900 block font-semibold">{colors.wall}</span>
              </div>

              <div className="p-3 rounded-2xl border border-softBorder bg-[#FAF7F2] space-y-1.5">
                <div className="h-12 rounded-xl border border-softBorder shadow-xs" style={{ backgroundColor: colors.floor }} />
                <span className="text-[10px] text-charcoal-500 font-bold block">Floor Surface</span>
                <span className="font-mono text-[11px] text-charcoal-900 block font-semibold">{colors.floor}</span>
              </div>

              <div className="p-3 rounded-2xl border border-softBorder bg-[#FAF7F2] space-y-1.5">
                <div className="h-12 rounded-xl border border-softBorder shadow-xs" style={{ backgroundColor: colors.ceiling }} />
                <span className="text-[10px] text-charcoal-500 font-bold block">Ceiling Tone</span>
                <span className="font-mono text-[11px] text-charcoal-900 block font-semibold">{colors.ceiling}</span>
              </div>

              <div className="p-3 rounded-2xl border border-softBorder bg-[#FAF7F2] space-y-1.5">
                <div className="h-12 rounded-xl border border-softBorder shadow-xs" style={{ backgroundColor: colors.furniture }} />
                <span className="text-[10px] text-charcoal-500 font-bold block">Furniture Finish</span>
                <span className="font-mono text-[11px] text-charcoal-900 block font-semibold">{colors.furniture}</span>
              </div>

              <div className="p-3 rounded-2xl border border-softBorder bg-[#FAF7F2] space-y-1.5">
                <div className="h-12 rounded-xl border border-softBorder shadow-xs" style={{ backgroundColor: colors.accent }} />
                <span className="text-[10px] text-charcoal-500 font-bold block">Accent Color</span>
                <span className="font-mono text-[11px] text-charcoal-900 block font-semibold">{colors.accent}</span>
              </div>
            </div>
          </div>

          {/* Staged Furniture Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">Furniture & Decor Selections</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#FAF7F2] border border-softBorder flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-charcoal-900 block truncate">{item.name}</span>
                    <span className="text-[10px] text-charcoal-500 capitalize">{item.category} &bull; {item.material || 'Ash wood & fabric'}</span>
                  </div>
                  <span className="font-mono font-bold text-terracotta-700 shrink-0">₹{(item.price || item.estimatedCost || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lighting & Ambience Summary */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Lighting Ambience:</strong> 2700K Warm Ambient Illumination with Natural Daylight Window Access</span>
            </div>
            <Badge variant="warning" size="sm">Harmonized</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
