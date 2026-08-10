import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Check local storage for saved language
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    } else {
      // Default is en
      setLanguage('en');
      document.documentElement.lang = 'en';
    }
    // Structural layout MUST remain LTR to prevent breaking Swiper and positioning.
    document.documentElement.dir = 'ltr'; 
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('portfolio-language', newLanguage);
    document.documentElement.lang = newLanguage;
    // Structural layout MUST remain LTR to prevent breaking Swiper and positioning.
    document.documentElement.dir = 'ltr';
  };

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
