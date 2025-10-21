import React from 'react';
import { envValidator } from '@/lib/env-validator';

/**
 * Hook pour accéder aux informations d'environnement validées
 */
export const useEnvironment = () => {
  const [report, setReport] = React.useState(() => envValidator.getDetailedReport());

  React.useEffect(() => {
    // Re-valider périodiquement en développement
    if (envValidator.isDevelopment()) {
      const interval = setInterval(() => {
        const newReport = envValidator.getDetailedReport();
        setReport(newReport);
      }, 30000); // Toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, []);

  return {
    ...report,
    // Helpers pratiques
    isProduction: envValidator.isProduction(),
    isDevelopment: envValidator.isDevelopment(),
    isStaging: envValidator.isStaging(),
    isDebugMode: envValidator.isDebugMode(),
    appName: envValidator.getAppName(),
    appVersion: envValidator.getAppVersion(),
    // Méthodes de validation
    revalidate: () => {
      const newReport = envValidator.getDetailedReport();
      setReport(newReport);
      return newReport;
    }
  };
};

/**
 * Utilitaire pour logger les informations d'environnement
 */
export const logEnvironmentInfo = () => {
  const report = envValidator.getDetailedReport();
  
  console.group('🌍 Informations d\'environnement');
  console.log('Application:', report.appInfo);
  console.log('Environnement:', report.environment);
  console.log('Mode debug:', report.isDebugMode);
  console.log('Sécurité:', report.security);
  
  if (report.validation.errors.length > 0) {
    console.group('❌ Erreurs de validation');
    report.validation.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  if (report.validation.warnings.length > 0) {
    console.group('⚠️ Avertissements');
    report.validation.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  console.groupEnd();
};

/**
 * Utilitaire pour vérifier si une fonctionnalité est disponible
 */
export const isFeatureAvailable = (feature: 'moneroo' | 'sentry' | 'debug'): boolean => {
  const report = envValidator.getDetailedReport();
  
  switch (feature) {
    case 'moneroo':
      return report.security.hasMoneroo;
    case 'sentry':
      return report.security.hasSentry;
    case 'debug':
      return report.isDebugMode;
    default:
      return false;
  }
};

/**
 * Utilitaire pour obtenir la configuration Supabase validée
 */
export const getSupabaseConfig = () => {
  const config = envValidator.getConfig();
  return {
    url: config.VITE_SUPABASE_URL,
    anonKey: config.VITE_SUPABASE_PUBLISHABLE_KEY,
    projectId: config.VITE_SUPABASE_PROJECT_ID
  };
};