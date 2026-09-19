'use strict';
(() => {
  const BUILD='19.4.8.20260919-LOCAL-DATA-ONLY-5';
  const KEY='hane_app_shell_build';
  try {
    if (localStorage.getItem(KEY) !== BUILD) {
      localStorage.setItem(KEY, BUILD);
      if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(regs.map(r=>r.update().catch(()=>{})))).catch(()=>{});
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
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        location.reload();
      });
    } catch (e) { console.warn('HANE update worker:', e); }
  });
})();
