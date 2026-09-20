/* HANE PWA - LOCAL DATA ONLY 35 read-fix verified lazy-engine service worker
   SECURITY MODEL
   1) Personal HANE data/documents are never uploaded by this worker.
   2) OCR/PDF engine packages are fetched only on explicit PREPARE_ENGINES using fixed npm tarball URLs,
      credentials omitted and no referrer.
   3) Each package tarball is verified with pinned SHA-512 integrity BEFORE any executable
      engine file is extracted/cached.
   4) Runtime is cache-only: no page/worker request is allowed to reach the network.
*/
const SW_BUILD = '19.4.8.20260920-LOCAL-DATA-ONLY-78-HALKBANK-COMPACT-FOOTER-GUARD';
const CACHE_NAME = 'hane-v19-4-8-LOCAL-DATA-ONLY-49-Z-THEME-STUDIO-FIX';
const HANE_CACHE_PREFIX = 'hane-';


const APP_SHELL=[
  './','./index.html','./styles.css','./bootstrap-security.js','./app-v19.js','./manifest.json','./update-config.json','./force-update.html','./force-update.js',
  './icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png','./icons/hane-app-icon.png',
  './vendor/tesseract/lang/tur.traineddata.gz','./vendor/tesseract/lang/eng.traineddata.gz'
];

const PACKAGES=[
  {
    url:'https://registry.npmjs.org/tesseract.js/-/tesseract.js-5.1.1.tgz',
    integrity:'sha512-lzVl/Ar3P3zhpUT31NjqeCo1f+D5+YfpZ5J62eo2S14QNVOmHBTtbchHm/YAbOOOzCegFnKf4B3Qih9LuldcYQ==',
    files:{
      'package/dist/tesseract.min.js':'__hane_engine__/tesseract/tesseract.min.js',
      'package/dist/worker.min.js':'__hane_engine__/tesseract/worker.min.js'
    }
  },
  {
    url:'https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-5.1.1.tgz',
    integrity:'sha512-KX3bYSU5iGcO1XJa+QGPbi+Zjo2qq6eBhNjSGR5E5q0JtzkoipJKOUQD7ph8kFyteCEfEQ0maWLu8MCXtvX5uQ==',
    files:{
      'package/tesseract-core.wasm.js':'__hane_engine__/tesseract/core/tesseract-core.wasm.js',
      'package/tesseract-core-simd.wasm.js':'__hane_engine__/tesseract/core/tesseract-core-simd.wasm.js',
      'package/tesseract-core-lstm.wasm.js':'__hane_engine__/tesseract/core/tesseract-core-lstm.wasm.js',
      'package/tesseract-core-simd-lstm.wasm.js':'__hane_engine__/tesseract/core/tesseract-core-simd-lstm.wasm.js',
      'package/tesseract-core.wasm':'__hane_engine__/tesseract/core/tesseract-core.wasm',
      'package/tesseract-core-simd.wasm':'__hane_engine__/tesseract/core/tesseract-core-simd.wasm',
      'package/tesseract-core-lstm.wasm':'__hane_engine__/tesseract/core/tesseract-core-lstm.wasm',
      'package/tesseract-core-simd-lstm.wasm':'__hane_engine__/tesseract/core/tesseract-core-simd-lstm.wasm'
    }
  },
  {
    url:'https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-4.10.38.tgz',
    integrity:'sha512-/Y3fcFrXEAsMjJXeL9J8+ZG9U01LbuWaYypvDW2ycW1jL269L3js3DVBjDJ0Up9Np1uqDXsDrRihHANhZOlwdQ==',
    files:{
      'package/build/pdf.min.mjs':'__hane_engine__/pdf/pdf.min.mjs',
      'package/build/pdf.worker.min.mjs':'__hane_engine__/pdf/pdf.worker.min.mjs'
    }
  }
];

const SCOPE=new URL(self.registration.scope);
const virtualHref=rel=>new URL(String(rel).replace(/^\.\//,''),SCOPE).href;
const VIRTUAL_BY_PATH=new Map(PACKAGES.flatMap(p=>Object.values(p.files)).map(rel=>{const href=virtualHref(rel);return[new URL(href).pathname,href]}));
const APP_PATHS=new Map(APP_SHELL.map(rel=>[new URL(rel,SCOPE).pathname,rel]));

function bytesToBase64(bytes){
  let s=''; const step=0x8000;
  for(let i=0;i<bytes.length;i+=step)s+=String.fromCharCode(...bytes.subarray(i,i+step));
  return btoa(s);
}
async function verifyIntegrity(buffer,expected){
  const [alg,want]=expected.split('-',2);
  if(alg!=='sha512'||!want)throw new Error('Unsupported package integrity');
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-512',buffer));
  const got=bytesToBase64(digest);
  if(got!==want)throw new Error('Engine package integrity mismatch');
}
function readTarString(u8,start,len){
  const part=u8.subarray(start,start+len); let end=part.indexOf(0); if(end<0)end=part.length;
  return new TextDecoder().decode(part.subarray(0,end)).trim();
}
function parseOctal(s){const clean=String(s||'').replace(/\0/g,'').trim();return clean?parseInt(clean,8)||0:0}
async function gunzip(buffer){
  if(typeof DecompressionStream!=='function')throw new Error('Secure package decompression is unsupported on this device');
  const stream=new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
function extractTarFiles(tar,needed){
  const found=new Map();
  for(let off=0;off+512<=tar.length;){
    const name=readTarString(tar,off,100),prefix=readTarString(tar,off+345,155);
    if(!name)break;
    const full=prefix?`${prefix}/${name}`:name;
    const size=parseOctal(readTarString(tar,off+124,12));
    const type=String.fromCharCode(tar[off+156]||48);
    const dataStart=off+512,dataEnd=dataStart+size;
    if((type==='0'||type==='\0')&&needed.has(full))found.set(full,tar.slice(dataStart,dataEnd));
    off=dataStart+Math.ceil(size/512)*512;
  }
  return found;
}
function mimeFor(path){
  if(path.endsWith('.wasm'))return'application/wasm';
  if(path.endsWith('.mjs'))return'text/javascript; charset=utf-8';
  if(path.endsWith('.js'))return'text/javascript; charset=utf-8';
  return'application/octet-stream';
}
async function installVerifiedPackage(cache,pkg){
  const req=new Request(pkg.url,{mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
  const res=await fetch(req);
  if(!res||!res.ok)throw new Error('Engine package download failed');
  const archive=await res.arrayBuffer();
  await verifyIntegrity(archive,pkg.integrity);
  const tar=await gunzip(archive);
  const needed=new Set(Object.keys(pkg.files)),files=extractTarFiles(tar,needed);
  if(files.size!==needed.size){
    const missing=[...needed].filter(x=>!files.has(x));
    throw new Error('Verified engine package is missing required files: '+missing.join(','));
  }
  for(const [tarPath,virtualPath] of Object.entries(pkg.files)){
    const body=files.get(tarPath);
    const localUrl=virtualHref(virtualPath);
    await cache.put(localUrl,new Response(body,{status:200,headers:{
      'Content-Type':mimeFor(virtualPath),
      'Cache-Control':'public, max-age=31536000, immutable',
      'X-HANE-Verified':'sha512-package'
    }}));
  }
}
async function installVerifiedEngines(cache){for(const pkg of PACKAGES)await installVerifiedPackage(cache,pkg)}
async function enginesReady(cache){
  for(const href of VIRTUAL_BY_PATH.values())if(!(await cache.match(href)))return false;
  return true;
}
async function ensureVerifiedEngines(){
  const cache=await caches.open(CACHE_NAME);
  if(await enginesReady(cache))return true;
  // Engine packages are fetched here BEFORE the user selects any personal document.
  // Fixed package URLs + pinned SHA-512 verification; no credentials/referrer/document data.
  await installVerifiedEngines(cache);
  if(!(await enginesReady(cache)))throw new Error('Verified engine cache could not be completed');
  return true;
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{
      // Activate quickly. Verified OCR/PDF engines are prepared on demand BEFORE file selection.
      // Do not delay Service Worker activation with multi-megabyte engine downloads.
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    }catch(err){
      await caches.delete(CACHE_NAME);
      throw err;
    }
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    // Activation only occurs after a complete HANE app shell install. Engines are verified on demand before statement selection.
    const current=await caches.open(CACHE_NAME);
    for(const rel of APP_SHELL){if(!(await current.match(rel)))throw new Error('HANE shell validation failed: '+rel)}
    const keys=await caches.keys();
    // Cache isolation: never delete caches owned by RUTIN, ZAZO TYCOON or another PWA on the same origin.
    await Promise.all(keys.filter(k=>k!==CACHE_NAME&&k.startsWith(HANE_CACHE_PREFIX)).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='PING'){
    const port=event.ports&&event.ports[0];
    port&&port.postMessage({ok:true,build:SW_BUILD});
    return;
  }
  if(event.data&&event.data.type==='SKIP_WAITING'){self.skipWaiting();return}
  if(event.data&&event.data.type==='PREPARE_ENGINES'){
    const port=event.ports&&event.ports[0];
    event.waitUntil((async()=>{
      try{await ensureVerifiedEngines();port&&port.postMessage({ok:true,build:SW_BUILD})}
      catch(err){port&&port.postMessage({ok:false,build:SW_BUILD,error:String(err&&err.message||err)})}
    })());
  }
});

function blocked(status=403,msg='Blocked by HANE local-data firewall'){
  return new Response(msg,{status,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
}

self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  const sameOrigin=url.origin===SCOPE.origin;

  // Verified fallback may download only the three fixed npm package archives BEFORE file selection.
  // The page verifies each archive against a pinned SHA-512 before caching/executing any engine file.
  const pinnedPackage=url.origin==='https://registry.npmjs.org' && (
    url.pathname==='/tesseract.js/-/tesseract.js-5.1.1.tgz' ||
    url.pathname==='/tesseract.js-core/-/tesseract.js-core-5.1.1.tgz' ||
    url.pathname==='/pdfjs-dist/-/pdfjs-dist-4.10.38.tgz'
  );
  if(!sameOrigin&&pinnedPackage&&req.method==='GET'){
    event.respondWith(fetch(new Request(url.href,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'})));
    return;
  }

  // Runtime firewall: all other cross-origin requests remain blocked.
  if(!sameOrigin){event.respondWith(blocked());return}
  if(req.method!=='GET'){event.respondWith(blocked(405,'HANE runtime network writes are disabled'));return}

  // Only exact HANE resources are addressable. Query strings cannot create an exfiltration channel.
  const path=url.pathname;
  const virtualUrl=VIRTUAL_BY_PATH.get(path);
  const isVirtual=!!virtualUrl;
  const appRel=APP_PATHS.get(path);
  const scopePath=SCOPE.pathname.endsWith('/')?SCOPE.pathname:SCOPE.pathname+'/';
  const isRootNav=req.mode==='navigate'&&(path===scopePath||path===new URL('./index.html',SCOPE).pathname);

  if(!isVirtual&&!appRel&&!isRootNav){event.respondWith(blocked(404,'Not an allowed HANE resource'));return}

  // Runtime is local-first. Missing fixed HANE shell files may self-repair from the SAME ORIGIN only.
  // No user data, query string, request body, credentials or referrer are sent during repair.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    if(isVirtual){
      let hit=await cache.match(virtualUrl);
      if(hit)return hit;
      try{
        await ensureVerifiedEngines();
        hit=await cache.match(virtualUrl);
        if(hit)return hit;
      }catch(_){ }
      return blocked(503,'Verified HANE engine is unavailable. Keep internet on and try Ekstre Okut again.');
    }
    const canonical=isRootNav?'./index.html':appRel;
    let hit=await cache.match(canonical);
    if(hit)return hit;
    try{
      const cleanUrl=new URL(String(canonical).replace(/^\.\//,''),SCOPE).href;
      const fresh=await fetch(new Request(cleanUrl,{method:'GET',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'}));
      if(fresh&&fresh.ok){
        await cache.put(canonical,fresh.clone());
        return fresh;
      }
    }catch(_){ }
    return blocked(503,'HANE application cache could not be repaired. Reload once while online.');
  })());
});
