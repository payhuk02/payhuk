import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Types pour les événements de tracking
interface TrackingEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface PageViewEvent {
  page: string;
  title: string;
  url: string;
  referrer?: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

// Configuration du tracking
interface TrackingConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushInterval: number;
  apiEndpoint?: string;
}

const defaultConfig: TrackingConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  batchSize: 10,
  flushInterval: 30000, // 30 secondes
  apiEndpoint: '/api/analytics'
};

class AnalyticsTracker {
  private config: TrackingConfig;
  private events: TrackingEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  track(event: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const trackingEvent: TrackingEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.events.push(trackingEvent);

    if (this.config.debug) {
      console.log('Analytics Event:', trackingEvent);
    }

    // Flush si le batch est plein
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  trackPageView(page: string, title: string, url: string, referrer?: string): void {
    if (!this.config.enabled) return;

    const pageViewEvent: PageViewEvent = {
      page,
      title,
      url,
      referrer,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.track('page_view', pageViewEvent);
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context
    });
  }

  trackPerformance(metrics: PerformanceMetrics): void {
    this.track('performance', metrics);
  }

  trackUserAction(action: string, target?: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      target,
      ...properties
    });
  }

  trackBusinessEvent(event: string, value?: number, currency?: string, properties?: Record<string, any>): void {
    this.track('business_event', {
      event,
      value,
      currency,
      ...properties
    });
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      if (this.config.apiEndpoint) {
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: eventsToFlush,
            sessionId: this.sessionId,
            userId: this.userId
          })
        });
      }

      // Envoyer aussi vers Google Analytics si configuré
      if (typeof gtag !== 'undefined') {
        eventsToFlush.forEach(event => {
          gtag('event', event.event, {
            event_category: 'custom',
            event_label: JSON.stringify(event.properties),
            value: event.properties?.value || 0
          });
        });
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Remettre les événements en cas d'erreur
      this.events.unshift(...eventsToFlush);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Instance globale du tracker
const analyticsTracker = new AnalyticsTracker();

// Hook pour utiliser le tracking
export const useAnalytics = () => {
  const location = useLocation();

  // Track page views automatiquement
  useEffect(() => {
    const page = location.pathname;
    const title = document.title;
    const url = window.location.href;
    const referrer = document.referrer;

    analyticsTracker.trackPageView(page, title, url, referrer);
  }, [location]);

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analyticsTracker.track(event, properties);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analyticsTracker.trackError(error, context);
  }, []);

  const trackUserAction = useCallback((action: string, target?: string, properties?: Record<string, any>) => {
    analyticsTracker.trackUserAction(action, target, properties);
  }, []);

  const trackBusinessEvent = useCallback((event: string, value?: number, currency?: string, properties?: Record<string, any>) => {
    analyticsTracker.trackBusinessEvent(event, value, currency, properties);
  }, []);

  return {
    track,
    trackError,
    trackUserAction,
    trackBusinessEvent
  };
};

// Hook pour le tracking des performances
export const usePerformanceTracking = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Attendre que la page soit complètement chargée
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Nécessite l'API LCP
        cumulativeLayoutShift: 0, // Nécessite l'API CLS
        firstInputDelay: 0, // Nécessite l'API FID
        timeToInteractive: navigation.domInteractive - navigation.navigationStart
      };

      analyticsTracker.trackPerformance(metrics);
    };

    // Mesurer après le chargement complet
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);
};

// Hook pour le tracking des erreurs
export const useErrorTracking = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analyticsTracker.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analyticsTracker.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

// Composant pour initialiser le tracking
interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
  config?: Partial<TrackingConfig>;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  userId,
  config
}) => {
  useEffect(() => {
    if (userId) {
      analyticsTracker.setUserId(userId);
    }

    if (config) {
      Object.assign(analyticsTracker, config);
    }

    return () => {
      analyticsTracker.destroy();
    };
  }, [userId, config]);

  return <>{children}</>;
};

// Utilitaires pour le tracking des événements métier
export const BusinessEvents = {
  // Événements produits
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',
  PRODUCT_PURCHASED: 'product_purchased',
  
  // Événements commandes
  ORDER_CREATED: 'order_created',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  
  // Événements utilisateur
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Événements boutique
  STORE_CREATED: 'store_created',
  STORE_UPDATED: 'store_updated',
  
  // Événements recherche
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  
  // Événements support
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  SUPPORT_TICKET_RESOLVED: 'support_ticket_resolved'
};

export default analyticsTracker;
