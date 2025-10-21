/**
 * ✅ Validateur avancé des variables d'environnement
 * Sécurise et centralise la configuration de l'application.
 * Compatible avec Vite, Supabase, Moneroo, Sentry et Vercel.
 * 
 * @version 2.0.0
 * @author Payhuk Team
 */

// Types étendus pour une meilleure validation
interface EnvConfig {
  VITE_SUPABASE_PROJECT_ID: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_APP_ENV: 'development' | 'staging' | 'production';
  VITE_MONEROO_API_KEY?: string;
  VITE_SENTRY_DSN?: string;
  VITE_APP_VERSION?: string;
  VITE_APP_NAME?: string;
  VITE_APP_URL?: string;
  VITE_DEBUG_MODE?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvConfig;
}

interface EnvVariable {
  key: keyof EnvConfig;
  label: string;
  required: boolean;
  validator?: (value: string) => boolean | string;
  defaultValue?: string;
  description?: string;
}

/**
 * Classe de validation et de sécurisation avancée des variables d'environnement
 */
class EnvValidator {
  private config: Partial<EnvConfig> = {};
  private errors: string[] = [];
  private warnings: string[] = [];
  private validationCache: Map<string, boolean> = new Map();

  // Configuration des variables avec validation avancée
  private readonly variables: EnvVariable[] = [
    {
      key: 'VITE_SUPABASE_PROJECT_ID',
      label: 'ID du projet Supabase',
      required: true,
      validator: (value) => this.validateSupabaseProjectId(value),
      defaultValue: 'hbdnzajbyjakdhuavrvb',
      description: 'Identifiant unique du projet Supabase'
    },
    {
      key: 'VITE_SUPABASE_URL',
      label: 'URL Supabase',
      required: true,
      validator: (value) => this.validateSupabaseUrl(value),
      defaultValue: 'https://hbdnzajbyjakdhuavrvb.supabase.co',
      description: 'URL de base de l\'API Supabase'
    },
    {
      key: 'VITE_SUPABASE_PUBLISHABLE_KEY',
      label: 'Clé publique Supabase',
      required: true,
      validator: (value) => this.validateSupabaseKey(value),
      defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM',
      description: 'Clé publique pour l\'authentification Supabase'
    },
    {
      key: 'VITE_APP_ENV',
      label: 'Environnement de l\'application',
      required: true,
      validator: (value) => this.validateAppEnvironment(value),
      defaultValue: 'production',
      description: 'Environnement de déploiement (development, staging, production)'
    },
    {
      key: 'VITE_MONEROO_API_KEY',
      label: 'Clé API Moneroo',
      required: false,
      validator: (value) => this.validateApiKey(value),
      description: 'Clé API pour les paiements Moneroo'
    },
    {
      key: 'VITE_SENTRY_DSN',
      label: 'DSN Sentry',
      required: false,
      validator: (value) => this.validateSentryDsn(value),
      description: 'DSN pour le monitoring d\'erreurs Sentry'
    },
    {
      key: 'VITE_APP_VERSION',
      label: 'Version de l\'application',
      required: false,
      defaultValue: '1.0.0',
      description: 'Version actuelle de l\'application'
    },
    {
      key: 'VITE_APP_NAME',
      label: 'Nom de l\'application',
      required: false,
      defaultValue: 'Payhuk',
      description: 'Nom de l\'application'
    },
    {
      key: 'VITE_APP_URL',
      label: 'URL de l\'application',
      required: false,
      validator: (value) => this.validateUrl(value),
      defaultValue: 'https://payhuk.vercel.app',
      description: 'URL de base de l\'application'
    },
    {
      key: 'VITE_DEBUG_MODE',
      label: 'Mode debug',
      required: false,
      validator: (value) => this.validateBoolean(value),
      defaultValue: 'false',
      description: 'Active le mode debug (true/false)'
    }
  ];

  /**
   * Lance la validation complète avec cache et optimisations
   */
  validate(): ValidationResult {
    this.resetValidation();
    
    console.log('🔍 Démarrage de la validation des variables d\'environnement...');
    
    // Validation des variables définies
    this.variables.forEach(variable => {
      this.validateVariable(variable);
    });

    // Validation croisée
    this.performCrossValidation();

    // Validation de sécurité
    this.performSecurityValidation();

    const result: ValidationResult = {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
      config: this.createFinalConfig()
    };

    this.logValidationResult(result);
    return result;
  }

  /**
   * Valide une variable individuelle avec cache
   */
  private validateVariable(variable: EnvVariable): void {
    const cacheKey = `${variable.key}_${import.meta.env[variable.key] || 'undefined'}`;
    
    if (this.validationCache.has(cacheKey)) {
      return;
    }

    const value = import.meta.env[variable.key];
    const hasValue = value && value.trim() !== '';

    if (!hasValue) {
      if (variable.required) {
        if (import.meta.env.PROD) {
          this.warnings.push(`⚠️ ${variable.label} (${variable.key}) manquante → valeur par défaut utilisée`);
          this.config[variable.key] = variable.defaultValue || this.getDefaultValue(variable.key);
        } else {
          this.errors.push(`❌ ${variable.label} (${variable.key}) est requise mais absente`);
        }
      }
      this.validationCache.set(cacheKey, !variable.required);
      return;
    }

    // Validation avec le validateur personnalisé
    if (variable.validator) {
      const validationResult = variable.validator(value);
      if (validationResult !== true) {
        const errorMsg = typeof validationResult === 'string' 
          ? validationResult 
          : `❌ ${variable.label} (${variable.key}) a un format invalide`;
        
        if (variable.required) {
          this.errors.push(errorMsg);
        } else {
          this.warnings.push(errorMsg);
        }
        this.validationCache.set(cacheKey, false);
        return;
      }
    }

    this.config[variable.key] = value;
    this.validationCache.set(cacheKey, true);
  }

  /**
   * Validation croisée entre variables
   */
  private performCrossValidation(): void {
    // Vérifier la cohérence Supabase
    if (this.config.VITE_SUPABASE_URL && this.config.VITE_SUPABASE_PROJECT_ID) {
      const urlProjectId = this.extractProjectIdFromUrl(this.config.VITE_SUPABASE_URL);
      if (urlProjectId && urlProjectId !== this.config.VITE_SUPABASE_PROJECT_ID) {
        this.warnings.push('⚠️ Incohérence détectée entre VITE_SUPABASE_URL et VITE_SUPABASE_PROJECT_ID');
      }
    }

    // Vérifier la cohérence environnement
    if (this.config.VITE_APP_ENV === 'production' && this.config.VITE_DEBUG_MODE === 'true') {
      this.warnings.push('⚠️ Mode debug activé en production - considérez le désactiver');
    }
  }

  /**
   * Validation de sécurité avancée
   */
  private performSecurityValidation(): void {
    // Vérifier les clés sensibles en développement
    if (this.config.VITE_APP_ENV === 'development') {
      const sensitiveKeys = ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_MONEROO_API_KEY'];
      sensitiveKeys.forEach(key => {
        const value = this.config[key];
        if (value && this.isProductionKey(value)) {
          this.warnings.push(`⚠️ ${key} semble être une clé de production utilisée en développement`);
        }
      });
    }

    // Vérifier la longueur des clés
    if (this.config.VITE_SUPABASE_PUBLISHABLE_KEY) {
      const keyLength = this.config.VITE_SUPABASE_PUBLISHABLE_KEY.length;
      if (keyLength < 100) {
        this.warnings.push('⚠️ VITE_SUPABASE_PUBLISHABLE_KEY semble trop courte');
      }
    }
  }

  /**
   * Validateurs spécialisés
   */
  private validateSupabaseProjectId(value: string): boolean | string {
    if (!/^[a-z0-9]{20}$/.test(value)) {
      return 'L\'ID du projet Supabase doit contenir exactement 20 caractères alphanumériques';
    }
    return true;
  }

  private validateSupabaseUrl(value: string): boolean | string {
    try {
      const url = new URL(value);
      if (!url.hostname.includes('supabase.co')) {
        return 'L\'URL Supabase doit pointer vers un domaine supabase.co';
      }
      if (!url.protocol.includes('https')) {
        return 'L\'URL Supabase doit utiliser HTTPS';
      }
      return true;
    } catch {
      return 'L\'URL Supabase doit être une URL valide';
    }
  }

  private validateSupabaseKey(value: string): boolean | string {
    try {
      // Décoder le JWT pour vérifier sa structure
      const parts = value.split('.');
      if (parts.length !== 3) {
        return 'La clé Supabase doit être un JWT valide';
      }
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.iss || !payload.ref) {
        return 'La clé Supabase semble invalide';
      }
      
      return true;
    } catch {
      return 'La clé Supabase doit être un JWT valide';
    }
  }

  private validateAppEnvironment(value: string): boolean | string {
    const validEnvs = ['development', 'staging', 'production'];
    if (!validEnvs.includes(value)) {
      return `L'environnement doit être parmi: ${validEnvs.join(', ')}`;
    }
    return true;
  }

  private validateApiKey(value: string): boolean | string {
    if (value.length < 20) {
      return 'La clé API semble trop courte';
    }
    return true;
  }

  private validateSentryDsn(value: string): boolean | string {
    try {
      const url = new URL(value);
      if (!url.hostname.includes('sentry.io') && !url.hostname.includes('ingest.sentry.io')) {
        return 'Le DSN Sentry doit pointer vers un domaine Sentry valide';
      }
      return true;
    } catch {
      return 'Le DSN Sentry doit être une URL valide';
    }
  }

        private validateBoolean(value: string): boolean | string {
          const validValues = ['true', 'false', '1', '0'];
          if (!validValues.includes(value.toLowerCase())) {
            return 'La valeur doit être un booléen valide (true/false)';
          }
          return true;
        }

        private validateUrl(value: string): boolean | string {
          try {
            const url = new URL(value);
            if (!url.protocol.includes('https')) {
              return 'L\'URL doit utiliser HTTPS';
            }
            return true;
          } catch {
            return 'L\'URL doit être une URL valide';
          }
        }

  /**
   * Utilitaires
   */
  private extractProjectIdFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const match = hostname.match(/^([a-z0-9]{20})\.supabase\.co$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  private isProductionKey(value: string): boolean {
    // Détection simple des clés de production
    return value.includes('prod') || value.includes('live') || value.length > 200;
  }

  private getDefaultValue(key: keyof EnvConfig): string {
    const variable = this.variables.find(v => v.key === key);
    return variable?.defaultValue || '';
  }

        private createFinalConfig(): EnvConfig {
          const finalConfig: EnvConfig = {
            VITE_SUPABASE_PROJECT_ID: this.config.VITE_SUPABASE_PROJECT_ID || this.getDefaultValue('VITE_SUPABASE_PROJECT_ID'),
            VITE_SUPABASE_URL: this.config.VITE_SUPABASE_URL || this.getDefaultValue('VITE_SUPABASE_URL'),
            VITE_SUPABASE_PUBLISHABLE_KEY: this.config.VITE_SUPABASE_PUBLISHABLE_KEY || this.getDefaultValue('VITE_SUPABASE_PUBLISHABLE_KEY'),
            VITE_APP_ENV: (this.config.VITE_APP_ENV as any) || 'production',
            VITE_MONEROO_API_KEY: this.config.VITE_MONEROO_API_KEY,
            VITE_SENTRY_DSN: this.config.VITE_SENTRY_DSN,
            VITE_APP_VERSION: this.config.VITE_APP_VERSION || this.getDefaultValue('VITE_APP_VERSION'),
            VITE_APP_NAME: this.config.VITE_APP_NAME || this.getDefaultValue('VITE_APP_NAME'),
            VITE_APP_URL: this.config.VITE_APP_URL || this.getDefaultValue('VITE_APP_URL'),
            VITE_DEBUG_MODE: this.config.VITE_DEBUG_MODE || this.getDefaultValue('VITE_DEBUG_MODE')
          };

          return finalConfig;
        }

  private resetValidation(): void {
    this.config = {};
    this.errors = [];
    this.warnings = [];
    this.validationCache.clear();
  }

  private logValidationResult(result: ValidationResult): void {
    console.group('🔍 Résultat de la validation des variables d\'environnement');
    
    if (result.isValid) {
      console.log('✅ Validation réussie');
    } else {
      console.error('❌ Validation échouée');
    }

    if (result.errors.length > 0) {
      console.group('❌ Erreurs');
      result.errors.forEach(error => console.error(error));
      console.groupEnd();
    }

    if (result.warnings.length > 0) {
      console.group('⚠️ Avertissements');
      result.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }

    console.log('📊 Configuration finale:', result.config);
    console.groupEnd();
  }

  /**
   * Méthodes publiques pour l'accès à la configuration
   */
  getConfig(): EnvConfig {
    return this.config as EnvConfig;
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Helpers d'environnement améliorés
   */
  isProduction(): boolean {
    return this.config.VITE_APP_ENV === 'production';
  }

  isDevelopment(): boolean {
    return this.config.VITE_APP_ENV === 'development';
  }

  isStaging(): boolean {
    return this.config.VITE_APP_ENV === 'staging';
  }

  isDebugMode(): boolean {
    return this.config.VITE_DEBUG_MODE === 'true';
  }

  getAppVersion(): string {
    return this.config.VITE_APP_VERSION || '1.0.0';
  }

  getAppName(): string {
    return this.config.VITE_APP_NAME || 'Payhuk';
  }

  /**
   * Méthode pour obtenir un rapport détaillé
   */
  getDetailedReport(): {
    config: EnvConfig;
    environment: string;
    isProduction: boolean;
    isDebugMode: boolean;
    appInfo: { name: string; version: string };
    security: { hasMoneroo: boolean; hasSentry: boolean };
    validation: { errors: string[]; warnings: string[] };
  } {
    return {
      config: this.getConfig(),
      environment: this.config.VITE_APP_ENV || 'production',
      isProduction: this.isProduction(),
      isDebugMode: this.isDebugMode(),
      appInfo: {
        name: this.getAppName(),
        version: this.getAppVersion()
      },
      security: {
        hasMoneroo: !!this.config.VITE_MONEROO_API_KEY,
        hasSentry: !!this.config.VITE_SENTRY_DSN
      },
      validation: {
        errors: this.getErrors(),
        warnings: this.getWarnings()
      }
    };
  }
}

// 🔁 Singleton global avec gestion d'erreur améliorée
const envValidator = new EnvValidator();
let envConfig: EnvConfig;

try {
  const validationResult = envValidator.validate();
  
  if (!validationResult.isValid && import.meta.env.PROD) {
    console.warn('⚠️ Configuration non valide en production, utilisation des valeurs par défaut');
  }
  
  envConfig = validationResult.config;
} catch (err) {
  console.error('🚨 Erreur critique de configuration:', err);
  
  // En production, utiliser les valeurs par défaut plutôt que de faire planter l'app
  if (import.meta.env.PROD) {
    console.warn('⚠️ Fallback vers la configuration par défaut');
        envConfig = {
          VITE_SUPABASE_PROJECT_ID: 'hbdnzajbyjakdhuavrvb',
          VITE_SUPABASE_URL: 'https://hbdnzajbyjakdhuavrvb.supabase.co',
          VITE_SUPABASE_PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM',
          VITE_APP_ENV: 'production',
          VITE_APP_VERSION: '1.0.0',
          VITE_APP_NAME: 'Payhuk',
          VITE_APP_URL: 'https://payhuk.vercel.app',
          VITE_DEBUG_MODE: 'false'
        };
  } else {
    throw err;
  }
}

export { envValidator, envConfig };
export type { EnvConfig, ValidationResult, EnvVariable };
