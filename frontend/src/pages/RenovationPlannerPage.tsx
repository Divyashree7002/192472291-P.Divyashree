import React, { useState } from 'react';
import { Hammer, Calculator, FileText, CheckCircle2, DollarSign, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useProjects } from '../context/ProjectContext';
import { formatCurrency } from '../utils/currency';

export const RenovationPlannerPage: React.FC = () => {
  const { activeProject, projects } = useProjects();
  const project = activeProject || projects[0];

  const len = project?.dimensions?.length || 4.2;
  const wid = project?.dimensions?.width || 3.5;
  const hgt = project?.dimensions?.height || 2.7;

  const floorAreaSqm = Math.round(len * wid * 100) / 100;
  const wallAreaSqm = Math.round((2 * (len + wid) * hgt - 4.0) * 100) / 100;
  const ceilingAreaSqm = floorAreaSqm;

  const paintLiters = Math.round((wallAreaSqm / 10.0) * 10) / 10;
  const flooringSqm = Math.round(floorAreaSqm * 1.10 * 100) / 100;
  const baseboardMeters = Math.round((2 * (len + wid) - 1.2) * 10) / 10;

  const [items, setItems] = useState([
    { id: 1, category: 'Wall Painting', description: 'Premium Interior Emulsion', quantity: `${paintLiters} Liters`, unitCost: 650, totalInr: Math.round(paintLiters * 650) },
    { id: 2, category: 'Flooring', description: 'Engineered Oak / Porcelain Tile', quantity: `${flooringSqm} sq.m`, unitCost: 1800, totalInr: Math.round(flooringSqm * 1800) },
    { id: 3, category: 'Ceiling Finish', description: 'False Ceiling / Warm White Coat', quantity: `${ceilingAreaSqm} sq.m`, unitCost: 450, totalInr: Math.round(ceilingAreaSqm * 450) },
    { id: 4, category: 'Lighting & Fixtures', description: 'Recessed LEDs & Ambient Lighting', quantity: '4 Fixtures', unitCost: 4500, totalInr: 18000 },
    { id: 5, category: 'Doors & Window Trims', description: 'Frame Refinement & Hardware', quantity: '1 Door, 1 Window', unitCost: 11000, totalInr: 22000 },
    { id: 6, category: 'Furniture Staging', description: 'Core Staged Furniture Pieces', quantity: '4 Items', unitCost: 35000, totalInr: 140000 },
    { id: 7, category: 'Storage & Cabinetry', description: 'Built-in Closet / Shelf Modules', quantity: '1 Module', unitCost: 45000, totalInr: 45000 },
  ]);

  const totalEstimatedCost = items.reduce((acc, i) => acc + i.totalInr, 0);
  const allocatedBudget = project?.budgetAllocated || 500000;
  const remainingBudget = allocatedBudget - totalEstimatedCost;

  const handleUpdateItemCost = (id: number, newCost: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, totalInr: newCost } : i)));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-softBorder pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
            <Hammer className="w-6 h-6 text-terracotta-600" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
              <span>Renovation Planner</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                ₹ INR Estimates
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Material quantities and estimated costs calculated directly from room scan dimensions ({len}m × {wid}m).
            </p>
          </div>
        </div>

        <Badge variant={remainingBudget >= 0 ? 'sage' : 'terracotta'} size="md">
          {remainingBudget >= 0 ? `Within Budget (${formatCurrency(remainingBudget, 'INR')})` : `Over Budget (${formatCurrency(Math.abs(remainingBudget), 'INR')})`}
        </Badge>
      </div>

      {/* Surface Quantity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Wall Paint Required</span>
          <p className="text-2xl font-mono font-bold text-charcoal-900">{paintLiters} Liters</p>
          <span className="text-[10px] text-charcoal-400">Calculated for {wallAreaSqm} sq.m wall area</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Flooring Required</span>
          <p className="text-2xl font-mono font-bold text-charcoal-900">{flooringSqm} sq.m</p>
          <span className="text-[10px] text-charcoal-400">Includes 10% waste allowance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Baseboards Length</span>
          <p className="text-2xl font-mono font-bold text-charcoal-900">{baseboardMeters} meters</p>
          <span className="text-[10px] text-charcoal-400">Room perimeter minus door swing</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-softBorder shadow-warm-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Estimated Total Cost</span>
          <p className="text-2xl font-mono font-bold text-terracotta-700">{formatCurrency(totalEstimatedCost, 'INR')}</p>
          <span className="text-[10px] text-charcoal-400">Allocated: {formatCurrency(allocatedBudget, 'INR')}</span>
        </div>
      </div>

      {/* Itemized Renovation Plan Table */}
      <div className="bg-white rounded-2xl border border-softBorder shadow-warm-md overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <h3 className="font-bold text-sm text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-terracotta-600" />
            <span>Itemized Renovation Quantity & Cost Breakdown</span>
          </h3>
          <span className="text-xs font-semibold text-charcoal-500">
            All prices in Indian Rupees (₹)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-softBorder bg-warmWhite text-charcoal-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Estimated Quantity</th>
                <th className="py-3 px-4 text-right">Estimated Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softBorder text-charcoal-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-warmWhite/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-charcoal-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-charcoal-600">{item.description}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      value={item.totalInr}
                      onChange={(e) => handleUpdateItemCost(item.id, Number(e.target.value))}
                      className="w-32 px-2 py-1 rounded-lg border border-softBorder text-right font-mono font-bold text-charcoal-900 bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-softBorder font-bold text-sm bg-warmWhite">
                <td colSpan={3} className="py-4 px-4 text-charcoal-900">Total Estimated Renovation Budget</td>
                <td className="py-4 px-4 text-right font-mono text-terracotta-700">{formatCurrency(totalEstimatedCost, 'INR')}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Estimated:</strong> Image-derived measurements provide planning estimates. Always confirm site dimensions before ordering construction materials.
          </span>
        </div>
      </div>
    </div>
  );
};
