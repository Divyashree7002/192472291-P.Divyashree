import React, { useState } from 'react';
import { Box, Eye, Maximize2, Rotate3d, Compass, Grid, Sparkles, Building, Layers } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type ViewMode = 'perspective' | 'top_down' | 'front_elevation' | 'side_elevation';

interface ViewportPlaceholderProps {
  roomDimensions?: { length: number; width: number; height: number };
  roomTitle?: string;
  isExteriorElevation?: boolean;
}

export const ViewportPlaceholder: React.FC<ViewportPlaceholderProps> = ({
  roomDimensions = { length: 5.2, width: 4.0, height: 2.8 },
  roomTitle = 'Living Room Space',
  isExteriorElevation = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);

  const floorArea = (roomDimensions.length * roomDimensions.width).toFixed(1);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-softBorder shadow-warm-md flex flex-col min-h-[520px]">
      {/* Top Viewport Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#FAF7F2] border-b border-softBorder z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isExteriorElevation ? (
              <Building className="w-4 h-4 text-terracotta-600" />
            ) : (
              <Box className="w-4 h-4 text-terracotta-600" />
            )}
            <span className="text-xs font-bold text-charcoal-900">{roomTitle}</span>
          </div>
          <Badge variant="sage" size="sm">
            {isExteriorElevation
              ? 'Exterior Elevation Model'
              : `${floorArea} m² (${roomDimensions.length}m × ${roomDimensions.width}m)`}
          </Badge>
        </div>

        {/* 4 View Mode Angle Selectors */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-softBorder text-xs shadow-warm-sm">
          <button
            onClick={() => setViewMode('perspective')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 ${
              viewMode === 'perspective'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>Perspective</span>
          </button>
          <button
            onClick={() => setViewMode('top_down')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 ${
              viewMode === 'top_down'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Top View</span>
          </button>
          <button
            onClick={() => setViewMode('front_elevation')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 ${
              viewMode === 'front_elevation'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Front View</span>
          </button>
          <button
            onClick={() => setViewMode('side_elevation')}
            className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 ${
              viewMode === 'side_elevation'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side View</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="relative flex-1 bg-[#F9F6F0] flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Drafting Grid Backdrop */}
        {showGrid && (
          <div className="absolute inset-0 bg-drafting-grid opacity-70 pointer-events-none" />
        )}

        {/* Viewport Overlay HUD */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 font-mono text-[11px]">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-softBorder text-charcoal-800 flex items-center gap-2 shadow-warm-sm">
            <span className="w-2 h-2 rounded-full bg-terracotta-500" />
            <span className="font-semibold">VIEW: {viewMode.replace('_', ' ').toUpperCase()}</span>
          </div>
          {showDimensions && !isExteriorElevation && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-softBorder text-charcoal-600 shadow-warm-sm font-medium">
              Bounding: {roomDimensions.length}m (L) × {roomDimensions.width}m (W) × {roomDimensions.height}m (H)
            </div>
          )}
        </div>

        {/* Viewport Controls HUD */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Drafting Grid"
            className={`p-2 rounded-xl text-xs border transition-colors shadow-warm-sm ${
              showGrid ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300' : 'bg-white text-charcoal-400 border-softBorder'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            title="Toggle Dimension Annotations"
            className={`p-2 rounded-xl text-xs border transition-colors shadow-warm-sm ${
              showDimensions ? 'bg-terracotta-100 text-terracotta-800 border-terracotta-300' : 'bg-white text-charcoal-400 border-softBorder'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Architectural 3D Wireframe Placeholder Container */}
        <div className="relative z-10 max-w-lg w-full p-8 rounded-2xl bg-white border border-softBorder text-center shadow-warm-lg flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-terracotta-50 border border-terracotta-200 flex items-center justify-center text-terracotta-500 mb-4 shadow-warm-sm">
            {isExteriorElevation ? (
              <Building className="w-8 h-8" />
            ) : (
              <Box className="w-8 h-8" />
            )}
          </div>

          <Badge variant="terracotta" size="md" className="mb-2.5">
            Interactive 3D Visualization
          </Badge>

          <h3 className="text-base font-bold text-charcoal-900 mb-1">
            3D Spatial Viewport Ready
          </h3>

          <p className="text-xs text-charcoal-600 max-w-sm mb-6 leading-relaxed">
            Visualize reconstructed 3D boundary meshes, textured elevation slices, and dimensional furniture layouts in real-time.
          </p>

          {/* Planned Capabilities Specs */}
          <div className="grid grid-cols-2 gap-2.5 w-full text-left font-mono text-[11px] text-charcoal-700">
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-softBorder">
              <span className="text-terracotta-600 block font-bold mb-0.5">✓ 3D Mesh Extraction</span>
              <span className="text-[10px] text-charcoal-500">Wall, floor & ceiling planes</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-softBorder">
              <span className="text-sage-600 block font-bold mb-0.5">✓ Interactive Orbit</span>
              <span className="text-[10px] text-charcoal-500">Perspective & top-down view</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-softBorder">
              <span className="text-sand-600 block font-bold mb-0.5">✓ Elevation Slices</span>
              <span className="text-[10px] text-charcoal-500">Front and side orthographic</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-softBorder">
              <span className="text-charcoal-800 block font-bold mb-0.5">✓ Collision Bounds</span>
              <span className="text-[10px] text-charcoal-500">Live pathway verification</span>
            </div>
          </div>
        </div>

        {/* Axes Helper Indicator (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-softBorder flex items-center gap-3 text-[10px] font-mono shadow-warm-sm">
          <span className="text-terracotta-600 font-bold">X (Width)</span>
          <span className="text-sage-600 font-bold">Y (Height)</span>
          <span className="text-sand-600 font-bold">Z (Depth)</span>
        </div>
      </div>

      {/* Viewport Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-[#FAF7F2] border-t border-softBorder text-xs text-charcoal-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-terracotta-600" />
          <span className="font-medium">3D Viewport Target Initialized & Calibrated.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Reset Camera
          </Button>
          <Button variant="primary" size="sm" className="shadow-terracotta">
            Capture View
          </Button>
        </div>
      </div>
    </div>
  );
};
