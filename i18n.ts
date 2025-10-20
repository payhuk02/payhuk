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

// Configuration d'i18n avec gestion d'erreur robuste
const initI18n = async () => {
  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'fr', // Langue par défaut
        debug: false, // Désactiver le debug en production
        
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
        saveMissing: false, // Désactiver en production
        missingKeyHandler: (lng, ns, key) => {
          console.warn(`Missing translation key: ${key} for language: ${lng}`);
        },

        // Configuration des formats
        keySeparator: '.',
        nsSeparator: ':',

        // Initialisation asynchrone pour éviter les erreurs de contexte
        initImmediate: false,
        
        // Configuration de compatibilité
        compatibilityJSON: 'v3',
      });
    
    console.log('✅ i18n initialisé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation d\'i18n:', error);
    return false;
  }
};

// Initialiser i18n de manière asynchrone
initI18n();

export default i18n;
