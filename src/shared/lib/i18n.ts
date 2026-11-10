import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import en from "@/shared/i18n/en.json";
import ro from "@/shared/i18n/ro.json";

const SUPPORTED_LANGUAGES = ["en", "ro"] as const;
const FALLBACK_LANGUAGE = "en";

function detectLanguage(): string {
  const code = getLocales()[0]?.languageCode;
  return code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code) ? code : FALLBACK_LANGUAGE;
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ro: { translation: ro },
  },
  lng: detectLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };
