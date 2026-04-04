const CACHE_NAME = 'mitaxi-v1';
const ASSETS = [
  '/mitaxi/',               // La raíz de la carpeta
  '/mitaxi/widget.html',    // Nombre exacto del archivo
  '/mitaxi/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => k !== CACHE_NAME && caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (e) => {
  // No cachear Google Maps para evitar errores de API
  if (e.request.url.includes('maps.googleapis') || e.request.url.includes('googleusercontent')) return;
  
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});