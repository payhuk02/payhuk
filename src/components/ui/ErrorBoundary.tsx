import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log l'erreur
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Appeler le callback si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Envoyer l'erreur à un service de monitoring (ex: Sentry)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Ici vous pouvez intégrer avec un service comme Sentry, LogRocket, etc.
    try {
      // Exemple d'intégration avec un service de monitoring
      // Sentry.captureException(error, {
      //   contexts: {
      //     react: {
      //       componentStack: errorInfo.componentStack
      //     }
      //   }
      // });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onGoBack={this.handleGoBack}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  onRetry: () => void;
  onGoHome: () => void;
  onGoBack: () => void;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onGoHome,
  onGoBack,
  showDetails = false
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"
        >
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Oups ! Une erreur s'est produite
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nous nous excusons pour ce désagrément. Notre équipe a été notifiée et travaille à résoudre le problème.
        </p>

        {errorId && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            ID d'erreur : <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{errorId}</code>
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={onGoBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              onClick={onGoHome}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {showTechnicalDetails ? 'Masquer' : 'Afficher'} les détails techniques
            </button>

            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 text-left"
              >
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-xs font-mono overflow-auto max-h-64">
                  <div className="mb-2">
                    <strong>Erreur :</strong>
                    <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                      {error?.message}
                    </pre>
                  </div>
                  
                  {error?.stack && (
                    <div className="mb-2">
                      <strong>Stack trace :</strong>
                      <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component stack :</strong>
                      <pre className="whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Hook pour gérer les erreurs dans les composants fonctionnels
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error('Error caught by useErrorHandler:', error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

// Composant pour afficher les erreurs de manière élégante
interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title = 'Une erreur s\'est produite',
  onRetry,
  showRetry = true,
  className = ''
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 font-medium transition-colors"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Composant pour les erreurs de réseau
interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'Problème de connexion réseau'
}) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {message}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Vérifiez votre connexion internet et réessayez.
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
};
