import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { HaneState, emptyState } from './types';

const LEGACY_KEYS=['@hane/state/v5','@hane/state/v4','@hane/state/v3','@hane/state/v2','@hane/state/v1'];
const ENC_KEY='@hane/state/encrypted-v1';
const SALT_KEY='@hane/security/data-salt-v1';
let activeKey:CryptoKey|null=null;

function migrate(x:any):HaneState{
  const b=emptyState();
  return {
    version:5,
    selectedMonth:x?.selectedMonth ?? b.selectedMonth,
    transactions:(x?.transactions ?? []).map((t:any)=>({...t})),
    cards:(x?.cards ?? []).map((c:any)=>({...c,paidMonths:c.paidMonths ?? []})),
    bills:(x?.bills ?? []).map((bill:any)=>({...bill})),
    fixedExpenses:(x?.fixedExpenses ?? []).map((f:any)=>({
      ...f,
      startMonth:f.startMonth ?? (x?.selectedMonth ?? b.selectedMonth),
      mode:f.mode ?? 'from_now',
      paidMonths:f.paidMonths ?? []
    })),
    reminders:x?.reminders ?? [],
    remindersEnabled:x?.remindersEnabled ?? true,
    alarmDaysBefore:x?.alarmDaysBefore ?? 3
  };
}

function bytesToB64(bytes:Uint8Array){
  let s=''; const CHUNK=0x8000;
  for(let i=0;i<bytes.length;i+=CHUNK)s+=String.fromCharCode(...bytes.subarray(i,Math.min(i+CHUNK,bytes.length)));
  return btoa(s);
}
function b64ToBytes(s:string){
  const raw=atob(s),out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}
async function getOrCreateSalt(){
  let s=await AsyncStorage.getItem(SALT_KEY);
  if(s)return b64ToBytes(s);
  const salt=crypto.getRandomValues(new Uint8Array(16));
  await AsyncStorage.setItem(SALT_KEY,bytesToB64(salt));
  return salt;
}
async function deriveKey(pin:string,salt:Uint8Array){
  if(Platform.OS!=='web'||!globalThis.crypto?.subtle)throw new Error('BU TARAYICI ŞİFRELEMEYİ DESTEKLEMİYOR');
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(`HANE|${pin}|DATA-V1`),'PBKDF2',false,['deriveKey']);
  return await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptState(s:HaneState,key:CryptoKey){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const plain=new TextEncoder().encode(JSON.stringify(s));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
  return JSON.stringify({v:1,alg:'AES-256-GCM',iv:bytesToB64(iv),data:bytesToB64(new Uint8Array(cipher))});
}
async function decryptState(raw:string,key:CryptoKey){
  const box=JSON.parse(raw); if(box?.v!==1||!box?.iv||!box?.data)throw new Error('ŞİFRELİ VERİ BİÇİMİ GEÇERSİZ');
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64ToBytes(box.iv)},key,b64ToBytes(box.data));
  return migrate(JSON.parse(new TextDecoder().decode(plain)));
}
async function loadLegacy(){
  try{for(const key of LEGACY_KEYS){const raw=await AsyncStorage.getItem(key);if(raw)return migrate(JSON.parse(raw));}}catch{}
  return emptyState();
}

// PIN doğrulandıktan sonra çağrılır. Eski düz veriyi ilk açılışta otomatik şifreler.
export async function unlockState(pin:string):Promise<HaneState>{
  if(Platform.OS!=='web')return await loadLegacy();
  const salt=await getOrCreateSalt(); activeKey=await deriveKey(pin,salt);
  const enc=await AsyncStorage.getItem(ENC_KEY);
  if(enc)return await decryptState(enc,activeKey);
  const state=await loadLegacy();
  await persistState(state);
  await AsyncStorage.multiRemove(LEGACY_KEYS);
  return state;
}

// PIN kapalıysa geriye dönük uyumluluk için korumasız veri yükler.
export async function loadState():Promise<HaneState>{
  if(Platform.OS==='web'&&await AsyncStorage.getItem(ENC_KEY))return emptyState();
  return await loadLegacy();
}
export async function persistState(s:HaneState){
  if(Platform.OS==='web'&&activeKey){
    await AsyncStorage.setItem(ENC_KEY,await encryptState(s,activeKey));
    await AsyncStorage.multiRemove(LEGACY_KEYS);
    return;
  }
  await AsyncStorage.setItem(LEGACY_KEYS[0],JSON.stringify(s));
}
export async function rekeyState(s:HaneState,newPin:string){
  if(Platform.OS!=='web'){await persistState(s);return;}
  const salt=crypto.getRandomValues(new Uint8Array(16));
  await AsyncStorage.setItem(SALT_KEY,bytesToB64(salt));
  activeKey=await deriveKey(newPin,salt);
  await AsyncStorage.setItem(ENC_KEY,await encryptState(s,activeKey));
  await AsyncStorage.multiRemove(LEGACY_KEYS);
}
export async function disableStateEncryption(s:HaneState){
  activeKey=null;
  await AsyncStorage.multiRemove([ENC_KEY,SALT_KEY]);
  await AsyncStorage.setItem(LEGACY_KEYS[0],JSON.stringify(s));
}
export function clearActiveEncryptionKey(){activeKey=null;}
export async function clearLocalState(){activeKey=null;await AsyncStorage.multiRemove([...LEGACY_KEYS,ENC_KEY,SALT_KEY]);}
