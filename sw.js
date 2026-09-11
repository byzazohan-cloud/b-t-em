const CACHE='butcem-premium-secure-v5';
const ASSETS=['./','./index.html','./styles.css?v=5','./app.js?v=5','./manifest.json','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin) return;
  const isNavigation=e.request.mode==='navigate';
  if(isNavigation){
    e.respondWith(fetch(e.request).then(resp=>{if(resp.ok)caches.open(CACHE).then(c=>c.put('./index.html',resp.clone()));return resp}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(fetch(e.request).then(resp=>{if(resp.ok)caches.open(CACHE).then(c=>c.put(e.request,resp.clone()));return resp}).catch(()=>caches.match(e.request)));
});
