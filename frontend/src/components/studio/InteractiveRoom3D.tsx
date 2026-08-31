import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Rotate3d,
  Compass,
  Eye,
  Layers,
  Grid,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Download,
  DoorOpen,
  Sun,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  RecommendationPlan,
  RoomColorPalette,
  PlacedFurnitureItem,
  DesignStyle
} from '../../types';
import { formatCurrency } from '../../utils/currency';

export type ViewMode = 'top_down' | 'perspective' | 'front_elevation' | 'side_elevation';

export interface SpatialObject3D {
  id: string;
  name: string;
  category?: string;
  x: number; // in meters (center relative to room origin X=0)
  y: number; // in meters (elevation)
  z: number; // in meters (depth from back wall Z=0 to Z=L)
  width: number;
  height: number;
  depth: number;
  rotationY?: number; // In degrees
  scale?: number;
  color: string;
  source: 'detected' | 'recommended' | 'custom';
  price?: number;
  confidence?: number;
  clearanceVerified?: boolean;
  isCustomAdded?: boolean;
}

interface InteractiveRoom3DProps {
  roomDimensions?: { length: number; width: number; height: number };
  roomTitle?: string;
  scanImage?: string | null;
  detectedObjects?: any[];
  activePlan?: RecommendationPlan | null;
  customColors?: RoomColorPalette;
  customStyle?: DesignStyle | string;
  floorMaterial?: string;
  placedFurniture?: PlacedFurnitureItem[];
  selectedFurnitureId?: string | null;
  onSelectFurniture?: (id: string | null) => void;
  isCalibrated?: boolean;
  isExteriorElevation?: boolean;
}

const DEFAULT_COLORS: RoomColorPalette = {
  wall: '#F4EFEA',
  floor: '#C8B6A6',
  ceiling: '#FAF8F5',
  furniture: '#8D7B68',
  accent: '#A75D5D',
};

export const InteractiveRoom3D: React.FC<InteractiveRoom3DProps> = ({
  roomDimensions = { length: 4.8, width: 3.6, height: 2.8 },
  roomTitle = 'Living Room Design',
  scanImage = null,
  detectedObjects = [],
  activePlan = null,
  customColors = DEFAULT_COLORS,
  customStyle = 'modern',
  floorMaterial = 'light_oak',
  placedFurniture = [],
  selectedFurnitureId = null,
  onSelectFurniture,
  isCalibrated = true,
  isExteriorElevation = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // View Mode: Default to top-down 2D floor plan for consumer clarity
  const [viewMode, setViewMode] = useState<ViewMode>('top_down');
  const [showScanPreview, setShowScanPreview] = useState<boolean>(Boolean(scanImage));
  const [rotationX, setRotationX] = useState<number>(0.52); // Pitch (radians)
  const [rotationY, setRotationY] = useState<number>(0.68); // Yaw (radians)
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showClearance, setShowClearance] = useState<boolean>(true);

  const isDraggingRef = useRef<boolean>(false);
  const dragModeRef = useRef<'rotate' | 'pan'>('rotate');
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didDragRef = useRef<boolean>(false);

  const L = Math.max(2.0, roomDimensions.length || 4.8);
  const W = Math.max(2.0, roomDimensions.width || 3.6);
  const H = Math.max(2.0, roomDimensions.height || 2.8);
  const floorArea = (L * W).toFixed(1);

  // Build unified spatial items list from detected objects + customized placed furniture / active plan
  const spatialItems: SpatialObject3D[] = useMemo(() => {
    const items: SpatialObject3D[] = [];

    // 1. Existing CV-detected objects (from room scan)
    if (detectedObjects && detectedObjects.length > 0) {
      detectedObjects.forEach((obj, idx) => {
        const s3d = obj.spatial_3d;
        items.push({
          id: `detected-${obj.id || idx}`,
          name: `Existing ${(obj.class_name || 'Object').replace(/_/g, ' ')}`,
          category: obj.category || 'furniture',
          x: s3d?.x_m ? Math.max(-W / 2 + 0.4, Math.min(W / 2 - 0.4, s3d.x_m)) : (idx % 2 === 0 ? -W * 0.25 : W * 0.25),
          y: s3d?.height_m ? s3d.height_m / 2 : 0.4,
          z: s3d?.z_m ? Math.max(0.5, Math.min(L - 0.5, s3d.z_m)) : (idx + 1) * (L * 0.3),
          width: s3d?.width_m || 0.9,
          height: s3d?.height_m || 0.75,
          depth: s3d?.depth_m || 0.8,
          rotationY: 0,
          scale: 1.0,
          color: '#E07A5F', // Distinct Terracotta for detected existing objects
          source: 'detected',
          confidence: obj.confidence,
          clearanceVerified: true,
        });
      });
    }

    // 2. Custom Placed Furniture (Prioritized)
    if (placedFurniture && placedFurniture.length > 0) {
      placedFurniture
        .filter((item) => item.isVisible !== false)
        .forEach((item, idx) => {
          const itemScale = item.scale || 1.0;
          const itemW = ((item.dimensions?.widthCm || 120) / 100) * itemScale;
          const itemH = ((item.dimensions?.heightCm || 80) / 100) * itemScale;
          const itemD = ((item.dimensions?.depthCm || 80) / 100) * itemScale;

          items.push({
            id: item.id,
            name: item.name,
            category: item.category,
            x: item.position?.x ?? 0,
            y: item.position?.y ?? itemH / 2,
            z: item.position?.z ?? Math.max(0.6, Math.min(L - 0.6, 1.2 + idx * 0.8)),
            width: itemW,
            height: itemH,
            depth: itemD,
            rotationY: item.rotationY || 0,
            scale: itemScale,
            color: item.customColor || customColors.furniture,
            source: item.isCustomAdded ? 'custom' : 'recommended',
            price: item.price || item.estimatedCost || 25000,
            clearanceVerified: true,
            isCustomAdded: item.isCustomAdded,
          });
        });
    } else if (activePlan?.items && activePlan.items.length > 0) {
      // 3. Fallback to active recommendation plan items if no custom placed list
      activePlan.items.forEach((item, idx) => {
        let posX = 0;
        let posZ = L * 0.45;
        let itemW = (item.dimensions?.widthCm || 120) / 100;
        let itemH = (item.dimensions?.heightCm || 80) / 100;
        let itemD = (item.dimensions?.depthCm || 80) / 100;

        if (item.category === 'seating' || item.name.toLowerCase().includes('sofa')) {
          posX = 0;
          posZ = L * 0.45;
          itemW = Math.min(W * 0.65, 2.2);
          itemD = 0.95;
          itemH = 0.82;
        } else if (item.category === 'tables' || item.name.toLowerCase().includes('coffee')) {
          posX = 0;
          posZ = L * 0.45 + 1.1;
          itemW = 1.1;
          itemD = 0.6;
          itemH = 0.42;
        } else if (item.category === 'storage' || item.name.toLowerCase().includes('tv') || item.name.toLowerCase().includes('media')) {
          posX = 0;
          posZ = 0.45;
          itemW = Math.min(W * 0.75, 1.8);
          itemD = 0.45;
          itemH = 0.55;
        } else {
          posX = (idx % 2 === 0 ? -1 : 1) * (W * 0.26);
          posZ = Math.min(L - 0.6, 1.2 + idx * 0.75);
        }

        items.push({
          id: item.id || `rec-${idx}`,
          name: item.name,
          category: item.category,
          x: posX,
          y: itemH / 2,
          z: posZ,
          width: itemW,
          height: itemH,
          depth: itemD,
          color: customColors.furniture,
          source: 'recommended',
          price: item.price || item.estimatedCost || 25000,
          clearanceVerified: true,
        });
      });
    }

    return items;
  }, [detectedObjects, placedFurniture, activePlan, customColors.furniture, L, W]);

  // Main Canvas Render Loop
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI scaling
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Warm background
    ctx.fillStyle = '#F7F5F0';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2 + panX;
    const cy = height / 2 + panY;
    const scale = Math.min(width / (W * 1.5), height / (L * 1.5)) * zoom;

    // 3D Point Projection Matrix
    const project = (x3d: number, y3d: number, z3d: number): { x: number; y: number; depth: number } => {
      if (viewMode === 'top_down') {
        const screenX = cx + x3d * scale;
        const screenY = cy + (z3d - L / 2) * scale;
        return { x: screenX, y: screenY, depth: y3d };
      } else if (viewMode === 'front_elevation') {
        const screenX = cx + x3d * scale;
        const screenY = cy - (y3d - H / 2) * scale;
        return { x: screenX, y: screenY, depth: z3d };
      } else if (viewMode === 'side_elevation') {
        const screenX = cx + (z3d - L / 2) * scale;
        const screenY = cy - (y3d - H / 2) * scale;
        return { x: screenX, y: screenY, depth: x3d };
      }

      // Standard Perspective Orbit Projection
      const centeredX = x3d;
      const centeredY = y3d - H / 2;
      const centeredZ = z3d - L / 2;

      // Yaw rotation (Y axis)
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const x1 = centeredX * cosY - centeredZ * sinY;
      const z1 = centeredX * sinY + centeredZ * cosY;

      // Pitch rotation (X axis)
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const y2 = centeredY * cosX - z1 * sinX;
      const z2 = centeredY * sinX + z1 * cosX;

      const cameraDistance = 8.5;
      const fov = 750;
      const factor = fov / (cameraDistance + z2);

      const screenX = cx + x1 * factor * (scale / 40);
      const screenY = cy - y2 * factor * (scale / 40) + 20;

      return { x: screenX, y: screenY, depth: z2 };
    };

    // ==========================================
    // 1. RENDER 2D FLOOR PLAN (TOP VIEW)
    // ==========================================
    if (viewMode === 'top_down') {
      const pTopLeft = project(-W / 2, 0, 0);
      const pTopRight = project(W / 2, 0, 0);
      const pBottomRight = project(W / 2, 0, L);
      const pBottomLeft = project(-W / 2, 0, L);

      const roomWidthPx = pTopRight.x - pTopLeft.x;
      const roomLengthPx = pBottomLeft.y - pTopLeft.y;

      // Draw Floor Surface with Custom Floor Color & Material Pattern
      ctx.save();
      ctx.fillStyle = customColors.floor || '#C8B6A6';
      ctx.fillRect(pTopLeft.x, pTopLeft.y, roomWidthPx, roomLengthPx);

      // Floor Material Patterns (Wood Planks, Marble Veining, Tiles, Herringbone, Concrete)
      if (showGrid) {
        ctx.strokeStyle = '#00000018';
        ctx.lineWidth = 1;

        if (floorMaterial === 'carrara_marble') {
          // Subtle diagonal marble veins
          ctx.strokeStyle = '#FFFFFF40';
          ctx.lineWidth = 2;
          for (let offset = -roomLengthPx; offset <= roomWidthPx; offset += 55) {
            ctx.beginPath();
            ctx.moveTo(pTopLeft.x + offset, pTopLeft.y);
            ctx.lineTo(pTopLeft.x + offset + 70, pBottomLeft.y);
            ctx.stroke();
          }
        } else if (floorMaterial === 'terracotta_tile' || floorMaterial === 'slate_tile') {
          // Square Ceramic / Terracotta Tile Grid
          const tileSize = Math.max(28, scale * 0.6);
          for (let px = pTopLeft.x; px <= pTopRight.x; px += tileSize) {
            ctx.beginPath();
            ctx.moveTo(px, pTopLeft.y);
            ctx.lineTo(px, pBottomLeft.y);
            ctx.stroke();
          }
          for (let py = pTopLeft.y; py <= pBottomLeft.y; py += tileSize) {
            ctx.beginPath();
            ctx.moveTo(pTopLeft.x, py);
            ctx.lineTo(pTopRight.x, py);
            ctx.stroke();
          }
        } else if (floorMaterial === 'herringbone_oak') {
          // Herringbone Chevron Pattern
          const chevronW = Math.max(20, scale * 0.45);
          for (let py = pTopLeft.y; py <= pBottomLeft.y; py += 16) {
            for (let px = pTopLeft.x; px <= pTopRight.x; px += chevronW * 2) {
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px + chevronW, py + 8);
              ctx.lineTo(px + chevronW * 2, py);
              ctx.stroke();
            }
          }
        } else {
          // Standard Staggered Wood Planks
          const plankHeight = Math.max(16, scale * 0.35);
          for (let py = pTopLeft.y; py <= pBottomLeft.y; py += plankHeight) {
            ctx.beginPath();
            ctx.moveTo(pTopLeft.x, py);
            ctx.lineTo(pTopRight.x, py);
            ctx.stroke();
          }

          const plankWidth = Math.max(45, scale * 1.0);
          let rowIdx = 0;
          for (let py = pTopLeft.y; py <= pBottomLeft.y; py += plankHeight) {
            const offsetX = (rowIdx % 2) * (plankWidth / 2);
            for (let px = pTopLeft.x + offsetX; px <= pTopRight.x; px += plankWidth) {
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(px, Math.min(pBottomLeft.y, py + plankHeight));
              ctx.stroke();
            }
            rowIdx++;
          }
        }
      }
      ctx.restore();

      // Outer Wall Perimeter with Thickness
      const wallThick = Math.max(8, scale * 0.12);
      ctx.save();
      ctx.fillStyle = customColors.wall || '#F4EFEA';
      ctx.strokeStyle = '#2B2D42';
      ctx.lineWidth = 2;

      // Top Wall
      ctx.fillRect(pTopLeft.x - wallThick, pTopLeft.y - wallThick, roomWidthPx + wallThick * 2, wallThick);
      ctx.strokeRect(pTopLeft.x - wallThick, pTopLeft.y - wallThick, roomWidthPx + wallThick * 2, wallThick);

      // Bottom Wall (with Doorway Opening)
      const doorWidthPx = Math.max(35, scale * 0.9);
      const doorLeftPx = pBottomLeft.x + (roomWidthPx - doorWidthPx) / 2;

      ctx.fillRect(pBottomLeft.x - wallThick, pBottomLeft.y, (roomWidthPx - doorWidthPx) / 2 + wallThick, wallThick);
      ctx.strokeRect(pBottomLeft.x - wallThick, pBottomLeft.y, (roomWidthPx - doorWidthPx) / 2 + wallThick, wallThick);

      ctx.fillRect(doorLeftPx + doorWidthPx, pBottomLeft.y, (roomWidthPx - doorWidthPx) / 2 + wallThick, wallThick);
      ctx.strokeRect(doorLeftPx + doorWidthPx, pBottomLeft.y, (roomWidthPx - doorWidthPx) / 2 + wallThick, wallThick);

      // Door Swing Arc (Architectural Standard)
      ctx.beginPath();
      ctx.strokeStyle = '#2B6CB0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.arc(doorLeftPx, pBottomLeft.y, doorWidthPx, 0, Math.PI / 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 2.5;
      ctx.moveTo(doorLeftPx, pBottomLeft.y);
      ctx.lineTo(doorLeftPx + doorWidthPx * Math.cos(Math.PI / 3), pBottomLeft.y + doorWidthPx * Math.sin(Math.PI / 3));
      ctx.stroke();

      // Left Wall (with Window Marker)
      ctx.fillRect(pTopLeft.x - wallThick, pTopLeft.y, wallThick, roomLengthPx);
      ctx.strokeRect(pTopLeft.x - wallThick, pTopLeft.y, wallThick, roomLengthPx);

      // Window on Left Wall
      const winLengthPx = Math.max(40, scale * 1.2);
      const winTopPx = pTopLeft.y + (roomLengthPx - winLengthPx) / 2;
      ctx.fillStyle = '#BAE6FD';
      ctx.fillRect(pTopLeft.x - wallThick, winTopPx, wallThick, winLengthPx);
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pTopLeft.x - wallThick, winTopPx, wallThick, winLengthPx);

      // Right Wall
      ctx.fillStyle = customColors.wall || '#F4EFEA';
      ctx.fillRect(pTopRight.x, pTopLeft.y, wallThick, roomLengthPx);
      ctx.strokeStyle = '#2B2D42';
      ctx.lineWidth = 2;
      ctx.strokeRect(pTopRight.x, pTopLeft.y, wallThick, roomLengthPx);
      ctx.restore();

      // Dimension Annotations on Perimeter
      if (showLabels) {
        ctx.save();
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillStyle = '#4B5563';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`Width: ${W.toFixed(1)} m`, cx, pTopLeft.y - wallThick - 4);

        ctx.save();
        ctx.translate(pTopLeft.x - wallThick - 12, cy);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`Length: ${L.toFixed(1)} m`, 0, 0);
        ctx.restore();
        ctx.restore();
      }

      // Draw 2D Furniture Silhouettes
      spatialItems.forEach((item) => {
        const isSelected = selectedFurnitureId === item.id;
        const isDetected = item.source === 'detected';
        const isCustom = item.source === 'custom';

        const centerProj = project(item.x, 0, item.z);
        const itemWPx = item.width * scale;
        const itemDPx = item.depth * scale;

        ctx.save();
        ctx.translate(centerProj.x, centerProj.y);
        ctx.rotate(((item.rotationY || 0) * Math.PI) / 180);

        // Clearance Zone (Safety border around furniture)
        if (showClearance) {
          ctx.beginPath();
          ctx.strokeStyle = isSelected ? `${customColors.accent}99` : '#10B98144';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.rect(-itemWPx / 2 - 8, -itemDPx / 2 - 8, itemWPx + 16, itemDPx + 16);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Base Body Shape with Rounded Corners
        ctx.fillStyle = isSelected
          ? `${customColors.accent}DD`
          : isDetected
          ? '#E07A5FEE'
          : isCustom
          ? `${item.color || customColors.furniture}F0`
          : `${item.color || customColors.furniture}E6`;

        ctx.strokeStyle = isSelected ? '#1F1A18' : isDetected ? '#C84B31' : '#2B2D42';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        if (isDetected) ctx.setLineDash([4, 2]);

        ctx.beginPath();
        ctx.roundRect(-itemWPx / 2, -itemDPx / 2, itemWPx, itemDPx, 6);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);

        // Stylized 2D Interior Details by Category
        const cat = (item.category || item.name).toLowerCase();
        ctx.fillStyle = '#FFFFFF30';
        ctx.strokeStyle = '#00000030';
        ctx.lineWidth = 1;

        if (cat.includes('sofa') || cat.includes('seating') || cat.includes('chair')) {
          // Backrest cushion at top
          ctx.fillRect(-itemWPx / 2 + 4, -itemDPx / 2 + 3, itemWPx - 8, Math.max(6, itemDPx * 0.22));
          // Armrests
          ctx.fillRect(-itemWPx / 2 + 2, -itemDPx / 2 + 4, Math.max(5, itemWPx * 0.12), itemDPx - 8);
          ctx.fillRect(itemWPx / 2 - Math.max(5, itemWPx * 0.12) - 2, -itemDPx / 2 + 4, Math.max(5, itemWPx * 0.12), itemDPx - 8);
          // Cushion divider
          ctx.beginPath();
          ctx.moveTo(0, -itemDPx / 2 + Math.max(6, itemDPx * 0.22));
          ctx.lineTo(0, itemDPx / 2 - 3);
          ctx.stroke();
        } else if (cat.includes('bed')) {
          // Headboard
          ctx.fillStyle = '#00000035';
          ctx.fillRect(-itemWPx / 2 + 3, -itemDPx / 2 + 2, itemWPx - 6, Math.max(6, itemDPx * 0.15));
          // Two pillows
          ctx.fillStyle = '#FFFFFF80';
          const pW = (itemWPx - 18) / 2;
          const pH = Math.max(8, itemDPx * 0.22);
          ctx.fillRect(-itemWPx / 2 + 6, -itemDPx / 2 + Math.max(8, itemDPx * 0.18), pW, pH);
          ctx.fillRect(itemWPx / 2 - pW - 6, -itemDPx / 2 + Math.max(8, itemDPx * 0.18), pW, pH);
        } else if (cat.includes('table') || cat.includes('desk')) {
          // Beveled edge and table runner
          ctx.strokeRect(-itemWPx / 2 + 4, -itemDPx / 2 + 4, itemWPx - 8, itemDPx - 8);
        } else if (cat.includes('storage') || cat.includes('tv') || cat.includes('wardrobe')) {
          // Cabinet doors dividing lines
          ctx.beginPath();
          ctx.moveTo(-itemWPx / 6, -itemDPx / 2 + 2);
          ctx.lineTo(-itemWPx / 6, itemDPx / 2 - 2);
          ctx.moveTo(itemWPx / 6, -itemDPx / 2 + 2);
          ctx.lineTo(itemWPx / 6, itemDPx / 2 - 2);
          ctx.stroke();
        } else if (cat.includes('lamp')) {
          // Concentric illumination beacon
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(itemWPx, itemDPx) * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#FDE04780';
          ctx.fill();
        }

        // Selection Pulse Ring
        if (isSelected) {
          ctx.strokeStyle = customColors.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(itemWPx, itemDPx) * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();

        // 2D Item Label
        if (showLabels) {
          ctx.save();
          ctx.font = isSelected ? 'bold 11px system-ui, sans-serif' : '500 10px system-ui, sans-serif';
          const typeBadge = isDetected ? '[Existing Detected]' : isCustom ? '[User Added]' : '[Recommended]';
          const labelText = `${typeBadge} ${item.name}`;
          const textMetrics = ctx.measureText(labelText);

          ctx.fillStyle = isSelected
            ? '#1E293B'
            : isDetected
            ? '#9A3412'
            : '#0F172A';

          const labelY = centerProj.y + itemDPx / 2 + 14;
          ctx.beginPath();
          ctx.roundRect(
            centerProj.x - textMetrics.width / 2 - 6,
            labelY - 11,
            textMetrics.width + 12,
            18,
            4
          );
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, centerProj.x, labelY - 2);
          ctx.restore();
        }
      });

      return;
    }

    // ==========================================
    // 2. RENDER 3D PERSPECTIVE & ELEVATIONS
    // ==========================================
    const corners = [
      { x: -W / 2, y: 0, z: 0 },
      { x: W / 2, y: 0, z: 0 },
      { x: W / 2, y: 0, z: L },
      { x: -W / 2, y: 0, z: L },
      { x: -W / 2, y: H, z: 0 },
      { x: W / 2, y: H, z: 0 },
      { x: W / 2, y: H, z: L },
      { x: -W / 2, y: H, z: L },
    ];

    const projCorners = corners.map((c) => project(c.x, c.y, c.z));

    // Floor fill with custom floor color
    ctx.beginPath();
    ctx.fillStyle = `${customColors.floor || '#C8B6A6'}FA`;
    ctx.moveTo(projCorners[0].x, projCorners[0].y);
    ctx.lineTo(projCorners[1].x, projCorners[1].y);
    ctx.lineTo(projCorners[2].x, projCorners[2].y);
    ctx.lineTo(projCorners[3].x, projCorners[3].y);
    ctx.closePath();
    ctx.fill();

    // Floor Grid / Drafting Planks
    if (showGrid) {
      ctx.lineWidth = 1;
      const gridStepsX = Math.max(2, Math.round(W * 2));
      const gridStepsZ = Math.max(2, Math.round(L * 2));

      for (let i = 0; i <= gridStepsX; i++) {
        const gx = -W / 2 + (i / gridStepsX) * W;
        const p1 = project(gx, 0, 0);
        const p2 = project(gx, 0, L);
        ctx.beginPath();
        ctx.strokeStyle = i === 0 || i === gridStepsX ? `${customColors.accent}80` : '#00000015';
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      for (let j = 0; j <= gridStepsZ; j++) {
        const gz = (j / gridStepsZ) * L;
        const p1 = project(-W / 2, 0, gz);
        const p2 = project(W / 2, 0, gz);
        ctx.beginPath();
        ctx.strokeStyle = j === 0 || j === gridStepsZ ? `${customColors.accent}80` : '#00000015';
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // Back Wall (z = 0) with custom wall color
    ctx.beginPath();
    ctx.fillStyle = `${customColors.wall || '#F4EFEA'}F0`;
    ctx.moveTo(projCorners[0].x, projCorners[0].y);
    ctx.lineTo(projCorners[1].x, projCorners[1].y);
    ctx.lineTo(projCorners[5].x, projCorners[5].y);
    ctx.lineTo(projCorners[4].x, projCorners[4].y);
    ctx.closePath();
    ctx.fill();

    // Left Wall (x = -W/2) with slightly darker ambient depth
    ctx.beginPath();
    ctx.fillStyle = `${customColors.wall || '#F4EFEA'}D8`;
    ctx.moveTo(projCorners[0].x, projCorners[0].y);
    ctx.lineTo(projCorners[3].x, projCorners[3].y);
    ctx.lineTo(projCorners[7].x, projCorners[7].y);
    ctx.lineTo(projCorners[4].x, projCorners[4].y);
    ctx.closePath();
    ctx.fill();

    // Subtle Ceiling Boundary in custom ceiling color
    ctx.beginPath();
    ctx.strokeStyle = `${customColors.ceiling || '#FAF8F5'}AA`;
    ctx.lineWidth = 2;
    ctx.moveTo(projCorners[4].x, projCorners[4].y);
    ctx.lineTo(projCorners[5].x, projCorners[5].y);
    ctx.lineTo(projCorners[6].x, projCorners[6].y);
    ctx.lineTo(projCorners[7].x, projCorners[7].y);
    ctx.closePath();
    ctx.stroke();

    // Room Cage Wireframe Edges
    ctx.strokeStyle = customColors.accent || '#8D7B68';
    ctx.lineWidth = customStyle.toLowerCase() === 'industrial' ? 2 : 1.2;
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Floor perimeter
      [0, 4], [1, 5], [2, 6], [3, 7], // Vertical corner pillars
      [4, 5], [5, 6], [6, 7], [7, 4], // Ceiling perimeter
    ];
    edges.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(projCorners[i].x, projCorners[i].y);
      ctx.lineTo(projCorners[j].x, projCorners[j].y);
      ctx.stroke();
    });

    // Helper: Draw 3D Box / Sub-component
    const drawSubBox = (
      cx3d: number,
      cy3d: number,
      cz3d: number,
      bw: number,
      bh: number,
      bd: number,
      baseColor: string,
      rotYDeg: number = 0,
      isSelected: boolean = false,
      isDetected: boolean = false
    ) => {
      const hw = bw / 2;
      const hh = bh / 2;
      const hd = bd / 2;

      const rad = (rotYDeg * Math.PI) / 180;
      const cosR = Math.cos(rad);
      const sinR = Math.sin(rad);

      const rotateLocal = (lx: number, lz: number) => ({
        rx: lx * cosR - lz * sinR,
        rz: lx * sinR + lz * cosR,
      });

      const rawCorners = [
        { lx: -hw, ly: -hh, lz: -hd },
        { lx: hw, ly: -hh, lz: -hd },
        { lx: hw, ly: -hh, lz: hd },
        { lx: -hw, ly: -hh, lz: hd },
        { lx: -hw, ly: hh, lz: -hd },
        { lx: hw, ly: hh, lz: -hd },
        { lx: hw, ly: hh, lz: hd },
        { lx: -hw, ly: hh, lz: hd },
      ];

      const v = rawCorners.map((c) => {
        const rot = rotateLocal(c.lx, c.lz);
        return project(cx3d + rot.rx, cy3d + c.ly, cz3d + rot.rz);
      });

      // Top Face
      ctx.beginPath();
      ctx.fillStyle = isSelected ? `${customColors.accent}FF` : isDetected ? '#E07A5FFF' : `${baseColor}FF`;
      ctx.moveTo(v[4].x, v[4].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[7].x, v[7].y);
      ctx.closePath();
      ctx.fill();

      // Top Face Border
      ctx.strokeStyle = isSelected ? customColors.accent : isDetected ? '#C84B31' : '#1F1A18';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      if (isDetected) ctx.setLineDash([4, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Front Face
      ctx.beginPath();
      ctx.fillStyle = isSelected ? `${customColors.accent}EE` : isDetected ? '#E07A5FDD' : `${baseColor}EE`;
      ctx.moveTo(v[3].x, v[3].y);
      ctx.lineTo(v[2].x, v[2].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[7].x, v[7].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Side Face
      ctx.beginPath();
      ctx.fillStyle = isSelected ? `${customColors.accent}CC` : isDetected ? '#E07A5FAA' : `${baseColor}CC`;
      ctx.moveTo(v[1].x, v[1].y);
      ctx.lineTo(v[2].x, v[2].y);
      ctx.lineTo(v[6].x, v[6].y);
      ctx.lineTo(v[5].x, v[5].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      return v;
    };

    // Draw Stylized Recognizable 3D Furniture Shapes
    const drawFurniture3D = (item: SpatialObject3D) => {
      const isSelected = selectedFurnitureId === item.id;
      const isDetected = item.source === 'detected';
      const cat = (item.category || item.name).toLowerCase();
      const baseColor = item.color || customColors.furniture;
      const rot = item.rotationY || 0;

      // Drop shadow on floor under the furniture piece
      const shadowP1 = project(item.x - item.width / 2, 0, item.z - item.depth / 2);
      const shadowP2 = project(item.x + item.width / 2, 0, item.z - item.depth / 2);
      const shadowP3 = project(item.x + item.width / 2, 0, item.z + item.depth / 2);
      const shadowP4 = project(item.x - item.width / 2, 0, item.z + item.depth / 2);

      ctx.beginPath();
      ctx.fillStyle = '#00000020';
      ctx.moveTo(shadowP1.x, shadowP1.y);
      ctx.lineTo(shadowP2.x, shadowP2.y);
      ctx.lineTo(shadowP3.x, shadowP3.y);
      ctx.lineTo(shadowP4.x, shadowP4.y);
      ctx.closePath();
      ctx.fill();

      let topVertices: any[] = [];

      if (cat.includes('sofa') || cat.includes('seating') || cat.includes('couch')) {
        // 1. Sofa Seat Base
        drawSubBox(item.x, item.height * 0.25, item.z, item.width, item.height * 0.45, item.depth, baseColor, rot, isSelected, isDetected);
        // 2. Sofa Backrest
        topVertices = drawSubBox(
          item.x,
          item.height * 0.65,
          item.z - item.depth * 0.32,
          item.width,
          item.height * 0.55,
          item.depth * 0.28,
          baseColor,
          rot,
          isSelected,
          isDetected
        );
      } else if (cat.includes('table') || cat.includes('desk')) {
        // 1. Table Top Slab
        topVertices = drawSubBox(item.x, item.height - 0.04, item.z, item.width, 0.08, item.depth, baseColor, rot, isSelected, isDetected);
        // 2. 4 Table Legs
        const legW = 0.06;
        const legH = item.height - 0.08;
        const offX = item.width / 2 - 0.06;
        const offZ = item.depth / 2 - 0.06;
        drawSubBox(item.x - offX, legH / 2, item.z - offZ, legW, legH, legW, '#3E2723', rot, isSelected, isDetected);
        drawSubBox(item.x + offX, legH / 2, item.z - offZ, legW, legH, legW, '#3E2723', rot, isSelected, isDetected);
        drawSubBox(item.x + offX, legH / 2, item.z + offZ, legW, legH, legW, '#3E2723', rot, isSelected, isDetected);
        drawSubBox(item.x - offX, legH / 2, item.z + offZ, legW, legH, legW, '#3E2723', rot, isSelected, isDetected);
      } else if (cat.includes('bed')) {
        // 1. Bed Platform Base
        drawSubBox(item.x, item.height * 0.2, item.z, item.width, item.height * 0.35, item.depth, '#5D4037', rot, isSelected, isDetected);
        // 2. Thick Mattress
        drawSubBox(item.x, item.height * 0.45, item.z, item.width * 0.95, item.height * 0.3, item.depth * 0.95, '#F8FAFC', rot, isSelected, isDetected);
        // 3. Headboard
        topVertices = drawSubBox(
          item.x,
          item.height * 0.65,
          item.z - item.depth * 0.45,
          item.width,
          item.height * 0.7,
          0.12,
          baseColor,
          rot,
          isSelected,
          isDetected
        );
      } else if (cat.includes('lamp')) {
        // 1. Heavy Base
        drawSubBox(item.x, 0.04, item.z, 0.35, 0.08, 0.35, '#E5E7EB', rot, isSelected, isDetected);
        // 2. Brass Stem
        drawSubBox(item.x, item.height * 0.5, item.z, 0.04, item.height * 0.95, 0.04, '#D97706', rot, isSelected, isDetected);
        // 3. Lampshade
        topVertices = drawSubBox(item.x, item.height * 0.9, item.z, 0.45, 0.3, 0.45, '#FEF08A', rot, isSelected, isDetected);
      } else {
        // Default Cabinet / Credenza / Wardrobe / Other
        topVertices = drawSubBox(item.x, item.y, item.z, item.width, item.height, item.depth, baseColor, rot, isSelected, isDetected);
      }

      // Selection Ring
      if (isSelected && topVertices && topVertices.length >= 7) {
        ctx.strokeStyle = customColors.accent;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(topVertices[6].x, topVertices[6].y, 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3D Item Label
      if (showLabels && topVertices && topVertices.length >= 7) {
        const topCenter = topVertices[6];
        ctx.font = 'bold 11px system-ui, sans-serif';
        const typeTag = isDetected ? '[Existing]' : item.source === 'custom' ? '[Custom]' : '[Recommended]';
        const labelText = `${typeTag} ${item.name}`;
        const textMetrics = ctx.measureText(labelText);

        ctx.fillStyle = isSelected ? `${customColors.accent}F2` : isDetected ? '#9A3412F0' : '#1F1A18E6';
        ctx.beginPath();
        ctx.roundRect(
          topCenter.x - textMetrics.width / 2 - 6,
          topCenter.y - 24,
          textMetrics.width + 12,
          18,
          4
        );
        ctx.fill();

        ctx.fillStyle = '#FAF7F2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, topCenter.x, topCenter.y - 14);
      }
    };

    // Sort objects back-to-front by projected depth for correct occlusion
    const sortedItems = [...spatialItems].sort((a, b) => {
      const pa = project(a.x, a.y, a.z);
      const pb = project(b.x, b.y, b.z);
      return pb.depth - pa.depth;
    });

    sortedItems.forEach(drawFurniture3D);

    // Dimension indicators in perspective mode
    if (showLabels && viewMode === 'perspective') {
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#6E675F';

      const midBack = project(0, 0, 0);
      ctx.fillText(`Width: ${W.toFixed(1)}m`, midBack.x, midBack.y + 14);

      const midLeft = project(-W / 2, 0, L / 2);
      ctx.fillText(`Length: ${L.toFixed(1)}m`, midLeft.x - 24, midLeft.y + 10);

      const midHeight = project(-W / 2, H / 2, 0);
      ctx.fillText(`Height: ${H.toFixed(1)}m`, midHeight.x - 24, midHeight.y);
    }
  }, [
    viewMode,
    rotationX,
    rotationY,
    panX,
    panY,
    zoom,
    showGrid,
    showLabels,
    showClearance,
    spatialItems,
    selectedFurnitureId,
    customColors,
    customStyle,
    L,
    W,
    H,
  ]);

  useEffect(() => {
    renderScene();
  }, [renderScene]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => renderScene();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderScene]);

  // Mouse / Canvas Click & Drag Handling
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    dragModeRef.current = e.button === 2 || e.shiftKey ? 'pan' : 'rotate';
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      didDragRef.current = true;
    }

    if (dragModeRef.current === 'rotate' && viewMode === 'perspective') {
      setRotationY((prev) => prev + dx * 0.008);
      setRotationX((prev) => Math.max(0.1, Math.min(Math.PI / 2 - 0.1, prev + dy * 0.008)));
    } else {
      setPanX((prev) => prev + dx);
      setPanY((prev) => prev + dy);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;

    // Direct Click to select furniture piece
    if (!didDragRef.current && onSelectFurniture && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      const cx = width / 2 + panX;
      const cy = height / 2 + panY;
      const scale = Math.min(width / (W * 1.5), height / (L * 1.5)) * zoom;

      // Check proximity to items
      let clickedItem: SpatialObject3D | null = null;
      for (const item of spatialItems) {
        if (viewMode === 'top_down') {
          const itemScreenX = cx + item.x * scale;
          const itemScreenY = cy + (item.z - L / 2) * scale;
          const dist = Math.hypot(mouseX - itemScreenX, mouseY - itemScreenY);
          if (dist < Math.max(item.width, item.depth) * scale * 0.6) {
            clickedItem = item;
            break;
          }
        }
      }

      if (clickedItem) {
        onSelectFurniture(clickedItem.id === selectedFurnitureId ? null : clickedItem.id);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.5, Math.min(3.0, prev * zoomFactor)));
  };

  const handleResetCamera = () => {
    setRotationX(0.52);
    setRotationY(0.68);
    setPanX(0);
    setPanY(0);
    setZoom(1.0);
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `smartspace_room_plan_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-softBorder shadow-warm-lg space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-softBorder pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200 shadow-warm-xs">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900 tracking-tight">{roomTitle}</h3>
              <p className="text-[11px] text-charcoal-500 font-mono">
                {W.toFixed(1)}m (W) &times; {L.toFixed(1)}m (L) &times; {H.toFixed(1)}m (H) &bull; {floorArea} m&sup2; &bull; {customStyle.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF7F2] border border-softBorder text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setViewMode('top_down')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              viewMode === 'top_down'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D Floor Plan</span>
          </button>
          <button
            onClick={() => setViewMode('perspective')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              viewMode === 'perspective'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>3D Preview</span>
          </button>
          <button
            onClick={() => setViewMode('front_elevation')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              viewMode === 'front_elevation'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Front View</span>
          </button>
          <button
            onClick={() => setViewMode('side_elevation')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              viewMode === 'side_elevation'
                ? 'bg-terracotta-500 text-white shadow-terracotta'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side View</span>
          </button>

          {scanImage && (
            <button
              onClick={() => setShowScanPreview((p) => !p)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                showScanPreview
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showScanPreview ? 'Hide Scan' : 'View Scan'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-softBorder shadow-warm-inner bg-[#F7F5F0] aspect-[4/3] sm:aspect-[16/10] w-full">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* Floating "Original Scan Reference" Picture-in-Picture Panel */}
        {showScanPreview && scanImage && (
          <div className="absolute top-3 left-3 z-10 w-44 sm:w-52 rounded-2xl overflow-hidden bg-white/95 border border-softBorder shadow-2xl backdrop-blur-md p-2 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-terracotta-500" />
                <span>Based on your room scan</span>
              </span>
              <button
                onClick={() => setShowScanPreview(false)}
                className="text-charcoal-400 hover:text-charcoal-800 text-[11px] font-bold"
                title="Hide scan preview"
              >
                &times;
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-charcoal-900 border border-softBorder">
              <img
                src={scanImage}
                alt="Original Room Scan"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Viewport Floating Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.min(3.0, z * 1.2))}
            title="Zoom In"
            className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-charcoal-700 border border-softBorder shadow-warm-sm flex items-center justify-center transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z * 0.8))}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-charcoal-700 border border-softBorder shadow-warm-sm flex items-center justify-center transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Pan & Orbit"
            className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-charcoal-700 border border-softBorder shadow-warm-sm flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid((g) => !g)}
            title={showGrid ? 'Hide Floor Grid' : 'Show Floor Grid'}
            className={`w-8 h-8 rounded-xl border border-softBorder shadow-warm-sm flex items-center justify-center transition-all ${
              showGrid ? 'bg-terracotta-50 text-terracotta-600' : 'bg-white/90 text-charcoal-400'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLabels((l) => !l)}
            title={showLabels ? 'Hide Labels' : 'Show Labels'}
            className={`w-8 h-8 rounded-xl border border-softBorder shadow-warm-sm flex items-center justify-center transition-all ${
              showLabels ? 'bg-terracotta-50 text-terracotta-600' : 'bg-white/90 text-charcoal-400'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
          {viewMode === 'top_down' && (
            <button
              onClick={() => setShowClearance((c) => !c)}
              title={showClearance ? 'Hide Clearance Corridors' : 'Show Clearance Corridors'}
              className={`w-8 h-8 rounded-xl border border-softBorder shadow-warm-sm flex items-center justify-center transition-all ${
                showClearance ? 'bg-sage-50 text-sage-600' : 'bg-white/90 text-charcoal-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleExportImage}
            title="Download Plan Snapshot PNG"
            className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-charcoal-700 border border-softBorder shadow-warm-sm flex items-center justify-center transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Floating Info / Help Tip */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-charcoal-950/85 text-cream-100 text-[11px] font-medium backdrop-blur-md border border-white/10 shadow-warm-sm flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-terracotta-400 shrink-0" />
          <span>{viewMode === 'top_down' ? 'Tip: Drag furniture to move it. Use the controls to rotate or resize.' : 'Tip: Drag to orbit 3D view. Click any piece to inspect or customize.'}</span>
        </div>
      </div>
    </div>
  );
};
