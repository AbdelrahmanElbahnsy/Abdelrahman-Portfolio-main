import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirestoreSingleDoc } from '../cms/hooks/useFirestoreSingleDoc';

const AppearanceContext = createContext();

export const AppearanceProvider = ({ children }) => {
  const { data: appearanceSettings, subscribe: subscribeAppearance } = useFirestoreSingleDoc('settings', 'appearance');
  const { data: generalSettings, subscribe: subscribeGeneral } = useFirestoreSingleDoc('settings', 'general');
  
  const [activeSettings, setActiveSettings] = useState(() => {
    // Try to bootstrap from localStorage for FOUC prevention
    try {
      const cached = localStorage.getItem('portfolio-appearance-cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    const unsubscribeAppearance = subscribeAppearance();
    const unsubscribeGeneral = subscribeGeneral();
    return () => {
      if (unsubscribeAppearance) unsubscribeAppearance();
      if (unsubscribeGeneral) unsubscribeGeneral();
    };
  }, [subscribeAppearance, subscribeGeneral]);

  useEffect(() => {
    if (appearanceSettings || generalSettings) {
      const mergedSettings = { ...appearanceSettings };
      
      // Override theme with general settings if it exists
      if (generalSettings && generalSettings.theme) {
        mergedSettings.theme = generalSettings.theme;
      }

      setActiveSettings(mergedSettings);
      
      try {
        localStorage.setItem('portfolio-appearance-cache', JSON.stringify(mergedSettings));
      } catch(e) {}
      
      if (mergedSettings.language) {
        localStorage.setItem('portfolio-language', mergedSettings.language);
      }
    }
  }, [appearanceSettings, generalSettings]);

  return (
    <AppearanceContext.Provider value={{ activeSettings, setActiveSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};
