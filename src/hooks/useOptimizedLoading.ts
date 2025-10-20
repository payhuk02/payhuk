import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimizedLoadingOptions {
  initialLoading?: boolean;
  debounceMs?: number;
  minLoadingTime?: number;
}

export const useOptimizedLoading = (options: UseOptimizedLoadingOptions = {}) => {
  const { 
    initialLoading = false, 
    debounceMs = 100, 
    minLoadingTime = 300 
  } = options;
  
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const startLoading = useCallback(() => {
    setError(null);
    startTimeRef.current = Date.now();
    
    // Debounce pour éviter les changements trop rapides
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setLoading(true);
    }, debounceMs);
  }, [debounceMs]);

  const stopLoading = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    const elapsed = Date.now() - startTimeRef.current;
    const remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    setTimeout(() => {
      setLoading(false);
    }, remainingTime);
  }, [minLoadingTime]);

  const setErrorState = useCallback((errorMessage: string) => {
    setError(errorMessage);
    stopLoading();
  }, [stopLoading]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    reset
  };
};
