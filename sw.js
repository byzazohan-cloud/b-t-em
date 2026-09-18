/* HANE PWA update worker - network first for app shell */
const CACHE_NAME = 'hane-v19-4-8-g3-card-cash-statement-20260918';
const APP_SHELL = [
  './', './index.html', './styles.css', './app-v19.js', './manifest.json',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL).catch(() => {})));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const fresh = await fetch(event.request, {cache:'no-store'});
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone()).catch(()=>{});
        if (event.request.mode === 'navigate') cache.put('./index.html', fresh.clone()).catch(()=>{});
      }
      return fresh;
    } catch (e) {
      if (event.request.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});
