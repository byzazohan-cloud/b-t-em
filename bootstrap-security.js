'use strict';
(() => {
  const BUILD='19.4.30-V113-S19-HAN-FIX2';
  const KEY='hane_app_shell_build';
  const RELOAD_KEY='hane_auto_update_reload';
  const CHECK_MS=60*60*1000;

  async function checkForUpdate(){
    if(!('serviceWorker' in navigator)) return;
    try{
      let reg=await navigator.serviceWorker.getRegistration('./');
      if(!reg) reg=await navigator.serviceWorker.register('./sw.js?v='+BUILD,{scope:'./',updateViaCache:'none'});
      await reg.update();
      const waiting=reg.waiting;
      if(waiting) waiting.postMessage({type:'SKIP_WAITING'});
    }catch(e){ console.warn('HANE update check:',e); }
  }

  try{
    if(localStorage.getItem(KEY)!==BUILD){
      localStorage.setItem(KEY,BUILD);
      checkForUpdate();
    }
  }catch(e){}

  if(!('serviceWorker' in navigator)) return;
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./sw.js?v='+BUILD,{scope:'./',updateViaCache:'none'});
      const activate=worker=>{
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller){
            try{worker.postMessage({type:'SKIP_WAITING'})}catch(e){}
          }
        });
      };
      activate(reg.installing);
      reg.addEventListener('updatefound',()=>activate(reg.installing));
      await reg.update();

      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        try{
          if(sessionStorage.getItem(RELOAD_KEY)===BUILD) return;
          sessionStorage.setItem(RELOAD_KEY,BUILD);
        }catch(e){}
        location.reload();
      });

      // Açık kalan HANE de yeni sürümü düzenli kontrol eder.
      setInterval(checkForUpdate,CHECK_MS);
      window.addEventListener('focus',checkForUpdate);
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkForUpdate();});
    }catch(e){console.warn('HANE update worker:',e)}
  });
})();
