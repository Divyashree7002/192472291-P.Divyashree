import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { preferenceService, DEFAULT_PREFERENCES } from '../services/preferenceService';
import { useToast } from './ToastContext';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  savePreferences: (newPrefs: UserPreferences) => void;
  resetPreferences: () => void;
  isLoading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      const loaded = preferenceService.getPreferences();
      setPreferences(loaded);
    } catch (e) {
      console.error('Failed to load user preferences:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const savePreferences = (newPrefs: UserPreferences) => {
    try {
      const saved = preferenceService.savePreferences(newPrefs);
      setPreferences(saved);
      addToast({
        title: 'Preferences Saved',
        description: 'Your design and lifestyle preferences have been stored locally.',
        type: 'success',
      });
    } catch (e) {
      addToast({
        title: 'Failed to Save',
        description: 'Could not store preferences. Please check your storage settings.',
        type: 'error',
      });
    }
  };

  const resetPreferences = () => {
    const reset = preferenceService.resetPreferences();
    setPreferences(reset);
    addToast({
      title: 'Preferences Reset',
      description: 'Default design profile restored.',
      type: 'info',
    });
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        savePreferences,
        resetPreferences,
        isLoading,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
