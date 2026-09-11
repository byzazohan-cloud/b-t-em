const CACHE='butcem-premium-secure-v4';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.json','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
const FILES=['index.html','styles.css','app.js','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))]))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  const isAsset=FILES.some(f=>url.pathname.endsWith('/'+f));
  const isNavigation=e.request.mode==='navigate';
  if(!isAsset&&!isNavigation)return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{
    if(resp.ok&&isAsset)caches.open(CACHE).then(c=>c.put(e.request,resp.clone()));
    return resp;
  }).catch(()=>isNavigation?caches.match('./index.html'):undefined)));
});
