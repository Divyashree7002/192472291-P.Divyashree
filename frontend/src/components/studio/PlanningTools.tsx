import React, { useState } from 'react';
import {
  Ruler,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Paintbrush,
  Zap,
  HardHat,
  Sliders,
  Sparkles,
  Layers,
  Box
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { DesignCustomizationState, PlacedFurnitureItem } from '../../types';

interface PlanningToolsProps {
  customization: DesignCustomizationState;
  roomDimensions: { length: number; width: number; height: number };
  onChangeCustomization: (updated: Partial<DesignCustomizationState>) => void;
}

export const PlanningTools: React.FC<PlanningToolsProps> = ({
  customization,
  roomDimensions,
  onChangeCustomization,
}) => {
  const [activeTab, setActiveTab] = useState<'measurements' | 'clearance' | 'renovation' | 'budget'>('measurements');

  const L = roomDimensions.length || 4.8;
  const W = roomDimensions.width || 3.6;
  const H = roomDimensions.height || 2.8;

  const floorArea = (L * W).toFixed(2);
  const wallArea = (2 * (L + W) * H).toFixed(2);

  // Paint Estimate: ~10 sqm per liter (2 coats)
  const paintLiters = (parseFloat(wallArea) / 5.0).toFixed(1);
  const flooringSqm = (parseFloat(floorArea) * 1.05).toFixed(1); // +5% wastage allowance

  const activeItems = customization.placedFurniture.filter((i) => i.isVisible !== false);
  const furnitureCost = activeItems.reduce((acc, i) => acc + (i.price || i.estimatedCost || 0), 0);

  const [flooringRate, setFlooringRate] = useState<number>(1800); // ₹1800 per sqm
  const [paintRate, setPaintRate] = useState<number>(450); // ₹450 per liter
  const [lightingCost, setLightingCost] = useState<number>(25000);
  const [decorCost, setDecorCost] = useState<number>(18000);

  const estimatedFlooringTotal = Math.round(parseFloat(flooringSqm) * flooringRate);
  const estimatedPaintTotal = Math.round(parseFloat(paintLiters) * paintRate);
  const grandTotal = furnitureCost + estimatedFlooringTotal + estimatedPaintTotal + lightingCost + decorCost;

  // Clearance Checks
  const clearanceWarnings: string[] = [];
  if (activeItems.length > 5 && parseFloat(floorArea) < 16) {
    clearanceWarnings.push('High furniture density: Consider removing secondary tables to preserve 75–90 cm walking aisles.');
  }

  // Check distances between items
  for (let i = 0; i < activeItems.length; i++) {
    for (let j = i + 1; j < activeItems.length; j++) {
      const p1 = activeItems[i].position;
      const p2 = activeItems[j].position;
      if (p1 && p2) {
        const dx = (p1.x || 0) - (p2.x || 0);
        const dz = (p1.z || 0) - (p2.z || 0);
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 0.65) {
          clearanceWarnings.push(`Tight clearance (${Math.round(dist * 100)} cm) between "${activeItems[i].name}" and "${activeItems[j].name}". Recommended walking clearance is 75–90 cm.`);
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-softBorder shadow-warm-md space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-softBorder pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200 flex items-center justify-center font-bold">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
              Architectural & Renovation Planning Tools
            </h3>
            <p className="text-xs text-charcoal-500">Estimates for contractors, interior designers & homeowners.</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#FAF7F2] p-1 rounded-2xl border border-softBorder text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'measurements'
                ? 'bg-white text-terracotta-700 shadow-warm-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            📐 Measurements
          </button>

          <button
            onClick={() => setActiveTab('clearance')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'clearance'
                ? 'bg-white text-terracotta-700 shadow-warm-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            🚶 Walkability & Fit
          </button>

          <button
            onClick={() => setActiveTab('renovation')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'renovation'
                ? 'bg-white text-terracotta-700 shadow-warm-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            🔨 Build & Renovate
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'budget'
                ? 'bg-white text-terracotta-700 shadow-warm-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            💰 Budget Schedule
          </button>
        </div>
      </div>

      {/* TAB 1: MEASUREMENTS */}
      {activeTab === 'measurements' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-1">
              <span className="text-[10px] font-bold uppercase text-charcoal-500">Room Width</span>
              <div className="text-xl font-bold font-mono text-charcoal-900">{L.toFixed(2)} m</div>
              <span className="text-[10px] text-charcoal-400">Primary Wall Axis</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-1">
              <span className="text-[10px] font-bold uppercase text-charcoal-500">Room Length</span>
              <div className="text-xl font-bold font-mono text-charcoal-900">{W.toFixed(2)} m</div>
              <span className="text-[10px] text-charcoal-400">Secondary Axis</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-1">
              <span className="text-[10px] font-bold uppercase text-charcoal-500">Floor Area</span>
              <div className="text-xl font-bold font-mono text-terracotta-600">{floorArea} m²</div>
              <span className="text-[10px] text-charcoal-400">{(parseFloat(floorArea) * 10.7639).toFixed(1)} sq ft</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-1">
              <span className="text-[10px] font-bold uppercase text-charcoal-500">Total Wall Surface</span>
              <div className="text-xl font-bold font-mono text-sage-700">{wallArea} m²</div>
              <span className="text-[10px] text-charcoal-400">Excludes doors & windows</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLEARANCE & FIT CHECK */}
      {activeTab === 'clearance' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-charcoal-900 flex items-center gap-1.5">
              <span>Walking Clearance Audit</span>
              <Badge variant={clearanceWarnings.length === 0 ? 'sage' : 'warning'} size="sm">
                {clearanceWarnings.length === 0 ? 'Optimal' : `${clearanceWarnings.length} Warnings`}
              </Badge>
            </h4>

            {clearanceWarnings.length === 0 ? (
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-sm">Clearance & Ergonomics Approved</span>
                  <p className="text-xs leading-relaxed text-sage-800">
                    All staged furniture pieces maintain greater than 75 cm walking clearance around main doorways and seating access corridors.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {clearanceWarnings.map((warn, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RENOVATION & QUANTITY ESTIMATES */}
      {activeTab === 'renovation' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-3">
              <div className="flex items-center gap-2 font-bold text-charcoal-900">
                <Paintbrush className="w-4 h-4 text-terracotta-600" />
                <span>Wall Paint Quantity Estimate</span>
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Wall Area:</span>
                  <span className="font-bold">{wallArea} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Coats Needed:</span>
                  <span className="font-bold">2 coats</span>
                </div>
                <div className="flex justify-between text-terracotta-700 font-bold border-t border-softBorder pt-1">
                  <span>Paint Required:</span>
                  <span>~{paintLiters} Liters</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-3">
              <div className="flex items-center gap-2 font-bold text-charcoal-900">
                <Layers className="w-4 h-4 text-sage-600" />
                <span>Flooring Quantity Estimate</span>
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Net Floor Area:</span>
                  <span className="font-bold">{floorArea} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Wastage Allowance:</span>
                  <span className="font-bold">+5%</span>
                </div>
                <div className="flex justify-between text-sage-700 font-bold border-t border-softBorder pt-1">
                  <span>Flooring Required:</span>
                  <span>~{flooringSqm} m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BUDGET SCHEDULE */}
      {activeTab === 'budget' && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-3">
            <h4 className="font-bold text-charcoal-900">Itemized Cost Schedule</h4>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between items-center py-1 border-b border-softBorder">
                <span>Staged Furniture ({activeItems.length} items):</span>
                <span className="font-bold">{formatCurrency(furnitureCost)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-softBorder">
                <span>Flooring Material ({flooringSqm} m² @ ₹{flooringRate}/m²):</span>
                <span className="font-bold">{formatCurrency(estimatedFlooringTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-softBorder">
                <span>Wall Paint ({paintLiters} L @ ₹{paintRate}/L):</span>
                <span className="font-bold">{formatCurrency(estimatedPaintTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-softBorder">
                <span>Architectural Lighting Fixtures:</span>
                <span className="font-bold">{formatCurrency(lightingCost)}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-base text-terracotta-700 font-bold border-t border-charcoal-300 pt-2">
                <span>Estimated Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
