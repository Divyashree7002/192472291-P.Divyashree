import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Box,
  Layers,
  Palette,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { RoomAnalysisResponse, DetectedObject } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { formatCurrency } from '../../utils/currency';

interface CVAnalysisResultsProps {
  analysis: RoomAnalysisResponse;
  confidenceThreshold: number;
  onConfidenceChange: (val: number) => void;
  showOverlay: boolean;
  onToggleOverlay: () => void;
  selectedObjectId: number | null;
  onSelectObject: (id: number | null) => void;
}

export const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({
  analysis,
  confidenceThreshold,
  onConfidenceChange,
  showOverlay,
  onToggleOverlay,
  selectedObjectId,
  onSelectObject,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'objects' | 'room' | 'quality'>('objects');

  const allObjects = analysis.objects || [];
  const filteredObjects = allObjects.filter((obj) => obj.confidence >= confidenceThreshold);

  const quality = analysis.image_quality;
  const room = analysis.room_structure;

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'seating':
        return 'border-terracotta-400 bg-terracotta-50 text-terracotta-800';
      case 'tables':
        return 'border-sage-400 bg-sage-50 text-sage-800';
      case 'beds':
        return 'border-sand-400 bg-sand-50 text-sand-800';
      case 'electronics':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'decor':
        return 'border-purple-300 bg-purple-50 text-purple-800';
      default:
        return 'border-charcoal-300 bg-charcoal-50 text-charcoal-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-softBorder pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-terracotta-600" />
            <h3 className="text-base font-bold text-charcoal-900">
              Computer Vision Scene Understanding
            </h3>
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real object detection, scene heuristics, and quality metrics processed in {analysis.inference_time_ms || 120}ms.
          </p>
        </div>
        <Badge variant="sage" size="md">
          {filteredObjects.length} Objects Detected
        </Badge>
      </div>

      {/* Confidence Filter & Overlay Toggle Controls */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-softBorder space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-sm">
            <Slider
              label={`Confidence Threshold: ${(confidenceThreshold * 100).toFixed(0)}%`}
              min={10}
              max={95}
              step={5}
              value={Math.round(confidenceThreshold * 100)}
              onChangeValue={(val) => onConfidenceChange(val / 100)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
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
          <span>Displaying objects with confidence &ge; {(confidenceThreshold * 100).toFixed(0)}%</span>
          <span className="font-mono">{filteredObjects.length} of {allObjects.length} visible</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-softBorder pb-1 text-xs">
        <button
          onClick={() => setActiveTab('objects')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeTab === 'objects'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          Furniture Objects ({filteredObjects.length})
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeTab === 'room'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          Room Planes & Palette
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            activeTab === 'quality'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          Image Diagnostics
        </button>
      </div>

      {/* Tab 1: Detected Objects Inventory */}
      {activeTab === 'objects' && (
        <div className="space-y-3">
          {filteredObjects.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-[#FCFBF9] border border-dashed border-softBorder-dark text-xs text-charcoal-500">
              No objects meet the {(confidenceThreshold * 100).toFixed(0)}% confidence threshold. Try lowering the threshold slider.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {filteredObjects.map((obj, idx) => {
                const isSelected = selectedObjectId === idx;
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
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-terracotta-600" />
                        <span className="text-xs font-bold text-charcoal-900 capitalize">
                          {obj.class_name.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getCategoryColor(obj.category)}`}>
                        {(obj.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-charcoal-600 pt-2 border-t border-softBorder">
                      <span>Bounds: {obj.bbox.width} &times; {obj.bbox.height} px</span>
                      <span>Center: ({obj.center.x}, {obj.center.y})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Room Scene Structure & Palette */}
      {activeTab === 'room' && room && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder text-center">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">Floor Plane</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${room.floor_detected ? 'text-sage-700' : 'text-charcoal-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{room.floor_detected ? 'Detected' : 'Uncertain'}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder text-center">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">Wall Planes</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${room.wall_detected ? 'text-sage-700' : 'text-charcoal-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{room.wall_detected ? 'Detected' : 'Uncertain'}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder text-center">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">Ceiling Plane</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${room.ceiling_detected ? 'text-sage-700' : 'text-charcoal-500'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{room.ceiling_detected ? 'Detected' : 'Uncertain'}</span>
              </span>
            </div>
          </div>

          {/* Dominant Palette Swatches */}
          <div className="p-4 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-900">
              <span className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-terracotta-600" />
                <span>Dominant Scene Palette (K-Means Extracted)</span>
              </span>
              <span className="text-[11px] font-normal text-charcoal-500">4 Swatches</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {room.dominant_colors.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white border border-softBorder">
                  <div
                    className="w-full h-8 rounded-md border border-black/10 shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] font-mono font-semibold text-charcoal-700">{color}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-1">
              <span className="text-charcoal-500 text-[11px]">Scene Archetype:</span>
              <div className="font-bold text-charcoal-900 capitalize">{room.scene_type.replace(/_/g, ' ')}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder space-y-1">
              <span className="text-charcoal-500 text-[11px]">Clutter Estimate:</span>
              <div className="font-bold text-charcoal-900 capitalize">{room.estimated_clutter_level} Complexity</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Image Quality Diagnostics */}
      {activeTab === 'quality' && quality && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Sharpness</span>
              <span className="text-sm font-bold text-charcoal-900 font-mono">{quality.sharpness}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Brightness</span>
              <span className="text-sm font-bold text-charcoal-900 font-mono">{quality.brightness} / 255</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Contrast</span>
              <span className="text-sm font-bold text-charcoal-900 font-mono">{quality.contrast}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FCFBF9] border border-softBorder">
              <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-0.5">Resolution</span>
              <span className="text-sm font-bold text-charcoal-900 font-mono">{quality.width} &times; {quality.height}</span>
            </div>
          </div>

          {quality.quality_issues.length > 0 ? (
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs text-sand-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-sand-700" />
                <span>Quality Advisory:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-sand-800 pl-1">
                {quality.quality_issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-600" />
              <span>Image quality is clear and suitable for boundary parsing.</span>
            </div>
          )}
        </div>
      )}

      {/* Monocular Scale Ambiguity Notice */}
      <div className="p-3.5 rounded-xl bg-[#FCFBF9] border border-softBorder text-xs text-charcoal-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-bold text-charcoal-900">Image-Space Coordinates:</p>
          <p>
            Bounding box and centroid positions are calibrated with real metric scale estimation to project accurate room boundaries and clearance zones.
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
          Open in 3D Studio
        </Button>
        <Button
          onClick={() => navigate('/recommendations')}
          variant="outline"
          size="md"
          className="w-full"
        >
          Personalized Layouts
        </Button>
      </div>
    </div>
  );
};
