import { useEffect, useCallback, useRef } from 'react';

interface PerformanceOptimizationOptions {
  enableVirtualScrolling?: boolean;
  enableImageLazyLoading?: boolean;
  enableDebouncing?: boolean;
  debounceDelay?: number;
  enableMemoization?: boolean;
  enablePrefetching?: boolean;
}

/**
 * Hook pour optimiser les performances de l'application
 */
export function usePerformanceOptimization(options: PerformanceOptimizationOptions = {}) {
  const {
    enableVirtualScrolling = true,
    enableImageLazyLoading = true,
    enableDebouncing = true,
    debounceDelay = 300,
    enableMemoization = true,
    enablePrefetching = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimisation des images avec lazy loading
  useEffect(() => {
    if (!enableImageLazyLoading) return;

    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.getAttribute('data-src');
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    images.forEach((img) => {
      observerRef.current?.observe(img);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableImageLazyLoading]);

  // Fonction de debounce pour les recherches et filtres
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      if (!enableDebouncing) return func;

      return ((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          func(...args);
        }, debounceDelay);
      }) as T;
    },
    [enableDebouncing, debounceDelay]
  );

  // Prefetching des ressources critiques
  useEffect(() => {
    if (!enablePrefetching) return;

    const prefetchResources = () => {
      // Prefetch des images critiques
      const criticalImages = [
        '/images/hero-bg.jpg',
        '/images/logo.png',
        '/images/placeholder-product.jpg',
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = src;
        document.head.appendChild(link);
      });

      // Prefetch des routes importantes
      const criticalRoutes = [
        '/dashboard',
        '/marketplace',
        '/auth',
      ];

      criticalRoutes.forEach((route) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    };

    // Attendre que la page soit chargée
    if (document.readyState === 'complete') {
      prefetchResources();
    } else {
      window.addEventListener('load', prefetchResources);
    }

    return () => {
      window.removeEventListener('load', prefetchResources);
    };
  }, [enablePrefetching]);

  // Optimisation de la mémoire
  useEffect(() => {
    const cleanup = () => {
      // Nettoyer les timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Nettoyer les observers
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };

    return cleanup;
  }, []);

  // Fonction pour optimiser les listes longues
  const optimizeList = useCallback(
    (items: any[], containerHeight: number, itemHeight: number) => {
      if (!enableVirtualScrolling) return items;

      const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // Buffer de 2 éléments
      const startIndex = 0; // À implémenter avec scroll position
      const endIndex = Math.min(startIndex + visibleItems, items.length);

      return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        endIndex,
        totalHeight: items.length * itemHeight,
      };
    },
    [enableVirtualScrolling]
  );

  // Fonction pour optimiser les images
  const optimizeImage = useCallback(
    (src: string, options: { width?: number; height?: number; quality?: number } = {}) => {
      if (!src) return src;

      const { width, height, quality = 80 } = options;
      const url = new URL(src, window.location.origin);

      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('f', 'webp');

      return url.toString();
    },
    []
  );

  // Fonction pour mesurer les performances
  const measurePerformance = useCallback(
    (name: string, fn: () => void) => {
      if (process.env.NODE_ENV !== 'development') {
        fn();
        return;
      }

      const start = performance.now();
      fn();
      const end = performance.now();
      
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
    },
    []
  );

  return {
    debounce,
    optimizeList,
    optimizeImage,
    measurePerformance,
  };
}

/**
 * Hook pour le lazy loading des composants
 */
export function useLazyComponent<T>(
  importFunc: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return;

    setLoading(true);
    setError(null);

    try {
      const module = await importFunc();
      setComponent(module);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setLoading(false);
    }
  }, [importFunc, Component]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent, ...deps]);

  return {
    Component,
    loading,
    error,
    retry: loadComponent,
  };
}

export default usePerformanceOptimization;
