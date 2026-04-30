import React, { createContext, useContext, useMemo, useState } from "react";
import * as Localization from "expo-localization";
import { setI18nConfig, t } from "../localization/i18n";

const LanguageContext = createContext(null);

const normalizeLocale = (locale) => (locale === "hi" ? "hi" : "en");

const getInitialLanguage = () => {
  const deviceLocale = Localization.locale?.split("-")[0] || "en";
  return normalizeLocale(deviceLocale);
};

const initialLanguage = getInitialLanguage();
setI18nConfig(initialLanguage);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(initialLanguage);

  const setLanguage = (nextLanguage) => {
    const normalized = normalizeLocale(nextLanguage);
    setI18nConfig(normalized);
    setLanguageState(normalized);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
