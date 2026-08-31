import React, { useState } from 'react';
import { Camera, Sparkles, Layers, ArrowLeftRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface BeforeAfterSliderProps {
  scanImage?: string | null;
  children: React.ReactNode; // 3D/2D canvas content
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  scanImage,
  children,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'before' | 'designed'>('split');
  const [sliderPos, setSliderPos] = useState<number>(50);

  if (!scanImage) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-3">
      {/* View Switcher Header */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-softBorder text-xs">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-terracotta-600" />
          <span className="font-bold text-charcoal-900">Before & After Experience</span>
        </div>

        <div className="flex items-center bg-white rounded-xl p-0.5 border border-softBorder shadow-warm-xs font-semibold text-xs">
          <button
            onClick={() => setViewMode('before')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'before' ? 'bg-terracotta-500 text-white shadow-terracotta' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            📷 Before (Uploaded Room)
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'split' ? 'bg-terracotta-500 text-white shadow-terracotta' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            ↔️ Interactive Compare
          </button>

          <button
            onClick={() => setViewMode('designed')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'designed' ? 'bg-terracotta-500 text-white shadow-terracotta' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            ✨ Designed (3D Layout)
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-softBorder shadow-warm-md bg-charcoal-900">
        {viewMode === 'before' && (
          <div className="relative w-full h-full">
            <img src={scanImage} alt="Uploaded Room Scan" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <Badge variant="terracotta" size="sm">
                BEFORE — Uploaded Room Image
              </Badge>
            </div>
          </div>
        )}

        {viewMode === 'designed' && (
          <div className="relative w-full h-full">
            {children}
            <div className="absolute top-4 left-4 z-20">
              <Badge variant="sage" size="sm">
                DESIGNED — SmartSpace AI Redesign
              </Badge>
            </div>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="relative w-full h-full overflow-hidden select-none">
            {/* Base layer: Designed 3D canvas */}
            <div className="absolute inset-0 w-full h-full">{children}</div>

            {/* Overlay layer: Uploaded Image clipped by slider position */}
            <div
              className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-2 border-white shadow-2xl z-10"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={scanImage}
                alt="Uploaded Room Scan"
                className="absolute top-0 left-0 h-full max-w-none object-cover"
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute top-4 left-4">
                <Badge variant="terracotta" size="sm">
                  BEFORE (Original Scan)
                </Badge>
              </div>
            </div>

            {/* Interactive Slider Handle Bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>
        )}
      </div>
    </div>
  );
};
