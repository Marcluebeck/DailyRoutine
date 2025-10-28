const CACHE_NAME = 'mein-super-start-v1';
const OFFLINE_URLS = [
  './',
  './src/index.html',
  './manifest.json',
  './icons/unicorn-maskottchen.svg',
  './src/css/style.css',
  './src/js/main.js',
  './src/js/storage.js',
  './src/js/gameLogic.js',
  './src/js/voice.js',
  './src/js/exportImport.js',
  './src/js/timer.js',
  './src/data/shopItems.json',
  './src/data/rewards.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
