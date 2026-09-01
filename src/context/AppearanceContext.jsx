import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirestoreSingleDoc } from '../cms/hooks/useFirestoreSingleDoc';

const AppearanceContext = createContext();

export const AppearanceProvider = ({ children }) => {
  const { data: appearanceSettings, subscribe } = useFirestoreSingleDoc('settings', 'appearance');
  
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
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  useEffect(() => {
    if (appearanceSettings) {
      setActiveSettings(appearanceSettings);
      
      try {
        localStorage.setItem('portfolio-appearance-cache', JSON.stringify(appearanceSettings));
      } catch(e) {}
      
      // We still update language cache for LanguageContext if it needs it independently, 
      // though LanguageContext should ideally also consume from AppearanceContext directly.
      if (appearanceSettings.language) {
        localStorage.setItem('portfolio-language', appearanceSettings.language);
      }
    }
  }, [appearanceSettings]);

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
