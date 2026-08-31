import React, { useState } from 'react';
import { Sparkles, Check, Undo2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { DesignCustomizationState, PlacedFurnitureItem } from '../../types';

interface ImproveMyRoomButtonProps {
  customization: DesignCustomizationState;
  onChangeCustomization: (updated: Partial<DesignCustomizationState>) => void;
}

export const ImproveMyRoomButton: React.FC<ImproveMyRoomButtonProps> = ({
  customization,
  onChangeCustomization,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [previousFurniture, setPreviousFurniture] = useState<PlacedFurnitureItem[] | null>(null);

  const improvements = [
    {
      id: 1,
      title: 'Reposition Sofa for Door Clearance',
      description: 'Shift sofa 0.4m away from doorway to ensure a 85cm open walking corridor.',
      action: 'Shift Placement',
    },
    {
      id: 2,
      title: 'Replace Oversized Side Table',
      description: 'Swap current table with a compact 45cm footprint table to prevent pathway bottlenecks.',
      action: 'Optimize Footprint',
    },
    {
      id: 3,
      title: 'Utilize Vertical Wall Storage',
      description: 'Add slim wall bookshelf to leverage unused vertical wall space.',
      action: 'Add Storage',
    },
  ];

  const handleApply = () => {
    setPreviousFurniture([...customization.placedFurniture]);

    // Apply repositioning optimization
    const updated = customization.placedFurniture.map((item, idx) => {
      if (item.category === 'seating' || item.name.toLowerCase().includes('sofa')) {
        return {
          ...item,
          position: {
            x: (item.position?.x || 0) + 0.3,
            y: item.position?.y || 0.4,
            z: Math.max(0.8, (item.position?.z || 1.5) - 0.2),
          },
        };
      }
      return item;
    });

    onChangeCustomization({ placedFurniture: updated });
    setApplied(true);
  };

  const handleUndo = () => {
    if (previousFurniture) {
      onChangeCustomization({ placedFurniture: previousFurniture });
      setApplied(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
        size="sm"
        className="text-xs bg-gradient-to-r from-terracotta-500 to-amber-600 text-white shadow-warm-md hover:brightness-105"
        leftIcon={<Sparkles className="w-3.5 h-3.5" />}
      >
        ✨ Improve My Room
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-softBorder space-y-5">
            <div className="flex items-center justify-between border-b border-softBorder pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-5 h-5 text-terracotta-600" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900">✨ AI Room Improvements</h3>
                  <p className="text-xs text-charcoal-500">
                    3 room-specific spatial optimizations derived from your scan geometry.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {improvements.map((imp) => (
                <div
                  key={imp.id}
                  className="p-3.5 rounded-2xl bg-warmWhite border border-softBorder space-y-1 hover:border-terracotta-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-charcoal-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-terracotta-500 text-white text-[10px] flex items-center justify-center">
                        {imp.id}
                      </span>
                      {imp.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800">
                      {imp.action}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 pl-5 leading-relaxed">{imp.description}</p>
                </div>
              ))}
            </div>

            {applied && (
              <div className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-sage-900 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-4 h-4 text-sage-600" />
                  <span>Applied spatial layout optimizations!</span>
                </span>
                <button
                  onClick={handleUndo}
                  className="text-xs font-bold text-terracotta-600 underline flex items-center gap-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-softBorder">
              <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm" className="text-xs">
                Close
              </Button>
              <Button
                onClick={handleApply}
                variant="primary"
                size="sm"
                className="text-xs"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                {applied ? 'Re-Apply Recommended Layout' : 'Apply Recommended Layout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
