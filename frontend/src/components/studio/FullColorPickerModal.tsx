import React, { useState } from 'react';
import { X, Check, RefreshCw, Palette, Sparkles, Heart, History, Sliders } from 'lucide-react';
import { Button } from '../ui/Button';
import { RoomColorPalette } from '../../types';

interface FullColorPickerModalProps {
  colors: RoomColorPalette;
  onChangeColors: (newColors: RoomColorPalette) => void;
  onClose: () => void;
}

type SurfaceKey = 'wall' | 'floor' | 'ceiling' | 'door' | 'windowFrame' | 'furniture' | 'cabinet' | 'accent';

interface ColorPresetCategory {
  name: string;
  colors: { hex: string; name: string }[];
}

const COLOR_CATEGORIES: ColorPresetCategory[] = [
  {
    name: 'Whites & Creams',
    colors: [
      { hex: '#FFFFFF', name: 'Pure White' },
      { hex: '#FAF8F5', name: 'Warm Cream' },
      { hex: '#F4EFEA', name: 'Alabaster' },
      { hex: '#EFECE6', name: 'Soft Linen' },
      { hex: '#EAE6DF', name: 'Ivory' },
    ],
  },
  {
    name: 'Greys & Charcoal',
    colors: [
      { hex: '#F0F2F5', name: 'Light Slate' },
      { hex: '#D1D5DB', name: 'Cool Grey' },
      { hex: '#9CA3AF', name: 'Medium Grey' },
      { hex: '#4B5563', name: 'Charcoal' },
      { hex: '#1F2937', name: 'Midnight' },
    ],
  },
  {
    name: 'Greens & Sage',
    colors: [
      { hex: '#E8F5E9', name: 'Pale Mint' },
      { hex: '#C8E6C9', name: 'Soft Sage' },
      { hex: '#81C784', name: 'Earthy Olive' },
      { hex: '#4CAF50', name: 'Forest Green' },
      { hex: '#2E7D32', name: 'Deep Moss' },
    ],
  },
  {
    name: 'Blues & Teal',
    colors: [
      { hex: '#E1F5FE', name: 'Powder Blue' },
      { hex: '#81D4FA', name: 'Sky Blue' },
      { hex: '#0288D1', name: 'Ocean Teal' },
      { hex: '#1565C0', name: 'Royal Navy' },
      { hex: '#0D47A1', name: 'Midnight Blue' },
    ],
  },
  {
    name: 'Terracotta & Warm Browns',
    colors: [
      { hex: '#FFF3E0', name: 'Peach Cream' },
      { hex: '#FFB74D', name: 'Warm Mustard' },
      { hex: '#E07A5F', name: 'Terracotta' },
      { hex: '#8D7B68', name: 'Walnut Brown' },
      { hex: '#3D312A', name: 'Dark Espresso' },
    ],
  },
];

const DEFAULT_COLORS: RoomColorPalette = {
  wall: '#F4EFEA',
  floor: '#C8B6A6',
  ceiling: '#FAF8F5',
  door: '#6C5B4C',
  windowFrame: '#3A3A3A',
  furniture: '#8D7B68',
  cabinet: '#5C5449',
  accent: '#E07A5F',
};

// Convert Hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export const FullColorPickerModal: React.FC<FullColorPickerModalProps> = ({
  colors,
  onChangeColors,
  onClose,
}) => {
  const [activeSurface, setActiveSurface] = useState<SurfaceKey>('wall');
  const [palette, setPalette] = useState<RoomColorPalette>({
    wall: colors.wall || DEFAULT_COLORS.wall,
    floor: colors.floor || DEFAULT_COLORS.floor,
    ceiling: colors.ceiling || DEFAULT_COLORS.ceiling,
    door: colors.door || DEFAULT_COLORS.door,
    windowFrame: colors.windowFrame || DEFAULT_COLORS.windowFrame,
    furniture: colors.furniture || DEFAULT_COLORS.furniture,
    cabinet: colors.cabinet || DEFAULT_COLORS.cabinet,
    accent: colors.accent || DEFAULT_COLORS.accent,
  });

  const [recentColors, setRecentColors] = useState<string[]>([
    '#F4EFEA', '#C8B6A6', '#FAF8F5', '#E07A5F', '#8D7B68', '#4A5D4E'
  ]);
  const [favoriteColors, setFavoriteColors] = useState<string[]>([
    '#E07A5F', '#81C784', '#1565C0', '#F4EFEA'
  ]);

  const currentColor = palette[activeSurface] || '#FFFFFF';
  const currentRgb = hexToRgb(currentColor);

  const handleColorChange = (newHex: string) => {
    const updatedHex = newHex.toUpperCase();
    setPalette((prev) => ({ ...prev, [activeSurface]: updatedHex }));

    if (!recentColors.includes(updatedHex)) {
      setRecentColors((prev) => [updatedHex, ...prev.slice(0, 7)]);
    }
  };

  const handleApplyAll = () => {
    onChangeColors(palette);
    onClose();
  };

  const handleToggleFavorite = (hex: string) => {
    if (favoriteColors.includes(hex)) {
      setFavoriteColors((prev) => prev.filter((c) => c !== hex));
    } else {
      setFavoriteColors((prev) => [...prev, hex]);
    }
  };

  const handleReset = () => {
    setPalette(DEFAULT_COLORS);
  };

  // Color Harmony Generator based on active wall/floor color
  const getSuggestedHarmonies = () => {
    const base = palette.wall.toUpperCase();
    if (base.includes('A8B89F') || base.includes('81C784') || base.includes('C8E6C9')) {
      return {
        wall: '#C8E6C9',
        floor: '#C8B6A6',
        ceiling: '#FAF8F5',
        door: '#6C5B4C',
        windowFrame: '#3A3A3A',
        cabinet: '#5C5449',
        accent: '#E07A5F',
        furniture: '#8D7B68',
      };
    }
    if (base.includes('E07A5F') || base.includes('FFB74D')) {
      return {
        wall: '#F4EFEA',
        floor: '#8D7B68',
        ceiling: '#FAF8F5',
        door: '#6C5B4C',
        windowFrame: '#3A3A3A',
        cabinet: '#5C5449',
        accent: '#E07A5F',
        furniture: '#3D312A',
      };
    }
    return {
      wall: '#F4EFEA',
      floor: '#C8B6A6',
      ceiling: '#FAF8F5',
      door: '#6C5B4C',
      windowFrame: '#3A3A3A',
      cabinet: '#5C5449',
      accent: '#E07A5F',
      furniture: '#8D7B68',
    };
  };

  const surfaces: { key: SurfaceKey; label: string }[] = [
    { key: 'wall', label: 'Wall' },
    { key: 'floor', label: 'Floor' },
    { key: 'ceiling', label: 'Ceiling' },
    { key: 'door', label: 'Door' },
    { key: 'windowFrame', label: 'Window Frame' },
    { key: 'furniture', label: 'Furniture Fabric' },
    { key: 'cabinet', label: 'Cabinet / Storage' },
    { key: 'accent', label: 'Accent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-softBorder space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-softBorder pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200">
              <Palette className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <span>Full Surface Color Customizer</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 font-medium">
                  360° Palette
                </span>
              </h3>
              <p className="text-xs text-charcoal-500">
                Select custom HEX/RGB shades or category presets for any surface.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Surface Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {surfaces.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSurface(s.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeSurface === s.key
                  ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-warm-xs'
                  : 'bg-warmWhite text-charcoal-600 border-softBorder hover:bg-charcoal-50'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: palette[s.key] || '#FFFFFF' }}
              />
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Main Color Customization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Native Color Picker & Controls */}
          <div className="md:col-span-6 space-y-4 bg-warmWhite p-4 rounded-2xl border border-softBorder">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                {surfaces.find((s) => s.key === activeSurface)?.label} Color
              </span>
              <button
                onClick={() => handleToggleFavorite(currentColor)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  favoriteColors.includes(currentColor)
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-charcoal-500 border-softBorder hover:bg-charcoal-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoriteColors.includes(currentColor) ? 'fill-current' : ''}`} />
                <span>Favorite</span>
              </button>
            </div>

            {/* Native HTML5 Color Spectrum Input & Swatch */}
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-2xl border-2 border-white shadow-warm-md flex items-center justify-center text-xs font-bold shrink-0 relative overflow-hidden"
                style={{ backgroundColor: currentColor }}
              >
                <input
                  type="color"
                  value={currentColor.length === 7 ? currentColor : '#FFFFFF'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>

              <div className="space-y-2 flex-1">
                <div>
                  <label className="text-[11px] font-semibold text-charcoal-500 block">HEX Code</label>
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-softBorder text-sm font-mono font-semibold uppercase bg-white text-charcoal-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="bg-white p-1 rounded-lg border border-softBorder">
                    <span className="text-charcoal-400 block">R</span>
                    <span className="font-bold text-charcoal-800">{currentRgb.r}</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-softBorder">
                    <span className="text-charcoal-400 block">G</span>
                    <span className="font-bold text-charcoal-800">{currentRgb.g}</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-softBorder">
                    <span className="text-charcoal-400 block">B</span>
                    <span className="font-bold text-charcoal-800">{currentRgb.b}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RGB Direct Sliders */}
            <div className="space-y-2 pt-2 border-t border-softBorder">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-red-600 w-4">R</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentRgb.r}
                  onChange={(e) =>
                    handleColorChange(rgbToHex(Number(e.target.value), currentRgb.g, currentRgb.b))
                  }
                  className="w-full accent-red-500 h-1.5 rounded-lg bg-charcoal-200 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-green-600 w-4">G</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentRgb.g}
                  onChange={(e) =>
                    handleColorChange(rgbToHex(currentRgb.r, Number(e.target.value), currentRgb.b))
                  }
                  className="w-full accent-green-500 h-1.5 rounded-lg bg-charcoal-200 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-blue-600 w-4">B</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentRgb.b}
                  onChange={(e) =>
                    handleColorChange(rgbToHex(currentRgb.r, currentRgb.g, Number(e.target.value)))
                  }
                  className="w-full accent-blue-500 h-1.5 rounded-lg bg-charcoal-200 cursor-pointer"
                />
              </div>
            </div>

            {/* Color Harmony Recommendation Button */}
            <button
              onClick={() => {
                const harm = getSuggestedHarmonies();
                setPalette((prev) => ({
                  ...prev,
                  wall: harm.wall,
                  floor: harm.floor,
                  ceiling: harm.ceiling,
                  door: harm.door,
                  windowFrame: harm.windowFrame,
                  cabinet: harm.cabinet,
                  accent: harm.accent,
                  furniture: harm.furniture,
                }));
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Apply Color Harmony Suggestions</span>
            </button>
          </div>

          {/* Right: Presets, History & Favorites */}
          <div className="md:col-span-6 space-y-4">
            {/* Category Presets */}
            <div>
              <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block mb-2">
                Curated Color Presets
              </span>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {COLOR_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <span className="text-[11px] font-semibold text-charcoal-500 block">{cat.name}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {cat.colors.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => handleColorChange(c.hex)}
                          className="w-7 h-7 rounded-xl border border-black/10 transition-transform hover:scale-110 flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: c.hex }}
                          title={`${c.name} (${c.hex})`}
                        >
                          {currentColor.toUpperCase() === c.hex.toUpperCase() && (
                            <Check className="w-3 h-3 text-white drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Used & Favorites */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-softBorder">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-charcoal-500 mb-1.5">
                  <History className="w-3 h-3 text-terracotta-600" />
                  <span>Recently Used</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {recentColors.map((hex, i) => (
                    <button
                      key={`${hex}-${i}`}
                      onClick={() => handleColorChange(hex)}
                      className="w-6 h-6 rounded-lg border border-black/10 transition-transform hover:scale-105"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-charcoal-500 mb-1.5">
                  <Heart className="w-3 h-3 text-red-500 fill-current" />
                  <span>Favorites</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {favoriteColors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => handleColorChange(hex)}
                      className="w-6 h-6 rounded-lg border border-black/10 transition-transform hover:scale-105"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-softBorder pt-4">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset to Default
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={onClose} variant="ghost" size="sm" className="text-xs">
              Cancel
            </Button>
            <Button onClick={handleApplyAll} variant="primary" size="sm" className="text-xs">
              Apply Surface Colors
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
