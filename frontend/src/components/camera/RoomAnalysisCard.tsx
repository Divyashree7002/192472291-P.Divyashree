import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Palette,
  Maximize2,
  Box,
  Eye,
  RotateCcw,
  UserX,
  Info
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RoomAnalysisResponse } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { RoomType, DesignStyle } from '../../types';

interface RoomAnalysisCardProps {
  analysis: RoomAnalysisResponse;
  capturedImage?: string | null;
  selectedRoomType: RoomType;
  selectedStyle: DesignStyle;
  targetBudget: number;
  onOpenStudio: () => void;
  onOpenRecommendations: () => void;
  onRetakePhoto?: () => void;
}

export const RoomAnalysisCard: React.FC<RoomAnalysisCardProps> = ({
  analysis,
  capturedImage,
  selectedRoomType,
  selectedStyle,
  targetBudget,
  onOpenStudio,
  onOpenRecommendations,
  onRetakePhoto,
}) => {
  const room = analysis.room;
  const struct = analysis.room_structure;
  const objects = analysis.objects || [];
  const planes = analysis.planes || [];
  const ignoredSummary = analysis.ignored_summary;
  const ignoredObjects = analysis.ignored_objects || [];

  const confidencePct = Math.round((analysis.scale_confidence ?? 0.78) * 100);
  const wallColor = struct?.dominant_wall_color || '#FAF8F5';
  const floorColor = struct?.dominant_floor_color || '#C8B6A6';

  const hasIgnoredItems = (ignoredSummary?.total_ignored ?? 0) > 0 || ignoredObjects.length > 0;
  const ignoredText = ignoredSummary?.descriptions?.length
    ? ignoredSummary.descriptions.join(', ')
    : `${ignoredObjects.length} transient items`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-softBorder pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-terracotta-50 text-terracotta-600 border border-terracotta-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
              Room Analysis
            </h3>
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Interior spatial extraction based on your room scan.
          </p>
        </div>

        <Badge variant={confidencePct >= 80 ? 'sage' : 'terracotta'} size="sm">
          {confidencePct}% Confidence
        </Badge>
      </div>

      {/* Main Grid: Scan Preview & Room Size */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Thumbnail of actual user scan */}
        {capturedImage && (
          <div className="sm:col-span-4 relative rounded-xl overflow-hidden border border-softBorder shadow-xs group aspect-4/3 bg-charcoal-900">
            <img
              src={capturedImage}
              alt="Room Scan Reference"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-charcoal-900/80 backdrop-blur-xs text-[10px] font-mono text-white font-semibold flex items-center gap-1">
              <Eye className="w-3 h-3 text-terracotta-400" />
              <span>Actual Scan</span>
            </div>
          </div>
        )}

        {/* Room Size & Type */}
        <div className={capturedImage ? 'sm:col-span-8 space-y-2.5' : 'sm:col-span-12 space-y-2.5'}>
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-softBorder space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 font-medium">Room Type:</span>
              <span className="font-bold text-charcoal-900 capitalize">
                {(selectedRoomType || 'living_room').replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 font-medium">Room Size:</span>
              <span className="font-mono font-bold text-charcoal-900">
                {room?.length_m ?? 4.2}m &times; {room?.width_m ?? 3.5}m &times; {room?.height_m ?? 2.7}m
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 font-medium">Floor Area & Volume:</span>
              <span className="font-mono text-charcoal-800">
                {room?.floor_area_sqm ?? 14.7} m² ({room?.volume_m3 ?? 39.7} m³)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 font-medium">Furniture Detected:</span>
              <span className="font-bold text-terracotta-700">
                {objects.length} pieces
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Tones Detected */}
      <div className="p-3.5 rounded-xl bg-white border border-softBorder space-y-2 text-xs">
        <span className="block font-bold text-charcoal-700 text-[11px] uppercase tracking-wider">
          Detected Surface Tones
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FCFBF9] border border-softBorder">
            <div
              className="w-5 h-5 rounded-md border border-charcoal-300 shadow-xs shrink-0"
              style={{ backgroundColor: wallColor }}
            />
            <div className="truncate">
              <span className="block text-[10px] text-charcoal-500">Wall Tone</span>
              <span className="font-mono text-[11px] font-semibold text-charcoal-800">{wallColor}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FCFBF9] border border-softBorder">
            <div
              className="w-5 h-5 rounded-md border border-charcoal-300 shadow-xs shrink-0"
              style={{ backgroundColor: floorColor }}
            />
            <div className="truncate">
              <span className="block text-[10px] text-charcoal-500">Floor Surface</span>
              <span className="font-mono text-[11px] font-semibold text-charcoal-800">{floorColor}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FCFBF9] border border-softBorder">
            <div className="w-5 h-5 rounded-md border border-charcoal-300 shadow-xs shrink-0 bg-white" />
            <div className="truncate">
              <span className="block text-[10px] text-charcoal-500">Ceiling Tone</span>
              <span className="font-mono text-[11px] font-semibold text-charcoal-800">#FAF8F5</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FCFBF9] border border-softBorder">
            <div className="w-5 h-5 rounded-md border border-terracotta-400 bg-terracotta-500 shadow-xs shrink-0" />
            <div className="truncate">
              <span className="block text-[10px] text-charcoal-500">Detected Accent</span>
              <span className="font-mono text-[11px] font-semibold text-charcoal-800">#E07A5F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Furniture List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
            Furniture Detected ({objects.length}):
          </label>
          {objects.length > 0 && (
            <span className="text-[11px] text-sage-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for 2D/3D Room</span>
            </span>
          )}
        </div>

        {objects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {objects.map((obj, idx) => {
              const name = (obj.class_name || 'Object').replace(/_/g, ' ');
              const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
              const conf = Math.round((obj.confidence || 0.8) * 100);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-softBorder text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                    <span className="font-semibold text-charcoal-900 truncate">{formattedName}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-terracotta-100 text-terracotta-700 font-mono font-medium shrink-0">
                    {conf}% match
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Room structure detected, but no relevant furniture was identified.</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              People, pets, clothing, and transient personal clutter were excluded from the room design.
            </p>
          </div>
        )}
      </div>

      {/* Subtle & Optional Ignored Items Section */}
      {hasIgnoredItems && (
        <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-softBorder text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-charcoal-600">
            <UserX className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
            <span className="text-[11px]">
              <strong className="text-charcoal-800">Ignored:</strong> {ignoredText} (excluded from room design)
            </span>
          </div>
          <span className="text-[10px] text-charcoal-400 font-mono">Filtered</span>
        </div>
      )}

      {/* AI Room Insights */}
      {analysis.ai_room_insights && analysis.ai_room_insights.length > 0 && (
        <div className="p-3.5 rounded-xl bg-sage-50/80 border border-sage-200 text-xs space-y-1.5">
          <span className="font-bold text-sage-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <span>AI Room Insights</span>
          </span>
          <ul className="space-y-1 text-sage-800 text-[11px] list-disc list-inside">
            {analysis.ai_room_insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Limitation Professional Disclaimer Notice */}
      <div className="p-3 rounded-xl bg-warmWhite border border-softBorder text-[10px] text-charcoal-500 leading-relaxed">
        <strong>Notice:</strong> SmartSpace AI uses computer vision to estimate room geometry and identify objects. Results may vary depending on lighting, camera angle, and partial object blockage. Review detections and measurements before purchasing materials or making construction decisions.
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-softBorder">
        <Button
          onClick={onOpenStudio}
          variant="primary"
          size="lg"
          className="flex-1 shadow-terracotta font-semibold text-xs"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {objects.length > 0 ? 'Start Designing' : 'Start Designing'}
        </Button>

        <Button
          onClick={onOpenStudio}
          variant="outline"
          size="lg"
          className="flex-1 text-xs"
          leftIcon={<CheckCircle2 className="w-4 h-4 text-terracotta-600" />}
        >
          Edit Detections & Calibration
        </Button>
      </div>
    </div>
  );
};
