import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from '../public/locales/en/common.json';
import ru from '../public/locales/ru/common.json';
import es from '../public/locales/es/common.json';
import fr from '../public/locales/fr/common.json';
import de from '../public/locales/de/common.json';
import it from '../public/locales/it/common.json';
import pt from '../public/locales/pt/common.json';
import zh from '../public/locales/zh/common.json';
import ja from '../public/locales/ja/common.json';
import ko from '../public/locales/ko/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      pt: { translation: pt },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
    },
    fallbackLng: 'en', // Язык по умолчанию, если ничего не найдено
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'], // Приоритет источников языка
      lookupCookie: 'lang', // Название куки для определения языка
      lookupLocalStorage: 'i18nextLng', // Ключ в localStorage для языка (по умолчанию)
      caches: ['cookie'], // Куда сохранять язык
    },
    interpolation: {
      escapeValue: false, // React автоматически экранирует значения
    },
    react: {
      useSuspense: false, // Если false, предотвращает отображение fallback UI при ожидании языка
    },
  });

export default i18n;
