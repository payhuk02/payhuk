import React, { Suspense, lazy, ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
  errorBoundary?: boolean;
}

/**
 * Composant de chargement par défaut optimisé
 */
const DefaultFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(
    "flex items-center justify-center p-8",
    "animate-pulse bg-gray-100 rounded-lg",
    className
  )}>
    <div className="flex flex-col items-center space-y-2">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Chargement...</span>
    </div>
  </div>
);

/**
 * Composant d'erreur par défaut
 */
const DefaultError: React.FC<{ error?: Error; retry?: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-12 h-12 mb-4 text-red-500">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erreur de chargement
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      {error?.message || 'Une erreur est survenue lors du chargement du composant.'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Réessayer
      </button>
    )}
  </div>
);

/**
 * Boundary d'erreur pour les composants paresseux
 */
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponent Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultError 
          error={this.state.error} 
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * HOC pour créer des composants paresseux avec gestion d'erreur
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFunc);
  
  return React.forwardRef<any, P & LazyComponentProps>((props, ref) => {
    const { fallback, className, errorBoundary = true, ...componentProps } = props;
    
    const content = (
      <Suspense fallback={fallback || <DefaultFallback className={className} />}>
        <LazyComponent {...(componentProps as P)} ref={ref} />
      </Suspense>
    );

    if (errorBoundary) {
      return (
        <LazyErrorBoundary fallback={fallback}>
          {content}
        </LazyErrorBoundary>
      );
    }

    return content;
  });
}

/**
 * Hook pour le chargement paresseux avec état
 */
export function useLazyLoading<T>(
  importFunc: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const load = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await importFunc();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error')
      }));
    }
  }, deps);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    retry: load,
  };
}

export default LazyComponent;
