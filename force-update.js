'use strict';
(async()=>{
  try{
    if('serviceWorker' in navigator){
      const ownScope=new URL('./',location.href).href;
      const rs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(rs.filter(r=>{
        try{return new URL(r.scope).href===ownScope}catch{return false}
      }).map(r=>r.unregister()));
    }
    if('caches' in window){
      const ks=await caches.keys();
      await Promise.all(ks.filter(k=>k.startsWith('hane-')).map(k=>caches.delete(k)));
    }
  }catch(e){}
  location.replace('./?v=19.4.8.20260920-LOCAL-DATA-ONLY-83-HALKBANK-DESC-ROW-FIX&fresh='+Date.now());
})();
