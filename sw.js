/* HANE PWA update worker - network first + OCR/PDF offline warm cache */
const CACHE_NAME = 'hane-v19-4-8-STATEMENT-TEST-FIXED-20260919';
const APP_SHELL = [
  './', './index.html', './styles.css', './app-v19.js', './manifest.json', './update-config.json',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/hane-app-icon.png',
  './vendor/tesseract/lang/tur.traineddata.gz', './vendor/tesseract/lang/eng.traineddata.gz'
];
const ENGINE_ASSETS = [
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core.wasm.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-simd.wasm.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-lstm.wasm.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-simd-lstm.wasm.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL).catch(()=>{});
    await Promise.allSettled(ENGINE_ASSETS.map(async url=>{
      try{const req=new Request(url,{mode:'cors',credentials:'omit',cache:'no-store'}),res=await fetch(req);if(res&&res.ok)await cache.put(req,res.clone())}catch{}
    }));
  })());
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
  const sameOrigin=url.origin===self.location.origin;
  const engine=ENGINE_ASSETS.includes(url.href);
  if(!sameOrigin&&!engine)return;
  event.respondWith((async () => {
    const cache=await caches.open(CACHE_NAME);
    try {
      const fresh = await fetch(event.request, {cache:'no-store'});
      if (fresh && (fresh.ok || fresh.type==='opaque')) {
        cache.put(event.request, fresh.clone()).catch(()=>{});
        if (sameOrigin && event.request.mode === 'navigate') cache.put('./index.html', fresh.clone()).catch(()=>{});
      }
      return fresh;
    } catch (e) {
      const cached=await cache.match(event.request);
      if(cached)return cached;
      if (sameOrigin && event.request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
