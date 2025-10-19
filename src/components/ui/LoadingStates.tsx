import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface LoadingStateProps {
  state: 'loading' | 'success' | 'error' | 'empty';
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

/**
 * Composant d'état de chargement unifié
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  state,
  message,
  className,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const getIcon = () => {
    if (!showIcon) return null;

    switch (state) {
      case 'loading':
        return <Loader2 className={cn('animate-spin', sizeClasses[size])} />;
      case 'success':
        return <CheckCircle className={cn('text-green-500', sizeClasses[size])} />;
      case 'error':
        return <AlertCircle className={cn('text-red-500', sizeClasses[size])} />;
      case 'empty':
        return <XCircle className={cn('text-gray-400', sizeClasses[size])} />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    if (message) return message;

    switch (state) {
      case 'loading':
        return 'Chargement en cours...';
      case 'success':
        return 'Opération réussie';
      case 'error':
        return 'Une erreur est survenue';
      case 'empty':
        return 'Aucun élément trouvé';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center',
        className
      )}
    >
      {getIcon()}
      <p className={cn(
        'mt-2 font-medium',
        textSizeClasses[size],
        state === 'error' && 'text-red-600',
        state === 'success' && 'text-green-600',
        state === 'empty' && 'text-gray-500',
        state === 'loading' && 'text-gray-600'
      )}>
        {getMessage()}
      </p>
    </div>
  );
};

/**
 * Skeleton loader pour les cartes de produits
 */
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)}>
    <div className="bg-gray-200 rounded-lg h-48 w-full mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

/**
 * Skeleton loader pour les listes
 */
export const ListSkeleton: React.FC<{ 
  items?: number; 
  className?: string;
  itemClassName?: string;
}> = ({ 
  items = 3, 
  className,
  itemClassName 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div
        key={index}
        className={cn(
          'animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg',
          itemClassName
        )}
      >
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton loader pour les tableaux
 */
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => (
  <div className={cn('animate-pulse', className)}>
    <div className="space-y-3">
      {/* En-tête */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
      
      {/* Lignes */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4 py-2" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-3 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Composant de chargement avec retry
 */
interface RetryableLoadingProps {
  onRetry: () => void;
  error?: Error;
  className?: string;
}

export const RetryableLoading: React.FC<RetryableLoadingProps> = ({
  onRetry,
  error,
  className,
}) => (
  <div className={cn('text-center p-6', className)}>
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Erreur de chargement
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      {error?.message || 'Impossible de charger les données'}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
    >
      Réessayer
    </button>
  </div>
);

export default LoadingState;
