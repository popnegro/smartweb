const CACHE_NAME = 'mitaxi-v2'; // Incrementamos versión
const ASSETS = [
  './', // Esto cachea el index.html automáticamente
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css'
];

// Instalación: Guardamos los archivos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 PWA: Cacheando archivos esenciales...');
        return cache.addAll(ASSETS);
      })
      .catch(err => {
        console.error('❌ Error en addAll (Revisá que todas las URLs existan):', err);
      })
  );
});

// Estrategia: Cache First, fallback to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});