import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import frTranslation from './locales/fr/translation.json';
import enTranslation from './locales/en/translation.json';

const resources = {
  fr: {
    translation: frTranslation
  },
  en: {
    translation: enTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
    debug: process.env.NODE_ENV === 'development',
    
    // Configuration de la détection automatique
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },

    // Configuration des namespaces
    defaultNS: 'translation',
    ns: ['translation'],

    // Configuration des pluriels
    pluralSeparator: '_',
    contextSeparator: '_',

    // Configuration des clés manquantes
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },

    // Configuration des formats
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;
