import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash-es';

// Hook pour le debouncing des valeurs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook pour le throttling des fonctions
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback as T;
}

// Hook pour le debouncing des fonctions
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback as T;
}

// Hook pour la virtualisation des listes
interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
}

// Hook pour l'intersection observer (lazy loading)
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Hook pour le lazy loading d'images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { isIntersecting } = useIntersectionObserver(imgRef);

  useEffect(() => {
    if (!isIntersecting || !src) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    img.src = src;
  }, [isIntersecting, src]);

  return {
    imageSrc,
    isLoading,
    hasError,
    imgRef
  };
}

// Hook pour la gestion de la mémoire
export function useMemoryOptimization() {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => fn());
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Nettoyage périodique de la mémoire
  useEffect(() => {
    const interval = setInterval(() => {
      // Forcer le garbage collection si disponible
      if (window.gc) {
        window.gc();
      }
    }, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return { addCleanup, cleanup };
}

// Hook pour le code splitting dynamique
export function useDynamicImport<T>(
  importFn: () => Promise<T>,
  deps: any[] = []
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return;

    setIsLoading(true);
    setError(null);

    try {
      const module = await importFn();
      setComponent(module);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setIsLoading(false);
    }
  }, [Component, importFn]);

  useEffect(() => {
    loadComponent();
  }, deps);

  return { Component, isLoading, error, loadComponent };
}

// Hook pour la précharge des ressources
export function usePreload() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const preloadStylesheet = useCallback((href: string) => {
    if (preloadedResources.current.has(href)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        preloadedResources.current.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadStylesheet,
    isPreloaded: (src: string) => preloadedResources.current.has(src)
  };
}

// Hook pour la gestion des Web Workers
export function useWebWorker<T = any>(
  workerScript: string | Worker,
  options: { autoStart?: boolean } = {}
) {
  const { autoStart = true } = options;
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startWorker = useCallback(() => {
    if (workerRef.current) return;

    try {
      if (typeof workerScript === 'string') {
        workerRef.current = new Worker(workerScript);
      } else {
        workerRef.current = workerScript;
      }

      workerRef.current.onmessage = (event) => {
        // Gérer les messages du worker
        console.log('Message from worker:', event.data);
      };

      workerRef.current.onerror = (error) => {
        setError(error);
        console.error('Worker error:', error);
      };

      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create worker'));
    }
  }, [workerScript]);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
    }
  }, []);

  const postMessage = useCallback((message: T) => {
    if (workerRef.current && isReady) {
      workerRef.current.postMessage(message);
    }
  }, [isReady]);

  useEffect(() => {
    if (autoStart) {
      startWorker();
    }

    return () => {
      terminateWorker();
    };
  }, [autoStart, startWorker, terminateWorker]);

  return {
    isReady,
    error,
    startWorker,
    terminateWorker,
    postMessage
  };
}

// Hook pour la gestion des performances avec Web Vitals
export function useWebVitals() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    const measureWebVitals = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, FCP: fcpEntry.startTime }));
      }

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, LCP: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics(prev => ({ ...prev, FID: entry.processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics(prev => ({ ...prev, CLS: clsValue }));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    };

    const cleanup = measureWebVitals();
    return cleanup;
  }, []);

  return metrics;
}