import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const applyLanguage = () => {
      const savedLanguage = localStorage.getItem('portfolio-language');
      if (savedLanguage === 'ar' || savedLanguage === 'en') {
        setLanguage(savedLanguage);
        document.documentElement.lang = savedLanguage;
      } else {
        // Default is en
        setLanguage('en');
        document.documentElement.lang = 'en';
      }
      
      // Update .portfolio-theme-root dir instead of global html to isolate RTL
      const root = document.documentElement;
      // Note: In React, we rely on setting standard DOM properties on elements that aren't managed by React
      // Here, we update the global language. RTL will be handled in CSS using `:lang(ar)` where needed, 
      // or we can explicitly set dir="rtl" on specific containers.
    };

    applyLanguage();

    // Listen for global appearance context changes
    window.addEventListener('portfolio-language-updated', applyLanguage);
    return () => window.removeEventListener('portfolio-language-updated', applyLanguage);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('portfolio-language', newLanguage);
    document.documentElement.lang = newLanguage;
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
