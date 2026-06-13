import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sessionAPI } from './api';
import { formatTranslation, translations } from './i18n';
import { LocaleCode } from './types';

interface LocaleContextType {
  locale: LocaleCode;
  bannerVisible: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  chooseLocale: (locale: LocaleCode) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<LocaleCode>('ru');
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLocale = async () => {
      try {
        const response = await sessionAPI.getLocale();
        const nextLocale = response.data.locale || response.data.suggestedLocale || 'ru';

        if (mounted) {
          setLocale(nextLocale);
          setBannerVisible(!response.data.locale);
        }
      } catch {
        if (mounted) {
          const fallbackLocale = navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
          setLocale(fallbackLocale);
          setBannerVisible(true);
        }
      }
    };

    void loadLocale();

    return () => {
      mounted = false;
    };
  }, []);

  const chooseLocale = useCallback(async (nextLocale: LocaleCode) => {
    setLocale(nextLocale);
    setBannerVisible(false);
    await sessionAPI.setLocale(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      const template = translations[locale][key] || translations.ru[key] || key;
      return formatTranslation(template, values);
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, bannerVisible, t, chooseLocale }),
    [locale, bannerVisible, t, chooseLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
};
