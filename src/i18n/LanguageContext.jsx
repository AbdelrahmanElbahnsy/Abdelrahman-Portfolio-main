import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTranslation } from './translations';
import { useAppearance } from '../context/AppearanceContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { activeSettings } = useAppearance();
  
  // Default to English, but if activeSettings is loading, we can check localStorage for FOUC
  const [language, setLanguage] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio-language');
      return cached === 'ar' ? 'ar' : 'en';
    } catch(e) {
      return 'en';
    }
  });

  useEffect(() => {
    if (activeSettings?.language) {
      setLanguage(activeSettings.language);
      document.documentElement.lang = activeSettings.language;
    }
  }, [activeSettings]);

  // We keep toggleLanguage for local override if necessary, but strictly AdminOS should change it.
  // Actually, toggleLanguage is no longer used in the public portfolio because there's no language switcher!
  // AdminOS handles language switching through Firestore.
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
