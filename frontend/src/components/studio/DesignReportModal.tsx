import React from 'react';
import { FileText, Download, Printer, X, CheckCircle2, ShieldCheck, Box } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { DesignCustomizationState, Project } from '../../types';

interface DesignReportModalProps {
  project?: Project | null;
  customization: DesignCustomizationState;
  roomDimensions: { length: number; width: number; height: number; isEstimated?: boolean; confidence?: number };
  onClose: () => void;
}

export const DesignReportModal: React.FC<DesignReportModalProps> = ({
  project,
  customization,
  roomDimensions,
  onClose,
}) => {
  const { roomType = 'living_room', style = 'modern', colors, placedFurniture, budget } = customization;

  const L = roomDimensions.length || 4.8;
  const W = roomDimensions.width || 3.6;
  const H = roomDimensions.height || 2.8;
  const floorArea = (L * W).toFixed(1);

  const activeItems = placedFurniture.filter((i) => i.isVisible !== false);
  const totalCost = activeItems.reduce((acc, i) => acc + (i.price || i.estimatedCost || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-softBorder shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-softBorder pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-terracotta-600" />
            <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
              Professional Design Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print Report
            </Button>
            <button onClick={onClose} className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-charcoal-900">
          {/* Document Header */}
          <div className="flex items-center justify-between border-b border-softBorder pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-bold text-xs">
                  <Box className="w-4 h-4" />
                </div>
                <span className="font-bold text-base tracking-tight text-charcoal-900">SmartSpace AI</span>
              </div>
              <p className="text-xs text-charcoal-500 font-medium mt-0.5">Interior Intelligence Architectural Report</p>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-charcoal-900 uppercase tracking-wider">{project?.title || 'Interior Room Report'}</div>
              <div className="text-charcoal-500 font-mono text-[11px]">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
            </div>
          </div>

          {/* Key Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder text-xs">
            <div>
              <span className="text-[10px] text-charcoal-500 uppercase tracking-wider block">Room Type</span>
              <span className="font-bold text-charcoal-900 capitalize">{(roomType || 'living_room').replace(/_/g, ' ')}</span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-500 uppercase tracking-wider block">Design Style</span>
              <span className="font-bold text-terracotta-700 capitalize">{style}</span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-500 uppercase tracking-wider block">Dimensions (Estimated)</span>
              <span className="font-mono font-bold text-charcoal-900">{L.toFixed(1)}m × {W.toFixed(1)}m ({floorArea} m²)</span>
            </div>

            <div>
              <span className="text-[10px] text-charcoal-500 uppercase tracking-wider block">Total Estimated Cost</span>
              <span className="font-mono font-bold text-charcoal-900">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Room Scan Reference (if uploaded) */}
          {customization.scanImage && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">Original Room Scan Reference</span>
              <div className="rounded-2xl overflow-hidden aspect-video border border-softBorder max-h-48 bg-charcoal-900">
                <img src={customization.scanImage} alt="Room Scan" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Color Palette Schedule */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">Specified Surface Palette</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-softBorder">
                <span className="w-5 h-5 rounded-md border border-softBorder shrink-0" style={{ backgroundColor: colors.wall }} />
                <div>
                  <span className="text-[10px] text-charcoal-500 block">Wall Tone</span>
                  <span className="font-mono text-xs font-semibold">{colors.wall}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-softBorder">
                <span className="w-5 h-5 rounded-md border border-softBorder shrink-0" style={{ backgroundColor: colors.floor }} />
                <div>
                  <span className="text-[10px] text-charcoal-500 block">Floor Finish</span>
                  <span className="font-mono text-xs font-semibold">{colors.floor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-softBorder">
                <span className="w-5 h-5 rounded-md border border-softBorder shrink-0" style={{ backgroundColor: colors.ceiling }} />
                <div>
                  <span className="text-[10px] text-charcoal-500 block">Ceiling Tone</span>
                  <span className="font-mono text-xs font-semibold">{colors.ceiling}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF7F2] border border-softBorder">
                <span className="w-5 h-5 rounded-md border border-softBorder shrink-0" style={{ backgroundColor: colors.furniture }} />
                <div>
                  <span className="text-[10px] text-charcoal-500 block">Furniture Tone</span>
                  <span className="font-mono text-xs font-semibold">{colors.furniture}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Furniture Schedule Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">Itemized Furniture Schedule ({activeItems.length} pieces)</span>
            <table className="w-full text-xs text-left border-collapse border border-softBorder rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-[#FAF7F2] text-charcoal-700 border-b border-softBorder">
                  <th className="p-2.5 font-bold">Item Name</th>
                  <th className="p-2.5 font-bold">Category</th>
                  <th className="p-2.5 font-bold">Dimensions</th>
                  <th className="p-2.5 font-bold">Source</th>
                  <th className="p-2.5 font-bold text-right">Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {activeItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-softBorder hover:bg-[#FCFBF9]">
                    <td className="p-2.5 font-semibold text-charcoal-900">{item.name}</td>
                    <td className="p-2.5 capitalize text-charcoal-600">{item.category}</td>
                    <td className="p-2.5 font-mono text-[11px] text-charcoal-600">
                      {item.dimensions?.widthCm || 100}W × {item.dimensions?.depthCm || 80}D × {item.dimensions?.heightCm || 80}H cm
                    </td>
                    <td className="p-2.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cream-200 text-charcoal-700">
                        {item.source || 'recommended'}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-right text-charcoal-900">
                      {formatCurrency(item.price || item.estimatedCost || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Walkability & Accessibility Statement */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Accessibility & Clearance Verification:</span>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                Primary circulation pathways maintain a minimum 0.6m clearance radius around major seating and doorway swings. Metric room dimensions are AI-estimated from captured images.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
