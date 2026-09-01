import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation } from './translations';
import { useAppearance } from '../context/AppearanceContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { activeSettings } = useAppearance();
  
  // Try to bootstrap from localStorage for FOUC if activeSettings isn't ready
  const language = activeSettings?.language || (() => {
    try {
      const cached = localStorage.getItem('portfolio-language');
      return cached === 'ar' ? 'ar' : 'en';
    } catch(e) {
      return 'en';
    }
  })();

  // AdminOS handles language switching through Firestore, so no manual toggle here.
  const toggleLanguage = () => {};

  const t = (key) => getTranslation(key, language);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
