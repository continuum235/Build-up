import React, { createContext, useContext, useMemo, useState, ReactNode } from "react";
import * as Localization from "expo-localization";
import { setI18nConfig, t } from "../localization/i18n";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const normalizeLocale = (locale: string): string => (locale === "hi" ? "hi" : "en");

const getInitialLanguage = (): string => {
  const deviceLocale = Localization.locale?.split("-")[0] || "en";
  return normalizeLocale(deviceLocale);
};

const initialLanguage = getInitialLanguage();
setI18nConfig(initialLanguage);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(initialLanguage);

  const setLanguage = (nextLanguage: string) => {
    const normalized = normalizeLocale(nextLanguage);
    setI18nConfig(normalized);
    setLanguageState(normalized);
  };

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
