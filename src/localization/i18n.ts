import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "./translations/en.json";
import hi from "./translations/hi.json";

const i18n = new I18n({ en, hi });

i18n.enableFallback = true;

i18n.defaultLocale = "en";

i18n.locale = Localization.getLocales()[0]?.languageCode ?? "en";

export const setI18nConfig = (locale: string): void => {
  i18n.locale = locale;
};

export const t = (scope: string, options?: any): string =>
  i18n.t(scope, options);

export default i18n;
