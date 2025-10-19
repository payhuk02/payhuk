import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Boundary d'erreur global pour capturer et gérer les erreurs React
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Générer un ID unique pour l'erreur
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log de l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Mettre à jour l'état
    this.setState({
      error,
      errorInfo,
    });

    // Callback personnalisé
    this.props.onError?.(error, errorInfo);

    // Envoyer l'erreur à un service de monitoring (ex: Sentry)
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Ici vous pouvez intégrer Sentry, LogRocket, ou autre service de monitoring
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report');
      console.error('Error ID:', errorReport.errorId);
      console.error('Message:', errorReport.message);
      console.error('Stack:', errorReport.stack);
      console.error('Component Stack:', errorReport.componentStack);
      console.groupEnd();
    }

    // En production, envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple d'intégration Sentry
      // Sentry.captureException(error, {
      //   tags: { errorId: this.state.errorId },
      //   extra: errorInfo,
      // });
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback personnalisé
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI d'erreur par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Icône d'erreur */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            {/* Titre */}
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Oups ! Quelque chose s'est mal passé
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Une erreur inattendue s'est produite. Notre équipe a été notifiée et travaille à la résoudre.
            </p>

            {/* ID d'erreur pour le support */}
            <div className="bg-gray-100 rounded-md p-3 mb-6">
              <p className="text-sm text-gray-500 mb-1">ID d'erreur :</p>
              <code className="text-xs font-mono text-gray-700 break-all">
                {this.state.errorId}
              </code>
            </div>

            {/* Détails de l'erreur (mode développement) */}
            {this.props.showDetails && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Détails techniques
                </summary>
                <div className="bg-gray-900 text-green-400 p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Accueil
                </Button>
              </div>

              <Button
                onClick={this.handleReload}
                variant="ghost"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recharger la page
              </Button>
            </div>

            {/* Lien de support */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Le problème persiste ?{' '}
                <a
                  href="mailto:support@payhuk.com"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Contactez notre support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour gérer les erreurs dans les composants fonctionnels
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Error captured by useErrorHandler:', error);
  }, []);

  // Si une erreur est capturée, la re-lancer pour que ErrorBoundary la gère
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
    hasError: !!error,
  };
}

export default ErrorBoundary;
