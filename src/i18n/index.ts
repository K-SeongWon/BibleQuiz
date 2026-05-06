import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ko: { translation: ko } },
    fallbackLng: "ko",
    supportedLngs: ["ko"],
    interpolation: { escapeValue: false },
  });

export default i18n;
