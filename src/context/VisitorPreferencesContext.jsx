import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppearance } from './AppearanceContext';

const VisitorPreferencesContext = createContext();

// Helper to generate deterministic fingerprints
const generateThemeFingerprint = (settings) => {
  if (!settings) return '';
  return JSON.stringify({
    theme: settings.theme,
    primaryColor: settings.primaryColor,
    backgroundColor: settings.backgroundColor,
    surfaceColor: settings.surfaceColor,
    textColor: settings.textColor
  });
};

const generateLanguageFingerprint = (settings) => {
  if (!settings) return '';
  return settings.language || 'en';
};

export const VisitorPreferencesProvider = ({ children }) => {
  const { activeSettings } = useAppearance();

  // Load initial preferences from localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem('visitor-preferences');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { theme: null, language: null, themeFingerprint: null, languageFingerprint: null };
  });

  // Reconcile and invalidate stale preferences when canonical activeSettings change
  useEffect(() => {
    if (!activeSettings) return;

    let updated = false;
    const currentThemeFingerprint = generateThemeFingerprint(activeSettings);
    const currentLanguageFingerprint = generateLanguageFingerprint(activeSettings);

    const newPreferences = { ...preferences };

    // Check if the stored theme preference is stale
    if (newPreferences.theme && newPreferences.themeFingerprint !== currentThemeFingerprint) {
      newPreferences.theme = null;
      newPreferences.themeFingerprint = null;
      updated = true;
    }

    // Check if the stored language preference is stale
    if (newPreferences.language && newPreferences.languageFingerprint !== currentLanguageFingerprint) {
      newPreferences.language = null;
      newPreferences.languageFingerprint = null;
      updated = true;
    }

    if (updated) {
      setPreferences(newPreferences);
      try {
        localStorage.setItem('visitor-preferences', JSON.stringify(newPreferences));
      } catch (e) {}
    }
  }, [activeSettings, preferences]);

  // Compute the EFFECTIVE state
  const effectiveTheme = preferences.theme || activeSettings?.theme || 'dark';
  const effectiveLanguage = preferences.language || activeSettings?.language || 'en';

  const toggleVisitorTheme = () => {
    if (!activeSettings) return;
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    const currentThemeFingerprint = generateThemeFingerprint(activeSettings);
    
    const newPreferences = {
      ...preferences,
      theme: newTheme,
      themeFingerprint: currentThemeFingerprint
    };
    
    setPreferences(newPreferences);
    try {
      localStorage.setItem('visitor-preferences', JSON.stringify(newPreferences));
    } catch (e) {}
  };

  const toggleVisitorLanguage = () => {
    if (!activeSettings) return;
    const newLanguage = effectiveLanguage === 'en' ? 'ar' : 'en';
    const currentLanguageFingerprint = generateLanguageFingerprint(activeSettings);
    
    const newPreferences = {
      ...preferences,
      language: newLanguage,
      languageFingerprint: currentLanguageFingerprint
    };
    
    setPreferences(newPreferences);
    try {
      localStorage.setItem('visitor-preferences', JSON.stringify(newPreferences));
    } catch (e) {}
  };

  return (
    <VisitorPreferencesContext.Provider value={{
      effectiveTheme,
      effectiveLanguage,
      toggleVisitorTheme,
      toggleVisitorLanguage,
      visitorPreferences: preferences
    }}>
      {children}
    </VisitorPreferencesContext.Provider>
  );
};

export const useVisitorPreferences = () => {
  const context = useContext(VisitorPreferencesContext);
  if (context === undefined) {
    throw new Error('useVisitorPreferences must be used within a VisitorPreferencesProvider');
  }
  return context;
};
