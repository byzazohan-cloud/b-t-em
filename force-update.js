'use strict';
(async()=>{
  try{
    if('serviceWorker' in navigator){
      const rs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(rs.map(r=>r.unregister()));
    }
    if('caches' in window){
      const ks=await caches.keys();
      await Promise.all(ks.filter(k=>k.startsWith('hane-')).map(k=>caches.delete(k)));
    }
  }catch(e){}
  location.replace('./?v=19.4.8.20260919-LOCAL-DATA-ONLY-11-STATEMENT-INTELLIGENCE&fresh='+Date.now());
})();
