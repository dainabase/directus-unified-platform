/**
 * Service Worker - Portal Multi-Rôles
 * Gestion du mode offline et cache intelligent
 */

const CACHE_NAME = 'portal-v1';
const DYNAMIC_CACHE = 'portal-dynamic-v1';

// Ressources essentielles à mettre en cache
const urlsToCache = [
    '/',
    '/index.html',
    '/login.html',
    '/assets/css/tabler.min.css',
    '/assets/css/custom.css',
    '/assets/css/responsive-fixes.css',
    '/assets/js/app.js',
    '/assets/js/portal-integration.js',
    '/assets/img/logo.svg',
    '/offline.html',
    // Fonts
    'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/iconfont/tabler-icons.min.css',
    // Client
    '/client/dashboard.html',
    '/client/projects.html',
    '/client/documents.html',
    '/client/finances.html',
    // Prestataire  
    '/prestataire/dashboard.html',
    '/prestataire/missions.html',
    '/prestataire/rewards.html',
    '/prestataire/collaboration.html',
    // Revendeur
    '/revendeur/dashboard.html',
    '/revendeur/pipeline.html',
    '/revendeur/marketing.html',
    '/revendeur/reports.html'
];

// Install event - mise en cache initiale
self.addEventListener('install', event => {
    console.log('[SW] Installation...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Mise en cache des ressources essentielles');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - nettoyage des anciens caches
self.addEventListener('activate', event => {
    console.log('[SW] Activation...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - stratégies de cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') return;
    
    // API calls - Network First
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // Static assets - Cache First
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // HTML pages - Network First with fallback
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(networkFirstWithOffline(request));
        return;
    }
    
    // Default - Network First
    event.respondWith(networkFirst(request));
});

// Stratégie Cache First
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        // Mettre à jour en arrière-plan
        fetchAndCache(request);
        return cached;
    }
    
    return fetchAndCache(request);
}

// Stratégie Network First
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        // Mettre en cache si succès
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        
        // Si API call échoue, retourner erreur JSON
        if (request.url.includes('/api/')) {
            return new Response(
                JSON.stringify({ 
                    error: 'Offline', 
                    message: 'Connexion indisponible' 
                }),
                { 
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        throw error;
    }
}

// Network First avec page offline
async function networkFirstWithOffline(request) {
    try {
        return await networkFirst(request);
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        
        // Retourner page offline
        return caches.match('/offline.html');
    }
}

// Fetch et mise en cache
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

// Vérifier si c'est un asset statique
function isStaticAsset(pathname) {
    const staticExtensions = [
        '.css', '.js', '.json', '.png', '.jpg', '.jpeg', 
        '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot'
    ];
    
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Gestion des messages du client
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    if (event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls;
        caches.open(DYNAMIC_CACHE).then(cache => {
            cache.addAll(urls);
        });
    }
});

// Background sync pour les formulaires offline
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncOfflineForms());
    }
});

// Synchroniser les formulaires en attente
async function syncOfflineForms() {
    const db = await openDB();
    const tx = db.transaction('pending-forms', 'readonly');
    const forms = await tx.objectStore('pending-forms').getAll();
    
    for (const form of forms) {
        try {
            await fetch(form.url, {
                method: 'POST',
                headers: form.headers,
                body: form.body
            });
            
            // Supprimer de la DB si succès
            await removePendingForm(form.id);
            
            // Notifier le client
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'FORM_SYNCED',
                        formId: form.id
                    });
                });
            });
            
        } catch (error) {
            console.error('[SW] Erreur sync formulaire:', error);
        }
    }
}

// Push notifications
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/img/logo.svg',
        badge: '/assets/img/badge.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Ouvrir',
                icon: '/assets/img/open.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/assets/img/close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Click sur notification
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        const urlToOpen = event.notification.data.url;
        
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then(windowClients => {
                    // Chercher si déjà ouvert
                    for (const client of windowClients) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Sinon ouvrir nouveau
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Periodic Background Sync (si supporté)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-data') {
        event.waitUntil(updateCachedData());
    }
});

// Mettre à jour les données en cache
async function updateCachedData() {
    const criticalUrls = [
        '/api/user/profile',
        '/api/notifications/unread',
        '/api/dashboard/stats'
    ];
    
    const cache = await caches.open(DYNAMIC_CACHE);
    
    for (const url of criticalUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.error('[SW] Erreur mise à jour cache:', url, error);
        }
    }
}

// Gestion taille du cache
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        trimCache(cacheName, maxItems);
    }
}

// Nettoyer régulièrement le cache dynamique
setInterval(() => {
    trimCache(DYNAMIC_CACHE, 50);
}, 60000); // Toutes les minutes

console.log('[SW] Service Worker chargé');