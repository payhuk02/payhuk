/**
 * Validateur de variables d'environnement pour la sécurité
 * Vérifie que toutes les variables requises sont présentes et valides
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
  VITE_MONEROO_API_KEY?: string;
  VITE_SENTRY_DSN?: string;
  VITE_APP_ENV: 'development' | 'staging' | 'production';
}

class EnvValidator {
  private config: Partial<EnvConfig> = {};
  private errors: string[] = [];

  /**
   * Valide toutes les variables d'environnement requises
   */
  validate(): EnvConfig {
    this.errors = [];
    
    // Variables requises
    this.validateRequired('VITE_SUPABASE_URL', 'URL Supabase');
    this.validateRequired('VITE_SUPABASE_PUBLISHABLE_KEY', 'Clé publique Supabase');
    this.validateRequired('VITE_APP_ENV', 'Environnement de l\'application');

    // Variables optionnelles
    this.validateOptional('VITE_MONEROO_API_KEY', 'Clé API Moneroo');
    this.validateOptional('VITE_SENTRY_DSN', 'DSN Sentry');

    // Validation spécifique
    this.validateSupabaseUrl();
    this.validateAppEnv();

    if (this.errors.length > 0) {
      throw new Error(`Variables d'environnement invalides:\n${this.errors.join('\n')}`);
    }

    return this.config as EnvConfig;
  }

  private validateRequired(key: keyof EnvConfig, description: string): void {
    const value = import.meta.env[key];
    
    if (!value || value.trim() === '') {
      this.errors.push(`❌ ${description} (${key}) est requise mais manquante`);
      return;
    }

    this.config[key] = value;
  }

  private validateOptional(key: keyof EnvConfig, description: string): void {
    const value = import.meta.env[key];
    
    if (value && value.trim() !== '') {
      this.config[key] = value;
    }
  }

  private validateSupabaseUrl(): void {
    const url = this.config.VITE_SUPABASE_URL;
    if (!url) return;

    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.hostname.includes('supabase')) {
        this.errors.push('❌ VITE_SUPABASE_URL doit être une URL Supabase valide');
      }
    } catch {
      this.errors.push('❌ VITE_SUPABASE_URL doit être une URL valide');
    }
  }

  private validateAppEnv(): void {
    const env = this.config.VITE_APP_ENV;
    if (!env) return;

    const validEnvs = ['development', 'staging', 'production'];
    if (!validEnvs.includes(env)) {
      this.errors.push(`❌ VITE_APP_ENV doit être l'un de: ${validEnvs.join(', ')}`);
    }
  }

  /**
   * Retourne la configuration validée
   */
  getConfig(): EnvConfig {
    return this.config as EnvConfig;
  }

  /**
   * Vérifie si on est en production
   */
  isProduction(): boolean {
    return this.config.VITE_APP_ENV === 'production';
  }

  /**
   * Vérifie si on est en développement
   */
  isDevelopment(): boolean {
    return this.config.VITE_APP_ENV === 'development';
  }
}

// Instance singleton
const envValidator = new EnvValidator();

// Validation au chargement du module
let envConfig: EnvConfig;
try {
  envConfig = envValidator.validate();
} catch (error) {
  console.error('❌ Erreur de configuration des variables d\'environnement:', error);
  
  // En production, créer une configuration de fallback pour éviter le crash
  if (import.meta.env.PROD) {
    console.warn('⚠️ Utilisation de la configuration de fallback en production');
    envConfig = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://fallback.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'fallback-key',
      VITE_APP_ENV: (import.meta.env.VITE_APP_ENV as any) || 'production',
      VITE_MONEROO_API_KEY: import.meta.env.VITE_MONEROO_API_KEY,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    };
  } else {
    throw error;
  }
}

export { envValidator, envConfig };
export type { EnvConfig };
