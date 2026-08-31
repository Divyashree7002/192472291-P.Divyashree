import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProjectFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRoomType: string;
  onRoomTypeChange: (type: string) => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}

export const ProjectFilterBar: React.FC<ProjectFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRoomType,
  onRoomTypeChange,
  selectedStyle,
  onStyleChange,
}) => {
  const roomTypes: { value: string; label: string }[] = [
    { value: 'all', label: 'All Room Types' },
    { value: 'living_room', label: 'Living Room' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'home_office', label: 'Home Office' },
    { value: 'dining_room', label: 'Dining Room' },
    { value: 'kitchen', label: 'Kitchen' },
  ];

  const styles: { value: string; label: string }[] = [
    { value: 'all', label: 'All Design Styles' },
    { value: 'modern_minimalist', label: 'Modern Minimalist' },
    { value: 'scandinavian', label: 'Scandinavian' },
    { value: 'japandi', label: 'Japandi' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'mid_century_modern', label: 'Mid-Century Modern' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-softBorder shadow-warm-sm flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search projects by name or notes..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF7F2] border border-softBorder text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-terracotta-500 focus:bg-white transition-all shadow-warm-sm"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-semibold shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-terracotta-600" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        <select
          value={selectedRoomType}
          onChange={(e) => onRoomTypeChange(e.target.value)}
          className="bg-white border border-softBorder rounded-xl px-3 py-2 text-xs text-charcoal-800 focus:outline-none focus:border-terracotta-500 shadow-warm-sm font-medium"
        >
          {roomTypes.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label}
            </option>
          ))}
        </select>

        <select
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          className="bg-white border border-softBorder rounded-xl px-3 py-2 text-xs text-charcoal-800 focus:outline-none focus:border-terracotta-500 shadow-warm-sm font-medium"
        >
          {styles.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
