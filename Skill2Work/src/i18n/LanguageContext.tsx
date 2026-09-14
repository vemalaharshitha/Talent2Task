import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../types';
import { TRANSLATIONS, localizeContent } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['en'];
  localize: (text: string | undefined | null) => string;
  translationVersion: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('talent2task_lang');
    return (saved as Language) || 'en';
  });
  const [translationVersion, setTranslationVersion] = useState<number>(0);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('talent2task_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Listen to background Gemini translation arrivals to immediately re-render live UI
  useEffect(() => {
    let timer: any = null;
    const handleTranslationUpdate = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setTranslationVersion(v => v + 1);
      }, 50);
    };

    window.addEventListener('talent2task_translation_updated', handleTranslationUpdate);
    return () => {
      window.removeEventListener('talent2task_translation_updated', handleTranslationUpdate);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const localize = (text: string | undefined | null) => localizeContent(text, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localize, translationVersion }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
