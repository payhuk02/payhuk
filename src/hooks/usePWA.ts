import React, { useState, useEffect, useCallback } from 'react';

// Types pour le PWA
interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable' | 'monochrome';
  }>;
}

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Configuration PWA par défaut
const defaultPWAConfig: PWAConfig = {
  name: 'Payhuk - Plateforme E-commerce',
  shortName: 'Payhuk',
  description: 'Plateforme e-commerce moderne et professionnelle',
  themeColor: '#3B82F6',
  backgroundColor: '#FFFFFF',
  display: 'standalone',
  orientation: 'any',
  startUrl: '/',
  scope: '/',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-maskable-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
};

// Hook principal pour le PWA
export const usePWA = (config: Partial<PWAConfig> = {}) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);

  const pwaConfig = { ...defaultPWAConfig, ...config };

  // Vérifier si l'app est installée
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
      
      setIsInstalled(isStandalone || (isIOS && isInStandaloneMode));
    };

    checkInstalled();
  }, []);

  // Écouter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Gérer l'invite d'installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Installer l'app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Mettre à jour le manifest
  const updateManifest = useCallback(() => {
    const manifest = {
      name: pwaConfig.name,
      short_name: pwaConfig.shortName,
      description: pwaConfig.description,
      theme_color: pwaConfig.themeColor,
      background_color: pwaConfig.backgroundColor,
      display: pwaConfig.display,
      orientation: pwaConfig.orientation,
      start_url: pwaConfig.startUrl,
      scope: pwaConfig.scope,
      icons: pwaConfig.icons
    };

    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json'
    });
    const manifestURL = URL.createObjectURL(manifestBlob);

    const link = document.querySelector('link[rel="manifest"]');
    if (link) {
      link.setAttribute('href', manifestURL);
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'manifest';
      newLink.href = manifestURL;
      document.head.appendChild(newLink);
    }
  }, [pwaConfig]);

  // Initialiser le manifest
  useEffect(() => {
    updateManifest();
  }, [updateManifest]);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    updateManifest
  };
};

// Hook pour la gestion du cache offline
export const useOfflineCache = () => {
  const [isServiceWorkerSupported, setIsServiceWorkerSupported] = useState(false);
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  // Vérifier le support du Service Worker
  useEffect(() => {
    setIsServiceWorkerSupported('serviceWorker' in navigator);
  }, []);

  // Enregistrer le Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!isServiceWorkerSupported) return false;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      setIsServiceWorkerRegistered(true);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }, [isServiceWorkerSupported]);

  // Obtenir la taille du cache
  const getCacheSize = useCallback(async () => {
    if (!isServiceWorkerSupported) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      setCacheSize(totalSize);
      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }, [isServiceWorkerSupported]);

  // Nettoyer le cache
  const clearCache = useCallback(async () => {
    if (!isServiceWorkerSupported) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      setCacheSize(0);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }, [isServiceWorkerSupported]);

  // Précharger des ressources
  const preloadResources = useCallback(async (urls: string[]) => {
    if (!isServiceWorkerSupported) return false;

    try {
      const cache = await caches.open('preload-cache');
      await Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          await cache.put(url, response);
        })
      );
      return true;
    } catch (error) {
      console.error('Error preloading resources:', error);
      return false;
    }
  }, [isServiceWorkerSupported]);

  useEffect(() => {
    if (isServiceWorkerRegistered) {
      getCacheSize();
    }
  }, [isServiceWorkerRegistered, getCacheSize]);

  return {
    isServiceWorkerSupported,
    isServiceWorkerRegistered,
    cacheSize,
    registerServiceWorker,
    getCacheSize,
    clearCache,
    preloadResources
  };
};

// Hook pour les notifications push
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    setPermission(Notification.permission);
  }, []);

  // Demander la permission pour les notifications
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // S'abonner aux notifications push
  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      setSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [isSupported, permission]);

  // Se désabonner des notifications push
  const unsubscribeFromPush = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription]);

  // Envoyer une notification locale
  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return false;

    try {
      new Notification(title, options);
      return true;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return false;
    }
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendLocalNotification
  };
};

// Composant pour l'invite d'installation PWA
interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const { isInstallable, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      setIsVisible(true);
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
      onInstall?.();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18l9-5-9-5-9 5 9 5z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Installer Payhuk
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Installez l'application pour un accès rapide
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Plus tard
          </button>
          <button
            onClick={handleInstall}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1 rounded-md transition-colors"
          >
            Installer
          </button>
        </div>
      </div>
    </div>
  );
};
