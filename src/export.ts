import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { HaneState } from './types';

function webDownload(name:string,text:string,mime:string){
  const blob=new Blob([text],{type:mime}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function nativeShare(name:string,text:string){
  const f=new File(Paths.cache,name);if(f.exists)f.delete();f.create();f.write(text);
  if(!await Sharing.isAvailableAsync())throw new Error('PAYLAŞIM KULLANILAMIYOR');
  await Sharing.shareAsync(f.uri);
}
async function save(name:string,text:string,mime='application/octet-stream'){
  if(Platform.OS==='web')webDownload(name,text,mime);else await nativeShare(name,text);
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
async function deriveBackupKey(pin:string,salt:Uint8Array){
  if(Platform.OS!=='web'||!globalThis.crypto?.subtle)throw new Error('BU CİHAZ ŞİFRELİ YEDEĞİ DESTEKLEMİYOR');
  const material=await crypto.subtle.importKey(
    'raw',new TextEncoder().encode(`HANE|${pin}|BACKUP-V1`),
    'PBKDF2',false,['deriveKey']
  );
  return await crypto.subtle.deriveKey(
    {name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},
    material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']
  );
}
async function encryptBackup(payload:any,pin:string){
  if(!/^\d{4}$/.test(pin))throw new Error('YEDEK İÇİN GEÇERLİ 4 HANELİ PIN GEREKLİ');
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const key=await deriveBackupKey(pin,salt);
  const plain=new TextEncoder().encode(JSON.stringify(payload));
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain);
  return JSON.stringify({
    format:'HANE-ENCRYPTED-BACKUP',
    v:1,
    alg:'AES-256-GCM',
    kdf:'PBKDF2-SHA256',
    iterations:310000,
    salt:bytesToB64(salt),
    iv:bytesToB64(iv),
    data:bytesToB64(new Uint8Array(cipher))
  });
}
export async function decryptBackup(raw:string,pin:string){
  let box:any;
  try{box=JSON.parse(raw)}catch{throw new Error('YEDEK DOSYASI GEÇERSİZ')}
  if(box?.format!=='HANE-ENCRYPTED-BACKUP'||box?.v!==1||!box?.salt||!box?.iv||!box?.data)
    throw new Error('BU DOSYA ŞİFRELİ HANE YEDEĞİ DEĞİL');
  try{
    const salt=b64ToBytes(box.salt),iv=b64ToBytes(box.iv);
    const key=await deriveBackupKey(pin,salt);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,b64ToBytes(box.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }catch{
    throw new Error('YEDEK AÇILAMADI · PIN YANLIŞ VEYA DOSYA BOZUK');
  }
}

export async function exportMonthBackup(s:HaneState,pin:string){
  const m=s.selectedMonth;
  const payload={
    version:5,scope:'month',month:m,exportedAt:new Date().toISOString(),
    transactions:s.transactions.filter(t=>t.date.startsWith(m)),
    bills:s.bills.filter(b=>b.dueDate.startsWith(m)),
    cards:s.cards,
    fixedExpenses:s.fixedExpenses.filter(f=>f.startMonth<=m),
    reminders:s.reminders.filter(r=>r.date.startsWith(m)),
    remindersEnabled:s.remindersEnabled,alarmDaysBefore:s.alarmDaysBefore
  };
  await save(`HANE-${m}-YEDEK.hane`,await encryptBackup(payload,pin),'application/octet-stream');
}
export async function exportAllBackup(s:HaneState,pin:string){
  const payload={...s,scope:'all',exportedAt:new Date().toISOString()};
  await save('HANE-TUM-VERILER-YEDEK.hane',await encryptBackup(payload,pin),'application/octet-stream');
}

// CSV bilerek okunabilir dışa aktarımdır; güvenli yedek değildir.
export async function exportMonthCsv(s:HaneState){
  const m=s.selectedMonth;
  const rows=[
    ['TARİH','TÜR','KATEGORİ','AÇIKLAMA','KAYNAK/KİŞİ','ÖDEME YÖNTEMİ','KART','EKSTRE','BELGE','TUTAR'],
    ...s.transactions.filter(t=>t.date.startsWith(m)).map(t=>[
      t.date,t.type,t.category,t.note,t.sourceOrPerson??'',t.paymentMethod??'',t.cardId??'',t.statementKey??'',t.attachment?'VAR':'YOK',String(t.amount)
    ])
  ];
  const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
  await save(`HANE-${m}.csv`,csv,'text/csv;charset=utf-8');
}
export async function pickBackupText(){
  const r=await DocumentPicker.getDocumentAsync({
    type:['application/octet-stream','application/json','text/plain'],
    copyToCacheDirectory:true,multiple:false
  });
  if(r.canceled||!r.assets?.[0])return null;
  const a=r.assets[0];
  if(Platform.OS==='web'){
    if(a.file)return await a.file.text();
    throw new Error('DOSYA OKUNAMADI');
  }
  return await new File(a.uri).text();
}
