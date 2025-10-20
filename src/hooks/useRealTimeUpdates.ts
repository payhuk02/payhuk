import { useEffect, useRef } from 'react';

interface UseRealTimeUpdatesOptions {
  interval?: number;
  enabled?: boolean;
  onUpdate?: () => void;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const { interval = 30000, enabled = true, onUpdate } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    if (!enabled || !onUpdate) return;

    const startUpdates = () => {
      if (intervalRef.current) return;
      
      intervalRef.current = setInterval(() => {
        if (isActiveRef.current) {
          onUpdate();
        }
      }, interval);
    };

    const stopUpdates = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Démarrer les mises à jour quand la page devient active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isActiveRef.current = true;
        startUpdates();
      } else {
        isActiveRef.current = false;
        stopUpdates();
      }
    };

    // Démarrer les mises à jour quand la fenêtre reprend le focus
    const handleFocus = () => {
      isActiveRef.current = true;
      startUpdates();
    };

    const handleBlur = () => {
      isActiveRef.current = false;
      stopUpdates();
    };

    // Écouter les changements de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Démarrer immédiatement si la page est visible
    if (document.visibilityState === 'visible') {
      isActiveRef.current = true;
      startUpdates();
    }

    return () => {
      stopUpdates();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [interval, enabled, onUpdate]);

  return {
    isActive: isActiveRef.current,
  };
};
