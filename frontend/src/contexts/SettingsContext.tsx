import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppSettings } from '../hooks/useAppSettings';

type SettingsContextType = ReturnType<typeof useAppSettings>;

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const settings = useAppSettings();

  const value = useMemo(() => settings, [
    settings.theme,
    settings.bgImage,
    settings.isBgLoading,
    settings.bgOpacity,
    settings.bgBlur,
    settings.spotlightType,
    settings.autoTrash,
    settings.handleThemeChange,
    settings.handleBgImageChange,
    settings.handleBgOpacityChange,
    settings.handleBgBlurChange,
    settings.handleSpotlightTypeChange,
    settings.handleAutoTrashChange
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
