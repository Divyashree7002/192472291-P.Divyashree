import React from 'react';
import { Sparkles, Check, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { DesignStyle } from '../../types';

export interface DesignVariation {
  id: string;
  name: string;
  style: DesignStyle;
  estimatedCost: number;
  description: string;
  wallColor: string;
  floorColor: string;
  accentColor: string;
  keyPieces: string[];
}

interface DesignAlternativesProps {
  onSelectDesign: (variation: DesignVariation) => void;
  onClose: () => void;
  currentStyle?: string;
  currentBudget?: number;
}

export const DESIGN_VARIATIONS_DATA: DesignVariation[] = [
  {
    id: 'var-a',
    name: 'Design A — Modern Elegance',
    style: 'modern',
    estimatedCost: 72000,
    description: 'Clean architectural lines, neutral walls, and contemporary bouclé seating.',
    wallColor: '#FAF8F5',
    floorColor: '#DEB887',
    accentColor: '#E07A5F',
    keyPieces: ['Nordic 3-Seater Sofa', 'White Oak Coffee Table', 'Arc Floor Lamp'],
  },
  {
    id: 'var-b',
    name: 'Design B — Scandinavian Sanctuary',
    style: 'scandinavian',
    estimatedCost: 65000,
    description: 'Warm light oak, airy linen, soft sage accents, and maximum natural light.',
    wallColor: '#B8C9BA',
    floorColor: '#A8A29E',
    accentColor: '#8D7B68',
    keyPieces: ['Scandinavian Slat Bed', 'Fluted Sideboard', 'Ceramic Table Lamp'],
  },
  {
    id: 'var-c',
    name: 'Design C — Luxury Contemporary',
    style: 'luxury',
    estimatedCost: 98000,
    description: 'Carrara marble finishes, rich walnut cabinetry, and deep velvet accents.',
    wallColor: '#4B5563',
    floorColor: '#ECEFF1',
    accentColor: '#1E293B',
    keyPieces: ['Modular Sectional Sofa', 'Carrara Prep Table', 'Brass Chandelier'],
  },
];

export const DesignAlternatives: React.FC<DesignAlternativesProps> = ({
  onSelectDesign,
  onClose,
  currentStyle = 'modern',
  currentBudget = 500000,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-softBorder shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-terracotta-600" />
              <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                AI Design Variations
              </h3>
            </div>
            <p className="text-xs text-charcoal-500 mt-1">
              Compare AI-generated proposals based on your scanned room structure.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Variation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DESIGN_VARIATIONS_DATA.map((varItem) => {
            const isCurrent = currentStyle.toLowerCase() === varItem.style.toLowerCase();
            return (
              <div
                key={varItem.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'bg-[#FAF7F2] border-terracotta-500 shadow-warm-md ring-2 ring-terracotta-400'
                    : 'bg-[#FCFBF9] hover:bg-white border-softBorder hover:border-terracotta-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={isCurrent ? 'terracotta' : 'sage'} size="sm">
                      {varItem.style.toUpperCase()}
                    </Badge>
                    <span className="font-mono font-bold text-sm text-charcoal-900">
                      {formatCurrency(varItem.estimatedCost)}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-charcoal-900 leading-tight">
                    {varItem.name}
                  </h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {varItem.description}
                  </p>

                  {/* Swatches */}
                  <div className="space-y-1.5 pt-2 border-t border-softBorder">
                    <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
                      Color Palette:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: varItem.wallColor }} title="Wall" />
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: varItem.floorColor }} title="Floor" />
                      <span className="w-5 h-5 rounded-md border border-softBorder shadow-xs" style={{ backgroundColor: varItem.accentColor }} title="Accent" />
                    </div>
                  </div>

                  {/* Key Pieces */}
                  <div className="space-y-1 pt-2 border-t border-softBorder">
                    <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
                      Key Furniture:
                    </span>
                    <ul className="text-xs text-charcoal-700 space-y-1 font-medium">
                      {varItem.keyPieces.map((kp, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-sage-600 shrink-0" />
                          <span className="truncate">{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    onSelectDesign(varItem);
                    onClose();
                  }}
                  variant={isCurrent ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full mt-2 font-semibold"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {isCurrent ? 'Active Design' : 'Apply Design'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
