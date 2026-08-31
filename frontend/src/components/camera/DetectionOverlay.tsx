import React from 'react';
import { DetectedObject } from '../../services/api';

interface DetectionOverlayProps {
  objects: DetectedObject[];
  originalWidth: number;
  originalHeight: number;
  confidenceThreshold: number;
  showOverlay: boolean;
  selectedObjectId: number | null;
  onSelectObject: (id: number | null) => void;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  objects,
  originalWidth,
  originalHeight,
  confidenceThreshold,
  showOverlay,
  selectedObjectId,
  onSelectObject,
}) => {
  if (!showOverlay || !objects || objects.length === 0 || originalWidth <= 0 || originalHeight <= 0) {
    return null;
  }

  const getBorderColor = (category?: string, isSelected?: boolean) => {
    if (isSelected) return 'border-amber-400 bg-amber-500/20 shadow-lg ring-2 ring-amber-300';
    switch (category) {
      case 'seating':
        return 'border-terracotta-500 bg-terracotta-500/10 hover:bg-terracotta-500/20';
      case 'tables':
        return 'border-sage-500 bg-sage-500/10 hover:bg-sage-500/20';
      case 'beds':
        return 'border-sand-500 bg-sand-500/10 hover:bg-sand-500/20';
      case 'electronics':
        return 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20';
      case 'decor':
        return 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20';
      default:
        return 'border-charcoal-700 bg-charcoal-500/10 hover:bg-charcoal-500/20';
    }
  };

  const getBadgeColor = (category?: string, isSelected?: boolean) => {
    if (isSelected) return 'bg-amber-500 text-white';
    switch (category) {
      case 'seating':
        return 'bg-terracotta-600 text-white';
      case 'tables':
        return 'bg-sage-700 text-white';
      case 'beds':
        return 'bg-sand-700 text-white';
      case 'electronics':
        return 'bg-blue-600 text-white';
      case 'decor':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-charcoal-800 text-white';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {objects.map((obj, idx) => {
        if (obj.confidence < confidenceThreshold) return null;

        const isSelected = selectedObjectId === idx;
        const leftPercent = (obj.bbox.x / originalWidth) * 100;
        const topPercent = (obj.bbox.y / originalHeight) * 100;
        const widthPercent = (obj.bbox.width / originalWidth) * 100;
        const heightPercent = (obj.bbox.height / originalHeight) * 100;

        return (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject(isSelected ? null : idx);
            }}
            style={{
              left: `${Math.max(0, Math.min(99, leftPercent))}%`,
              top: `${Math.max(0, Math.min(99, topPercent))}%`,
              width: `${Math.max(1, Math.min(100 - leftPercent, widthPercent))}%`,
              height: `${Math.max(1, Math.min(100 - topPercent, heightPercent))}%`,
            }}
            className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-150 pointer-events-auto ${getBorderColor(
              obj.category,
              isSelected
            )}`}
          >
            {/* Object Class & Confidence Tag */}
            <div
              className={`absolute -top-6 left-0 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-tight shadow-warm-sm flex items-center gap-1 select-none whitespace-nowrap ${getBadgeColor(
                obj.category,
                isSelected
              )}`}
            >
              <span className="capitalize">{obj.class_name.replace('_', ' ')}</span>
              <span>{(obj.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
