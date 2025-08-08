/**
 * Service Worker pour le cache et les fonctionnalités offline
 * Optimisé pour l'application Directus Unified Platform
 */

const CACHE_NAME = 'directus-unified-v1.0.0';
const API_CACHE_NAME = 'directus-api-v1.0.0';
const ASSETS_CACHE_NAME = 'directus-assets-v1.0.0';

// Resources à mettre en cache immédiatement
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/App.vue',
  '/src/assets/css/main.css',
  '/src/utils/optimizations/advanced-cache.js',
  '/src/utils/optimizations/lazy-loader.js',
  '/src/utils/optimizations/virtual-scroll.js'
];

// Patterns d'API à mettre en cache
const API_CACHE_PATTERNS = [
  /\/api\/items\/companies/,
  /\/api\/items\/projects/,
  /\/api\/items\/client_invoices/,
  /\/api\/items\/people/,
  /\/api\/items\/activities/,
  /\/api\/users/,
  /\/api\/collections/,
  /\/api\/fields/
];

// Patterns à ne JAMAIS mettre en cache
const NO_CACHE_PATTERNS = [
  /\/api\/auth/,
  /\/api\/users\/me/,
  /\/api\/server\/info/,
  /\/api\/items\/audit_logs/,
  /\/websocket/
];

// Configuration du cache
const CACHE_CONFIG = {
  // Durée de vie par type de ressource (en millisecondes)
  ttl: {
    static: 7 * 24 * 60 * 60 * 1000,    // 7 jours
    api: 15 * 60 * 1000,                // 15 minutes
    images: 30 * 24 * 60 * 60 * 1000,   // 30 jours
    documents: 24 * 60 * 60 * 1000       // 24 heures
  },
  
  // Taille maximale des caches (en Mo)
  maxSize: {
    static: 50,
    api: 25,
    assets: 100
  }
};

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources statiques critiques
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Forcer l'activation immédiate
      self.skipWaiting()
    ])
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activation...');
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      cleanupOldCaches(),
      
      // Prendre le contrôle des clients existants
      self.clients.claim()
    ])
  );
});

// Intercepter les requêtes
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET ou cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }
  
  // Vérifier si la requête doit être ignorée
  if (shouldSkipCache(request)) {
    return;
  }
  
  // Déterminer la stratégie de cache appropriée
  if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isAssetRequest(request)) {
    event.respondWith(handleAssetRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Gestion des requêtes API avec stratégie Network First
async function handleAPIRequest(request) {
  const cacheName = API_CACHE_NAME;
  
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      // Mettre en cache si succès
      const cache = await caches.open(cacheName);
      const clonedResponse = networkResponse.clone();
      
      // Ajouter metadata de cache
      const responseWithMetadata = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: {
          ...Object.fromEntries(clonedResponse.headers),
          'sw-cache-time': Date.now().toString(),
          'sw-cache-ttl': CACHE_CONFIG.ttl.api.toString()
        }
      });
      
      cache.put(request, responseWithMetadata);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Réseau indisponible, tentative cache:', request.url);
    
    // Fallback sur le cache
    const cachedResponse = await getCachedResponse(request, cacheName);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Réponse d'erreur offline
    return createOfflineResponse(request);
  }
}

// Gestion des assets avec stratégie Cache First
async function handleAssetRequest(request) {
  const cacheName = ASSETS_CACHE_NAME;
  
  // Vérifier le cache d'abord
  const cachedResponse = await getCachedResponse(request, cacheName);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Télécharger depuis le réseau
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const clonedResponse = networkResponse.clone();
      
      // Déterminer le TTL selon le type
      let ttl = CACHE_CONFIG.ttl.static;
      if (isImageRequest(request)) {
        ttl = CACHE_CONFIG.ttl.images;
      } else if (isDocumentRequest(request)) {
        ttl = CACHE_CONFIG.ttl.documents;
      }
      
      // Mettre en cache avec metadata
      const responseWithMetadata = new Response(clonedResponse.body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: {
          ...Object.fromEntries(clonedResponse.headers),
          'sw-cache-time': Date.now().toString(),
          'sw-cache-ttl': ttl.toString()
        }
      });
      
      cache.put(request, responseWithMetadata);
    }
    
    return networkResponse;
    
  } catch (error) {
    return createOfflineResponse(request);
  }
}

// Gestion des ressources statiques avec stratégie Stale While Revalidate
async function handleStaticRequest(request) {
  const cacheName = CACHE_NAME;
  
  // Retourner immédiatement depuis le cache
  const cachedResponse = await getCachedResponse(request, cacheName);
  
  // Mettre à jour en arrière-plan
  const updatePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(cacheName);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);
  
  return cachedResponse || await updatePromise || createOfflineResponse(request);
}

// Utilitaires
function shouldSkipCache(request) {
  return NO_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

function isAPIRequest(request) {
  return request.url.includes('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

function isAssetRequest(request) {
  const url = request.url.toLowerCase();
  return url.includes('/assets/') ||
         url.includes('/files/') ||
         /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/i.test(url);
}

function isImageRequest(request) {
  return /\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i.test(request.url);
}

function isDocumentRequest(request) {
  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(request.url);
}

async function getCachedResponse(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (!cachedResponse) return null;
  
  // Vérifier l'expiration
  const cacheTime = cachedResponse.headers.get('sw-cache-time');
  const cacheTTL = cachedResponse.headers.get('sw-cache-ttl');
  
  if (cacheTime && cacheTTL) {
    const age = Date.now() - parseInt(cacheTime);
    const ttl = parseInt(cacheTTL);
    
    if (age > ttl) {
      // Cache expiré, le supprimer
      cache.delete(request);
      return null;
    }
  }
  
  return cachedResponse;
}

function fetchWithTimeout(request, timeout = 5000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeout);
    })
  ]);
}

function createOfflineResponse(request) {
  if (request.url.includes('/api/')) {
    // Réponse JSON pour les APIs
    return new Response(
      JSON.stringify({
        error: 'Application en mode hors ligne',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  // Page HTML pour les autres requêtes
  const offlineHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mode hors ligne</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh; 
          margin: 0; 
          background: #f5f5f5; 
        }
        .offline-container { 
          text-align: center; 
          padding: 2rem; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .icon { 
          font-size: 4rem; 
          margin-bottom: 1rem; 
        }
        .retry-btn {
          background: #007cba;
          color: white;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        .retry-btn:hover {
          background: #005a8b;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">📡</div>
        <h1>Mode hors ligne</h1>
        <p>Vous n'êtes pas connecté à Internet.<br>
           Certaines fonctionnalités peuvent être limitées.</p>
        <button class="retry-btn" onclick="location.reload()">
          Réessayer
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_NAME, API_CACHE_NAME, ASSETS_CACHE_NAME];
  
  return Promise.all(
    cacheNames
      .filter(cacheName => !validCaches.includes(cacheName))
      .map(cacheName => {
        console.log('[SW] Suppression cache obsolète:', cacheName);
        return caches.delete(cacheName);
      })
  );
}

// Nettoyage périodique des caches
async function cleanupExpiredEntries() {
  const cacheNames = [CACHE_NAME, API_CACHE_NAME, ASSETS_CACHE_NAME];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cacheTime = response?.headers.get('sw-cache-time');
      const cacheTTL = response?.headers.get('sw-cache-ttl');
      
      if (cacheTime && cacheTTL) {
        const age = Date.now() - parseInt(cacheTime);
        const ttl = parseInt(cacheTTL);
        
        if (age > ttl) {
          await cache.delete(request);
        }
      }
    }
  }
}

// Background sync pour les données critiques
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Synchroniser les données critiques quand la connexion revient
    const criticalEndpoints = [
      '/api/users/me',
      '/api/items/companies',
      '/api/items/projects?filter[status][_eq]=active'
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(API_CACHE_NAME);
          cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.log('[SW] Erreur sync:', endpoint, error);
      }
    }
    
  } catch (error) {
    console.log('[SW] Erreur background sync:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Directus Platform', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Messages depuis l'application principale
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ cleared: true });
    });
  }
});

// Statistiques du cache
async function getCacheStats() {
  const cacheNames = [CACHE_NAME, API_CACHE_NAME, ASSETS_CACHE_NAME];
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    stats[cacheName] = {
      count: requests.length,
      urls: requests.map(req => req.url)
    };
  }
  
  return stats;
}

// Nettoyage complet
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Nettoyage automatique toutes les heures
setInterval(cleanupExpiredEntries, 60 * 60 * 1000);

console.log('[SW] Service Worker chargé et prêt');