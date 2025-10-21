import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

const NotificationItem: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  actions = []
}) => {
  const removeNotification = useAppStore(state => state.removeNotification);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          removeNotification(id);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, id, removeNotification]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative max-w-sm w-full p-4 rounded-lg border shadow-lg
        ${getBackgroundColor()}
        backdrop-blur-sm
      `}
    >
      {/* Barre de progression */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        <motion.div
          className={`h-full ${getProgressColor()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
          
          {/* Actions */}
          {actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={() => removeNotification(id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

export const NotificationContainer: React.FC = () => {
  const notifications = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            {...notification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook utilitaire pour les notifications
export const useNotification = () => {
  const addNotification = useAppStore(state => state.addNotification);

  const showSuccess = (title: string, message: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  };

  const showError = (title: string, message: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'error',
      title,
      message,
      ...options
    });
  };

  const showWarning = (title: string, message: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  };

  const showInfo = (title: string, message: string, options?: Partial<NotificationProps>) => {
    addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
