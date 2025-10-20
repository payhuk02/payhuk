import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueryOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTime?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: string, data: any, cacheTime: number = 300000): void { // 5 minutes par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTime
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

export const useOptimizedQuery = () => {
  const retryCountRef = useRef<Map<string, number>>(new Map());

  const executeQuery = useCallback(async <T>(
    queryKey: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: QueryOptions = {}
  ): Promise<{ data: T | null; error: any }> => {
    const {
      timeout = 8000,
      retries = 2,
      cache = true,
      cacheTime = 300000
    } = options;

    // Vérifier le cache d'abord
    if (cache) {
      const cachedData = queryCache.get(queryKey);
      if (cachedData) {
        return { data: cachedData, error: null };
      }
    }

    const executeWithTimeout = async (): Promise<{ data: T | null; error: any }> => {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Query timeout after ${timeout}ms`)), timeout)
      );

      try {
        const result = await Promise.race([queryFn(), timeoutPromise]);
        
        // Mettre en cache si succès
        if (cache && result.data && !result.error) {
          queryCache.set(queryKey, result.data, cacheTime);
        }
        
        return result;
      } catch (error: any) {
        return { data: null, error };
      }
    };

    // Retry logic
    let lastError: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await executeWithTimeout();
        
        if (!result.error) {
          // Reset retry count on success
          retryCountRef.current.delete(queryKey);
          return result;
        }
        
        lastError = result.error;
        
        // Attendre avant de retry (délai croissant)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error: any) {
        lastError = error;
        
        // Attendre avant de retry
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Toutes les tentatives ont échoué
    retryCountRef.current.set(queryKey, retries);
    return { data: null, error: lastError };
  }, []);

  const clearCache = useCallback(() => {
    queryCache.clear();
  }, []);

  const getRetryCount = useCallback((queryKey: string) => {
    return retryCountRef.current.get(queryKey) || 0;
  }, []);

  return {
    executeQuery,
    clearCache,
    getRetryCount
  };
};

// Hook spécialisé pour les requêtes Supabase
export const useSupabaseQuery = () => {
  const { executeQuery } = useOptimizedQuery();

  const queryTable = useCallback(async <T>(
    table: string,
    query: any,
    options: QueryOptions = {}
  ): Promise<{ data: T | null; error: any }> => {
    const queryKey = `${table}_${JSON.stringify(query)}`;
    
    return executeQuery(
      queryKey,
      async () => {
        const { data, error } = await supabase
          .from(table)
          .select(query.select || '*')
          .eq(query.eq?.field || '', query.eq?.value || '')
          .limit(query.limit || 100)
          .order(query.order?.field || 'created_at', { ascending: query.order?.ascending !== false });
        
        return { data, error };
      },
      {
        timeout: 6000,
        retries: 1,
        cache: true,
        cacheTime: 180000, // 3 minutes
        ...options
      }
    );
  }, [executeQuery]);

  return { queryTable };
};
