import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-purple-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Chargement...',
  description = 'Veuillez patienter pendant le chargement des données',
  icon,
  showProgress = false,
  progress = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="text-center">
        {icon && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            {icon}
          </motion.div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
        
        <div className="flex justify-center mb-4">
          <LoadingSpinner size="lg" />
        </div>
        
        {showProgress && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: ''
  };
  
  const style = {
    width: width || '100%',
    height: height || '1rem'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

interface SkeletonCardProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
  lines = 3
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {showImage && (
        <Skeleton
          variant="rectangular"
          height="200px"
          className="mb-4"
        />
      )}
      
      {showTitle && (
        <Skeleton
          variant="text"
          height="24px"
          className="mb-2"
        />
      )}
      
      {showDescription && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              height="16px"
              width={`${Math.random() * 40 + 60}%`}
            />
          ))}
        </div>
      )}
      
      {showActions && (
        <div className="flex space-x-2 mt-4">
          <Skeleton
            variant="rectangular"
            height="36px"
            width="80px"
          />
          <Skeleton
            variant="rectangular"
            height="36px"
            width="100px"
          />
        </div>
      )}
    </div>
  );
};

interface LoadingGridProps {
  count?: number;
  columns?: number;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({
  count = 6,
  columns = 3,
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols]} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          showImage={showImage}
          showTitle={showTitle}
          showDescription={showDescription}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

interface LoadingPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title = 'Chargement de la page...',
  description = 'Veuillez patienter pendant le chargement',
  icon,
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingCard
        title={title}
        description={description}
        icon={icon}
        showProgress={showProgress}
        progress={progress}
      />
    </div>
  );
};

// Composants spécialisés pour différents contextes
export const ProductLoadingCard: React.FC = () => (
  <SkeletonCard
    showImage={true}
    showTitle={true}
    showDescription={true}
    showActions={true}
    lines={2}
  />
);

export const DashboardLoadingCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div className="flex-1">
        <Skeleton variant="text" height="20px" width="60%" className="mb-2" />
        <Skeleton variant="text" height="16px" width="40%" />
      </div>
    </div>
    <Skeleton variant="text" height="32px" width="80%" className="mb-2" />
    <Skeleton variant="text" height="16px" width="100%" />
  </div>
);

export const TableLoadingRow: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <Skeleton variant="text" height="16px" />
      </td>
    ))}
  </tr>
);

export const TableLoadingSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  showHeader?: boolean; 
}> = ({ rows = 5, columns = 4, showHeader = true }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {showHeader && (
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" height="20px" width="120px" />
          ))}
        </div>
      </div>
    )}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height="16px" width="100px" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
