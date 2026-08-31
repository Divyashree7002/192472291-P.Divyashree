import {
  RoomType,
  DesignStyle,
  RoomColorPalette,
  PlacedFurnitureItem,
  DesignCustomizationState
} from '../types';

export interface StylePresetDefinition {
  id: DesignStyle;
  label: string;
  badge: string;
  description: string;
  palette: RoomColorPalette;
  floorMaterial: string;
  furnitureMaterial: string;
  accentDetail: string;
  lightingMood: string;
}

export const STYLE_PRESETS: Record<DesignStyle, StylePresetDefinition> = {
  scandinavian: {
    id: 'scandinavian',
    label: 'Scandinavian',
    badge: 'Cozy Hygge',
    description: 'Crisp warm alabaster walls, blonde ash wood, textured beige bouclé & airy natural light.',
    palette: {
      wall: '#FAF8F5',       // Warm Alabaster
      floor: '#DEB887',      // Light Oak / Blonde Ash
      ceiling: '#FFFFFF',    // Crisp Pure White
      furniture: '#D8C3A5',  // Natural Birch / Ash
      accent: '#DDA15E',     // Warm Ochre / Tan
    },
    floorMaterial: 'light_oak',
    furnitureMaterial: 'Natural Ash & Textured Cream Bouclé',
    accentDetail: 'Brushed Brass & Ceramic Stoneware',
    lightingMood: '3000K Warm Diffuse Ambient',
  },
  industrial: {
    id: 'industrial',
    label: 'Industrial',
    badge: 'Urban Loft',
    description: 'Exposed charcoal concrete, steel framing, raw timber & moody high-contrast accents.',
    palette: {
      wall: '#4B5563',       // Charcoal Concrete Slate
      floor: '#9E9E9E',      // Polished Raw Cement
      ceiling: '#1F2937',    // Dark Architectural Charcoal
      furniture: '#1F2421',  // Smoked Oak & Matte Steel
      accent: '#C2410C',     // Rust Copper / Amber
    },
    floorMaterial: 'polished_concrete',
    furnitureMaterial: 'Black Powder-Coated Metal & Reclaimed Walnut',
    accentDetail: 'Raw Iron Fixtures & Edison Filament Cues',
    lightingMood: '2400K Warm Edison Glow',
  },
  luxury: {
    id: 'luxury',
    label: 'Luxury',
    badge: 'Opulent',
    description: 'Polished Italian marble, rich dark walnut, champagne gold trim & plush velvet textures.',
    palette: {
      wall: '#F4EFEA',       // Warm Ivory
      floor: '#ECEFF1',      // Carrara Marble / Polished Stone
      ceiling: '#FAF8F5',    // Warm Pearl White
      furniture: '#2D231E',  // Dark Smoked Walnut
      accent: '#D4A373',     // Brushed Champagne Gold
    },
    floorMaterial: 'carrara_marble',
    furnitureMaterial: 'Dark American Walnut, Fluted Stone & Rich Velvet',
    accentDetail: 'Champagne Brass Trim & Crystal Elements',
    lightingMood: '2700K Soft Crystal Chandelier',
  },
  minimalist: {
    id: 'minimalist',
    label: 'Minimalist',
    badge: 'Restrained',
    description: 'Pure neutral walls, uninterrupted circulation, essential geometric planes & zero visual clutter.',
    palette: {
      wall: '#FDFBF7',       // Pure Alabaster
      floor: '#D7C4B7',      // Smooth Blonde Oak
      ceiling: '#FFFFFF',    // Pure White
      furniture: '#7D7461',  // Restrained Muted Wood
      accent: '#A8A29E',     // Subtle Warm Grey
    },
    floorMaterial: 'light_oak',
    furnitureMaterial: 'Matte Lacquer & Clean Solid Ash',
    accentDetail: 'Concealed Integrated Shadow Gaps',
    lightingMood: '4000K Natural Neutral Day',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    badge: 'Popular',
    description: 'Clean architectural lines, contemporary neutral slate, tailored upholstery & dynamic balance.',
    palette: {
      wall: '#E2E8F0',       // Neutral Slate Gray
      floor: '#CBD5E1',      // Modern Gray Wood Planks
      ceiling: '#F8FAFC',    // Soft Off-White
      furniture: '#1E293B',  // Deep Slate Navy & Teak
      accent: '#2563EB',     // Royal Cobalt Accent
    },
    floorMaterial: 'gray_hardwood',
    furnitureMaterial: 'Solid Teak, Matte Steel & Performance Linen',
    accentDetail: 'Sleek Anodized Aluminum Trims',
    lightingMood: '3500K Clean Architectural Downlight',
  },
  traditional: {
    id: 'traditional',
    label: 'Traditional',
    badge: 'Timeless',
    description: 'Warm creamy wall tones, rich mahogany hardwoods, ornate moldings & classic craftsmanship.',
    palette: {
      wall: '#EAE5D9',       // Warm Sand Cream
      floor: '#6F4E37',      // Rich Mahogany Hardwood
      ceiling: '#FFFDF9',    // Warm Cream White
      furniture: '#4A3525',  // Classic Dark Oak & Walnut
      accent: '#854D0E',     // Antique Amber Bronze
    },
    floorMaterial: 'mahogany',
    furnitureMaterial: 'Solid Dark Oak, Tufted Leather & Classical Carvings',
    accentDetail: 'Antique Brass Hardware & Crown Trim',
    lightingMood: '2700K Warm Incandescent Harmony',
  },
  contemporary: {
    id: 'contemporary',
    label: 'Contemporary',
    badge: 'Curated',
    description: 'Sculpted profiles, warm clay tones, organic herringbone wood & curated deep teal details.',
    palette: {
      wall: '#E7E5E4',       // Warm Stone
      floor: '#A8A29E',      // Herringbone Natural Wood
      ceiling: '#FAFAF9',    // Smooth Sand
      furniture: '#292524',  // Charcoal Ash & Bouclé
      accent: '#0D9488',     // Deep Teal Cyan
    },
    floorMaterial: 'herringbone_oak',
    furnitureMaterial: 'Curved Bouclé Upholstery & Charcoal Ash',
    accentDetail: 'Matte Black Hardware & Ceramic Vessels',
    lightingMood: '3000K Sculptural Indirect Glow',
  },
  japandi: {
    id: 'japandi',
    label: 'Japandi',
    badge: 'Zen',
    description: 'Harmonious fusion of Japanese Wabi-Sabi and Scandinavian functionality.',
    palette: {
      wall: '#F5F2EB',
      floor: '#D5C3A5',
      ceiling: '#FFFFFF',
      furniture: '#5C4D3C',
      accent: '#738678',
    },
    floorMaterial: 'light_oak',
    furnitureMaterial: 'Unfinished Light Cedar, Paper Cord & Raw Ceramic',
    accentDetail: 'Blackened Steel & Tatami Matting',
    lightingMood: '2700K Low Horizon Lantern Glow',
  },
  bohemian: {
    id: 'bohemian',
    label: 'Bohemian',
    badge: 'Eclectic',
    description: 'Vibrant terracotta clays, rattan cane weaves, earthy textures & layered botanical decor.',
    palette: {
      wall: '#E8D5C4',
      floor: '#A0522D',
      ceiling: '#FFF8DC',
      furniture: '#8B4513',
      accent: '#D97706',
    },
    floorMaterial: 'terracotta_tile',
    furnitureMaterial: 'Rattan Cane, Hand-Woven Jute & Teak',
    accentDetail: 'Handcrafted Macramé & Brass Planters',
    lightingMood: '2200K Amber Sunset Glow',
  },
  mid_century: {
    id: 'mid_century',
    label: 'Mid-Century Modern',
    badge: 'Retro',
    description: 'Tapered legs, organic curvature, rich teak woods and iconic geometric silhouettes.',
    palette: {
      wall: '#EDE8DF',
      floor: '#8B5A2B',
      ceiling: '#FDFBF7',
      furniture: '#5C3A21',
      accent: '#E76F51',
    },
    floorMaterial: 'natural_walnut',
    furnitureMaterial: 'Molded Plywood, Teak Wood & Wool Upholstery',
    accentDetail: 'Sputnik Brass Hardware & Geometric Ceramics',
    lightingMood: '2900K Mid-Century Warm Glow',
  },
  modern_minimalist: {
    id: 'modern_minimalist',
    label: 'Modern Minimalist',
    badge: 'Ultra Clean',
    description: 'Seamless monochrome, monolithic storage, floating forms & zero unnecessary elements.',
    palette: {
      wall: '#F1F5F9',
      floor: '#E2E8F0',
      ceiling: '#FFFFFF',
      furniture: '#334155',
      accent: '#64748B',
    },
    floorMaterial: 'polished_concrete',
    furnitureMaterial: 'Floating Micro-Cement, Aluminum & Glass',
    accentDetail: 'Recessed Architectural Profile Lighting',
    lightingMood: '4000K Clean White Horizon',
  },
};

export interface RoomTypeMetadata {
  id: RoomType;
  label: string;
  iconName: string;
  badge: string;
  description: string;
  defaultDimensions: { length: number; width: number; height: number };
  suggestedCategories: string[];
}

export const ROOM_TYPE_METADATA: Record<string, RoomTypeMetadata> = {
  living_room: {
    id: 'living_room',
    label: 'Living Room',
    iconName: 'Armchair',
    badge: 'Social & Relaxation',
    description: 'Spacious central hub optimized for comfortable seating, media entertainment, and family gathering.',
    defaultDimensions: { length: 4.8, width: 3.6, height: 2.8 },
    suggestedCategories: ['seating', 'tables', 'storage', 'lighting', 'decor'],
  },
  bedroom: {
    id: 'bedroom',
    label: 'Bedroom',
    iconName: 'Bed',
    badge: 'Rest & Sanctuary',
    description: 'Peaceful private haven with restorative sleeping center, bedside lighting, and wardrobe storage.',
    defaultDimensions: { length: 4.2, width: 3.5, height: 2.7 },
    suggestedCategories: ['beds', 'storage', 'lighting', 'decor', 'seating'],
  },
  dining_room: {
    id: 'dining_room',
    label: 'Dining Room',
    iconName: 'Utensils',
    badge: 'Culinary & Entertaining',
    description: 'Dedicated dining space with symmetrical table placement, dining chairs, buffet credenza & chandelier.',
    defaultDimensions: { length: 4.0, width: 3.2, height: 2.8 },
    suggestedCategories: ['tables', 'seating', 'storage', 'lighting', 'decor'],
  },
  study_room: {
    id: 'study_room',
    label: 'Study Room',
    iconName: 'BookOpen',
    badge: 'Focus & Learning',
    description: 'Quiet intellectual retreat featuring solid study desk, ergonomic chair, bookshelves & task lighting.',
    defaultDimensions: { length: 3.6, width: 3.0, height: 2.7 },
    suggestedCategories: ['tables', 'seating', 'storage', 'lighting', 'decor'],
  },
  office: {
    id: 'office',
    label: 'Home Office',
    iconName: 'Briefcase',
    badge: 'Productivity & Work',
    description: 'High-efficiency workstation setup with dual monitor desk, ergonomic task chair, and file credenza.',
    defaultDimensions: { length: 3.8, width: 3.2, height: 2.8 },
    suggestedCategories: ['tables', 'seating', 'storage', 'lighting'],
  },
  kitchen: {
    id: 'kitchen',
    label: 'Kitchen',
    iconName: 'ChefHat',
    badge: 'Culinary Workshop',
    description: 'Modern open kitchen layout with prep island, barstools, pantry storage, and high-lumen lighting.',
    defaultDimensions: { length: 4.2, width: 3.2, height: 2.8 },
    suggestedCategories: ['storage', 'seating', 'tables', 'lighting'],
  },
  studio: {
    id: 'studio',
    label: 'Studio Apartment',
    iconName: 'LayoutGrid',
    badge: 'Multi-Functional',
    description: 'Space-optimized open concept integrating micro living, sleeper zone, and compact dining.',
    defaultDimensions: { length: 5.4, width: 3.8, height: 2.8 },
    suggestedCategories: ['seating', 'beds', 'tables', 'storage', 'lighting'],
  },
  balcony: {
    id: 'balcony',
    label: 'Balcony & Terrace',
    iconName: 'Sun',
    badge: 'Outdoor Living',
    description: 'Outdoor retreat with weather-resistant bistro seating, vertical planters, and warm ambient sconces.',
    defaultDimensions: { length: 3.2, width: 1.8, height: 2.6 },
    suggestedCategories: ['seating', 'tables', 'decor', 'lighting'],
  },
  kids_room: {
    id: 'kids_room',
    label: 'Kids Room',
    iconName: 'Sparkles',
    badge: 'Play & Study',
    description: 'Bright multi-functional child space with study desk, single trundle bed, and low-reach toy storage.',
    defaultDimensions: { length: 3.8, width: 3.0, height: 2.7 },
    suggestedCategories: ['beds', 'tables', 'storage', 'lighting', 'decor'],
  },
};

/**
 * Generates initial furniture arrangement tailored to the specific Room Type and Room Dimensions
 */
export function getArchetypeFurniture(
  roomType: string,
  dimensions: { length: number; width: number; height: number },
  style: string = 'modern'
): PlacedFurnitureItem[] {
  const L = Math.max(2.5, dimensions.length || 4.8);
  const W = Math.max(2.2, dimensions.width || 3.6);
  const stylePreset = STYLE_PRESETS[style as DesignStyle] || STYLE_PRESETS.modern;
  const furnColor = stylePreset.palette.furniture;

  const type = roomType.toLowerCase().replace(/[\s-]/g, '_');

  switch (type) {
    case 'bedroom':
      return [
        {
          id: `bed-${Date.now()}-1`,
          name: 'King Platform Bed with Padded Headboard',
          category: 'beds',
          dimensions: { widthCm: 195, depthCm: 215, heightCm: 110 },
          estimatedCost: 58000,
          price: 58000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.55, z: L * 0.42 },
        },
        {
          id: `nightstand-left-${Date.now()}`,
          name: 'Solid Wood Bedside Nightstand (Left)',
          category: 'tables',
          dimensions: { widthCm: 55, depthCm: 45, heightCm: 52 },
          estimatedCost: 9500,
          price: 9500,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: -W * 0.38, y: 0.26, z: L * 0.42 },
        },
        {
          id: `nightstand-right-${Date.now()}`,
          name: 'Solid Wood Bedside Nightstand (Right)',
          category: 'tables',
          dimensions: { widthCm: 55, depthCm: 45, heightCm: 52 },
          estimatedCost: 9500,
          price: 9500,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: W * 0.38, y: 0.26, z: L * 0.42 },
        },
        {
          id: `wardrobe-${Date.now()}`,
          name: 'Full-Height 3-Door Modular Wardrobe',
          category: 'storage',
          dimensions: { widthCm: 180, depthCm: 60, heightCm: 210 },
          estimatedCost: 48000,
          price: 48000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 90,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: -W / 2 + 0.45, y: 1.05, z: L * 0.82 },
        },
      ];

    case 'dining_room':
      return [
        {
          id: `dining-table-${Date.now()}`,
          name: '6-Seater Solid Hardwood Dining Table',
          category: 'tables',
          dimensions: { widthCm: 180, depthCm: 90, heightCm: 76 },
          estimatedCost: 42000,
          price: 42000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.38, z: L * 0.5 },
        },
        {
          id: `sideboard-${Date.now()}`,
          name: 'Modern Dining Credenza & Buffet Sideboard',
          category: 'storage',
          dimensions: { widthCm: 160, depthCm: 45, heightCm: 85 },
          estimatedCost: 32000,
          price: 32000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.42, z: 0.4 },
        },
      ];

    case 'study_room':
    case 'office':
    case 'home_office':
      return [
        {
          id: `study-desk-${Date.now()}`,
          name: 'Executive Ergonomic Study Desk',
          category: 'tables',
          dimensions: { widthCm: 150, depthCm: 75, heightCm: 75 },
          estimatedCost: 28000,
          price: 28000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.375, z: L * 0.45 },
        },
        {
          id: `office-chair-${Date.now()}`,
          name: 'High-Back Ergonomic Lumbar Mesh Chair',
          category: 'seating',
          dimensions: { widthCm: 65, depthCm: 65, heightCm: 105 },
          estimatedCost: 18000,
          price: 18000,
          material: 'Breathable Mesh & Aluminum Base',
          isVisible: true,
          rotationY: 180,
          scale: 1.0,
          customColor: '#1F2937',
          source: 'recommended',
          position: { x: 0, y: 0.52, z: L * 0.45 + 0.65 },
        },
        {
          id: `bookcase-${Date.now()}`,
          name: 'Tall 5-Tier Architectural Bookshelf',
          category: 'storage',
          dimensions: { widthCm: 110, depthCm: 35, heightCm: 190 },
          estimatedCost: 24000,
          price: 24000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 90,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: -W / 2 + 0.35, y: 0.95, z: L * 0.45 },
        },
      ];

    case 'kitchen':
      return [
        {
          id: `kitchen-island-${Date.now()}`,
          name: 'Freestanding Prep Island with Quartz Top',
          category: 'tables',
          dimensions: { widthCm: 160, depthCm: 80, heightCm: 90 },
          estimatedCost: 45000,
          price: 45000,
          material: 'Engineered Quartz & Oak Cabinetry',
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.45, z: L * 0.5 },
        },
      ];

    case 'kids_room':
      return [
        {
          id: `kids-bed-${Date.now()}`,
          name: 'Kids Single Platform Bed',
          category: 'beds',
          dimensions: { widthCm: 110, depthCm: 200, heightCm: 85 },
          estimatedCost: 28000,
          price: 28000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: -W * 0.25, y: 0.425, z: L * 0.45 },
        },
        {
          id: `kids-desk-${Date.now()}`,
          name: 'Kids Ergonomic Study Desk',
          category: 'tables',
          dimensions: { widthCm: 100, depthCm: 55, heightCm: 70 },
          estimatedCost: 15000,
          price: 15000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: W * 0.25, y: 0.35, z: L * 0.45 },
        },
        {
          id: `kids-storage-${Date.now()}`,
          name: 'Low-Reach Toy Storage & Bookshelf',
          category: 'storage',
          dimensions: { widthCm: 120, depthCm: 40, heightCm: 90 },
          estimatedCost: 18000,
          price: 18000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.45, z: 0.45 },
        },
      ];

    case 'living_room':
    default:
      return [
        {
          id: `sofa-${Date.now()}`,
          name: 'Nordic Low-Profile 3-Seater Sofa',
          category: 'seating',
          dimensions: { widthCm: 220, depthCm: 95, heightCm: 78 },
          estimatedCost: 45000,
          price: 45000,
          material: stylePreset.furnitureMaterial,
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.39, z: L * 0.42 },
        },
        {
          id: `coffee-table-${Date.now()}`,
          name: 'Minimalist White Oak Coffee Table',
          category: 'tables',
          dimensions: { widthCm: 110, depthCm: 60, heightCm: 42 },
          estimatedCost: 12000,
          price: 12000,
          material: 'Natural White Oak',
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.21, z: L * 0.42 + 1.15 },
        },
        {
          id: `tv-unit-${Date.now()}`,
          name: 'Modern Teak TV Entertainment Console',
          category: 'storage',
          dimensions: { widthCm: 180, depthCm: 45, heightCm: 50 },
          estimatedCost: 35000,
          price: 35000,
          material: 'Natural Teak & Cane Weave',
          isVisible: true,
          rotationY: 0,
          scale: 1.0,
          customColor: furnColor,
          source: 'recommended',
          position: { x: 0, y: 0.25, z: 0.45 },
        },
        {
          id: `accent-chair-${Date.now()}`,
          name: 'Curved Scandinavian Lounge Armchair',
          category: 'seating',
          dimensions: { widthCm: 85, depthCm: 85, heightCm: 75 },
          estimatedCost: 22000,
          price: 22000,
          material: 'Textured Wool Bouclé',
          isVisible: true,
          rotationY: 45,
          scale: 1.0,
          customColor: stylePreset.palette.accent,
          source: 'recommended',
          position: { x: W * 0.32, y: 0.375, z: L * 0.48 },
        },
      ];
  }
}

/**
 * Transforms CV-detected objects from real user photo into PlacedFurnitureItem objects
 */
export function convertDetectedObjectsToPlacedFurniture(
  detectedObjects: any[],
  dimensions: { length: number; width: number; height: number },
  defaultColor: string = '#E07A5F'
): PlacedFurnitureItem[] {
  if (!detectedObjects || detectedObjects.length === 0) return [];

  const L = Math.max(2.5, dimensions.length || 4.8);
  const W = Math.max(2.2, dimensions.width || 3.6);

  return detectedObjects.map((obj, idx) => {
    const s3d = obj.spatial_3d;
    const rawClass = (obj.class_name || 'furniture').replace(/_/g, ' ');
    const formattedName = rawClass.charAt(0).toUpperCase() + rawClass.slice(1);

    const wCm = s3d?.width_m ? Math.round(s3d.width_m * 100) : 100;
    const dCm = s3d?.depth_m ? Math.round(s3d.depth_m * 100) : 80;
    const hCm = s3d?.height_m ? Math.round(s3d.height_m * 100) : 75;

    // Localize in room coordinate system (X between -W/2 and +W/2, Z between 0.3 and L-0.3)
    let posX = 0;
    let posZ = 1.2 + idx * 0.8;

    if (s3d?.x_m !== undefined) {
      posX = Math.max(-W / 2 + (wCm / 200) + 0.1, Math.min(W / 2 - (wCm / 200) - 0.1, s3d.x_m));
    } else {
      posX = (idx % 2 === 0 ? -1 : 1) * Math.min(W * 0.28, W / 2 - 0.5);
    }

    if (s3d?.z_m !== undefined) {
      posZ = Math.max(dCm / 200 + 0.2, Math.min(L - dCm / 200 - 0.2, s3d.z_m));
    } else {
      posZ = Math.max(0.6, Math.min(L - 0.6, 0.8 + idx * 0.9));
    }

    return {
      id: `detected-obj-${obj.id || idx}-${Date.now()}`,
      name: `Scanned ${formattedName}`,
      category: obj.category || 'furniture',
      dimensions: {
        widthCm: wCm,
        depthCm: dCm,
        heightCm: hCm,
        width: wCm / 100,
        height: hCm / 100,
        length: dCm / 100,
      },
      estimatedCost: 0,
      price: 0,
      material: 'Detected Existing Object from Scan',
      isVisible: true,
      rotationY: 0,
      scale: 1.0,
      customColor: defaultColor,
      source: 'detected',
      position: {
        x: Number(posX.toFixed(2)),
        y: Number((hCm / 200).toFixed(2)),
        z: Number(posZ.toFixed(2)),
      },
    };
  });
}

/**
 * Applies a full style preset to the current customization state with instantaneous reactive update
 */
export function applyStylePresetToState(
  style: DesignStyle,
  currentState: DesignCustomizationState
): DesignCustomizationState {
  const preset = STYLE_PRESETS[style] || STYLE_PRESETS.modern;

  // Update furniture items that don't have user custom overrides
  const updatedFurniture = (currentState.placedFurniture || []).map((item) => {
    // If it's a detected object, preserve detected color (#E07A5F)
    if (item.source === 'detected') return item;

    return {
      ...item,
      customColor: preset.palette.furniture,
      material: preset.furnitureMaterial,
    };
  });

  return {
    ...currentState,
    style: preset.id,
    colors: { ...preset.palette },
    floorMaterial: preset.floorMaterial,
    placedFurniture: updatedFurniture,
  };
}
