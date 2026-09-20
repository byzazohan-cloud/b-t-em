'use strict';
(() => {
  const BUILD='19.4.8.20260920-LOCAL-DATA-ONLY-61-DENIZBANK-RIGHT-COLUMN';
  const KEY='hane_app_shell_build';
  try {
    if (localStorage.getItem(KEY) !== BUILD) {
      localStorage.setItem(KEY, BUILD);
      if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(regs.filter(r=>{try{return new URL(r.scope).pathname===new URL('./',location.href).pathname}catch{return false}}).map(r=>r.update().catch(()=>{})))).catch(()=>{});
    }
  } catch(e) {}
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js?v=' + BUILD, {updateViaCache:'none'});
      await reg.update();
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) worker.postMessage({type:'SKIP_WAITING'});
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Yeni worker devreye girince açık oturumu bozma.
        // Yeni sürüm bir sonraki manuel yenilemede doğal olarak kullanılacak.
        try{ sessionStorage.setItem('hane_update_ready','1'); }catch(e){}
      });
    } catch (e) { console.warn('HANE update worker:', e); }
  });
})();
