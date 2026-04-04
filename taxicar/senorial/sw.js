const CACHE_NAME = 'senorial-cache-v1';

// Lista de recursos a cachear (Asegúrate de que los nombres de archivos sean exactos)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './senorial-brand.webp',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap'
];

// Instalación y guardado de caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Limpieza de cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// Estrategia de respuesta
self.addEventListener('fetch', (e) => {
  // NO cachear llamadas a Google Maps API
  if (e.request.url.includes('maps.googleapis.com') || e.request.url.includes('googleusercontent')) return;

  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});