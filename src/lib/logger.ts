/**
 * Système de logging centralisé pour l'application Payhuk
 * 
 * Ce module fournit une interface de logging cohérente avec :
 * - Niveaux de log appropriés (debug, info, warn, error)
 * - Formatage uniforme des messages
 * - Filtrage par environnement (dev/prod)
 * - Intégration avec les services de monitoring
 * 
 * @author Payhuk Team
 * @version 1.0.0
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private sessionId = this.generateSessionId();

  /**
   * Génère un ID de session unique pour le tracking
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formate un message de log avec métadonnées
   */
  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
      },
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error : undefined,
    };
  }

  /**
   * Affiche le log dans la console avec le bon niveau
   */
  private outputToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, context, error);
        }
        break;
      case 'info':
        console.info(prefix, message, context);
        break;
      case 'warn':
        console.warn(prefix, message, context, error);
        break;
      case 'error':
        console.error(prefix, message, context, error);
        break;
    }
  }

  /**
   * Envoie le log à un service de monitoring (ex: Sentry)
   */
  private sendToMonitoring(entry: LogEntry): void {
    if (!this.isProduction) return;

    // Intégration Sentry (exemple)
    // if (entry.level === 'error' && entry.error) {
    //   Sentry.captureException(entry.error, {
    //     tags: { level: entry.level },
    //     extra: entry.context,
    //   });
    // }

    // Intégration LogRocket (exemple)
    // if (window.LogRocket) {
    //   window.LogRocket.log(entry.message, entry.context);
    // }
  }

  /**
   * Log de niveau debug - informations détaillées pour le développement
   */
  debug(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('debug', message, context);
    this.outputToConsole(entry);
  }

  /**
   * Log de niveau info - informations générales sur le fonctionnement
   */
  info(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('info', message, context);
    this.outputToConsole(entry);
  }

  /**
   * Log de niveau warn - avertissements sur des situations anormales
   */
  warn(message: string, context?: Record<string, any>, error?: Error): void {
    const entry = this.formatMessage('warn', message, context, error);
    this.outputToConsole(entry);
    this.sendToMonitoring(entry);
  }

  /**
   * Log de niveau error - erreurs qui nécessitent une attention
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    const entry = this.formatMessage('error', message, context, error);
    this.outputToConsole(entry);
    this.sendToMonitoring(entry);
  }

  /**
   * Log spécialisé pour les actions utilisateur
   */
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      ...context,
      type: 'user_action',
    });
  }

  /**
   * Log spécialisé pour les performances
   */
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      type: 'performance',
      duration,
    });
  }

  /**
   * Log spécialisé pour les erreurs de paiement
   */
  paymentError(operation: string, error: Error, context?: Record<string, any>): void {
    this.error(`Payment error in ${operation}`, {
      ...context,
      type: 'payment_error',
      operation,
    }, error);
  }

  /**
   * Log spécialisé pour les erreurs d'authentification
   */
  authError(operation: string, error: Error, context?: Record<string, any>): void {
    this.error(`Auth error in ${operation}`, {
      ...context,
      type: 'auth_error',
      operation,
    }, error);
  }

  /**
   * Log spécialisé pour les erreurs de base de données
   */
  databaseError(operation: string, error: Error, context?: Record<string, any>): void {
    this.error(`Database error in ${operation}`, {
      ...context,
      type: 'database_error',
      operation,
    }, error);
  }

  /**
   * Log spécialisé pour les erreurs réseau
   */
  networkError(operation: string, error: Error, context?: Record<string, any>): void {
    this.error(`Network error in ${operation}`, {
      ...context,
      type: 'network_error',
      operation,
    }, error);
  }

  /**
   * Log spécialisé pour les erreurs de validation
   */
  validationError(field: string, value: any, error: Error, context?: Record<string, any>): void {
    this.warn(`Validation error for field ${field}`, {
      ...context,
      type: 'validation_error',
      field,
      value,
    }, error);
  }

  /**
   * Log spécialisé pour les erreurs de sécurité
   */
  securityError(operation: string, error: Error, context?: Record<string, any>): void {
    this.error(`Security error in ${operation}`, {
      ...context,
      type: 'security_error',
      operation,
    }, error);
  }

  /**
   * Log spécialisé pour les erreurs d'intégration tierce
   */
  integrationError(service: string, operation: string, error: Error, context?: Record<string, any>): void {
    this.error(`Integration error with ${service} in ${operation}`, {
      ...context,
      type: 'integration_error',
      service,
      operation,
    }, error);
  }
}

// Instance singleton
export const logger = new Logger();

// Export des méthodes pour un usage plus simple
export const { debug, info, warn, error, userAction, performance, paymentError, authError, databaseError, networkError, validationError, securityError, integrationError } = logger;

export default logger;