import React, { createContext, useContext } from 'react';
import { getTranslation } from './translations';
import { useVisitorPreferences } from '../context/VisitorPreferencesContext';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { effectiveLanguage, toggleVisitorLanguage } = useVisitorPreferences();
  
  const language = effectiveLanguage;
  const toggleLanguage = toggleVisitorLanguage;

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
