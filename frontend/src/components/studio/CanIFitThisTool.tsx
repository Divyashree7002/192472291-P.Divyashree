import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Ruler, Box } from 'lucide-react';
import { Button } from '../ui/Button';

interface CanIFitThisToolProps {
  roomDimensions: { length: number; width: number; height: number };
  onClose: () => void;
}

export const CanIFitThisTool: React.FC<CanIFitThisToolProps> = ({
  roomDimensions,
  onClose,
}) => {
  const [width, setWidth] = useState<number>(2.0);
  const [depth, setDepth] = useState<number>(0.9);
  const [height, setHeight] = useState<number>(0.8);
  const [result, setResult] = useState<{
    status: 'green' | 'yellow' | 'red';
    message: string;
    clearanceCm: number;
  } | null>(null);

  const handleCheckFit = () => {
    const minDim = Math.min(roomDimensions.length, roomDimensions.width);
    const maxFootprint = width;

    const remainingSpaceM = minDim - maxFootprint;
    const clearanceCm = Math.round(remainingSpaceM * 100);

    if (width > minDim * 0.9 || depth > roomDimensions.width * 0.8) {
      setResult({
        status: 'red',
        message: '✕ Does not fit in this room without blocking doorway or wall boundaries.',
        clearanceCm: Math.max(0, clearanceCm),
      });
    } else if (clearanceCm < 75) {
      setResult({
        status: 'yellow',
        message: `⚠ Fits, but leaves only ${clearanceCm} cm walking clearance. (Recommended: 75–90 cm)`,
        clearanceCm,
      });
    } else {
      setResult({
        status: 'green',
        message: `✓ Fits comfortably with ${clearanceCm} cm of remaining walking clearance.`,
        clearanceCm,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-softBorder space-y-5">
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sage-50 text-sage-600 border border-sage-200">
              <Ruler className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-charcoal-900">Can I Fit This?</h3>
              <p className="text-xs text-charcoal-500">
                Check if custom furniture fits your {roomDimensions.length}m × {roomDimensions.width}m space.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal-700 block mb-1">
              Furniture Width (m)
            </label>
            <input
              type="number"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-sm font-semibold text-charcoal-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal-700 block mb-1">
              Furniture Depth (m)
            </label>
            <input
              type="number"
              step="0.1"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-sm font-semibold text-charcoal-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal-700 block mb-1">
              Furniture Height (m)
            </label>
            <input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-softBorder text-sm font-semibold text-charcoal-800"
            />
          </div>

          <Button
            onClick={handleCheckFit}
            variant="primary"
            className="w-full text-xs font-semibold"
            leftIcon={<Box className="w-4 h-4" />}
          >
            Check Fit & Clearance
          </Button>

          {result && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1 ${
                result.status === 'green'
                  ? 'bg-sage-50 text-sage-900 border-sage-300'
                  : result.status === 'yellow'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.status === 'green' && <CheckCircle2 className="w-5 h-5 text-sage-600" />}
                {result.status === 'yellow' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {result.status === 'red' && <XCircle className="w-5 h-5 text-red-600" />}
                <span>Fit Verification Result</span>
              </div>
              <p className="font-medium leading-relaxed">{result.message}</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-softBorder text-right">
          <Button onClick={onClose} variant="outline" size="sm" className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
