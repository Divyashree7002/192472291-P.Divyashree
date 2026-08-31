import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Save,
  Layers,
  IndianRupee,
  Move,
  Maximize2,
  Compass,
  Armchair,
  Check,
  ChevronDown,
  ChevronUp,
  Box,
  Eye,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Minus,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Bed,
  Utensils,
  BookOpen,
  Briefcase,
  ChefHat,
  Sun,
  Ruler,
  Info
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  DesignStyle,
  RoomType,
  RoomColorPalette,
  PlacedFurnitureItem,
  DesignCustomizationState,
  FurnitureItem
} from '../../types';
import { formatCurrency } from '../../utils/currency';
import { SAMPLE_FURNITURE, FurnitureCatalog } from './FurnitureCatalog';
import {
  STYLE_PRESETS,
  ROOM_TYPE_METADATA,
  getArchetypeFurniture,
  applyStylePresetToState
} from '../../utils/roomArchetypes';

export const WALL_COLOR_PRESETS = [
  { name: 'Warm White', hex: '#FAF8F5' },
  { name: 'Beige Ivory', hex: '#F4EFEA' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Sage Green', hex: '#B8C9BA' },
  { name: 'Light Sky', hex: '#D0E1FD' },
  { name: 'Terracotta', hex: '#DDA896' },
  { name: 'Neutral Slate', hex: '#E2E8F0' },
  { name: 'Charcoal Grey', hex: '#4B5563' },
];

export const FLOOR_MATERIAL_PRESETS = [
  { id: 'light_oak', name: 'Light Oak', hex: '#DEB887', desc: 'Natural blonde ash planks' },
  { id: 'natural_walnut', name: 'Walnut', hex: '#5D4037', desc: 'Warm smoked American walnut' },
  { id: 'carrara_marble', name: 'Carrara Marble', hex: '#ECEFF1', desc: 'Polished Italian veined stone' },
  { id: 'polished_concrete', name: 'Raw Concrete', hex: '#9E9E9E', desc: 'Honed urban industrial slate' },
  { id: 'gray_hardwood', name: 'Gray Hardwood', hex: '#CBD5E1', desc: 'Contemporary muted timber' },
  { id: 'mahogany', name: 'Rich Mahogany', hex: '#6F4E37', desc: 'Timeless deep traditional grain' },
  { id: 'herringbone_oak', name: 'Herringbone', hex: '#A8A29E', desc: 'Artisan chevron wood pattern' },
  { id: 'terracotta_tile', name: 'Terracotta Tile', hex: '#A0522D', desc: 'Handcrafted Mediterranean clay' },
];

export const CEILING_PRESETS = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Warm Alabaster', hex: '#FAF8F5' },
  { name: 'Soft Cream', hex: '#FFFDD0' },
  { name: 'Architectural Slate', hex: '#1F2937' },
];

export const FURNITURE_COLOR_PRESETS = [
  { name: 'Nordic Bouclé', hex: '#EAE5D9' },
  { name: 'Deep Slate Navy', hex: '#1E293B' },
  { name: 'Forest Emerald', hex: '#2D5A27' },
  { name: 'Terracotta Rust', hex: '#C86D51' },
  { name: 'Warm Mustard', hex: '#DDA15E' },
  { name: 'Natural Ash', hex: '#D8C3A5' },
  { name: 'Dark Walnut', hex: '#4A3525' },
  { name: 'Matte Charcoal', hex: '#1F2421' },
];

interface RoomDesignPanelProps {
  customization: DesignCustomizationState;
  onChangeCustomization: (updated: Partial<DesignCustomizationState>) => void;
  roomDimensions: { length: number; width: number; height: number; isEstimated?: boolean; confidence?: number };
  onUpdateDimensions?: (dimensions: { length: number; width: number; height: number }) => void;
  onGenerateDesignPlan: () => void;
  isGeneratingPlan?: boolean;
  onResetDesign: () => void;
  onSaveDesign: () => void;
  isSaving?: boolean;
  detectedObjectsCount?: number;
}

import { FullColorPickerModal } from './FullColorPickerModal';
import { CanIFitThisTool } from './CanIFitThisTool';
import { ImproveMyRoomButton } from './ImproveMyRoomButton';

export const RoomDesignPanel: React.FC<RoomDesignPanelProps> = ({
  customization,
  onChangeCustomization,
  roomDimensions,
  onUpdateDimensions,
  onGenerateDesignPlan,
  isGeneratingPlan = false,
  onResetDesign,
  onSaveDesign,
  isSaving = false,
  detectedObjectsCount = 0,
}) => {
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [showFullColorPickerModal, setShowFullColorPickerModal] = useState(false);
  const [showCanIFitThisModal, setShowCanIFitThisModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'style_room' | 'surfaces' | 'furniture' | 'summary'>('style_room');

  const { style, colors, floorMaterial = 'light_oak', placedFurniture, selectedItemId, budget, roomType = 'living_room' } = customization;

  const L = Math.max(2.0, roomDimensions.length || 4.8);
  const W = Math.max(2.0, roomDimensions.width || 3.6);
  const H = Math.max(2.0, roomDimensions.height || 2.8);

  const totalFurnitureCost = placedFurniture
    .filter((item) => item.isVisible !== false)
    .reduce((acc, item) => acc + (item.price || item.estimatedCost || 0), 0);

  const remainingBudget = budget - totalFurnitureCost;
  const isOverBudget = remainingBudget < 0;
  const selectedFurniture = placedFurniture.find((item) => item.id === selectedItemId);

  // 1. Surface Color Handlers (Immediate Reactivity)
  const handleColorChange = (key: keyof RoomColorPalette, value: string) => {
    onChangeCustomization({
      colors: {
        ...colors,
        [key]: value,
      },
    });
  };

  // 2. Full Style Switcher (Immediate Visual Transformation)
  const handleSelectStyle = (newStyle: DesignStyle) => {
    const updated = applyStylePresetToState(newStyle, customization);
    onChangeCustomization(updated);
  };

  // 3. Room Type Switcher (Immediate Archetype & Suggested Furniture Transformation)
  const handleSelectRoomType = (newType: RoomType) => {
    const updatedFurniture = getArchetypeFurniture(newType, roomDimensions, style);
    onChangeCustomization({
      roomType: newType,
      placedFurniture: updatedFurniture,
      selectedItemId: null,
    });
  };

  // 4. Floor Material Switcher
  const handleSelectFloorMaterial = (mat: typeof FLOOR_MATERIAL_PRESETS[0]) => {
    onChangeCustomization({
      floorMaterial: mat.id,
      colors: {
        ...colors,
        floor: mat.hex,
      },
    });
  };

  // 5. Dimension Sliders
  const handleDimensionChange = (field: 'length' | 'width' | 'height', val: number) => {
    const updated = {
      length: field === 'length' ? val : L,
      width: field === 'width' ? val : W,
      height: field === 'height' ? val : H,
    };
    if (onUpdateDimensions) {
      onUpdateDimensions(updated);
    }
  };

  // 6. Add Item to Room with Sensible Collision-Free Boundary Coordinates
  const handleAddFurnitureToRoom = (catalogItem: FurnitureItem) => {
    const itemScale = 1.0;
    const itemW = ((catalogItem.dimensions?.widthCm || 100) / 100) * itemScale;
    const itemH = ((catalogItem.dimensions?.heightCm || 80) / 100) * itemScale;
    const itemD = ((catalogItem.dimensions?.depthCm || 80) / 100) * itemScale;

    const existingCount = placedFurniture.length;
    let targetX = 0;
    let targetZ = L * 0.45;

    if (catalogItem.category === 'seating' || catalogItem.name.toLowerCase().includes('sofa')) {
      targetX = 0;
      targetZ = Math.max(itemD / 2 + 0.5, Math.min(L - itemD / 2 - 0.5, L * 0.45));
    } else if (catalogItem.category === 'tables' || catalogItem.name.toLowerCase().includes('coffee')) {
      targetX = 0;
      targetZ = Math.max(itemD / 2 + 0.5, Math.min(L - itemD / 2 - 0.5, L * 0.45 + 1.1));
    } else if (catalogItem.category === 'storage' || catalogItem.name.toLowerCase().includes('tv')) {
      targetX = 0;
      targetZ = Math.max(itemD / 2 + 0.4, 0.45);
    } else if (catalogItem.category === 'beds') {
      targetX = 0;
      targetZ = Math.max(itemD / 2 + 0.4, L * 0.5);
    } else {
      targetX = (existingCount % 2 === 0 ? -1 : 1) * Math.min(W * 0.25, (W / 2 - itemW / 2 - 0.4));
      targetZ = Math.max(itemD / 2 + 0.5, Math.min(L - itemD / 2 - 0.5, 1.2 + (existingCount % 3) * 0.8));
    }

    const clampedX = Math.max(-W / 2 + itemW / 2 + 0.2, Math.min(W / 2 - itemW / 2 - 0.2, targetX));
    const clampedZ = Math.max(itemD / 2 + 0.3, Math.min(L - itemD / 2 - 0.3, targetZ));

    const newItem: PlacedFurnitureItem = {
      ...catalogItem,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isCustomAdded: true,
      source: 'custom',
      isVisible: true,
      rotationY: 0,
      scale: 1.0,
      customColor: colors.furniture,
      position: {
        x: Number(clampedX.toFixed(2)),
        y: Number((itemH / 2).toFixed(2)),
        z: Number(clampedZ.toFixed(2)),
      },
    };

    onChangeCustomization({
      placedFurniture: [...placedFurniture, newItem],
      selectedItemId: newItem.id,
    });
  };

  const handleRemoveFurniture = (id: string) => {
    const updated = placedFurniture.filter((item) => item.id !== id);
    onChangeCustomization({
      placedFurniture: updated,
      selectedItemId: selectedItemId === id ? null : selectedItemId,
    });
  };

  const handleToggleVisibility = (id: string) => {
    const updated = placedFurniture.map((item) =>
      item.id === id ? { ...item, isVisible: item.isVisible === false ? true : false } : item
    );
    onChangeCustomization({ placedFurniture: updated });
  };

  // Nudge / Slider Furniture Transform Update
  const handleUpdateFurnitureTransform = (
    id: string,
    updates: { x?: number; y?: number; z?: number; rotationY?: number; scale?: number; customColor?: string }
  ) => {
    const updated = placedFurniture.map((item) => {
      if (item.id !== id) return item;
      const currentScale = item.scale || 1.0;
      const itemW = ((item.dimensions?.widthCm || 100) / 100) * currentScale;
      const itemD = ((item.dimensions?.depthCm || 80) / 100) * currentScale;

      let newX = updates.x !== undefined ? updates.x : item.position?.x || 0;
      let newZ = updates.z !== undefined ? updates.z : item.position?.z || 1.5;

      // Clamp inside room
      newX = Math.max(-W / 2 + itemW / 2 + 0.1, Math.min(W / 2 - itemW / 2 - 0.1, newX));
      newZ = Math.max(itemD / 2 + 0.1, Math.min(L - itemD / 2 - 0.1, newZ));

      return {
        ...item,
        scale: updates.scale !== undefined ? updates.scale : item.scale,
        rotationY: updates.rotationY !== undefined ? updates.rotationY : item.rotationY,
        customColor: updates.customColor !== undefined ? updates.customColor : item.customColor,
        position: {
          x: Number(newX.toFixed(2)),
          y: item.position?.y ?? 0.4,
          z: Number(newZ.toFixed(2)),
        },
      };
    });

    onChangeCustomization({ placedFurniture: updated });
  };

  const roomTypesList: { id: RoomType; label: string; icon: any }[] = [
    { id: 'living_room', label: 'Living Room', icon: Armchair },
    { id: 'bedroom', label: 'Bedroom', icon: Bed },
    { id: 'dining_room', label: 'Dining Room', icon: Utensils },
    { id: 'study_room', label: 'Study Room', icon: BookOpen },
    { id: 'office', label: 'Home Office', icon: Briefcase },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'kids_room', label: 'Kids Room', icon: Sparkles },
    { id: 'studio', label: 'Studio Apartment', icon: LayoutGrid },
    { id: 'balcony', label: 'Balcony', icon: Sun },
  ];

  const styleKeys = Object.keys(STYLE_PRESETS) as DesignStyle[];

  return (
    <div className="bg-white rounded-3xl p-6 border border-softBorder shadow-warm-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-softBorder pb-4">
        <div>
          <h3 className="text-base font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-4 h-4 text-terracotta-600" />
            <span>Interactive Customization Suite</span>
          </h3>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real-time surface styling, room archetype switching, and 2D/3D furniture staging.
          </p>
        </div>
        <Badge variant="sage" size="sm">
          Live Reactivity
        </Badge>
      </div>

      {/* Main Studio Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-[#FAF7F2] border border-softBorder text-xs font-semibold">
        <button
          onClick={() => setActiveTab('style_room')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'style_room'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="truncate">Type & Style</span>
        </button>
        <button
          onClick={() => setActiveTab('surfaces')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'surfaces'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="truncate">Surfaces</span>
        </button>
        <button
          onClick={() => setActiveTab('furniture')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'furniture'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          <Armchair className="w-3.5 h-3.5" />
          <span className="truncate">Furniture ({placedFurniture.filter((i) => i.isVisible !== false).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
            activeTab === 'summary'
              ? 'bg-terracotta-500 text-white shadow-terracotta'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
          }`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span className="truncate">Summary</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: ROOM TYPE & STYLE & DIMENSIONS                      */}
      {/* ========================================================== */}
      {activeTab === 'style_room' && (
        <div className="space-y-6 animate-fade-in">
          {/* 1. ROOM TYPE SELECTOR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                1. Room Archetype:
              </label>
              <Badge variant="terracotta" size="sm">
                {(roomType || 'living_room').replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roomTypesList.map((rt) => {
                const isSelected = (roomType || 'living_room') === rt.id;
                const IconComponent = rt.icon;
                return (
                  <button
                    key={rt.id}
                    onClick={() => handleSelectRoomType(rt.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-terracotta-500 shadow-warm-sm ring-1 ring-terracotta-400'
                        : 'bg-[#FCFBF9] hover:bg-white border-softBorder hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`p-1.5 rounded-xl ${isSelected ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-charcoal-700'}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-600" />}
                    </div>
                    <span className="font-bold text-xs text-charcoal-900 leading-tight">{rt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. DESIGN STYLE SELECTOR (INSTANT WHOLE-ROOM REPLACEMENT) */}
          <div className="space-y-2.5 pt-2 border-t border-softBorder">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                2. Design Style (Updates All Surfaces):
              </label>
              <Badge variant="sage" size="sm">
                Selected: {style.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {styleKeys.map((stKey) => {
                const st = STYLE_PRESETS[stKey];
                const isSelected = style.toLowerCase() === st.id.toLowerCase();
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStyle(st.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-terracotta-500 shadow-warm-sm ring-1 ring-terracotta-400'
                        : 'bg-[#FCFBF9] hover:bg-white border-softBorder hover:border-cream-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-charcoal-900">{st.label}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cream-200 text-charcoal-600 font-medium">
                          {st.badge}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-terracotta-600" />}
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-1 leading-snug">{st.description}</p>
                    <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-softBorder">
                      <span className="text-[10px] text-charcoal-400">Palette:</span>
                      <span className="w-3 h-3 rounded-full border border-softBorder" style={{ backgroundColor: st.palette.wall }} />
                      <span className="w-3 h-3 rounded-full border border-softBorder" style={{ backgroundColor: st.palette.floor }} />
                      <span className="w-3 h-3 rounded-full border border-softBorder" style={{ backgroundColor: st.palette.furniture }} />
                      <span className="w-3 h-3 rounded-full border border-softBorder" style={{ backgroundColor: st.palette.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. EDITABLE ROOM DIMENSIONS */}
          <div className="space-y-3 pt-2 border-t border-softBorder">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-terracotta-600" />
                <span>3. Room Dimensions (Meters):</span>
              </label>
              {roomDimensions.isEstimated && (
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                  Estimated {roomDimensions.confidence ?? 78}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-charcoal-600">Length:</span>
                  <span className="font-mono font-bold text-charcoal-900">{L.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min={2.5}
                  max={8.0}
                  step={0.1}
                  value={L}
                  onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-terracotta-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-charcoal-600">Width:</span>
                  <span className="font-mono font-bold text-charcoal-900">{W.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={6.5}
                  step={0.1}
                  value={W}
                  onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-terracotta-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-charcoal-600">Height:</span>
                  <span className="font-mono font-bold text-charcoal-900">{H.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min={2.2}
                  max={4.0}
                  step={0.1}
                  value={H}
                  onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-terracotta-500"
                />
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-charcoal-500 pt-1">
              <span>Floor Area: <strong className="text-charcoal-900">{(L * W).toFixed(1)} m²</strong></span>
              <span>Room Volume: <strong className="text-charcoal-900">{(L * W * H).toFixed(1)} m³</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: SURFACES (WALL, FLOOR, CEILING, ACCENT)             */}
      {/* ========================================================== */}
      {activeTab === 'surfaces' && (
        <div className="space-y-6 animate-fade-in">
          {/* WALL COLOR */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Wall Color Tone:
              </label>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border border-softBorder shadow-xs" style={{ backgroundColor: colors.wall }} />
                <span className="font-mono text-xs font-semibold text-charcoal-700">{colors.wall}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {WALL_COLOR_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleColorChange('wall', c.hex)}
                  title={c.name}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                    colors.wall.toLowerCase() === c.hex.toLowerCase()
                      ? 'ring-2 ring-terracotta-500 scale-105 shadow-warm-xs'
                      : 'border-softBorder hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {colors.wall.toLowerCase() === c.hex.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 text-charcoal-900" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-[11px] text-charcoal-500">Custom Wall Hex:</label>
              <input
                type="color"
                value={colors.wall}
                onChange={(e) => handleColorChange('wall', e.target.value)}
                className="w-6 h-6 rounded-md border border-softBorder cursor-pointer"
              />
              <input
                type="text"
                value={colors.wall}
                onChange={(e) => handleColorChange('wall', e.target.value)}
                className="font-mono text-xs px-2 py-0.5 rounded-lg border border-softBorder w-24 bg-white"
              />
            </div>
          </div>

          {/* FLOOR MATERIAL & COLOR */}
          <div className="space-y-2.5 pt-2 border-t border-softBorder">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Floor Material & Finish:
              </label>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border border-softBorder shadow-xs" style={{ backgroundColor: colors.floor }} />
                <span className="font-mono text-xs font-semibold text-charcoal-700">{colors.floor}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FLOOR_MATERIAL_PRESETS.map((f) => {
                const isSelected = floorMaterial === f.id || colors.floor.toLowerCase() === f.hex.toLowerCase();
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFloorMaterial(f)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-terracotta-500 shadow-warm-xs ring-1 ring-terracotta-400'
                        : 'bg-[#FCFBF9] hover:bg-white border-softBorder'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-charcoal-300 shadow-xs shrink-0" style={{ backgroundColor: f.hex }} />
                      <span className="font-bold text-xs text-charcoal-900 truncate">{f.name}</span>
                    </div>
                    <p className="text-[10px] text-charcoal-500 mt-1 leading-snug truncate">{f.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="text-[11px] text-charcoal-500">Custom Floor Hex:</label>
              <input
                type="color"
                value={colors.floor}
                onChange={(e) => handleColorChange('floor', e.target.value)}
                className="w-6 h-6 rounded-md border border-softBorder cursor-pointer"
              />
              <input
                type="text"
                value={colors.floor}
                onChange={(e) => handleColorChange('floor', e.target.value)}
                className="font-mono text-xs px-2 py-0.5 rounded-lg border border-softBorder w-24 bg-white"
              />
            </div>
          </div>

          {/* CEILING COLOR */}
          <div className="space-y-2.5 pt-2 border-t border-softBorder">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Ceiling Tone:
              </label>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border border-softBorder shadow-xs" style={{ backgroundColor: colors.ceiling }} />
                <span className="font-mono text-xs font-semibold text-charcoal-700">{colors.ceiling}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {CEILING_PRESETS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleColorChange('ceiling', c.hex)}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                    colors.ceiling.toLowerCase() === c.hex.toLowerCase()
                      ? 'ring-2 ring-terracotta-500 scale-105 shadow-warm-xs'
                      : 'border-softBorder hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {colors.ceiling.toLowerCase() === c.hex.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 text-charcoal-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* FURNITURE PALETTE */}
          <div className="space-y-2.5 pt-2 border-t border-softBorder">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                Default Furniture Tone:
              </label>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border border-softBorder shadow-xs" style={{ backgroundColor: colors.furniture }} />
                <span className="font-mono text-xs font-semibold text-charcoal-700">{colors.furniture}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {FURNITURE_COLOR_PRESETS.map((f) => (
                <button
                  key={f.hex}
                  onClick={() => handleColorChange('furniture', f.hex)}
                  title={f.name}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all ${
                    colors.furniture.toLowerCase() === f.hex.toLowerCase()
                      ? 'ring-2 ring-terracotta-500 scale-105 shadow-warm-xs'
                      : 'border-softBorder hover:scale-105'
                  }`}
                  style={{ backgroundColor: f.hex }}
                >
                  {colors.furniture.toLowerCase() === f.hex.toLowerCase() && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: FURNITURE STAGING & POSITION CONTROLS               */}
      {/* ========================================================== */}
      {activeTab === 'furniture' && (
        <div className="space-y-6 animate-fade-in">
          {/* BROWSE CATALOG BUTTON */}
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Staged Furniture Pieces:
            </label>
            <Button
              onClick={() => setShowCatalogModal(true)}
              variant="primary"
              size="sm"
              className="shadow-terracotta font-semibold"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Browse Catalog
            </Button>
          </div>

          {/* LIST OF PLACED FURNITURE */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {placedFurniture.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-dashed border-charcoal-300 text-center space-y-2">
                <Box className="w-6 h-6 text-charcoal-400 mx-auto" />
                <p className="text-xs text-charcoal-600 font-medium">No furniture staged yet.</p>
                <Button onClick={() => setShowCatalogModal(true)} variant="outline" size="sm">
                  Add From Catalog
                </Button>
              </div>
            ) : (
              placedFurniture.map((item) => {
                const isSelected = selectedItemId === item.id;
                const isDetected = item.source === 'detected';
                return (
                  <div
                    key={item.id}
                    onClick={() => onChangeCustomization({ selectedItemId: isSelected ? null : item.id })}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-terracotta-500 shadow-warm-xs ring-1 ring-terracotta-400'
                        : 'bg-[#FCFBF9] hover:bg-white border-softBorder'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-softBorder shadow-xs shrink-0"
                        style={{ backgroundColor: item.customColor || colors.furniture }}
                      />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-charcoal-900 truncate">{item.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            isDetected ? 'bg-amber-100 text-amber-800' : item.source === 'custom' ? 'bg-purple-100 text-purple-800' : 'bg-sage-100 text-sage-800'
                          }`}>
                            {isDetected ? 'Detected from scan' : item.source === 'custom' ? 'Added by you' : 'Recommended'}
                          </span>
                        </div>
                        <span className="text-[10px] text-charcoal-500 font-mono">
                          X: {item.position?.x?.toFixed(1) ?? '0.0'}m &bull; Z: {item.position?.z?.toFixed(1) ?? '1.5'}m &bull; {item.rotationY ?? 0}&deg; &bull; {formatCurrency(item.price || item.estimatedCost || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleRemoveFurniture(item.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Remove Piece"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SELECTED FURNITURE TRANSFORM INSPECTOR */}
          {selectedFurniture && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-terracotta-300 space-y-4 animate-fade-in shadow-warm-xs">
              <div className="flex items-center justify-between border-b border-softBorder pb-2">
                <div className="flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-terracotta-600" />
                  <span className="font-bold text-xs text-charcoal-900 truncate max-w-[200px]">
                    Adjust: {selectedFurniture.name}
                  </span>
                </div>
                <Badge variant="terracotta" size="sm">
                  Selected
                </Badge>
              </div>

              {/* Nudge Directional Pad */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-charcoal-600">Nudge Position in Room:</label>
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    onClick={() => handleUpdateFurnitureTransform(selectedFurniture.id, { x: (selectedFurniture.position?.x || 0) - 0.2 })}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs font-mono"
                  >
                    &larr; Left
                  </Button>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => handleUpdateFurnitureTransform(selectedFurniture.id, { z: (selectedFurniture.position?.z || 1.5) - 0.2 })}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs font-mono"
                    >
                      &uarr; Forward
                    </Button>
                    <Button
                      onClick={() => handleUpdateFurnitureTransform(selectedFurniture.id, { z: (selectedFurniture.position?.z || 1.5) + 0.2 })}
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs font-mono"
                    >
                      &darr; Back
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleUpdateFurnitureTransform(selectedFurniture.id, { x: (selectedFurniture.position?.x || 0) + 0.2 })}
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs font-mono"
                  >
                    Right &rarr;
                  </Button>
                </div>
              </div>

              {/* Rotation Buttons */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-charcoal-600 font-semibold">Rotation Angle:</span>
                  <span className="font-mono font-bold text-charcoal-900">{selectedFurniture.rotationY || 0}&deg;</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 45, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => handleUpdateFurnitureTransform(selectedFurniture.id, { rotationY: deg })}
                      className={`py-1 text-[11px] rounded-lg font-mono font-bold border transition-all ${
                        (selectedFurniture.rotationY || 0) === deg
                          ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-xs'
                          : 'bg-white text-charcoal-700 border-softBorder hover:bg-cream-100'
                      }`}
                    >
                      {deg}&deg;
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-charcoal-600 font-semibold">Scale Multiplier:</span>
                  <span className="font-mono font-bold text-charcoal-900">{(selectedFurniture.scale || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.1}
                  value={selectedFurniture.scale || 1.0}
                  onChange={(e) => handleUpdateFurnitureTransform(selectedFurniture.id, { scale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-terracotta-500"
                />
              </div>

              {/* Individual Item Color Customization */}
              <div className="space-y-1.5 pt-2 border-t border-softBorder">
                <div className="flex justify-between text-[11px]">
                  <span className="text-charcoal-600 font-semibold">Item Color Finish:</span>
                  <span className="font-mono font-bold text-charcoal-900">{selectedFurniture.customColor || colors.furniture}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {FURNITURE_COLOR_PRESETS.slice(0, 6).map((f) => (
                    <button
                      key={f.hex}
                      onClick={() => handleUpdateFurnitureTransform(selectedFurniture.id, { customColor: f.hex })}
                      className="w-6 h-6 rounded-md border border-softBorder hover:scale-110 transition-all"
                      style={{ backgroundColor: f.hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={selectedFurniture.customColor || colors.furniture}
                    onChange={(e) => handleUpdateFurnitureTransform(selectedFurniture.id, { customColor: e.target.value })}
                    className="w-6 h-6 rounded-md border border-softBorder cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: DESIGN SUMMARY & BUDGET BREAKDOWN                   */}
      {/* ========================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-5 animate-fade-in">
          {/* Budget Overview Card */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-softBorder space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-700">Estimated Total Cost:</span>
              <span className="font-mono font-bold text-base text-charcoal-900">{formatCurrency(totalFurnitureCost)}</span>
            </div>

            <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget ? 'bg-red-500' : 'bg-sage-600'
                }`}
                style={{ width: `${Math.min(100, (totalFurnitureCost / Math.max(1, budget)) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-charcoal-600">
              <span>Allocated: {formatCurrency(budget)}</span>
              <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-sage-700 font-bold'}>
                {isOverBudget ? `Exceeds by ${formatCurrency(Math.abs(remainingBudget))}` : `Remaining: ${formatCurrency(remainingBudget)}`}
              </span>
            </div>
          </div>

          {/* Itemized Staged Furniture */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Itemized Staged Catalog ({placedFurniture.length} items):
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {placedFurniture.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 rounded-xl bg-white border border-softBorder text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0" />
                    <span className="font-medium text-charcoal-800 truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-semibold text-charcoal-900 shrink-0">
                    {formatCurrency(item.price || item.estimatedCost || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Actions Footer */}
      <div className="pt-3 border-t border-softBorder space-y-2.5">
        <Button
          onClick={onSaveDesign}
          isLoading={isSaving}
          variant="primary"
          size="lg"
          className="w-full shadow-terracotta font-semibold"
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Design
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setShowFullColorPickerModal(true)}
            variant="outline"
            size="sm"
            className="text-xs border-terracotta-200 text-terracotta-800 bg-terracotta-50/80 hover:bg-terracotta-100 font-semibold"
            leftIcon={<Palette className="w-3.5 h-3.5 text-terracotta-600" />}
          >
            Full Color Palette
          </Button>

          <Button
            onClick={() => setShowCanIFitThisModal(true)}
            variant="outline"
            size="sm"
            className="text-xs border-sage-200 text-sage-800 bg-sage-50/80 hover:bg-sage-100 font-semibold"
            leftIcon={<Ruler className="w-3.5 h-3.5 text-sage-600" />}
          >
            Can I Fit This?
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <ImproveMyRoomButton
            customization={customization}
            onChangeCustomization={onChangeCustomization}
          />

          <Button
            onClick={onResetDesign}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Colors
          </Button>
        </div>
      </div>

      {/* Full Color Customizer Modal */}
      {showFullColorPickerModal && (
        <FullColorPickerModal
          colors={colors}
          onChangeColors={(newColors) => onChangeCustomization({ colors: newColors })}
          onClose={() => setShowFullColorPickerModal(false)}
        />
      )}

      {/* Can I Fit This Tool Modal */}
      {showCanIFitThisModal && (
        <CanIFitThisTool
          roomDimensions={roomDimensions}
          onClose={() => setShowCanIFitThisModal(false)}
        />
      )}

      {/* Full Furniture Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-softBorder shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-softBorder pb-3">
              <div>
                <h3 className="text-base font-bold text-charcoal-900 tracking-tight">
                  Browse Interior Furniture Catalog
                </h3>
                <p className="text-xs text-charcoal-500">
                  Select pieces to stage immediately in your {roomDimensions.length}m &times; {roomDimensions.width}m room.
                </p>
              </div>
              <Button onClick={() => setShowCatalogModal(false)} variant="outline" size="sm">
                Close
              </Button>
            </div>

            <FurnitureCatalog
              placedFurnitureIds={placedFurniture.map((i) => i.id)}
              onAddItem={(item) => {
                handleAddFurnitureToRoom(item);
              }}
              onRemoveItem={(id) => {
                handleRemoveFurniture(id);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
