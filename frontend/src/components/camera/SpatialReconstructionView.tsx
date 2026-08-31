import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Layers,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Info,
  ArrowRight,
  Compass,
  Ruler,
  Eye,
  EyeOff,
  Activity,
  Maximize,
  Grid
} from 'lucide-react';
import { RoomAnalysisResponse, EstimatedPlane, DetectedObject } from '../../services/api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';

interface SpatialReconstructionViewProps {
  analysis: RoomAnalysisResponse;
  confidenceThreshold: number;
  onConfidenceChange: (val: number) => void;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  selectedObjectId: number | null;
  onSelectObject: (id: number | null) => void;
}

export const SpatialReconstructionView: React.FC<SpatialReconstructionViewProps> = ({
  analysis,
  confidenceThreshold,
  onConfidenceChange,
  showOverlay,
  onToggleOverlay,
  selectedObjectId,
  onSelectObject,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'spatial_3d' | 'planes' | 'depth' | 'diagnostics'>('spatial_3d');

  const room = analysis.room;
  const planes = analysis.planes || [];
  const allObjects = analysis.objects || [];
  const filteredObjects = allObjects.filter((obj) => obj.confidence >= confidenceThreshold);

  return (
    <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-softBorder pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-terracotta-600" />
            <h3 className="text-base font-bold text-charcoal-900">
              Metric Depth & 3D Spatial Reconstruction
            </h3>
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Monocular depth estimation, RANSAC plane fitting, and metric spatial coordinate mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="sage" size="md">
            Scale Conf: {((analysis.scale_confidence || 0.85) * 100).toFixed(0)}%
          </Badge>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-xl bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
            {analysis.calibration_source === 'user_priors' ? 'Calibrated Prior' : 'Default Prior'}
          </span>
        </div>
      </div>

      {/* Metric Room Dimensions Summary Card */}
      {room && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Room Length</span>
            <span className="text-sm font-bold text-charcoal-900 font-mono">{room.length_m} m</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Room Width</span>
            <span className="text-sm font-bold text-charcoal-900 font-mono">{room.width_m} m</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Ceiling Height</span>
            <span className="text-sm font-bold text-charcoal-900 font-mono">{room.height_m} m</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Floor Area</span>
            <span className="text-sm font-bold text-charcoal-900 font-mono">{room.floor_area_sqm} m&sup2;</span>
          </div>
          <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Room Volume</span>
            <span className="text-sm font-bold text-charcoal-900 font-mono">{room.volume_m3} m&sup3;</span>
          </div>
        </div>
      )}

      {/* Confidence Filter & Viewport Controls */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-softBorder space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm">
            <Slider
              label={`Confidence Filter: ${(confidenceThreshold * 100).toFixed(0)}%`}
              min={10}
              max={95}
              step={5}
              value={Math.round(confidenceThreshold * 100)}
              onChangeValue={(val) => onConfidenceChange(val / 100)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleOverlay}
              variant={showOverlay ? 'primary' : 'outline'}
              size="sm"
              leftIcon={showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            >
              {showOverlay ? 'Overlay Visible' : 'Overlay Hidden'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-1 border-t border-softBorder">
          <span>Displaying {filteredObjects.length} of {allObjects.length} 3D-localized objects</span>
          <span className="font-mono">{planes.length} RANSAC Planes Fitted</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-softBorder pb-1 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('spatial_3d')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'spatial_3d'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          3D Object Coordinates ({filteredObjects.length})
        </button>
        <button
          onClick={() => setActiveTab('planes')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'planes'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          Fitted Room Planes ({planes.length})
        </button>
        <button
          onClick={() => setActiveTab('depth')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'depth'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          Monocular Depth Map
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'diagnostics'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          Scene Quality & Palette
        </button>
      </div>

      {/* Tab 1: 3D Object Spatial Coordinates */}
      {activeTab === 'spatial_3d' && (
        <div className="space-y-3">
          {filteredObjects.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#FCFBF9] border border-dashed border-softBorder-dark text-xs text-charcoal-500">
              No objects above {(confidenceThreshold * 100).toFixed(0)}% confidence threshold.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {filteredObjects.map((obj, idx) => {
                const isSelected = selectedObjectId === idx;
                const s3d = obj.spatial_3d;
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectObject(isSelected ? null : idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-warm-sm flex flex-col justify-between ${
                      isSelected
                        ? 'bg-terracotta-50 border-terracotta-400 ring-2 ring-terracotta-200'
                        : 'bg-[#FCFBF9] border-softBorder hover:border-terracotta-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-terracotta-600" />
                        <span className="text-xs font-bold text-charcoal-900 capitalize">
                          {obj.class_name.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold bg-terracotta-50 text-terracotta-800 border-terracotta-200">
                        {(obj.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    {s3d ? (
                      <div className="space-y-1 text-[11px] font-mono text-charcoal-700 bg-white/90 p-2.5 rounded-lg border border-softBorder">
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Position (X, Y, Z):</span>
                          <span className="font-bold">({s3d.x_m}m, {s3d.y_m}m, {s3d.z_m}m)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Volume (W &times; H &times; D):</span>
                          <span>{s3d.width_m}m &times; {s3d.height_m}m &times; {s3d.depth_m}m</span>
                        </div>
                        <div className="flex justify-between text-terracotta-700 font-semibold">
                          <span>Camera Distance:</span>
                          <span>{s3d.distance_from_camera_m} m</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-charcoal-500">
                        2D Bounds: {obj.bbox.width} &times; {obj.bbox.height} px
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Fitted Room Planes (RANSAC) */}
      {activeTab === 'planes' && (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {planes.map((p, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-2 shadow-warm-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sage-600" />
                  <span>{p.orientation_label}</span>
                </span>
                <Badge variant="sage" size="sm">
                  {(p.confidence * 100).toFixed(0)}% Conf
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-charcoal-700 bg-white p-2 rounded-lg border border-softBorder">
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Normal Vector</span>
                  <span>[{p.normal.x}, {p.normal.y}, {p.normal.z}]</span>
                </div>
                <div>
                  <span className="text-charcoal-400 block text-[10px]">Distance to Origin</span>
                  <span>{p.estimated_distance_m} meters</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-softBorder text-[10px] text-charcoal-500">
                  <span>Equation: <code>{p.equation}</code></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Monocular Depth Map Colormap */}
      {activeTab === 'depth' && (
        <div className="space-y-3">
          {analysis.depth_visualization ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border border-softBorder shadow-warm-md bg-black">
              <img
                src={analysis.depth_visualization}
                alt="Monocular Depth Map Visualization"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-mono text-white flex items-center gap-3">
                <span className="text-purple-400 font-bold">&bull; Dark/Purple = Near</span>
                <span className="text-amber-400 font-bold">&bull; Yellow/White = Far</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-[#FCFBF9] border border-softBorder text-xs text-charcoal-500">
              Depth map unavailable.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Scene Diagnostics & Palette */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-3">
          {analysis.room_structure?.dominant_colors && (
            <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-2">
              <span className="text-xs font-bold text-charcoal-900 block">Dominant Scene Palette</span>
              <div className="grid grid-cols-4 gap-2">
                {analysis.room_structure.dominant_colors.map((c: string, i: number) => (
                  <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-softBorder">
                    <div className="w-full h-7 rounded border border-black/10 shadow-inner" style={{ backgroundColor: c }} />
                    <span className="text-[10px] font-mono text-charcoal-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monocular Scale Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder text-xs text-charcoal-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-bold text-charcoal-900">Metric Scale Calibration:</p>
          <p>
            {analysis.monocular_disclaimer ||
              'Scale calibrated from input room dimensions and standard camera elevation priors. Metric spatial measurements are estimated within ±8% variance.'}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex gap-3 pt-2 border-t border-softBorder">
        <Button
          onClick={() => navigate('/studio')}
          variant="primary"
          size="md"
          className="w-full shadow-terracotta font-semibold"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Open in 3D Design Studio
        </Button>
        <Button
          onClick={() => navigate('/recommendations')}
          variant="outline"
          size="md"
          className="w-full"
        >
          View Recommendations
        </Button>
      </div>
    </div>
  );
};
