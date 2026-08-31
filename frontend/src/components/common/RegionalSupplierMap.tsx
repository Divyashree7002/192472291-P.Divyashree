import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Building2, Store, Phone, Star, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Supplier {
  id: string;
  name: string;
  category: 'furniture' | 'materials' | 'lighting' | 'architectural';
  address: string;
  city: string;
  rating: number;
  phone: string;
  specialty: string;
}

const SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Godrej Interio Flagship Studio',
    category: 'furniture',
    address: 'Indiranagar 100ft Road',
    city: 'Bengaluru, Karnataka',
    rating: 4.8,
    phone: '+91 80 4125 8900',
    specialty: 'Ergonomic Seating & Modular Storage',
  },
  {
    id: 'sup-2',
    name: 'Pepperfry Studio & Experience Centre',
    category: 'furniture',
    address: 'Koramangala 5th Block',
    city: 'Bengaluru, Karnataka',
    rating: 4.7,
    phone: '+91 80 2553 4411',
    specialty: 'Solid Sheesham & Scandinavian Living Suites',
  },
  {
    id: 'sup-3',
    name: 'Kajaria Ceramics & Marbles Studio',
    category: 'materials',
    address: 'Ring Road, Sector 14',
    city: 'Gurugram, Haryana',
    rating: 4.9,
    phone: '+91 124 408 9200',
    specialty: 'Vitrified Matte Flooring & Glazed Wall Tiles',
  },
  {
    id: 'sup-4',
    name: 'Asian Paints Colour Idea Lounge',
    category: 'materials',
    address: 'Bandra West, Linking Road',
    city: 'Mumbai, Maharashtra',
    rating: 4.8,
    phone: '+91 22 2640 1200',
    specialty: 'Royale Luxury Emulsions & Textured Stucco',
  },
  {
    id: 'sup-5',
    name: 'Havells Studio & Smart Lighting',
    category: 'lighting',
    address: 'Connaught Place, Outer Circle',
    city: 'New Delhi, Delhi',
    rating: 4.6,
    phone: '+91 11 4350 7800',
    specialty: 'Warm Dimmable LED Troffers & Track Spotlights',
  },
];

export const RegionalSupplierMap: React.FC = () => {
  const apiKey = (import.meta as { env?: { VITE_GOOGLE_MAPS_API_KEY?: string } }).env?.VITE_GOOGLE_MAPS_API_KEY;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSuppliers = SAMPLE_SUPPLIERS.filter((s) => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-softBorder shadow-warm-md space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-softBorder pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-terracotta-100 text-terracotta-700">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal-900">Regional Material & Furniture Suppliers</h3>
            <p className="text-xs text-charcoal-500">Locate regional showrooms and verified interior material depots across India.</p>
          </div>
        </div>

        <Badge variant={apiKey ? 'sage' : 'sand'} size="sm">
          {apiKey ? 'Google Maps API Live' : 'Simulated Regional Network (India)'}
        </Badge>
      </div>

      {!apiKey && (
        <div className="p-3 rounded-xl bg-[#FAF7F2] border border-softBorder text-xs text-charcoal-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-sand-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Google Maps API Key not set in <code className="font-mono text-terracotta-700">.env</code> (<code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code>). Displaying certified national interior partner directory.
          </p>
        </div>
      )}

      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['all', 'furniture', 'materials', 'lighting'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-terracotta-500 text-white shadow-terracotta'
                  : 'bg-[#FAF8F5] text-charcoal-600 hover:bg-cream-200 border border-softBorder'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter suppliers by name, city, or material..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-xl border border-softBorder focus:outline-none focus:border-terracotta-400 w-full sm:w-64"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="p-4 rounded-xl bg-[#FAF8F5] border border-softBorder hover:border-terracotta-300 transition-all space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-bold text-xs text-charcoal-900 line-clamp-1">{supplier.name}</span>
                <span className="flex items-center gap-0.5 text-sand-700 font-bold text-[11px]">
                  <Star className="w-3 h-3 fill-sand-500 text-sand-500" />
                  <span>{supplier.rating}</span>
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-terracotta-500 shrink-0" />
                <span className="truncate">{supplier.address}, {supplier.city}</span>
              </p>
              <p className="text-[11px] text-terracotta-700 font-medium mt-1">
                Specialty: {supplier.specialty}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-softBorder text-[11px] text-charcoal-500 font-mono">
              <span>{supplier.phone}</span>
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(supplier.name + ' ' + supplier.city)}`, '_blank')}
                className="text-terracotta-600 hover:text-terracotta-700 font-semibold flex items-center gap-0.5"
              >
                <span>Directions</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
