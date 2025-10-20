const CACHE_NAME = 'payhuk-v1';
const STATIC_CACHE = 'payhuk-static-v1';
const DYNAMIC_CACHE = 'payhuk-dynamic-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Ajouter les assets critiques
  '/assets/payhuk-logo.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Stratégie cache-first pour les assets statiques, network-first pour l'API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie différente selon le type de ressource
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    // Cache-first pour les assets statiques
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const responseToCache = fetchResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return fetchResponse;
        });
      })
    );
  } else if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    // Network-first pour les API
    event.respondWith(
      fetch(request).then((response) => {
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  } else {
    // Stale-while-revalidate pour les pages HTML
    event.respondWith(
      caches.match(request).then((response) => {
        const fetchPromise = fetch(request).then((fetchResponse) => {
          const responseToCache = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return fetchResponse;
        });
        return response || fetchPromise;
      })
    );
  }
});
