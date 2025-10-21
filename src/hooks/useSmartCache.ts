import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  enableLRU?: boolean;
  enableStats?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

class SmartCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0
  };
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize || 100,
      defaultTTL: options.defaultTTL || 5 * 60 * 1000, // 5 minutes
      enableLRU: options.enableLRU ?? true,
      enableStats: options.enableStats ?? true
    };
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.options.defaultTTL,
      hits: 0,
      lastAccessed: now
    };

    // Si le cache est plein, supprimer l'entrée la moins récemment utilisée
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.updateStats();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    const now = Date.now();
    
    // Vérifier si l'entrée a expiré
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.hits++;
    entry.lastAccessed = now;
    this.stats.hits++;
    this.updateStats();

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const now = Date.now();
    
    // Vérifier si l'entrée a expiré
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.updateStats();
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0
    };
  }

  private evictLRU(): void {
    if (!this.options.enableLRU) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Nettoyer les entrées expirées
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }

  // Obtenir toutes les clés
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Obtenir la taille du cache
  size(): number {
    return this.cache.size;
  }
}

// Hook pour utiliser le cache intelligent
export function useSmartCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { 
    dependencies?: any[];
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
  } = {}
) {
  const {
    dependencies = [],
    enabled = true,
    refetchOnWindowFocus = true,
    ...cacheOptions
  } = options;

  const cacheRef = useRef<SmartCache<T>>(new SmartCache(cacheOptions));
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Vérifier le cache d'abord
    if (!forceRefresh) {
      const cachedData = cacheRef.current.get(key);
      if (cachedData) {
        setData(cachedData);
        setIsStale(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheRef.current.set(key, result);
      setData(result);
      setIsStale(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, ...dependencies]);

  // Charger les données au montage
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recharger sur le focus de la fenêtre
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchData, refetchOnWindowFocus]);

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      cacheRef.current.cleanup();
    }, 60000); // Nettoyer toutes les minutes

    return () => clearInterval(interval);
  }, []);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setData(null);
  }, []);

  const getCacheStats = useCallback(() => {
    return cacheRef.current.getStats();
  }, []);

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    invalidate,
    clearCache,
    getCacheStats
  };
}

// Hook pour le cache de requêtes
export function useQueryCache<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    retry?: number;
    retryDelay?: number;
    enabled?: boolean;
  } = {}
) {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = 1000,
    enabled = true
  } = options;

  return useSmartCache(queryKey, queryFn, {
    defaultTTL: cacheTime,
    enabled,
    dependencies: [queryKey]
  });
}

// Hook pour le cache de mutations
export function useMutationCache<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  } = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    isLoading,
    error,
    data
  };
}

// Utilitaire pour créer un cache global
export const globalCache = new SmartCache({
  maxSize: 1000,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  enableLRU: true,
  enableStats: true
});

// Hook pour accéder au cache global
export function useGlobalCache<T>(key: string) {
  const [data, setData] = useState<T | null>(null);

  const get = useCallback(() => {
    const cachedData = globalCache.get(key);
    setData(cachedData);
    return cachedData;
  }, [key]);

  const set = useCallback((value: T, ttl?: number) => {
    globalCache.set(key, value, ttl);
    setData(value);
  }, [key]);

  const remove = useCallback(() => {
    globalCache.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    get();
  }, [get]);

  return {
    data,
    get,
    set,
    remove,
    has: () => globalCache.has(key)
  };
}
