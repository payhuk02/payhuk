import { envConfig, envValidator } from '@/lib/env-validator';

/**
 * Hook pour accéder aux variables d'environnement validées
 */
export const useEnvironment = () => {
  const config = envConfig;
  const validator = envValidator;
  
  return {
    config,
    validator,
    isProduction: validator.isProduction(),
    isDevelopment: validator.isDevelopment(),
    isStaging: validator.isStaging(),
    isDebugMode: validator.isDebugMode(),
    appName: validator.getAppName(),
    appVersion: validator.getAppVersion(),
    environment: config.VITE_APP_ENV,
    validation: {
      errors: validator.getErrors(),
      warnings: validator.getWarnings()
    }
  };
};

/**
 * Fonction utilitaire pour logger les informations d'environnement
 */
export const logEnvironmentInfo = () => {
  const env = useEnvironment();
  console.group('🌍 Informations d\'environnement');
  console.log('App:', env.appName, 'v' + env.appVersion);
  console.log('Environment:', env.environment);
  console.log('Debug Mode:', env.isDebugMode);
  console.log('Production:', env.isProduction);
  console.log('Errors:', env.validation.errors.length);
  console.log('Warnings:', env.validation.warnings.length);
  console.groupEnd();
};