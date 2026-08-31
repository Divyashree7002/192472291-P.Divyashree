import { UserPreferences } from '../types';

const PREFERENCES_STORAGE_KEY = 'smartspace_user_preferences_v3';

export const DEFAULT_PREFERENCES: UserPreferences = {
  designGoal: 'my_home',
  spaceUsers: ['family', 'children'],
  preferredStyles: ['modern', 'minimalist', 'scandinavian'],
  preferredColors: ['#FAF8F5', '#F4EFEA', '#C86D51', '#607B66', '#D4A373', '#2C2523'],
  budget: {
    min: 100000,
    max: 500000,
    currency: 'INR',
    flexibility: 'moderate',
  },
  lifestyle: {
    workFromHome: true,
    entertaining: true,
    relaxation: true,
    familyLiving: true,
    studyFocused: false,
    storageFocused: true,
    hasPets: false,
    hasKids: true,
  },
  preferredRoomTypes: ['living_room', 'home_office'],
  storagePreference: 'balanced',
  maintenanceLevel: 'moderate',
  spacePriorities: ['comfort', 'functionality', 'open_space'],
  accessibility: ['standard', 'child_friendly'],
  preservedFurniture: [
    {
      id: 'pf-1',
      name: 'Solid Walnut Dining Table',
      category: 'tables',
      dimensions: '180 × 90 cm',
      notes: 'Heirloom piece to keep in central dining area',
    },
  ],
  exteriorElevation: {
    buildingType: 'Residential Villa',
    floors: 2,
    preferredStyle: 'Modern Contemporary',
    materialPreference: 'Natural Travertine & Teak',
    budget: 2500000,
  },
};

/**
 * Service to manage User Preferences.
 * Backed by LocalStorage for Phase 1.
 * Ready to connect to FastAPI `/api/v1/user/preferences` in future phases.
 */
export const preferenceService = {
  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_PREFERENCES;
      }
      const parsed = JSON.parse(stored);
      // Migrate older USD values to native INR if needed
      const budget = {
        ...DEFAULT_PREFERENCES.budget,
        ...(parsed.budget || {}),
        currency: 'INR',
      };
      if (budget.max < 50000) {
        budget.min = 100000;
        budget.max = 500000;
      }
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        budget,
        lifestyle: { ...DEFAULT_PREFERENCES.lifestyle, ...(parsed.lifestyle || {}) },
      };
    } catch (error) {
      console.warn('Failed to load user preferences from localStorage:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(preferences: UserPreferences): UserPreferences {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
      // TODO: Future FastAPI integration:
      // await apiClient.put('/api/v1/user/preferences', preferences);
      return preferences;
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
      throw error;
    }
  },

  resetPreferences(): UserPreferences {
    try {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      return DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },
};
