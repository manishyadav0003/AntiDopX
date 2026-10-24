import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { en, type TranslationKeys } from './translations/en';
import { hi } from './translations/hi';

export type SupportedLanguage = 'en' | 'hi';

type LocalizationContextType = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: TranslationKeys;
  isReady: boolean;
};

const LANGUAGE_STORAGE_KEY = '@antidopx_selected_language';

const translations: Record<SupportedLanguage, TranslationKeys> = {
  en,
  hi,
};

const LocalizationContext = createContext<LocalizationContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: en,
  isReady: false,
});

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === 'en' || saved === 'hi') {
          setLanguageState(saved);
        }
      } catch {
        // Fallback to English
      } finally {
        setIsReady(true);
      }
    };

    void loadSavedLanguage();
  }, []);

  const setLanguage = async (newLang: SupportedLanguage) => {
    try {
      setLanguageState(newLang);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {
      // Ignore storage errors
    }
  };

  const t = translations[language] || en;

  return (
    <LocalizationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isReady,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = () => useContext(LocalizationContext);
