import React, { useState, useMemo } from 'react';
import {
  Armchair,
  CheckCircle2,
  IndianRupee,
  Ruler,
  Plus,
  Check,
  Trash2,
  Search,
  Bed,
  Tv,
  Table,
  Lamp,
  Box,
  SlidersHorizontal
} from 'lucide-react';
import { FurnitureItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/currency';

export const SAMPLE_FURNITURE: FurnitureItem[] = [
  {
    id: 'furn-sofa-nordic',
    name: 'Nordic Low-Profile 3-Seater Sofa',
    category: 'seating',
    dimensions: { widthCm: 220, depthCm: 95, heightCm: 78 },
    estimatedCost: 45000,
    price: 45000,
    material: 'Textured Bouclé / Solid Ash Base',
    clearanceVerified: true,
    description: 'Generous ergonomic cushioning with Scandinavian solid ash foundation.',
  },
  {
    id: 'furn-sofa-lounge',
    name: 'Contemporary Modular Sectional',
    category: 'seating',
    dimensions: { widthCm: 260, depthCm: 160, heightCm: 82 },
    estimatedCost: 72000,
    price: 72000,
    material: 'High-Performance Velvet / Brushed Steel',
    clearanceVerified: true,
    description: 'Deep modular seating tailored for expansive living areas and family relaxation.',
  },
  {
    id: 'furn-chair-accent',
    name: 'Ergonomic Lounge Accent Chair',
    category: 'seating',
    dimensions: { widthCm: 82, depthCm: 85, heightCm: 76 },
    estimatedCost: 18000,
    price: 18000,
    material: 'Oatmeal Wool / Matte Clay Legs',
    clearanceVerified: true,
    description: 'Sculpted silhouette with high-density foam for premium reading comfort.',
  },
  {
    id: 'furn-table-coffee',
    name: 'Minimalist White Oak Coffee Table',
    category: 'tables',
    dimensions: { widthCm: 110, depthCm: 60, heightCm: 42 },
    estimatedCost: 12000,
    price: 12000,
    material: 'Natural White Oak',
    clearanceVerified: true,
    description: 'Low-slung rounded profile with seamless bullnose timber edge.',
  },
  {
    id: 'furn-table-dining',
    name: '6-Seater Solid Oak Dining Table',
    category: 'tables',
    dimensions: { widthCm: 180, depthCm: 90, heightCm: 76 },
    estimatedCost: 40000,
    price: 40000,
    material: 'Solid White Oak',
    clearanceVerified: true,
    description: 'Heirloom joinery with chamfered perimeter and sturdy trestle base.',
  },
  {
    id: 'furn-table-desk',
    name: 'Solid Teak Ergonomic Study Desk',
    category: 'tables',
    dimensions: { widthCm: 140, depthCm: 65, heightCm: 75 },
    estimatedCost: 22000,
    price: 22000,
    material: 'Solid Plantation Teak',
    clearanceVerified: true,
    description: 'Integrated cable raceway with soft-close stationery drawer.',
  },
  {
    id: 'furn-storage-tv',
    name: 'Modern Teak TV Entertainment Unit',
    category: 'storage',
    dimensions: { widthCm: 180, depthCm: 45, heightCm: 50 },
    estimatedCost: 35000,
    price: 35000,
    material: 'Natural Teak & Cane Weave',
    clearanceVerified: true,
    description: 'Acoustic rattan door insets with ventilated AV equipment bays.',
  },
  {
    id: 'furn-storage-wardrobe',
    name: 'Modular 3-Door Wardrobe',
    category: 'storage',
    dimensions: { widthCm: 160, depthCm: 60, heightCm: 210 },
    estimatedCost: 65000,
    price: 65000,
    material: 'Engineered Wood & Matte Fluted Glass',
    clearanceVerified: true,
    description: 'Full-height modular storage with integrated LED sensor illumination.',
  },
  {
    id: 'furn-storage-credenza',
    name: 'Japandi Low Credenza Sideboard',
    category: 'storage',
    dimensions: { widthCm: 150, depthCm: 42, heightCm: 72 },
    estimatedCost: 32000,
    price: 32000,
    material: 'Walnut Veneer & Fluted Tambour',
    clearanceVerified: true,
    description: 'Sliding tambour doors for concealed storage without taking up floor clearance.',
  },
  {
    id: 'furn-bed-king',
    name: 'King Size Platform Bed',
    category: 'beds',
    dimensions: { widthCm: 195, depthCm: 215, heightCm: 105 },
    estimatedCost: 55000,
    price: 55000,
    material: 'Upholstered Linen & Solid Sheesham',
    clearanceVerified: true,
    description: 'Floating plinth base with acoustic foam headboard padding.',
  },
  {
    id: 'furn-bed-queen',
    name: 'Minimalist Queen Slat Bed',
    category: 'beds',
    dimensions: { widthCm: 165, depthCm: 205, heightCm: 95 },
    estimatedCost: 42000,
    price: 42000,
    material: 'Natural Ash & Woven Cord',
    clearanceVerified: true,
    description: 'Airy spindle headboard designed to maximize bedroom light circulation.',
  },
  {
    id: 'furn-chair-office',
    name: 'High-Back Ergonomic Task Chair',
    category: 'seating',
    dimensions: { widthCm: 65, depthCm: 65, heightCm: 105 },
    estimatedCost: 18000,
    price: 18000,
    material: 'Breathable Mesh & Die-Cast Aluminum Base',
    clearanceVerified: true,
    description: '3D adjustable lumbar support with multi-lock tilt mechanism.',
  },
  {
    id: 'furn-storage-bookshelf',
    name: 'Tall 5-Tier Architectural Bookshelf',
    category: 'storage',
    dimensions: { widthCm: 110, depthCm: 35, heightCm: 190 },
    estimatedCost: 24000,
    price: 24000,
    material: 'Solid Ash & Concealed Steel Brackets',
    clearanceVerified: true,
    description: 'Minimalist open-frame shelving suitable for studies and home libraries.',
  },
  {
    id: 'furn-table-nightstand',
    name: 'Solid Wood Bedside Nightstand',
    category: 'tables',
    dimensions: { widthCm: 55, depthCm: 45, heightCm: 52 },
    estimatedCost: 9500,
    price: 9500,
    material: 'Solid Teak with Soft-Close Drawer',
    clearanceVerified: true,
    description: 'Compact bedside companion with chamfered edge profile.',
  },
  {
    id: 'furn-island-kitchen',
    name: 'Freestanding Prep Island with Quartz Top',
    category: 'tables',
    dimensions: { widthCm: 160, depthCm: 80, heightCm: 90 },
    estimatedCost: 45000,
    price: 45000,
    material: 'Engineered Quartz & Oak Cabinetry',
    clearanceVerified: true,
    description: 'Double-sided storage island with breakfast bar overhang.',
  },
  {
    id: 'furn-lamp-floor',
    name: 'Sculptural Arc Floor Lamp',
    category: 'lighting',
    dimensions: { widthCm: 45, depthCm: 120, heightCm: 195 },
    estimatedCost: 8500,
    price: 8500,
    material: 'Warm Brushed Brass / Travertine Base',
    clearanceVerified: true,
    description: 'Heavy mineral travertine foundation with dimmable warm ambient dome.',
  },
  {
    id: 'furn-lamp-table',
    name: 'Ceramic Mushroom Table Lamp',
    category: 'lighting',
    dimensions: { widthCm: 32, depthCm: 32, heightCm: 45 },
    estimatedCost: 4500,
    price: 4500,
    material: 'Hand-thrown Terracotta Ceramic',
    clearanceVerified: true,
    description: 'Soft downward 2700K ambient illumination for bedside or consoles.',
  },
];

interface FurnitureCatalogProps {
  placedFurnitureIds?: string[];
  onAddItem?: (item: FurnitureItem) => void;
  onRemoveItem?: (id: string) => void;
  className?: string;
  isCompact?: boolean;
}

export const FurnitureCatalog: React.FC<FurnitureCatalogProps> = ({
  placedFurnitureIds = [],
  onAddItem,
  onRemoveItem,
  className = '',
  isCompact = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { addToast } = useToast();

  const categories = [
    { id: 'all', label: 'All Pieces' },
    { id: 'seating', label: 'Seating' },
    { id: 'tables', label: 'Tables' },
    { id: 'storage', label: 'Storage' },
    { id: 'beds', label: 'Beds' },
    { id: 'lighting', label: 'Lighting' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'seating':
        return <Armchair className="w-4 h-4 text-terracotta-600" />;
      case 'tables':
        return <Table className="w-4 h-4 text-sage-600" />;
      case 'storage':
        return <Tv className="w-4 h-4 text-sand-600" />;
      case 'beds':
        return <Bed className="w-4 h-4 text-terracotta-600" />;
      case 'lighting':
        return <Lamp className="w-4 h-4 text-amber-500" />;
      default:
        return <Box className="w-4 h-4 text-charcoal-500" />;
    }
  };

  const filteredItems = useMemo(() => {
    return SAMPLE_FURNITURE.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleAdd = (item: FurnitureItem) => {
    if (onAddItem) {
      onAddItem(item);
    } else {
      addToast({
        title: 'Item Added to Room',
        description: `"${item.name}" placed inside your room layout.`,
        type: 'success',
      });
    }
  };

  const handleRemove = (item: FurnitureItem) => {
    if (onRemoveItem) {
      onRemoveItem(item.id);
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-5 border border-softBorder shadow-warm-lg space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-softBorder pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200 shadow-warm-xs">
            <Armchair className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-charcoal-900">Curated Furniture Catalog</h3>
            <p className="text-[11px] text-charcoal-500">
              Dimensional architectural furniture with verified spatial clearance.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-charcoal-700 bg-[#FAF7F2] px-2.5 py-1 rounded-xl border border-softBorder self-start sm:self-auto">
          {filteredItems.length} Available Models
        </span>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, material, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-softBorder text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition-all font-semibold ${
                activeCategory === cat.id
                  ? 'bg-terracotta-500 text-white shadow-terracotta'
                  : 'bg-[#FAF7F2] text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100 border border-softBorder'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Item Cards Grid / List */}
      <div className={`space-y-2.5 overflow-y-auto pr-1 ${isCompact ? 'max-h-72' : 'max-h-[480px]'}`}>
        {filteredItems.map((item) => {
          // Check if item or a variant with item.id is placed
          const isAdded = placedFurnitureIds.some((id) => id === item.id || id.startsWith(`custom-${item.id}`) || id.includes(item.id));
          const cost = item.price || item.estimatedCost || 0;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all shadow-warm-xs flex flex-col gap-2.5 ${
                isAdded
                  ? 'bg-sage-50/40 border-sage-300 ring-1 ring-sage-300'
                  : 'bg-[#FCFBF9] hover:bg-white border-softBorder hover:border-cream-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white border border-softBorder shadow-xs shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-charcoal-900">{item.name}</h4>
                      {isAdded && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sage-100 text-sage-800 text-[10px] font-bold border border-sage-300">
                          <Check className="w-2.5 h-2.5" /> Added
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">{item.material}</p>
                  </div>
                </div>

                <Badge variant="sage" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                  Clearance Verified
                </Badge>
              </div>

              {/* Dimensions and Cost */}
              <div className="flex items-center justify-between text-[11px] text-charcoal-600 pt-1.5 border-t border-softBorder/80">
                <span className="flex items-center gap-1 font-mono text-charcoal-700">
                  <Ruler className="w-3 h-3 text-terracotta-600" />
                  <span>
                    {item.dimensions?.widthCm || 80} × {item.dimensions?.depthCm || 60} × {item.dimensions?.heightCm || 75} cm
                  </span>
                </span>
                <span className="font-bold text-charcoal-900 font-mono">
                  {formatCurrency(cost)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5">
                {isAdded ? (
                  <>
                    <button
                      disabled
                      className="flex-1 py-1.5 px-3 rounded-xl bg-sage-100 text-sage-800 border border-sage-300 text-xs font-bold flex items-center justify-center gap-1 cursor-default"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>In Room Preview</span>
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      title="Remove from room preview"
                      className="py-1.5 px-3 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleAdd(item)}
                    variant="primary"
                    size="sm"
                    className="w-full text-xs py-1.5 shadow-terracotta"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add to Room
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-8 text-center text-xs text-charcoal-400 border border-dashed border-softBorder rounded-2xl">
            No furniture matching &quot;{searchQuery}&quot; found.
          </div>
        )}
      </div>
    </div>
  );
};
