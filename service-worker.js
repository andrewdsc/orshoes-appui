const CACHE_NAME = 'orshoes-cache-v8';
const ASSETS = [
    './',
    './index.html',
    './index.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './classic_leather_shoes.jpg'
];

// Install Event - Pre-cache Assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker pre-caching static assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Service Worker clearing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Serve Cached Assets (Stale-while-revalidate pattern)
self.addEventListener('fetch', (e) => {
    if (e.request.url.startsWith(self.location.origin)) {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                if (cachedResponse) {
                    // Update cache in the background
                    fetch(e.request).then((networkResponse) => {
                        if (networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(e.request, networkResponse);
                            });
                        }
                    }).catch(() => {});
                    
                    return cachedResponse;
                }
                return fetch(e.request);
            })
        );
    }
});
