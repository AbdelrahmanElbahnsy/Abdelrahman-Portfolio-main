import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirestoreSingleDoc } from '../cms/hooks/useFirestoreSingleDoc';

const AppearanceContext = createContext();

export const AppearanceProvider = ({ children }) => {
  const { data: appearanceSettings, subscribe } = useFirestoreSingleDoc('settings', 'appearance');
  
  const [activeSettings, setActiveSettings] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  useEffect(() => {
    if (appearanceSettings) {
      setActiveSettings(appearanceSettings);
      
      // Update LanguageContext based on global settings if present
      if (appearanceSettings.language) {
        localStorage.setItem('portfolio-language', appearanceSettings.language);
        // We let LanguageContext handle the actual translation via a window event or direct update
        window.dispatchEvent(new Event('portfolio-language-updated'));
      }
    }
  }, [appearanceSettings]);

  useEffect(() => {
    if (!activeSettings) return;

    const root = document.documentElement;

    if (activeSettings.primaryColor) {
      root.style.setProperty('--portfolio-primary', activeSettings.primaryColor);
    } else {
      root.style.removeProperty('--portfolio-primary');
    }

    if (activeSettings.backgroundColor) {
      root.style.setProperty('--portfolio-background', activeSettings.backgroundColor);
    } else {
      root.style.removeProperty('--portfolio-background');
    }

    if (activeSettings.surfaceColor) {
      root.style.setProperty('--portfolio-surface', activeSettings.surfaceColor);
    } else {
      root.style.removeProperty('--portfolio-surface');
    }

    if (activeSettings.textColor) {
      root.style.setProperty('--portfolio-text', activeSettings.textColor);
    } else {
      root.style.removeProperty('--portfolio-text');
    }
    
    if (activeSettings.theme === 'light') {
      root.classList.add('portfolio-light-mode');
    } else {
      root.classList.remove('portfolio-light-mode');
    }

  }, [activeSettings]);

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
