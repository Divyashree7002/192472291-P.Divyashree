export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'dining_room'
  | 'office'
  | 'bathroom'
  | 'studio'
  | 'balcony'
  | 'kids_room'
  | 'exterior_elevation'
  | 'hallway'
  | 'study_room'
  | 'home_office';

export type DesignStyle =
  | 'modern'
  | 'minimalist'
  | 'scandinavian'
  | 'industrial'
  | 'bohemian'
  | 'traditional'
  | 'contemporary'
  | 'mid_century'
  | 'japandi'
  | 'luxury'
  | 'modern_minimalist';

export type DesignGoal =
  | 'maximize_space'
  | 'increase_storage'
  | 'improve_lighting'
  | 'aesthetic_upgrade'
  | 'budget_redesign'
  | 'exterior_elevation'
  | 'work_from_home'
  | 'my_home'
  | 'new_apartment'
  | 'rental_property'
  | 'interior_design_project'
  | 'building_elevation'
  | 'furniture_planning'
  | 'property_visualization';

export type SpaceUser =
  | 'single_adult'
  | 'couple'
  | 'family_with_kids'
  | 'pets_present'
  | 'elderly'
  | 'shared_flat'
  | 'individual'
  | 'family'
  | 'children'
  | 'accessibility_focused'
  | 'pet_owner';

export type StoragePreference =
  | 'minimal'
  | 'moderate'
  | 'maximum_concealed'
  | 'open_display'
  | 'balanced';

export type MaintenanceLevel = 'low' | 'moderate' | 'high';

export type SpacePriority =
  | 'pathway_clearance'
  | 'natural_light'
  | 'maximum_seating'
  | 'large_workstation'
  | 'cozy_ambience'
  | 'open_space'
  | 'storage'
  | 'comfort'
  | 'aesthetics'
  | 'functionality';

export type AccessibilityRequirement =
  | 'wide_doorways'
  | 'low_reach_storage'
  | 'slip_resistant_flooring'
  | 'high_contrast_edges'
  | 'zero_threshold'
  | 'standard'
  | 'elderly_friendly'
  | 'wheelchair_friendly'
  | 'child_friendly'
  | 'pet_friendly';

export interface PreservedFurnitureItem {
  id: string;
  name: string;
  category: string;
  dimensions?: string;
  notes?: string;
}

export interface BuildingElevationSpec {
  buildingType: string;
  floors: number;
  preferredStyle: string;
  materialPreference: string;
  budget: number;
}

export interface UserPreferences {
  designGoal: DesignGoal;
  spaceUsers: SpaceUser[];
  preferredStyles: DesignStyle[];
  preferredColors: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
    flexibility: 'strict' | 'moderate' | 'flexible';
  };
  lifestyle: {
    workFromHome: boolean;
    entertaining: boolean;
    relaxation: boolean;
    familyLiving: boolean;
    studyFocused: boolean;
    storageFocused: boolean;
    hasPets?: boolean;
    hasKids?: boolean;
  };
  preferredRoomTypes: RoomType[];
  storagePreference: StoragePreference;
  maintenanceLevel: MaintenanceLevel;
  spacePriorities: SpacePriority[];
  accessibility: AccessibilityRequirement[];
  preservedFurniture: PreservedFurnitureItem[];
  exteriorElevation?: BuildingElevationSpec;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'seating' | 'tables' | 'storage' | 'lighting' | 'decor' | 'beds' | string;
  dimensions?: {
    widthCm?: number;
    depthCm?: number;
    heightCm?: number;
    length?: number;
    width?: number;
    height?: number;
    footprint_sqm?: number;
  };
  estimatedCost?: number;
  price?: number;
  material?: string;
  materials?: string[];
  colors?: string[];
  clearanceVerified?: boolean;
  modelPlaceholderUrl?: string;
  description?: string;
  recommended_position?: string;
}

export interface ConstraintValidation {
  ruleName: string;
  category: 'spatial_clearance' | 'circulation' | 'door_swing' | 'light_path' | 'budget_ceiling' | string;
  status: 'passed' | 'warning' | 'failed' | 'placeholder_pending_cv' | string;
  message: string;
  metricValue?: string;
}

export interface RecommendationScores {
  spaceCompatibility: number; // 0-100
  styleCompatibility: number; // 0-100
  storageScore: number;       // 0-100
  lightingScore: number;      // 0-100
  overallScore: number;       // 0-100
}

export interface ExplainabilityData {
  primaryRationale: string;
  spatialReasoning: string[];
  styleMatchingFactors: string[];
  budgetOptimizationNote: string;
  tradeOffConsiderations: string[];
  lightingNotes?: string;
  lifestyleNotes?: string;
  accessibilityNotes?: string;
}

export interface RecommendationPlan {
  id: string;
  title: string;
  designStyle: string;
  roomType: string;
  matchScore: number;
  scores: RecommendationScores;
  estimatedCost: number;
  currency: string;
  createdAt: string;
  isPlaceholder: boolean;
  constraints: ConstraintValidation[];
  items: FurnitureItem[];
  explainability: ExplainabilityData;
}

export interface ProjectDimensions {
  length: number; // in meters
  width: number;  // in meters
  height: number; // in meters
  unit: 'metric' | 'imperial';
  isEstimated?: boolean;
  confidence?: number;
}

export interface ProjectSpatialData {
  depthVisualization?: string;
  planesCount?: number;
  objectsCount?: number;
  floorAreaSqm?: number;
  volumeM3?: number;
  scaleConfidence?: number;
  isEstimated?: boolean;
  dominantWallColor?: string;
  dominantFloorColor?: string;
}

export type ScanMode = 'quick' | 'detailed';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';
export type MaterialFinish = 'matte' | 'semi_gloss' | 'gloss';
export type FitCheckResult = 'green' | 'yellow' | 'red';

export interface SurfaceCustomization {
  color: string;
  material?: string;
  finish?: MaterialFinish;
}

export interface RoomColorPalette {
  wall: string;       // Hex string, e.g. '#F4EFEA'
  floor: string;      // Hex string, e.g. '#C8B6A6'
  ceiling: string;    // Hex string, e.g. '#FAF8F5'
  door?: string;      // Hex string, e.g. '#6C5B4C'
  windowFrame?: string;// Hex string, e.g. '#3A3A3A'
  furniture: string;  // Hex string, e.g. '#8D7B68'
  cabinet?: string;   // Hex string, e.g. '#5C5449'
  accent: string;     // Hex string, e.g. '#A75D5D'
  wood?: string;
  metal?: string;
  fabric?: string;
}

export interface PlacedFurnitureItem extends FurnitureItem {
  position?: { x: number; y: number; z: number };
  rotationY?: number; // In degrees: 0, 90, 180, 270 or continuous
  scale?: number;     // Multiplier, default 1.0
  isVisible?: boolean;
  isCustomAdded?: boolean;
  customColor?: string;
  customWoodColor?: string;
  customMetalColor?: string;
  customFabricColor?: string;
  confidence?: number;
  confidenceLevel?: ConfidenceLevel;
  source?: 'detected' | 'recommended' | 'custom';
}

export interface RenovationItem {
  category: string;
  description: string;
  quantity: string;
  estimatedCostInr: number;
}

export interface RenovationPlan {
  floorAreaSqm: number;
  wallAreaSqm: number;
  ceilingAreaSqm: number;
  paintRequiredLiters: number;
  flooringRequiredSqm: number;
  baseboardLengthM: number;
  items: RenovationItem[];
  totalEstimatedCostInr: number;
}

export interface DesignCustomizationState {
  scanImage?: string | null;
  scanMode?: ScanMode;
  roomType?: RoomType | string;
  customRoomType?: string;
  style: DesignStyle | string;
  dimensions?: ProjectDimensions;
  userCalibrationLength?: number;
  colors: RoomColorPalette;
  floorMaterial?: string;
  floorFinish?: MaterialFinish;
  doorMaterial?: string;
  placedFurniture: PlacedFurnitureItem[];
  selectedItemId?: string | null;
  budget: number;
  viewMode?: 'top_down' | 'perspective' | 'front_elevation' | 'side_elevation';
  aiRoomInsights?: string[];
  ignoredSummary?: any;
}

export interface HomeRoomProject {
  id: string;
  name: string;
  roomType: RoomType | string;
  dimensions: ProjectDimensions;
  budget: number;
  status: string;
}

export interface Project {
  id: string;
  title: string;
  roomType: RoomType;
  designStyle: DesignStyle;
  dimensions: ProjectDimensions;
  budgetAllocated: number;
  budgetSpent: number;
  currency: string;
  status: 'draft' | 'analyzed' | 'in_progress' | 'completed' | 'scanned' | 'rendered';
  recommendationsCount: number;
  notes?: string;
  scanImage?: string | null;
  scanMode?: ScanMode;
  detectedObjects?: any[];
  ignoredSummary?: any;
  aiRoomInsights?: string[];
  roomStructure?: any;
  spatialData?: ProjectSpatialData;
  designPlan?: RecommendationPlan;
  activePlan?: RecommendationPlan;
  designCustomization?: DesignCustomizationState;
  renovationPlan?: RenovationPlan;
  homeRooms?: HomeRoomProject[];
  createdAt: string;
  updatedAt: string;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}


