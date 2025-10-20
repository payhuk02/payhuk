import { useEffect, useRef, useState, useCallback } from 'react';

interface UseRealTimeUpdatesOptions {
  interval?: number;
  enabled?: boolean;
  onUpdate?: () => void;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const { interval = 30000, enabled = true, onUpdate } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const safeOnUpdate = useCallback(() => {
    if (!onUpdate) return;
    
    try {
      // Éviter les mises à jour trop fréquentes
      const now = Date.now();
      if (now - lastUpdateRef.current < 5000) { // Minimum 5 secondes entre les mises à jour
        return;
      }
      
      lastUpdateRef.current = now;
      onUpdate();
    } catch (error) {
      console.warn('Erreur lors de la mise à jour en temps réel:', error);
    }
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || !onUpdate) {
      setIsActive(false);
      return;
    }

    const startUpdates = () => {
      if (intervalRef.current) return;
      
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === 'visible') {
          safeOnUpdate();
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
        setIsActive(true);
        startUpdates();
      } else {
        setIsActive(false);
        stopUpdates();
      }
    };

    // Démarrer les mises à jour quand la fenêtre reprend le focus
    const handleFocus = () => {
      setIsActive(true);
      startUpdates();
    };

    const handleBlur = () => {
      setIsActive(false);
      stopUpdates();
    };

    // Écouter les changements de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Démarrer immédiatement si la page est visible
    if (document.visibilityState === 'visible') {
      setIsActive(true);
      startUpdates();
    }

    return () => {
      stopUpdates();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [interval, enabled, safeOnUpdate]);

  return {
    isActive,
  };
};
