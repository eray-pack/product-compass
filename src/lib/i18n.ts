import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import nl from "../locales/nl.json";
import fr from "../locales/fr.json";
import es from "../locales/es.json";

const LANG_KEY = "stopamine.lang";

function getInitialLang(): string {
  if (typeof localStorage === "undefined") return "en";
  return localStorage.getItem(LANG_KEY) ?? "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    nl: { translation: nl },
    fr: { translation: fr },
    es: { translation: es },
  },
  lng: getInitialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  // No suspense — synchronous init so SSR and client both work without flicker
  react: { useSuspense: false },
});

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LANG_KEY, lang);
  }
}

export default i18n;
