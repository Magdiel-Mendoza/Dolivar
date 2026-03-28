/*
 * Dolivar - Service Worker
 * v1.2.8 — 28/03/2026
 * Permite instalación como app nativa y funcionamiento sin internet
 */

const CACHE_NAME = 'dolivar-cache-v1.2.8';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.png',
    './splash-animado.png'
];

// Instalación: guardar archivos en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activación: limpiar cachés viejos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: servir desde caché si no hay internet
self.addEventListener('fetch', event => {
    // Las llamadas a APIs externas siempre van a la red
    if (event.request.url.includes('dolarapi.com') ||
        event.request.url.includes('rafnixg.dev') ||
        event.request.url.includes('tailwindcss.com')) {
        event.respondWith(fetch(event.request).catch(() => new Response('')));
        return;
    }

    // Para los archivos de la app: caché primero, red como respaldo
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(() => caches.match('./index.html'))
    );
});
