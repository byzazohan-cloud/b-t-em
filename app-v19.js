
// V17 native/PWA feel helpers — no business logic changes.
(function(){
  const root=document.documentElement;
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;
  if(standalone) root.classList.add('is-standalone');
  else root.classList.add('is-browser');

  document.addEventListener('touchstart',()=>{}, {passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'){
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
  });
  const setVh=()=>document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  setVh();
  window.addEventListener('resize',setVh,{passive:true});
})();

'use strict';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const META='HANE_LOCKED_META_V1',DATA='HANE_LOCKED_DATA_V1',STORAGE_TXN='HANE_STORAGE_TXN_V1';
const enc=new TextEncoder(),dec=new TextDecoder();let state=null,key=null,current='home',modal=null,pin='',timer=null,setupPhoto='',themeDraft=null,reportPeriod='month',reportCustomStart='',reportCustomEnd='',txFilter='all',financeTab='cards',navHistory=[],calendarMonth='',calendarDay='',calendarView='month',txSearch='',txDate='',txCategory='',txPay='',txMin='',txMax='',txMember='',cardStatementMonth='',reportView='summary',reportMonths=6,statementImportCardId='',statementImportRows=[],statementImportMeta={},statementImportBusy=false;
let browserNavReady=false;
let normalExpensesOpen=true,fixedExpensesOpen=true,returnScrollTop=null,expenseView='normal';
const Q=['Bugün küçük adımlar, yarın büyük rahatlık getirir.','Disiplin, özgürlüğün kapısını açar.','Küçük birikimler büyük huzur getirir.','Planlı para, güçlü yarınlar demektir.'];
const BASE_C=['Kira','Aidat','Market','Manav','Fırın','Harçlık','Kafe','Yemek','Restoran','Giyim','Online Alışveriş','Elektronik','Mobilya','Ev Bakım','Kırtasiye','Kitap','Kozmetik','Kişisel Bakım','Spor','Oyun','Abonelik','Akaryakıt','Otopark','Otoyol/Köprü','Araç Bakım','Ulaşım','Kuyumculuk','Kargo','Sağlık','Eğitim','Çocuk','Evcil Hayvan','Ev','Temizlik','Eğlence','Tatil','Konaklama','Uçak','Hediye','Bağış','Sigorta','Vergi & Faiz','Vergi','Banka Masrafı','Faiz','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Diğer'];
const BASE_NORMAL_C=['Market','Manav','Fırın','Harçlık','Kafe','Yemek','Restoran','Giyim','Online Alışveriş','Elektronik','Mobilya','Ev Bakım','Kırtasiye','Kitap','Kozmetik','Kişisel Bakım','Spor','Oyun','Abonelik','Akaryakıt','Otopark','Otoyol/Köprü','Araç Bakım','Ulaşım','Kuyumculuk','Kargo','Sağlık','Eğitim','Çocuk','Evcil Hayvan','Ev','Temizlik','Eğlence','Tatil','Konaklama','Uçak','Hediye','Bağış','Sigorta','Vergi & Faiz','Vergi','Banka Masrafı','Faiz','Diğer'];
const BASE_FIXED_C=['Kira','Aidat','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Abonelik','Sigorta','Vergi'];
let C=[...BASE_C];
let NORMAL_C=[...BASE_NORMAL_C];
let FIXED_C=[...BASE_FIXED_C];
const I={Kira:'🏠',Aidat:'🏢',Market:'🛒',Manav:'🍎',Fırın:'🥖',Harçlık:'💵',Kafe:'☕',Yemek:'🍽️',Restoran:'🍴',Giyim:'👕',Akaryakıt:'⛽',Faturalar:'🧾',İnternet:'📡',Elektrik:'⚡',Su:'💧',Doğalgaz:'🔥','Cep Telefonu':'📱',Ulaşım:'◆',Sağlık:'✚',Eğitim:'✎',Ev:'⌂',Temizlik:'✦',Çocuk:'★','Evcil Hayvan':'♣','Kişisel Bakım':'✧',Abonelik:'◎',Eğlence:'♪',Tatil:'☀',Hediye:'🎁',Sigorta:'◇',Vergi:'▤','Vergi & Faiz':'▤',Diğer:'●'};
const CAT_COLORS={Kira:'#d8ad4f',Aidat:'#a86ef7',Market:'#19d77d',Manav:'#7ed957',Fırın:'#e5a85b',Harçlık:'#d9b44a',Kafe:'#c58a52',Yemek:'#ff8b5c',Restoran:'#ff6f61',Giyim:'#c084fc','Online Alışveriş':'#8b5cf6',Elektronik:'#38bdf8',Mobilya:'#c4a484','Ev Bakım':'#f59e0b',Kırtasiye:'#60a5fa',Kitap:'#818cf8',Kozmetik:'#f472b6','Kişisel Bakım':'#ec4899',Spor:'#22c55e',Oyun:'#a78bfa',Abonelik:'#6366f1',Akaryakıt:'#f59e0b',Otopark:'#64748b','Otoyol/Köprü':'#94a3b8','Araç Bakım':'#f97316',Ulaşım:'#4dd6c7',Kuyumculuk:'#e0b341',Kargo:'#06b6d4',Sağlık:'#ff5f78',Eğitim:'#60a5fa',Çocuk:'#fb7185','Evcil Hayvan':'#34d399',Ev:'#d8ad4f',Temizlik:'#22d3ee',Eğlence:'#f06dad',Tatil:'#fbbf24',Konaklama:'#eab308',Uçak:'#0ea5e9',Hediye:'#e879f9',Bağış:'#14b8a6',Sigorta:'#38bdf8','Vergi & Faiz':'#f59e0b',Vergi:'#94a3b8','Banka Masrafı':'#a3a3a3',Faiz:'#ef4444',Faturalar:'#ff8c42','İnternet':'#6ed4ff',Elektrik:'#ffd84d',Su:'#3fa9ff','Doğalgaz':'#ff6b45','Cep Telefonu':'#b879ff',Diğer:'#9ca3af'};
function categoryIconSvg(cat,size=22){
  const P={
    'Kira':'<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v10h11V10"/><path d="M10 20v-6h4v6"/>',
    'Aidat':'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3"/>',
    'Market':'<path d="M3 5h2l2.2 10h10.7l2-7H6"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    'Manav':'<path d="M12 8c-5-2-8 2-6.5 7.5C7 20 12 21 12 21s5-1 6.5-5.5C20 11 17 6 12 8Z"/><path d="M12 8c0-3 2-5 5-5M12 7c-2-2-4-2-6-1"/>',
    'Fırın':'<path d="M5 18c1-5 4-10 7-13 3 3 6 8 7 13-4 2-10 2-14 0Z"/><path d="M9 10l6 2M8 14l8 2"/>',
    'Harçlık':'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9h1M17 15h1"/>',
    'Kafe':'<path d="M5 8h11v7a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2M8 4c0 1 1 1 1 2M12 4c0 1 1 1 1 2"/>',
    'Yemek':'<path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M16 3v18M16 3c3 2 4 6 0 9"/>',
    'Restoran':'<path d="M6 3v18M3 3v5a3 3 0 0 0 6 0V3M17 3v18M14 3c4 1 6 5 3 9"/>',
    'Giyim':'<path d="m8 5-4 3 3 4 2-1v10h6V11l2 1 3-4-4-3c-1 2-7 2-8 0Z"/>',
    'Akaryakıt':'<path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h15M8 7h5v4H8z"/><path d="M16 8h2l2 3v6a2 2 0 0 1-4 0v-2"/>',
    'Ulaşım':'<rect x="4" y="5" width="16" height="13" rx="3"/><path d="M7 18v2m10-2v2M7 9h10M8 14h.1M16 14h.1"/>',
    'Sağlık':'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    'Eğitim':'<path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 12v5c3 2 7 2 10 0v-5M21 9v7"/>',
    'Ev':'<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v10h11V10M9 15h6"/>',
    'Temizlik':'<path d="M7 20h10M9 20l1-9h4l1 9M10 8h4M12 3v5"/><path d="M5 6h2M17 6h2M6 3l1 1M18 3l-1 1"/>',
    'Eğlence':'<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    'Faturalar':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    'İnternet':'<path d="M4 9a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0M10 17a3 3 0 0 1 4 0"/><circle cx="12" cy="20" r="1"/>',
    'Elektrik':'<path d="m13 2-7 11h6l-1 9 7-12h-6z"/>',
    'Su':'<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/><path d="M9 15c.5 1.5 1.5 2 3 2"/>',
    'Doğalgaz':'<path d="M13 2c1 5-4 6-2 10 1-2 3-3 4-5 3 3 4 6 3 9-1 4-5 6-8 5-4-1-6-5-4-9 1-3 3-5 5-7 0 3 1 4 2 5 1-2 1-5 0-8Z"/>',
    'Cep Telefonu':'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 5h4M11 19h2"/>',
    'Diğer':'<circle cx="12" cy="12" r="9"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/>'
  };
  const alias={'Online Alışveriş':'Market','Elektronik':'Cep Telefonu','Mobilya':'Ev','Ev Bakım':'Ev','Kırtasiye':'Eğitim','Kitap':'Eğitim','Kozmetik':'Sağlık','Kişisel Bakım':'Sağlık','Spor':'Sağlık','Oyun':'Eğlence','Abonelik':'Faturalar','Otopark':'Ulaşım','Otoyol/Köprü':'Ulaşım','Araç Bakım':'Akaryakıt','Kuyumculuk':'Hediye','Kargo':'Ulaşım','Çocuk':'Harçlık','Evcil Hayvan':'Sağlık','Tatil':'Eğlence','Konaklama':'Ev','Uçak':'Ulaşım','Hediye':'Harçlık','Bağış':'Harçlık','Sigorta':'Faturalar','Vergi & Faiz':'Faturalar','Vergi':'Faturalar','Banka Masrafı':'Faturalar','Faiz':'Faturalar'};
  const path=P[cat]||P[alias[cat]]||P['Diğer'];
  return `<svg class="catSvg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${path}</svg>`;
}
function catIcon(cat){return categoryIconSvg(cat,22)}
function catColor(cat){return state?.categoryMeta?.[cat]?.color||CAT_COLORS[cat]||'#d8ad4f'}
function catPremiumIcon(cat){return `<span class="catGem" style="--cat:${catColor(cat)}">${categoryIconSvg(cat,22)}</span>`}
function paymentLabel(x){if(x.source==='card'){const c=state.cards.find(c=>c.id===x.cardId);return c?`KART · ${esc(c.bank)} ${esc(c.name)}`:'KART'}return 'NAKİT'}
const id=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),iso=(d=new Date())=>{const x=d instanceof Date?d:new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')},ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const money=n=>state?.settings?.privacy?'••••••':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const upper=v=>String(v??'').toLocaleUpperCase('tr-TR');
// S6 — Merkezi arayüz altyapısı. Görünümü değiştirmeden buton, ikon ve logo tanımları tek merkezden yönetilir.
const HANE_UI=Object.freeze({
  build:'20260922-V113-S6-MERKEZI-ARAYUZ',
  brand:Object.freeze({name:'HANE',logo:'icons/hane-app-icon.png',logoVersion:'s6'}),
  buttons:Object.freeze({base:'btn',primary:'btn gold',icon:'ib premiumTopIcon'}),
  nav:Object.freeze([
    Object.freeze({tab:'home',icon:'home',label:'ANA SAYFA'}),
    Object.freeze({tab:'transactions',icon:'transactions',label:'HAREKETLER'}),
    Object.freeze({tab:'fixed',icon:'fixed',label:'GİDERLER'}),
    Object.freeze({tab:'cards',icon:'cards',label:'FİNANS'}),
    Object.freeze({tab:'calendar',icon:'fixed',label:'TAKVİM'}),
    Object.freeze({tab:'reports',icon:'report',label:'RAPORLAR'})
  ])
});
function uiButtonClass(kind='base',extra=''){return `${HANE_UI.buttons[kind]||HANE_UI.buttons.base}${extra?' '+extra:''}`}
function haneLogo(size=54,cls=''){
  const n=Math.max(28,Number(size)||54);
  return `<img class="haneLogoImg ${cls}" src="${HANE_UI.brand.logo}?v=${HANE_UI.brand.logoVersion}" width="${n}" alt="HANE">`;
}
function haneFullLogo(cls=''){
  return `<img class="haneFullLogo ${cls}" src="${HANE_UI.brand.logo}?v=${HANE_UI.brand.logoVersion}" alt="HANE">`;
}
function premiumIcon(name,size=26){
  const p={
home:`<path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v10h11V10"/><path d="M10 20v-6h4v6"/>`,
transactions:`<path d="M6 5h12M6 10h12M6 15h8M6 20h10"/><circle cx="3" cy="5" r="1"/><circle cx="3" cy="10" r="1"/><circle cx="3" cy="15" r="1"/><circle cx="3" cy="20" r="1"/>`,
fixed:`<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"/>`,
cards:`<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9h18M7 15h5"/>`,
profile:`<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.8-4.2 3.3-6.5 7.5-6.5s6.7 2.3 7.5 6.5"/>`,
settings:`<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M18.5 5.5 17 7M7 17l-1.5 1.5"/><path d="M8.3 4.3 9 2.5h6l.7 1.8 1.7.7 1.8-.8 2.6 2.6-.8 1.8.7 1.7 1.8.7v3.7l-1.8.7-.7 1.7.8 1.8-2.6 2.6-1.8-.8-1.7.7-.7 1.8H9l-.7-1.8-1.7-.7-1.8.8-2.6-2.6.8-1.8-.7-1.7-1.8-.7V11l1.8-.7L3 8.6l-.8-1.8 2.6-2.6 1.8.8z"/>`,
income:`<path d="M12 20V5m-5 5 5-5 5 5M5 20h14"/>`,
expense:`<path d="M12 4v15m-5-5 5 5 5-5M5 4h14"/>`,
report:`<path d="M5 20V10M10 20V5M15 20v-8M20 20V8M3 20h19"/>`,
pluscard:`<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M12 13v5M9.5 15.5h5"/>`,
bell:`<path d="M6 17h12l-1.5-2.5V10a4.5 4.5 0 0 0-9 0v4.5zM10 20h4"/>`,
lock:`<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1"/>`,
palette:`<path d="M12 3a9 9 0 0 0 0 18h2a2 2 0 0 0 0-4h-1a1.5 1.5 0 0 1 0-3h2a6 6 0 0 0-3-11Z"/><circle cx="7.5" cy="9" r="1"/><circle cx="10" cy="6.5" r="1"/><circle cx="15" cy="7.5" r="1"/>`,
backup:`<path d="M6 16a4 4 0 0 1 .5-8A6 6 0 0 1 18 9a3.5 3.5 0 0 1 0 7M12 11v9m-3.5-5 3.5-4 3.5 4"/>`,
info:`<circle cx="12" cy="12" r="9"/><path d="M12 10v6"/><circle cx="12" cy="7" r=".8"/>`,
trash:`<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>`,
globe:`<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>`,
note:`<path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>`
  };
  return `<svg class="premiumSvg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${p[name]||p.home}</svg>`;
}
function normalizeV19(st){
  st.cardPayments=Array.isArray(st.cardPayments)?st.cardPayments:[];
  st.fixedPayments=Array.isArray(st.fixedPayments)?st.fixedPayments:[];
  st.flexTransactions=Array.isArray(st.flexTransactions)?st.flexTransactions:[];
  st.installments=Array.isArray(st.installments)?st.installments:[];
  st.cardTransactions=Array.isArray(st.cardTransactions)?st.cardTransactions:[];
  st.statementImports=Array.isArray(st.statementImports)?st.statementImports:[];
  st.statementCategoryRules=st.statementCategoryRules&&typeof st.statementCategoryRules==='object'?st.statementCategoryRules:{};
  st.expenses=Array.isArray(st.expenses)?st.expenses:[];
  // S2: Kalıcı finansal bağlantı kimliği. Eski kayıtlar veri kaybı olmadan yerinde yükseltilir.
  const ensureFinanceLink=x=>{if(x&&(!x.financeLinkId||!String(x.financeLinkId).trim()))x.financeLinkId='fin_'+id();return x?.financeLinkId||''};
  st.expenses.forEach(ensureFinanceLink);st.cardPayments.forEach(ensureFinanceLink);st.fixedPayments.forEach(ensureFinanceLink);st.cardTransactions.forEach(ensureFinanceLink);
  st.incomes=Array.isArray(st.incomes)?st.incomes:[];
  st.cards=Array.isArray(st.cards)?st.cards:[];
  // S1: Kart ortak-limit alanları geriye uyumlu biçimde normalize edilir.
  st.cards.forEach(c=>{if(c.sharedLimitGroup==null)c.sharedLimitGroup='';if(c.sharedLimit==null)c.sharedLimit=0});
  st.accounts=Array.isArray(st.accounts)?st.accounts:[];st.flexAccounts=Array.isArray(st.flexAccounts)?st.flexAccounts:[];st.categoryMeta=st.categoryMeta||{};st.customCategories=Array.isArray(st.customCategories)?st.customCategories:[];
  // V10: Toplu Taşıma ayrı kategori değil; tüm yol/toplu taşıma giderleri Ulaşım altında birleşir.
  if(!st.settings)st.settings={};
  if(!st.settings.transportMergedToUlasim20260919){
    const mergeCat=x=>{if(x&&x.category==='Toplu Taşıma')x.category='Ulaşım'};
    (st.expenses||[]).forEach(mergeCat);(st.cardTransactions||[]).forEach(mergeCat);(st.installments||[]).forEach(mergeCat);(st.fixedPayments||[]).forEach(mergeCat);
    Object.keys(st.statementCategoryRules||{}).forEach(k=>{if(st.statementCategoryRules[k]==='Toplu Taşıma')st.statementCategoryRules[k]='Ulaşım'});
    st.customCategories=(st.customCategories||[]).filter(c=>c!=='Toplu Taşıma');
    if(st.categoryMeta['Toplu Taşıma'])delete st.categoryMeta['Toplu Taşıma'];
    st.settings.transportMergedToUlasim20260919=true;
  }
  const persistedNormal=[...(st.expenses||[]).filter(x=>!x.recurring).map(x=>x.category),...(st.cardTransactions||[]).map(x=>x.category),...(st.installments||[]).map(x=>x.category)].filter(Boolean);
  const persistedFixed=[...(st.expenses||[]).filter(x=>x.recurring).map(x=>x.category),...(st.fixedPayments||[]).map(x=>x.category)].filter(Boolean);
  const persistedCats=[...persistedNormal,...persistedFixed];
  C=[...new Set([...BASE_C,...st.customCategories,...persistedCats])];NORMAL_C=[...new Set([...BASE_NORMAL_C,...st.customCategories,...persistedNormal])];FIXED_C=[...new Set([...BASE_FIXED_C,...st.customCategories,...persistedFixed])];
  st.profile=st.profile||{name:'',photo:'',motto:''};
  st.notes=Array.isArray(st.notes)?st.notes:[];
  st.settings=st.settings||{};if(typeof st.settings.darkMode!=='boolean')st.settings.darkMode=true;
  if(!/^\d{4}-\d{2}$/.test(String(st.selectedMonth||'')))st.selectedMonth=ym(new Date());
  if(!st.settings.monthCoreGroup2Migrated)st.settings.monthCoreGroup2Migrated=true;
  if(typeof st.settings.privacy!=='boolean')st.settings.privacy=false;st.members=Array.isArray(st.members)?st.members:[];if(!st.members.length)st.members=[{id:'me',name:'BEN',icon:'👤'}];st.homeLayout=Array.isArray(st.homeLayout)?st.homeLayout:['summary','quick','monthly','recent'];st.homeHidden=Array.isArray(st.homeHidden)?st.homeHidden:[];
  st.expenses.forEach((x,i)=>{if(typeof x.sortOrder!=='number')x.sortOrder=i;if(!Array.isArray(x.paidMonths))x.paidMonths=[];if(!x.source)x.source='cash'});
  // Kategori kaynağı yalnızca kaydın kendi category alanıdır; başlık/ikon üzerinden sürekli kategori tahmini yapılmaz.
  st.expenses.forEach(x=>{if(!x.category||!String(x.category).trim())x.category='Diğer'});
  // 2026-09-17 tek seferlik eski-veri onarımı: önceki hatalı paketin Kira'ya yazdığı
  // açık Cep Telefonu sabit giderlerini gerçek kategori alanına geri taşı. Sonraki hesaplar yine yalnız category alanından yapılır.
  if(!st.settings.legacyFixedCategoryRepair20260917){
    st.expenses.forEach(x=>{
      const title=String(x.title||'').toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim();
      if(x.recurring && x.category==='Kira' && title.includes('cep telefon')) x.category='Cep Telefonu';
    });
    st.settings.legacyFixedCategoryRepair20260917=true;
  }
  // Eski ödeme kayıtlarının kategori bilgisini bağlı oldukları gerçek sabit giderle senkron tut.
  st.fixedPayments.forEach(p=>{const ex=st.expenses.find(x=>x.id===p.expenseId);if(ex)p.category=ex.category||'Diğer';if(p.actualAmount==null)p.actualAmount=+p.amount||0;if(p.expectedAmount==null)p.expectedAmount=ex?fixedBillAmount(ex):(+p.amount||0);p.difference=(+(p.actualAmount??p.amount)||0)-(+p.expectedAmount||0)});
  st.expenses.forEach(x=>{if(x.recurring){if(x.billAmount==null)x.billAmount=+x.amount||0}else if(x.actualAmount==null)x.actualAmount=+x.amount||0});
  // S3 FIX2 veri temizliği: önceki hatalı S3/FIX1'in otomatik ürettiği, kullanıcı tarafından onaylanmamış
  // sabit gider hareketlerini kaldır. Onaylı ödeme için aynı ay paidMonths içinde bulunmak zorundadır.
  if(!st.settings.s3UnpaidFixedMovementCleanup20260922){
    st.fixedPayments=(st.fixedPayments||[]).filter(p=>{const ex=st.expenses.find(x=>x.id===p.expenseId);if(!ex||!ex.recurring)return true;return (ex.paidMonths||[]).includes(p.month)});
    st.expenses.filter(x=>x.recurring).forEach(x=>{x.paid=false});
    st.settings.s3UnpaidFixedMovementCleanup20260922=true;
  }
  if(!st.settings.financeCoreGroup1Migrated){
    // Eski kart hareketlerinden ana gider kaydı olmayanları veri kaybetmeden gider kaydına taşı.
    (st.cardTransactions||[]).forEach(t=>{if((st.expenses||[]).some(e=>e.cardTxId===t.id))return;st.expenses.push({id:id(),cardTxId:t.id,source:'card',cardId:t.cardId,title:t.title||'KART HARCAMASI',amount:+t.amount||0,actualAmount:+t.amount||0,category:t.category||'Diğer',date:t.date||iso(),dueDate:t.date||iso(),recurring:false,paid:true,attachment:t.attachment||'',installmentGroup:t.installmentGroup,installmentNo:t.installmentNo,installmentCount:t.installmentCount})});
    // S3 FIX2: Sabit gider plan kaydı asla kendi başına gerçek hareket/ödeme üretmez.
    // Gerçek hareket yalnız kullanıcı ÖDEMEYİ ONAYLA dediğinde fixedPayments içine yazılır.
    // paidMonths eski/onaylanmış ödeme bilgisidir; legacy x.paid alanı sabit giderlerde hareket kaynağı değildir.
    // Mevcut görünen kart borcunu aynen koruyacak açılış bakiyesini hesapla.
    st.cards.forEach(c=>{const normal=st.expenses.filter(x=>!x.recurring&&x.source==='card'&&x.cardId===c.id).reduce((a,x)=>a+(+(x.actualAmount??x.amount)||0),0),fixed=st.fixedPayments.filter(p=>p.source==='card'&&p.cardId===c.id).reduce((a,p)=>a+(+(p.actualAmount??p.amount)||0),0),paid=st.cardPayments.filter(p=>p.cardId===c.id).reduce((a,p)=>a+(+p.amount||0),0);c.openingBalance=(+c.balance||0)-normal-fixed+paid});
    st.settings.financeCoreGroup1Migrated=true;
  }
  return st;
}
function usedCategorySet(){
  const used=new Set();
  const add=v=>{if(v&&String(v).trim())used.add(String(v).trim())};
  (state?.expenses||[]).forEach(x=>add(x.category));
  (state?.fixedPayments||[]).forEach(x=>add(x.category));
  (state?.cardTransactions||[]).forEach(x=>add(x.category));
  (state?.installments||[]).forEach(x=>add(x.category));
  return used
}
function visibleCategoryList(){
  const used=usedCategorySet(),custom=new Set(state?.customCategories||[]);
  return C.filter(c=>used.has(c)||custom.has(c))
}
function fixedPaidForMonth(x,m=state?.selectedMonth){return !!(x?.paidMonths||[]).includes(m) || (!!x?.paid && String(x?.date||'').startsWith(m))}
function fixedPaymentFor(x,m=state?.selectedMonth){return (state?.fixedPayments||[]).find(p=>p.expenseId===x.id&&p.month===m)||null}
function fixedPaymentDate(x,m=state?.selectedMonth){const pay=fixedPaymentFor(x,m);return pay?.date||dateForSelectedMonth(x?.dueDate||x?.date||iso(),m)}
function fixedBillAmount(x){return +(x?.billAmount??x?.amount??0)||0}
function actualExpenseEntriesForMonth(m=state?.selectedMonth){
  const normal=(state?.expenses||[]).filter(x=>!x.recurring&&String(x.date||'').startsWith(m)).map(x=>({...x,amount:+(x.actualAmount??x.amount??0)||0,_actual:true}));
  const fixed=(state?.fixedPayments||[]).filter(p=>String(p.date||'').startsWith(m)).map(p=>{const ex=(state?.expenses||[]).find(x=>x.id===p.expenseId);return {...(ex||{}),...p,id:ex?.id||p.expenseId||p.id,paymentId:p.id,expenseId:p.expenseId,title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',memberId:(ex?.memberId??''),recurring:true,billAmount:fixedBillAmount(ex),amount:+(p.actualAmount??p.amount??0)||0,date:p.date||ex?.dueDate||ex?.date||iso(),source:p.source||ex?.source||'cash',cardId:p.cardId||ex?.cardId||null,_actual:true}});
  return [...normal,...fixed]
}
function actualExpenseEntriesInRange(start,end){
  const normal=(state?.expenses||[]).filter(x=>!x.recurring&&String(x.date||'')>=start&&String(x.date||'')<=end).map(x=>({...x,amount:+(x.actualAmount??x.amount??0)||0,_actual:true}));
  const fixed=(state?.fixedPayments||[]).filter(p=>String(p.date||'')>=start&&String(p.date||'')<=end).map(p=>{const ex=(state?.expenses||[]).find(x=>x.id===p.expenseId);return {...(ex||{}),...p,id:ex?.id||p.expenseId||p.id,paymentId:p.id,expenseId:p.expenseId,title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',memberId:(ex?.memberId??''),recurring:true,billAmount:fixedBillAmount(ex),amount:+(p.actualAmount??p.amount??0)||0,date:p.date||ex?.dueDate||ex?.date||iso(),source:p.source||ex?.source||'cash',cardId:p.cardId||ex?.cardId||null,_actual:true}});
  return [...normal,...fixed]
}
function isCardRefund(x){return !!x?.importedRefund||(+((x?.actualAmount??x?.amount)??0)<0)}
function cardDerivedNet(cardId){
  const c=(state?.cards||[]).find(x=>x.id===cardId),anchor=String(c?.balanceAnchorDate||'');
  const after=d=>!anchor||String(d||'')>anchor;
  const normal=(state?.expenses||[]).filter(x=>!x.recurring&&x.source==='card'&&x.cardId===cardId&&after(x.date)).reduce((a,x)=>a+(+(x.actualAmount??x.amount)||0),0);
  const fixed=(state?.fixedPayments||[]).filter(p=>p.source==='card'&&p.cardId===cardId&&after(p.date)).reduce((a,p)=>a+(+(p.actualAmount??p.amount)||0),0);
  const paid=(state?.cardPayments||[]).filter(p=>p.cardId===cardId&&after(p.date)).reduce((a,p)=>a+(+p.amount||0),0);
  return normal+fixed-paid
}
function syncDerivedCardTransactions(){
  const out=[];
  (state?.expenses||[]).filter(x=>!x.recurring&&x.source==='card'&&x.cardId).forEach(x=>{if(!x.cardTxId)x.cardTxId=id();const c=state.cards.find(c=>c.id===x.cardId);out.push({id:x.cardTxId,financeLinkId:x.financeLinkId||(x.financeLinkId='fin_'+id()),expenseId:x.id,cardId:x.cardId,amount:+(x.actualAmount??x.amount)||0,totalAmount:x.totalAmount,title:x.title,baseTitle:x.baseTitle,category:x.category,date:x.date,purchaseDate:x.purchaseDate||x.date,statementMonth:c?statementMonthFor(c,x.date):String(x.date||'').slice(0,7),attachment:x.attachment||'',installmentGroup:x.installmentGroup,installmentNo:x.installmentNo,installmentCount:x.installmentCount,importedRefund:isCardRefund(x),derived:true})});
  (state?.fixedPayments||[]).filter(p=>p.source==='card'&&p.cardId).forEach(p=>{if(!p.cardTxId)p.cardTxId=id();const ex=state.expenses.find(x=>x.id===p.expenseId),c=state.cards.find(c=>c.id===p.cardId);out.push({id:p.cardTxId,financeLinkId:p.financeLinkId||(p.financeLinkId='fin_'+id()),fixedPaymentId:p.id,expenseId:p.expenseId,cardId:p.cardId,amount:+(p.actualAmount??p.amount)||0,title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',date:p.date||iso(),statementMonth:c?statementMonthFor(c,p.date||iso()):String(p.date||'').slice(0,7),derived:true})});
  state.cardTransactions=out
}
function recalculateFinanceCore(){
  if(!state)return;
  syncDerivedCardTransactions();
  (state.cards||[]).forEach(c=>{if(!Number.isFinite(+c.openingBalance))c.openingBalance=+c.balance||0;const anchored=!!c.balanceAnchorDate&&Number.isFinite(+c.balanceAnchorAmount),base=anchored?(+c.balanceAnchorAmount||0):(+c.openingBalance||0);c.balance=base+cardDerivedNet(c.id)})
}

function taraAudit(){
 const issues=[],seen=new Map(),all=[];
 const add=(level,title,detail)=>issues.push({level,title,detail});
 const collect=(name,arr)=>{(arr||[]).forEach(x=>{if(!x||!x.id)return add('bad',name+' KAYDI KİMLİKSİZ','Bir kayıtta kalıcı kimlik yok.');const key=String(x.id);if(seen.has(key))add('bad','MÜKERRER KAYIT KİMLİĞİ',key+' · '+seen.get(key)+' / '+name);else seen.set(key,name);all.push(x)})};
 collect('GİDER',state.expenses);collect('GELİR',state.incomes);collect('SABİT ÖDEME',state.fixedPayments);collect('KART ÖDEMESİ',state.cardPayments);collect('KART',state.cards);
 (state.fixedPayments||[]).forEach(p=>{const ex=(state.expenses||[]).find(x=>x.id===p.expenseId);if(!ex)add('bad','BAĞLANTISIZ SABİT ÖDEME',(p.title||p.id)+' için sabit gider bulunamadı.');else if(!ex.recurring)add('warn','SABİT ÖDEME BAĞLANTISI','Ödeme sabit olmayan bir gidere bağlı.');if(p.month&&ex&&!(ex.paidMonths||[]).includes(p.month))add('warn','ÖDEME DURUMU UYUŞMUYOR',(ex.title||'Sabit gider')+' · '+p.month)});
 (state.expenses||[]).filter(x=>x.recurring).forEach(ex=>{(ex.paidMonths||[]).forEach(m=>{if(!(state.fixedPayments||[]).some(p=>p.expenseId===ex.id&&p.month===m))add('warn','EKSİK SABİT ÖDEME HAREKETİ',(ex.title||'Sabit gider')+' · '+m)})});
 (state.expenses||[]).filter(x=>!x.recurring&&x.source==='card').forEach(x=>{if(!x.cardId||!(state.cards||[]).some(c=>c.id===x.cardId))add('bad','KART BAĞLANTISI EKSİK',(x.title||'Harcama')+' · kart bulunamadı.');if(!x.financeLinkId)add('warn','FİNANSAL KİMLİK EKSİK',(x.title||'Harcama')+' finansal bağlantı kimliği taşımıyor.')});
 const fps=new Map();(state.expenses||[]).filter(x=>x.importedFromStatement).forEach(x=>{const k=x.importFingerprint||x.importBaseFingerprint;if(k){if(fps.has(k))add('bad','MÜKERRER EKSTRE HAREKETİ',(x.title||'Ekstre hareketi')+' aynı parmak iziyle birden fazla kayıtlı.');else fps.set(k,x.id)}});
 (state.cards||[]).forEach(c=>{const expected=(Number.isFinite(+c.balanceAnchorAmount)&&c.balanceAnchorDate?+c.balanceAnchorAmount:+c.openingBalance||0)+cardDerivedNet(c.id);if(Math.abs((+c.balance||0)-expected)>.01)add('warn','KART BORCU TUTARSIZ',`${c.bank||''} ${c.name||''} · beklenen ${money(expected)}, kayıtlı ${money(+c.balance||0)}`)});
 const month=financeMonthSnapshot(state.selectedMonth);return {issues,month,checked:all.length,ok:issues.filter(x=>x.level==='bad').length===0}
}
function tara(){const a=taraAudit(),bad=a.issues.filter(x=>x.level==='bad').length,warn=a.issues.filter(x=>x.level==='warn').length;return `<div class="card"><div class="section"><b>TARA · SİSTEM SAĞLIĞI</b><span>${a.checked} kayıt kontrol edildi</span></div><div class="reportHero3"><div><small>KRİTİK</small><b class="${bad?'exp':'inc'}">${bad}</b></div><div><small>UYARI</small><b>${warn}</b></div><div><small>DURUM</small><b class="${a.ok?'inc':'exp'}">${a.ok?'SAĞLAM':'KONTROL'}</b></div></div><div class="notice"><b>${monthLabel(a.month.month)}</b><br>Merkezi motor: Gelir ${money(a.month.incomeTotal)} · Gider ${money(a.month.expenseTotal)} · Kalan ${money(a.month.remaining)}</div><div class="section"><b>DENETİM SONUÇLARI</b><span></span></div><div class="list">${a.issues.length?a.issues.map(x=>`<div class="item"><div class="ico">${x.level==='bad'?'!':'?'}</div><div><b>${esc(x.title)}</b><small>${esc(x.detail)}</small></div></div>`).join(''):'<div class="notice">KRİTİK VERİ TUTARSIZLIĞI BULUNMADI.</div>'}</div><button class="btn gold" data-action="taraRun">TEKRAR TARA</button></div>`}
function goTo(next,{replace=false,fromPop=false}={}){if(!next||next===current)return;if(!fromPop)navHistory.push(current);current=next;modal=null;if(browserNavReady&&!fromPop){const st={haneView:next};replace?history.replaceState(st,''):history.pushState(st,'')}render()}
function goBack(){if(current==='theme')themeDraft=null;const prev=navHistory.pop()||'home';current=prev;modal=null;if(browserNavReady)history.replaceState({haneView:current},'');render()}
function initBrowserNav(){if(browserNavReady)return;browserNavReady=true;history.replaceState({haneView:current},'');window.addEventListener('popstate',e=>{if(!state)return;const next=e.state?.haneView||navHistory.pop()||'home';if(next!==current){current=next;modal=null;render()}})}
function summaryDetailBody(kind){
  const m=state.selectedMonth;
  const inc=realizedIncomeEntriesForMonth(m).map(x=>({...x,_kind:'income'}));
  const exp=actualExpenseEntriesForMonth(m).map(x=>({...x,_kind:'expense'}));
  const items=(kind==='income'?inc:kind==='expense'?exp:[...inc,...exp]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const T=totals(m),title=kind==='income'?'GELİR DETAYI':kind==='expense'?'GİDER DETAYI':'KALAN DETAYI';
  const rows=items.map(x=>{
    const fixed=x._kind==='expense'&&x.recurring&&x.paymentId;
    const edit=x._kind==='income'?'editIncome':fixed?'editStatementFixedPayment':'editExpense';
    const del=x._kind==='income'?'delIncome':fixed?'delFixedPaymentExact':'delExpense';
    const rid=fixed?x.paymentId:x.id;
    const refund=x._kind==='expense'&&isCardRefund(x),label=x._kind==='income'?'GELİR':refund?'İADE':esc(x.category||'DİĞER'),color=x._kind==='income'||refund?'var(--green)':'var(--red)',sign=x._kind==='income'||refund?'+':'-';
    return `<div class="item"><div class="ico premiumIco">${x._kind==='income'?premiumIcon('income',22):catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · ${label}${fixed?' · ÖDENDİ':''}</small></div><div class="reportMoveRight"><b style="color:${color}">${sign}${money(Math.abs(x.amount))}</b><div><button data-action="${edit}" data-direct-edit="1" data-id="${rid}">DETAY</button><button class="danger" data-action="${del}" data-id="${rid}">SİL</button></div></div></div>`;
  }).join('');
  return `<div class="summaryDetailBox"><div class="summaryDetailHead"><small>${m}</small><h2>${kind==='income'?money(T.i):kind==='expense'?money(T.e):money(T.r)}</h2><b>${title}</b></div>${kind==='remain'?`<div class="summaryBreakdown"><span>Gelir <b style="color:var(--green)">${money(T.i)}</b></span><span>Gider <b style="color:var(--red)">${money(T.e)}</b></span><span>Kalan <b style="color:var(--gr)">${money(T.r)}</b></span></div>`:''}<div class="list">${rows||'<div class="notice">KAYIT YOK.</div>'}</div></div>`
}



const b64=a=>{let s='';for(const b of new Uint8Array(a))s+=String.fromCharCode(b);return btoa(s)},ub64=s=>{const r=atob(s),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
async function derive(p,salt){const m=await crypto.subtle.importKey('raw',enc.encode('HANE|LOCKED|'+p),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encrypt(st,k){const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,enc.encode(JSON.stringify(st)));return{iv:b64(iv),data:b64(data)}}
async function decrypt(box,k){const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(box.iv)},k,ub64(box.data));return JSON.parse(dec.decode(p))}
function meta(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch{return null}}
let saveQueue=Promise.resolve();
let storageExclusive=false,storageExclusiveMode='',storageExclusiveWaiters=[];
function cloneStateSnapshot(v){try{return structuredClone(v)}catch{return JSON.parse(JSON.stringify(v))}}
function waitForStorageAvailable(){
  if(!storageExclusive)return Promise.resolve();
  return new Promise((resolve,reject)=>storageExclusiveWaiters.push({resolve,reject}));
}
async function beginStorageExclusive(mode='maintenance'){
  while(storageExclusive)await waitForStorageAvailable();
  storageExclusive=true;storageExclusiveMode=mode;
  try{await saveQueue}catch{}
}
function endStorageExclusive(){
  storageExclusive=false;storageExclusiveMode='';
  const waiters=storageExclusiveWaiters.splice(0);
  waiters.forEach(w=>w.resolve());
}
function abortStorageExclusiveWaiters(message){
  const waiters=storageExclusiveWaiters.splice(0);
  waiters.forEach(w=>w.reject(new Error(message||'Depolama işlemi nedeniyle kayıt iptal edildi.')));
}
async function save(){
  await waitForStorageAvailable();
  if(!state)throw new Error('Uygulama verisi hazır değil');
  recalculateFinanceCore();
  setLockPreviewFromState();
  if(!key)throw new Error('Şifreleme anahtarı hazır değil. Uygulamayı kilitleyip PIN ile tekrar girin.');
  const snapshot=cloneStateSnapshot(state),saveKey=key;
  const write=async()=>{const box=await encrypt(snapshot,saveKey);try{localStorage.setItem(DATA,JSON.stringify(box))}catch(e){throw new Error('Cihaz depolamasına kayıt yapılamadı')}};
  const task=saveQueue.then(write,write);
  saveQueue=task.catch(()=>{});
  return task;
}
function recoverStorageTransaction(){
  let tx=null;try{tx=JSON.parse(localStorage.getItem(STORAGE_TXN)||'null')}catch{}
  if(!tx)return;
  try{
    if(tx.oldData==null)localStorage.removeItem(DATA);else localStorage.setItem(DATA,tx.oldData);
    if(tx.oldMeta==null)localStorage.removeItem(META);else localStorage.setItem(META,tx.oldMeta);
  }finally{try{localStorage.removeItem(STORAGE_TXN)}catch{}}
}
function commitEncryptedPair(nextMeta,nextData){
  const oldMeta=localStorage.getItem(META),oldData=localStorage.getItem(DATA);
  const tx=JSON.stringify({oldMeta,oldData,startedAt:new Date().toISOString()});
  try{
    localStorage.setItem(STORAGE_TXN,tx);
    localStorage.setItem(DATA,nextData);
    localStorage.setItem(META,nextMeta);
    localStorage.removeItem(STORAGE_TXN);
  }catch(e){
    try{if(oldData==null)localStorage.removeItem(DATA);else localStorage.setItem(DATA,oldData)}catch{}
    try{if(oldMeta==null)localStorage.removeItem(META);else localStorage.setItem(META,oldMeta)}catch{}
    try{localStorage.removeItem(STORAGE_TXN)}catch{}
    throw new Error('Güvenli kayıt tamamlanamadı; önceki veriler korundu.');
  }
}
const LOCK_PREVIEW='hane_lock_preview_v1';
function setLockPreviewSnapshot(profile={}){try{localStorage.setItem(LOCK_PREVIEW,JSON.stringify({name:profile?.name||'HANE',photo:profile?.photo||''}))}catch{}}
function setLockPreviewFromState(){if(state?.profile)setLockPreviewSnapshot(state.profile)}
function getLockPreview(){try{return JSON.parse(localStorage.getItem(LOCK_PREVIEW)||'null')||{}}catch{return {}}}
async function setup(p,st){const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(p,salt),box=await encrypt(st,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt)}));setLockPreviewSnapshot(st?.profile||{});key=k;state=normalizeV19(st)}
async function unlock(p){const m=meta();if(!m)return false;try{
  const k=await derive(p,ub64(m.salt)),st=await decrypt(JSON.parse(localStorage.getItem(DATA)),k);
  st.cardPayments=Array.isArray(st.cardPayments)?st.cardPayments:[];
  st.fixedPayments=Array.isArray(st.fixedPayments)?st.fixedPayments:[];
  st.flexTransactions=Array.isArray(st.flexTransactions)?st.flexTransactions:[];
  st.installments=Array.isArray(st.installments)?st.installments:[];
  st.cardTransactions=Array.isArray(st.cardTransactions)?st.cardTransactions:[];
  key=k;state=normalizeV19(st);setLockPreviewSnapshot(state.profile||{});localStorage.setItem(META,JSON.stringify({salt:m.salt}));state.selectedMonth=ym(new Date());calendarMonth=state.selectedMonth;calendarDay='';applyTheme();return true
}catch{return false}}
function def(){return{version:19,selectedMonth:ym(new Date()),profile:{name:'',photo:'',motto:'Disiplin, özgürlüğün kapısını açar.'},settings:{lockMinutes:15,leadDays:3,notifications:false,darkMode:true},theme:{bg:'#05080d',accent:'#47bfff',income:'#2bd48e',expense:'#ff616d',remain:'#58c7ff'},incomes:[],expenses:[],cards:[],accounts:[],flexAccounts:[],customCategories:[],categoryMeta:{},cardTransactions:[],cardPayments:[],statementImports:[],statementCategoryRules:{},fixedPayments:[],flexTransactions:[],installments:[],notes:[],members:[{id:'me',name:'BEN',icon:'👤'}],homeLayout:['summary','quick','monthly','recent'],homeHidden:[]}}
function applyTheme(){if(!state)return;const t=state.theme||{},dark=state.settings?.darkMode!==false;const z={bg:'#05080d',accent:'#47bfff',income:'#2bd48e',expense:'#ff616d',remain:'#58c7ff'};const legacy=!t||((t.bg||'')==='#000000'&&((t.accent||'')==='#d8ad4f'||(t.accent||'')==='#f0cd77')&&((t.income||'')==='#248ef5')&&((t.expense||'')==='#ff4658')&&((t.remain||'')==='#16d77d'));const a=legacy?z:{bg:t.bg||z.bg,accent:t.accent||z.accent,income:t.income||z.income,expense:t.expense||z.expense,remain:t.remain||z.remain};const rgb=h=>{let s=String(h||'').replace('#','').trim();if(s.length===3)s=s.split('').map(c=>c+c).join('');const n=parseInt(s,16);return Number.isFinite(n)?[(n>>16)&255,(n>>8)&255,n&255]:[71,191,255]},rgba=(h,o)=>{const [r,g,b]=rgb(h);return `rgba(${r},${g},${b},${o})`};const root=document.documentElement;root.classList.toggle('lightMode',!dark);root.classList.toggle('darkMode',dark);root.dataset.skin='z';root.style.setProperty('--bg',dark?a.bg:'#f3f1eb');root.style.setProperty('--gold',a.accent);root.style.setProperty('--gold2',a.accent);root.style.setProperty('--gi',a.income);root.style.setProperty('--ge',a.expense);root.style.setProperty('--gr',a.remain);root.style.setProperty('--green',a.income);root.style.setProperty('--red',a.expense);root.style.setProperty('--blue',a.accent);root.style.setProperty('--z-accent',a.accent);root.style.setProperty('--z-accent-soft',a.remain);root.style.setProperty('--theme-accent',a.accent);root.style.setProperty('--theme-income',a.income);root.style.setProperty('--theme-expense',a.expense);root.style.setProperty('--theme-remain',a.remain);root.style.setProperty('--skin-bg',a.bg);root.style.setProperty('--skin-surface','#0b1118');root.style.setProperty('--skin-surface-2','#0f1720');root.style.setProperty('--skin-text','#eef7ff');root.style.setProperty('--skin-muted','#92a3b5');root.style.setProperty('--skin-border',rgba(a.accent,.22));root.style.setProperty('--skin-border-strong',rgba(a.accent,.52));root.style.setProperty('--skin-glow',rgba(a.accent,.18));root.style.setProperty('--skin-active-bg-1',rgba(a.accent,.22));root.style.setProperty('--skin-active-bg-2',rgba(a.accent,.08));root.style.setProperty('--skin-active-text','#edf9ff');root.style.setProperty('--skin-passive-bg-1','rgba(13,18,26,.98)');root.style.setProperty('--skin-passive-bg-2','rgba(8,12,17,.98)');root.style.setProperty('--skin-passive-text','#8ea0b4');root.style.setProperty('--skin-purple','#a87eff');root.style.setProperty('--skin-purple-soft','rgba(168,126,255,.14)');root.style.setProperty('--icon-active',a.accent);root.style.setProperty('--icon-border',rgba(a.accent,.20));root.style.setProperty('--icon-border-strong',rgba(a.accent,.50));root.style.setProperty('--icon-glow',rgba(a.accent,.16));}
function recurringIncomeDate(x,m){
  const base=String(x?.date||iso()),day=Math.max(1,Math.min(31,Number(base.slice(8,10))||1)),[y,mo]=String(m||state.selectedMonth).split('-').map(Number),last=new Date(y,mo,0).getDate();return `${m}-${String(Math.min(day,last)).padStart(2,'0')}`
}
function incomeEntriesForMonth(m=state.selectedMonth){
  const list=state?.incomes||[];
  return list.filter(x=>!x.recurring&&String(x.date||'').startsWith(m)).map(x=>({...x,_incomeTemplate:false})).concat(
    list.filter(x=>x.recurring&&String(x.date||'').slice(0,7)<=m).map(x=>({...x,date:recurringIncomeDate(x,m),_incomeTemplate:true,_incomeMonth:m}))
  )
}
function realizedIncomeEntriesForMonth(m=state.selectedMonth){
  const today=iso();
  return incomeEntriesForMonth(m).filter(x=>String(x.date||'')<=today)
}
function incomeEntriesInRange(start,end){
  const out=[],seen=new Set(),today=iso(),realEnd=String(end||'')>today?today:end;
  if(String(start||'')>today)return out;
  let d=new Date(start+'T12:00:00'),stop=new Date(realEnd+'T12:00:00');
  while(d<=stop){const m=ym(d);if(!seen.has(m)){seen.add(m);realizedIncomeEntriesForMonth(m).forEach(x=>{if(x.date>=start&&x.date<=realEnd)out.push(x)})}d=new Date(d.getFullYear(),d.getMonth()+1,1,12)}
  return out
}
function financeMonthSnapshot(m=state.selectedMonth){
  const incomes=realizedIncomeEntriesForMonth(m),expenses=actualExpenseEntriesForMonth(m);
  const incomeTotal=incomes.reduce((n,x)=>n+(+x.amount||0),0),expenseTotal=expenses.reduce((n,x)=>n+(+x.amount||0),0);
  const byCategory={};expenses.forEach(x=>{const k=x.category||'Diğer';byCategory[k]=(byCategory[k]||0)+(+x.amount||0)});
  const bySource={cash:0,card:0,flex:0};expenses.forEach(x=>{const k=x.source==='card'?'card':x.source==='flex'?'flex':'cash';bySource[k]+=(+x.amount||0)});
  return {month:m,incomes,expenses,incomeTotal,expenseTotal,remaining:incomeTotal-expenseTotal,byCategory,bySource}
}
function totals(m=state.selectedMonth){const f=financeMonthSnapshot(m);return{i:f.incomeTotal,e:f.expenseTotal,r:f.remaining}}
function cashFlow(m=state.selectedMonth){
  const actual=actualExpenseEntriesForMonth(m),spent=actual.reduce((a,x)=>a+(+x.amount||0),0);
  const directPaid=actual.filter(x=>x.source!=='card').reduce((a,x)=>a+(+x.amount||0),0);
  const cardPaid=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0);
  return{spent,paid:directPaid+cardPaid,directPaid,cardPaid}
}
function paymentSourceStats(m=state.selectedMonth){
  const items=actualExpenseEntriesForMonth(m),cash=items.filter(x=>x.source!=='card'),card=items.filter(x=>x.source==='card');
  return{cash,card,cashTotal:cash.reduce((n,x)=>n+(+x.amount||0),0),cardTotal:card.reduce((n,x)=>n+(+x.amount||0),0)}
}
function paymentSourceSummary(){const s=paymentSourceStats();return `<div class="paySummaryGrid"><button data-action="paymentSourceDetail" data-source="cash"><small>TOPLAM NAKİT HARCAMA</small><b>${money(s.cashTotal)}</b><span>${s.cash.length} HAREKET ›</span></button><button data-action="paymentSourceDetail" data-source="card"><small>TOPLAM KREDİ KARTI HARCAMA</small><b>${money(s.cardTotal)}</b><span>${s.card.length} HAREKET ›</span></button></div>`}
function paymentSourceDetailBody(source){const s=paymentSourceStats(),items=(source==='card'?s.card:s.cash).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),total=source==='card'?s.cardTotal:s.cashTotal;return `<div class="statementHero"><small>${state.selectedMonth} · ${source==='card'?'KREDİ KARTI':'NAKİT'}</small><h2>${money(total)}</h2><b>${items.length} HAREKET</b></div><div class="list">${items.length?items.map(x=>{const c=x.cardId?state.cards.find(z=>z.id===x.cardId):null,action=x.recurring?'editFixedPayment':'editExpense',rid=x.recurring?(x.expenseId||x.id):x.id,refund=isCardRefund(x);return `<div class="item" data-action="${action}" data-id="${rid}" data-direct-edit="1"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date||''} · ${refund?'İADE · ':''}${esc(x.category||'Diğer')} · ${source==='card'?'KREDİ KARTI'+(c?' • '+esc(c.bank)+' '+esc(c.name):''):'NAKİT'}</small></div><div class="right"><b style="color:${refund?'var(--green)':'var(--red)'}">${refund?'+':'-'}${money(Math.abs(x.amount))}</b><small class="tapDetailHint">DÜZENLE ›</small></div></div>`}).join(''):'<div class="notice">BU AY HAREKET YOK.</div>'}</div>`}

function statementPeriodRange(card,m){
  const [y,mo]=String(m||state.selectedMonth).split('-').map(Number),cut=Math.max(1,Math.min(31,Number(card?.statementDay)||1));
  const endDay=Math.min(cut,new Date(y,mo,0).getDate()),end=`${y}-${String(mo).padStart(2,'0')}-${String(endDay).padStart(2,'0')}`;
  const py=mo===1?y-1:y,pm=mo===1?12:mo-1,prevDay=Math.min(cut,new Date(py,pm,0).getDate()),prev=new Date(py,pm-1,prevDay,12),startD=new Date(prev);startD.setDate(startD.getDate()+1);
  const start=`${startD.getFullYear()}-${String(startD.getMonth()+1).padStart(2,'0')}-${String(startD.getDate()).padStart(2,'0')}`;
  return{start,end,label:`${new Date(start+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR')} – ${new Date(end+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR')}`}
}
function cardStatementItems(cardId,m){
  const c=state.cards.find(x=>x.id===cardId);if(!c)return[];const r=statementPeriodRange(c,m),inside=d=>String(d||'')>=r.start&&String(d||'')<=r.end;
  const expenses=(state.expenses||[]).filter(x=>!x.recurring&&x.source==='card'&&x.cardId===cardId&&inside(x.date)).map(x=>({kind:isCardRefund(x)?'refund':'spend',id:x.id,date:x.date,title:x.title,category:x.category,amount:+(x.actualAmount??x.amount)||0,installmentNo:x.installmentNo||null,installmentCount:x.installmentCount||null,totalAmount:x.totalAmount||null,action:'editExpense'}));
  const fixed=(state.fixedPayments||[]).filter(p=>p.source==='card'&&p.cardId===cardId&&inside(p.date)).map(p=>({kind:'fixed',id:p.id,date:p.date,title:p.title||'SABİT GİDER',category:p.category,amount:+(p.actualAmount??p.amount)||0,action:'editStatementFixedPayment'}));
  const pays=(state.cardPayments||[]).filter(p=>p.cardId===cardId&&inside(p.date)).map(p=>({kind:'payment',id:p.id,date:p.date,title:'KART ÖDEMESİ',category:'Ödeme',amount:+p.amount||0,action:'editCardPayment'}));
  return [...expenses,...fixed,...pays].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
function cardStatementBody(cardId,m=cardStatementMonth||state.selectedMonth){
  const c=state.cards.find(x=>x.id===cardId);if(!c)return '<div class="notice">KART BULUNAMADI.</div>';const period=statementPeriodRange(c,m),items=cardStatementItems(cardId,m),purchases=items.filter(x=>x.kind==='spend'||x.kind==='fixed').reduce((n,x)=>n+Math.max(0,x.amount),0),refunds=items.filter(x=>x.kind==='refund').reduce((n,x)=>n+Math.abs(x.amount),0),paid=items.filter(x=>x.kind==='payment').reduce((n,x)=>n+x.amount,0),snap=statementSnapshot(cardId,m),bankSpend=snap&&Number.isFinite(+snap.spendingTotal)?+snap.spendingTotal:null,bankDebt=snap&&snap.periodDebt!=null&&Number.isFinite(+snap.periodDebt)?+snap.periodDebt:null,prev=snap&&Number.isFinite(+snap.previousBalance)?+snap.previousBalance:null,fees=snap&&Number.isFinite(+snap.feesTotal)?+snap.feesTotal:0,bankPays=snap&&Number.isFinite(+snap.paymentsTotal)?+snap.paymentsTotal:null,haneNet=purchases-refunds;
  const foundCount=items.filter(x=>x.kind!=='payment').length,payCount=items.filter(x=>x.kind==='payment').length,diff=bankSpend==null?null:haneNet-bankSpend;
  const bankBox=snap?`<div class="statementBankSummary simpleBankStatement"><b>BANKA EKSTRESİ</b><div class="statementEquation"><span><small>DEVREDEN</small><b>${prev==null?'-':money(prev)}</b></span><i>+</i><span><small>HARCAMALAR</small><b>${bankSpend==null?'-':money(bankSpend)}</b></span><i>+</i><span><small>FAİZ / ÜCRET</small><b>${money(fees)}</b></span><i>−</i><span><small>ÖDEMELER</small><b>${bankPays==null?'-':money(bankPays)}</b></span><i>=</i><span class="debt"><small>DÖNEM BORCU</small><b>${bankDebt==null?'-':money(bankDebt)}</b></span></div></div><div class="statementCompare"><div><small>HANE'DE BULUNAN HARCAMA / İADE</small><b>${foundCount} işlem · ${money(haneNet)}</b></div><div><small>HANE'DE BULUNAN KART ÖDEMESİ</small><b>${payCount} işlem · ${money(paid)}</b></div>${diff!=null&&Math.abs(diff)>.01?`<p>${diff>0?'HANE’de fazla okunan':'HANE’de eksik okunan'} harcama: <b>${money(Math.abs(diff))}</b></p>`:`<p>Ekstre harcama toplamı ile HANE uyumlu.</p>`}</div>`:'';
  return `<div class="statementHead"><button data-action="cardStatementShift" data-dir="-1" data-id="${c.id}">‹</button><div><small>EKSTRE DÖNEMİ</small><b>${period.label}</b></div><button data-action="cardStatementShift" data-dir="1" data-id="${c.id}">›</button></div><div class="statementHero"><small>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</small><h2>${bankDebt!=null?money(bankDebt):money(c.balance)}</h2><b>${bankDebt!=null?'DÖNEM BORCU':'GÜNCEL KART BORCU'}</b></div>${bankBox}<div class="statementPrivacyNote">🔒 Ekstre cihazda okunur · belge dışarı gönderilmez</div><div class="statementCardActions"><button class="btn" data-action="cardStatement" data-id="${c.id}">EKSTRE</button><button class="btn gold" data-action="statementImport" data-id="${c.id}">EKSTRE OKU</button><button class="btn" data-action="cardSpend" data-id="${c.id}">HARCAMA EKLE</button><button class="btn" data-action="editCard" data-id="${c.id}">DÜZENLE</button></div><div class="list">${items.length?items.map(x=>{const refund=x.kind==='refund',payment=x.kind==='payment',label=payment?'KART ÖDEMESİ':refund?'İADE':x.installmentCount?`TAKSİT ${x.installmentNo||'?'} / ${x.installmentCount}`:x.kind==='fixed'?'SABİT GİDER':'HARCAMA',color=payment||refund?'var(--green)':'var(--red)',sign=payment||refund?'−':'+';return `<div class="item statementItem ${refund?'refundItem':''}" data-action="${x.action}" data-id="${x.id}" data-direct-edit="1"><div class="ico premiumIco">${payment?premiumIcon('cards',22):catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · ${label}${x.category&&!payment?' · '+esc(x.category):''}</small></div><div class="right"><b style="color:${color}">${sign}${money(Math.abs(x.amount))}</b><small class="tapDetailHint">DÜZENLE / SİL ›</small></div></div>`}).join(''):'<div class="notice">BU EKSTRE DÖNEMİNDE HAREKET YOK.</div>'}</div>`
}

function statementMonthFor(card,dateStr){
  const d=new Date(dateStr+'T12:00:00');
  const ref=card.statementDate?new Date(card.statementDate+'T12:00:00'):null;
  const cutDay=ref&&!Number.isNaN(ref.getTime())?ref.getDate():Number(card.statementDay||1);
  const x=new Date(d.getFullYear(),d.getMonth()+(d.getDate()>cutDay?1:0),1);
  return ym(x)
}
function cardPaymentInfo(c,base=new Date()){
  const t=new Date(base.getFullYear(),base.getMonth(),base.getDate());
  let statementDate=rollMonthlyDate(c.statementDate,t);
  let dueDate=rollMonthlyDate(c.dueDate,t);

  if(!statementDate){
    const sd=Math.max(1,Math.min(31,Number(c.statementDay)||1));
    statementDate=new Date(t.getFullYear(),t.getMonth(),Math.min(sd,new Date(t.getFullYear(),t.getMonth()+1,0).getDate()));
    if(statementDate<t)statementDate=new Date(t.getFullYear(),t.getMonth()+1,Math.min(sd,new Date(t.getFullYear(),t.getMonth()+2,0).getDate()));
  }
  if(!dueDate){
    const dd=Math.max(1,Math.min(31,Number(c.dueDay)||1));
    dueDate=new Date(statementDate.getFullYear(),statementDate.getMonth(),Math.min(dd,new Date(statementDate.getFullYear(),statementDate.getMonth()+1,0).getDate()));
    if(dueDate<=statementDate)dueDate=new Date(statementDate.getFullYear(),statementDate.getMonth()+1,Math.min(dd,new Date(statementDate.getFullYear(),statementDate.getMonth()+2,0).getDate()));
  }

  while(dueDate<=statementDate){
    const day=dueDate.getDate();
    const next=new Date(dueDate.getFullYear(),dueDate.getMonth()+1,1);
    next.setDate(Math.min(day,new Date(next.getFullYear(),next.getMonth()+1,0).getDate()));
    dueDate=next;
  }
  return{statementDate,dueDate,days:Math.max(0,Math.ceil((dueDate-t)/86400000)),paymentWindowDays:Math.max(0,Math.ceil((dueDate-statementDate)/86400000))}
}
function rec(){const t=new Date();let best=null;state.cards.forEach(c=>{const info=cardPaymentInfo(c,t),u=(+c.balance||0)/Math.max(1,+c.limit||1),score=info.days-(u>.8?20:u>.6?8:0);if(!best||score>best.score)best={...c,...info,score}});return best}
function buildTopBar(){
  if(current==='home')return`<div class="top homeTop"><button class="ib premiumTopIcon menuBtn" data-action="openMenu">☰</button><div class="brand brandLogo officialBrand">${haneLogo(44,'brandMark')}</div><div class="topRight"><button class="ib premiumTopIcon" data-tab="alerts">${premiumIcon('bell',30)}</button><button class="ib premiumTopIcon homeIdentityBtn" data-tab="profile" aria-label="Kimlik Kartım">${state.profile.photo?`<img src="${state.profile.photo}" alt="Profil">`:`<span>${esc((state.profile.name||'H')[0])}</span>`}</button></div></div>`;
  const t={tara:'TARA · SİSTEM SAĞLIĞI',transactions:'HAREKETLER',fixed:'GİDERLER',cards:'FİNANS',calendar:'TAKVİM',reports:'RAPORLAR',profile:'PROFİL',backup:'YEDEKLEME',settings:'AYARLAR',members:'HANE ÜYELERİ',homeEdit:'ANA SAYFAYI DÜZENLE',categories:'KATEGORİLER',theme:'TEMA STÜDYOSU',alerts:'HATIRLATMALAR',about:'HAKKINDA',monthSpent:'BU AY HARCANAN',monthPaid:'AYLIK HESAP',notes:'NOTLAR'};
  return`<div class="top"><button class="back" data-action="back">‹</button><div class="brand">${t[current]||'HANE'}</div><div class="topRight"><button class="ib premiumTopIcon" data-tab="alerts">${premiumIcon('bell',28)}</button><button class="ib premiumTopIcon" data-tab="settings">${premiumIcon('settings',28)}</button></div></div>`
}
function nav(){return`<nav class="nav premiumNav v1947CleanNav">${HANE_UI.nav.map(x=>`<button data-tab="${x.tab}" class="${current===x.tab?'active':''}"><span class="navIcon">${premiumIcon(x.icon,30)}</span><span>${x.label}</span></button>`).join('')}</nav>`}
function menuBody(){const a=[['home','home','ANA EKRAN'],['transactions','transactions','HAREKETLER'],['fixed','expense','GİDERLER'],['cards','cards','KARTLAR / ESNEK HESAP'],['calendar','fixed','TAKVİM'],['reports','report','RAPORLAR'],['alerts','bell','HATIRLATMALAR'],['notes','note','NOTLAR'],['categories','fixed','KATEGORİLER'],['members','profile','HANE ÜYELERİ'],['profile','profile','PROFİL / KİMLİK'],['tara','report','TARA · SİSTEM SAĞLIĞI'],['settings','settings','AYARLAR']];return `<div class="menuList">${a.map(x=>`<button data-action="menuGo" data-go="${x[0]}"><i>${premiumIcon(x[1],24)}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div>`}

function monthLabel(m=state.selectedMonth){const [y,mo]=m.split('-').map(Number);return new Date(y,mo-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR')}
function monthShiftValue(m,delta){const [y,mo]=String(m||ym(new Date())).split('-').map(Number),d=new Date(y,mo-1+delta,1);return ym(d)}
function monthNavigator(){return `<div class="monthNavigator"><button type="button" data-action="monthPrev">‹</button><b>${monthLabel(state.selectedMonth)}</b><button type="button" data-action="monthNext">›</button><button type="button" class="monthToday" data-action="monthToday">BUGÜN</button></div>`}
function dateForSelectedMonth(baseDate,m=state.selectedMonth){const src=new Date(String(baseDate||iso())+'T12:00:00'),[y,mo]=m.split('-').map(Number),day=Number.isNaN(src.getTime())?1:src.getDate(),last=new Date(y,mo,0).getDate();return `${m}-${String(Math.min(day,last)).padStart(2,'0')}`}
function categoryStats(items){const map={};items.forEach(x=>{const k=x.category||'Diğer';map[k]=(map[k]||0)+(+x.amount||0)});return Object.entries(map).sort((a,b)=>b[1]-a[1])}
function roadText(v){return String(v||'').toLocaleUpperCase('tr-TR').replace(/İ/g,'I').replace(/Ş/g,'S').replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O').replace(/Ç/g,'C')}
function isRoadFee(x){if(!x||x.type!=='expense')return false;const t=roadText(x.title),c=roadText(x.category);return t.includes('YOL UCRET')||c.includes('YOL UCRET')||(t.includes('YOL')&&(c==='ULASIM'||c.includes('YOL')))}
function roadFeeItemsForDate(date){return (state?.expenses||[]).filter(x=>!x.recurring&&String(x.date||'')===String(date||'')&&isRoadFee({...x,type:'expense'})).sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'tr'))}
function roadFeeGroupBody(date){const items=roadFeeItemsForDate(date),total=items.reduce((n,x)=>n+(+(x.actualAmount??x.amount)||0),0),cash=items.filter(x=>x.source!=='card').reduce((n,x)=>n+(+(x.actualAmount??x.amount)||0),0),card=items.filter(x=>x.source==='card').reduce((n,x)=>n+(+(x.actualAmount??x.amount)||0),0);return `<div class="roadFeeGroupDetail"><div class="roadFeeGroupHero"><div><small>${esc(date||'')}</small><h2>YOL ÜCRETLERİ</h2><span>${items.length} HAREKET</span></div><strong>${money(total)}</strong></div><div class="roadFeeMiniGrid"><div><small>NAKİT</small><b>${money(cash)}</b></div><div><small>KREDİ KARTI</small><b>${money(card)}</b></div></div><div class="section"><b>AYRINTILAR</b><span>DÜZENLE / SİL</span></div><div class="list">${items.map(x=>{const cardObj=x.cardId?state.cards.find(c=>c.id===x.cardId):null,pay=x.source==='card'?`KREDİ KARTI${cardObj?' · '+esc(cardObj.bank)+' '+esc(cardObj.name):''}`:'NAKİT';return `<div class="item roadFeeDetailItem" data-action="editExpense" data-id="${x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category||'Ulaşım')}</div><div><b>${esc(x.title||'YOL ÜCRETİ')}</b><small>${esc(pay)}</small></div><div class="right"><b style="color:var(--red)">-${money(x.actualAmount??x.amount)}</b><small class="tapDetailHint">AYRINTI ›</small></div></div>`}).join('')}</div></div>`}
function monthSpent(){
  const m=state.selectedMonth,items=actualExpenseEntriesForMonth(m).sort((a,b)=>String(b.date).localeCompare(String(a.date))),total=items.reduce((a,x)=>a+(+x.amount||0),0),cats=categoryStats(items),palette=['#ff4658','#d8ad4f','#278ff5','#19d77d','#a86ef7','#ff8c42','#6ed4ff','#f06dad'];
  let acc=0;const segs=cats.map((x,i)=>{const p=total?x[1]/total*100:0,st=acc;acc+=p;return`${palette[i%palette.length]} ${st}% ${acc}%`}).join(','),avg=total/Math.max(1,new Date(+m.slice(0,4),+m.slice(5,7),0).getDate());
  return`<div class="monthDetailPage"><div class="detailHero card"><div><small>${monthLabel(m)}</small><h2>${money(total)}</h2><span>TOPLAM HARCAMA</span></div><div class="detailDonut" style="background:${total?`conic-gradient(${segs})`:'#151515'}"><div><b>${items.length}</b><small>İŞLEM</small></div></div></div><div class="detailMiniGrid"><div class="detailMini"><i>◷</i><span>GÜNLÜK ORTALAMA</span><b>${money(avg)}</b></div><div class="detailMini"><i>▦</i><span>KATEGORİ SAYISI</span><b>${cats.length}</b></div></div><div class="section"><b>KATEGORİLER</b><span></span></div><div class="detailCategoryList">${cats.length?cats.map((x,i)=>{const p=total?Math.round(x[1]/total*100):0;return`<div class="detailCat"><div class="detailCatIcon">${catPremiumIcon(x[0])}</div><div class="detailCatMid"><div><b>${esc(x[0])}</b><span>%${p}</span></div><div class="detailBar"><i style="width:${p}%;background:${palette[i%palette.length]}"></i></div></div><strong>${money(x[1])}</strong></div>`}).join(''):'<div class="notice">BU AY HARCAMA YOK.</div>'}</div><div class="section"><b>HARCAMALAR</b><span>${items.length} İŞLEM</span></div><div class="list detailTxList">${items.length?items.map(x=>{const fixed=x.recurring&&x.paymentId,action=fixed?'editStatementFixedPayment':'editExpense',rid=fixed?x.paymentId:x.id;return `<div class="item" data-action="${action}" data-direct-edit="1" data-id="${rid}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · ${isCardRefund(x)?'İADE · ':''}${esc(x.category||'DİĞER')}${fixed?' · SABİT GİDER':''}</small></div><div class="right"><b style="color:${isCardRefund(x)?'var(--green)':'var(--red)'}">${isCardRefund(x)?'+':'-'}${money(Math.abs(x.amount))}</b></div></div>`}).join(''):'<div class="notice">BU AY HARCAMA YOK.</div>'}</div></div>`
}
function monthPaid(){
  const m=state.selectedMonth;
  const card=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>{const c=state.cards.find(z=>z.id===x.cardId);return {...x,kind:'card',displayTitle:c?`${c.bank} · ${c.name||'KREDİ KARTI'}`:(x.title||'KREDİ KARTI ÖDEMESİ'),displayMeta:'KART ÖDEMESİ'}});
  const normalCash=(state.expenses||[]).filter(x=>!x.recurring&&x.source!=='card'&&String(x.date||'').startsWith(m)&&x.paid===true).map(x=>({...x,amount:+(x.actualAmount??x.amount??0)||0,kind:'direct',displayTitle:x.title||'GİDER',displayMeta:x.category||'ÖDENEN GİDER'}));
  const fixedCash=(state.fixedPayments||[]).filter(p=>p.source!=='card'&&String(p.date||'').startsWith(m)).map(p=>{const ex=state.expenses.find(x=>x.id===p.expenseId);return {...p,title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',amount:+(p.actualAmount??p.amount??0)||0,kind:'fixed',displayTitle:p.title||ex?.title||'SABİT GİDER',displayMeta:'SABİT GİDER'}});
  const flex=(state.flexTransactions||[]).filter(x=>x.kind==='pay'&&String(x.date||'').startsWith(m)).map(x=>{const f=(state.flexAccounts||[]).find(z=>z.id===x.flexId);return {...x,kind:'flex',displayTitle:x.title||(f?`${f.bank} · ${f.name||'ESNEK HESAP'}`:'ESNEK HESAP ÖDEMESİ'),displayMeta:'ESNEK HESAP ÖDEMESİ'}});
  const items=[...card,...normalCash,...fixedCash,...flex].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
  const total=items.reduce((a,x)=>a+(+x.amount||0),0);
  const day=x=>{const d=new Date(String(x.date||'')+'T12:00:00');return Number.isNaN(d.getTime())?'--':String(d.getDate()).padStart(2,'0')};
  const edit=x=>x.kind==='card'?'editCardPayment':x.kind==='fixed'?'editStatementFixedPayment':x.kind==='flex'?'editFlexPayment':'editExpense';
  const icon=x=>x.kind==='card'?premiumIcon('cards',21):x.kind==='flex'?premiumIcon('finance',21):catPremiumIcon(x.category||'Diğer');
  return `<div class="monthlyLedgerPage">${monthNavigator()}<div class="monthlyLedgerHead"><div><small>${monthLabel(m)}</small><b>AYLIK HESAP</b></div><strong>${money(total)}</strong><span>TOPLAM ÖDENEN</span></div><div class="monthlyLedgerList">${items.length?items.map(x=>`<button type="button" class="monthlyLedgerRow" data-action="${edit(x)}" data-direct-edit="1" data-id="${x.id}"><span class="monthlyLedgerDate"><b>${day(x)}</b><small>${new Date(String(x.date||'')+'T12:00:00').toLocaleDateString('tr-TR',{month:'short'}).toLocaleUpperCase('tr-TR')}</small></span><span class="monthlyLedgerIcon">${icon(x)}</span><span class="monthlyLedgerInfo"><b>${esc(x.displayTitle||x.title||'ÖDEME')}</b><small>${esc(x.displayMeta||x.category||'ÖDEME')}</small></span><strong>${money(x.amount)}</strong></button>`).join(''):'<div class="monthlyLedgerEmpty">BU AY ÖDEME KAYDI YOK.</div>'}</div>${items.length?`<div class="monthlyLedgerTotal"><span>AY TOPLAMI<small>${items.length} ÖDEME</small></span><strong>${money(total)}</strong></div>`:''}</div>`
}
function recentMovementsHome(limit=12){
  const m=state.selectedMonth;
  const incomes=realizedIncomeEntriesForMonth(m).map(x=>({...x,_recentKind:'income'}));
  const expenses=actualExpenseEntriesForMonth(m).map(x=>({...x,_recentKind:x.recurring?'fixed':'expense'}));
  const cardPays=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,_recentKind:'cardPayment'}));
  const rows=[...incomes,...expenses,...cardPays].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||''))).slice(0,limit);
  const html=rows.map(x=>{let action='editExpense',rid=x.id,label='GİDER',sign='-',color='var(--red)',ico=catPremiumIcon(x.category||'Diğer');if(x._recentKind==='income'){action='editIncome';label='GELİR';sign='+';color='var(--green)';ico=premiumIcon('income',22)}else if(x._recentKind==='fixed'){action='editFixedPayment';rid=x.expenseId||x.id;label='SABİT GİDER';ico=catPremiumIcon(x.category||'Diğer')}else if(x._recentKind==='cardPayment'){action='editCardPayment';label='KART ÖDEMESİ';sign='';color='var(--gold2)';ico=premiumIcon('cards',22)}const card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;const pay=(x._recentKind==='expense'||x._recentKind==='fixed')?(x.source==='card'?'KART'+(card?' · '+esc(card.name):''):'NAKİT'):'';return `<div class="item recentHomeItem" data-action="${action}" data-id="${rid}"><div class="ico premiumIco">${ico}</div><div><b>${esc(x.title||label)}</b><small>${x.date||''} · ${label}${pay?' · '+pay:''}</small></div><div class="right"><b style="color:${color}">${sign}${money(x.amount)}</b><small class="tapDetailHint">AYRINTI ›</small></div></div>`}).join('');
  return `<div class="section"><b>SON HAREKETLER</b><button class="sectionLinkBtn" data-tab="transactions">TÜMÜ ›</button></div><div class="list recentHomeList">${html||'<div class="notice">BU AY HAREKET YOK.</div>'}</div>`;
}
function monthlyAccountPreview(limit=4){
  const m=state.selectedMonth;
  const card=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>{const c=state.cards.find(z=>z.id===x.cardId);return {...x,displayTitle:c?`${c.bank} · ${c.name||'KREDİ KARTI'}`:(x.title||'KREDİ KARTI ÖDEMESİ')}});
  const normal=(state.expenses||[]).filter(x=>!x.recurring&&x.source!=='card'&&String(x.date||'').startsWith(m)&&x.paid===true).map(x=>({...x,amount:+(x.actualAmount??x.amount??0)||0,displayTitle:x.title||'GİDER'}));
  const fixed=(state.fixedPayments||[]).filter(x=>x.source!=='card'&&String(x.date||'').startsWith(m)).map(x=>{const e=state.expenses.find(z=>z.id===x.expenseId);return {...x,amount:+(x.actualAmount??x.amount??0)||0,displayTitle:x.title||e?.title||'SABİT GİDER'}});
  const flex=(state.flexTransactions||[]).filter(x=>x.kind==='pay'&&String(x.date||'').startsWith(m)).map(x=>{const f=state.flexAccounts.find(z=>z.id===x.flexId);return {...x,displayTitle:x.title||(f?`${f.bank} · ${f.name||'ESNEK HESAP'}`:'ESNEK HESAP ÖDEMESİ')}});
  const all=[...card,...normal,...fixed,...flex].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))),total=all.reduce((n,x)=>n+(+x.amount||0),0);
  const rows=all.slice(0,limit).map(x=>`<div class="monthlyPreviewRow"><span>${esc(x.displayTitle||'ÖDEME')}</span><b>${money(x.amount)}</b></div>`).join('');
  return `<button type="button" class="monthlyPreviewHead" data-tab="monthPaid"><span><small>${monthLabel(m)}</small><b>AYLIK HESAP</b></span><em>TÜMÜ ›</em></button><div class="monthlyPreviewRows">${rows||'<div class="monthlyPreviewEmpty">BU AY ÖDEME KAYDI YOK.</div>'}</div><button type="button" class="monthlyPreviewTotal" data-tab="monthPaid"><span>AY TOPLAMI</span><strong>${money(total)}</strong></button>`;
}
function home(){const T=totals();return`<div class="homeHero">
  <div class="homeHeroAvatar ava">${state.profile.photo?`<img src="${state.profile.photo}">`:esc((state.profile.name||'H')[0])}</div>
  <div class="homeHeroText"><small>MERHABA</small><h2>${esc(state.profile.name||'HANE')}</h2><div class="date">${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'})}</div></div>
</div>
<div class="homeFinancePanel"><div class="homeFinanceMonth">${monthLabel(state.selectedMonth)}</div><div class="homeSummaryNav"><button class="sum" data-action="homeSummaryNav" data-kind="income"><label>Gelir</label><strong style="color:var(--green)">${money(T.i)}</strong><span>›</span></button><button class="sum" data-action="homeSummaryNav" data-kind="expense"><label>Gider</label><strong style="color:var(--red)">${money(T.e)}</strong><span>›</span></button><button class="sum" data-action="homeSummaryNav" data-kind="remain"><label>Kalan</label><strong style="color:var(--gr)">${money(T.r)}</strong><span>›</span></button></div></div>
<div class="homePrimaryActions"><button data-action="addIncome">${premiumIcon('income',25)}<span>GELİR EKLE</span></button><button data-action="addExpense">${premiumIcon('expense',25)}<span>GİDER EKLE</span></button></div>
<div class="section cleanHomeTitle"><b>HIZLI ERİŞİM</b><span></span></div><div class="card quick premiumQuick v1947Quick cleanQuick"><button data-tab="monthPaid"><i>${premiumIcon("report",27)}</i>AYLIK HESAP</button><button data-tab="fixed"><i>${premiumIcon("fixed",27)}</i>SABİT GİDERLER</button><button data-tab="alerts"><i>${premiumIcon("bell",27)}</i>HATIRLATMALAR</button><button data-action="quickCards"><i>${premiumIcon("cards",27)}</i>KARTLAR</button><button data-tab="notes"><i>${premiumIcon("note",27)}</i>NOTLAR</button></div>
<div class="card monthlyPreview">${monthlyAccountPreview()}</div>
${recentMovementsHome(5)}`}

function txAdvancedFilterBody(){
  const cats=['',...new Set([...(C||[]),...(state.customCategories||[])])];
  const members=[{id:'',name:'TÜM ÜYELER'},...(state.members||[])];
  return `<form class="form txAdvancedFilterForm" id="txAdvancedFilterForm">
    ${input('date','Tarih',txDate||'','date')}
    <div class="field"><label>Kategori</label><select name="category"><option value="">TÜM KATEGORİLER</option>${cats.filter(Boolean).map(c=>`<option value="${esc(c)}" ${txCategory===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
    <div class="field"><label>Ödeme Kaynağı</label><select name="pay"><option value="">TÜMÜ</option><option value="cash" ${txPay==='cash'?'selected':''}>NAKİT</option><option value="card" ${txPay==='card'?'selected':''}>KART</option><option value="flex" ${txPay==='flex'?'selected':''}>ESNEK HESAP</option></select></div>
    <div class="txAmountRange">${input('min','En Az Tutar',txMin||'','number','step="0.01" min="0"')}${input('max','En Çok Tutar',txMax||'','number','step="0.01" min="0"')}</div>
    <div class="field"><label>Hane Üyesi</label><select name="member">${members.map(m=>`<option value="${esc(m.id)}" ${txMember===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></div>
    <button class="btn gold" type="submit">FİLTREYİ UYGULA</button>
    <button class="btn" type="button" data-action="clearTxFilters">FİLTRELERİ TEMİZLE</button>
  </form>`;
}
function transactions(){
  const m=state.selectedMonth,q=txSearch.trim().toLocaleLowerCase('tr-TR');
  let a=[...realizedIncomeEntriesForMonth(m).map(x=>({...x,type:'income'})),...state.expenses.filter(x=>!x.recurring).map(x=>({...x,type:'expense'})),...(state.fixedPayments||[]).map(p=>{const ex=state.expenses.find(x=>x.id===p.expenseId);return {...(ex||{}),...p,id:p.id,expenseId:p.expenseId,type:'fixedExpense',title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',amount:+(p.actualAmount??p.amount??0)||0,date:p.date||iso(),source:p.source||'cash',cardId:p.cardId||null,_paid:true}}),...(state.cardPayments||[]).map(x=>({...x,type:'cardPayment',source:'card'})),...(state.flexTransactions||[]).map(x=>({...x,type:x.kind==='pay'?'flexPayment':'flexSpend',source:'flex'}))];
  if(!q)a=a.filter(x=>String(x.date||'').startsWith(m));
  if(txFilter==='income')a=a.filter(x=>x.type==='income');else if(txFilter==='expense')a=a.filter(x=>['expense','fixedExpense','flexSpend'].includes(x.type)&&x.source!=='card');else if(txFilter==='card')a=a.filter(x=>x.type==='cardPayment'||x.type==='flexPayment');
  if(txDate)a=a.filter(x=>String(x.date||'')===txDate);if(txCategory)a=a.filter(x=>String(x.category||'')===txCategory);if(txPay)a=a.filter(x=>String(x.source||'cash')===txPay);if(txMin!=='')a=a.filter(x=>(+x.amount||0)>=+txMin);if(txMax!=='')a=a.filter(x=>(+x.amount||0)<=+txMax);if(txMember)a=a.filter(x=>String(x.memberId||'me')===txMember);
  if(q)a=a.filter(x=>{const card=state.cards.find(c=>c.id===x.cardId),flex=state.flexAccounts.find(f=>f.id===x.flexId),mem=state.members.find(mm=>mm.id===(x.memberId||'me'));return [x.title,x.category,x.note,x.description,x.bank,x.source,x.type,x.date,x.amount,card?.bank,card?.name,flex?.bank,flex?.name,mem?.name].some(v=>String(v||'').toLocaleLowerCase('tr-TR').includes(q))});
  a.sort((a,b)=>String(b.date).localeCompare(String(a.date)));const B=(k,l)=>`<button data-action="txFilter" data-filter="${k}" class="${txFilter===k?'active':''}">${l}</button>`;
  const rr=x=>{const mem=state.members.find(m=>m.id===(x.memberId||'me')),card=state.cards.find(c=>c.id===x.cardId),flex=state.flexAccounts.find(f=>f.id===x.flexId);let kind=x.type==='income'?'GELİR':x.type==='fixedExpense'?'SABİT GİDER':x.type==='cardPayment'?'KART ÖDEMESİ':x.type==='flexPayment'?'ESNEK HESAP ÖDEMESİ':x.type==='flexSpend'?'ESNEK HESAP HARCAMASI':'GİDER';let pay=x.type==='fixedExpense'?(x._paid?(x.source==='card'?`KART${card?' · '+esc(card.bank)+' '+esc(card.name):''}`:'NAKİT'):'ÖDENMEDİ'):x.source==='card'?`KART${card?' · '+esc(card.bank)+' '+esc(card.name):''}`:x.source==='flex'?`ESNEK HESAP${flex?' · '+esc(flex.bank):''}`:'NAKİT';let edit=x.type==='income'?'editIncome':x.type==='fixedExpense'?'editStatementFixedPayment':x.type==='cardPayment'?'editCardPayment':x.type==='flexPayment'?'editFlexPayment':'editExpense';return `<div class="item searchResultItem movementRow ${x._paid?'isPaid':''}" data-action="${edit}" data-id="${x.id}"><div class="ico premiumIco">${x.type==='income'?premiumIcon('income',22):x.type==='cardPayment'?premiumIcon('cards',22):catPremiumIcon(x.category)}</div><div class="movementMain"><b>${esc(x.title||kind)}</b><small>${kind}${x.category?' · '+esc(x.category):''} · ${pay}${mem?' · '+esc(mem.name):''}${x.type==='fixedExpense'?' · '+(x._paid?'ÖDENDİ':'ÖDENMEDİ'):''}</small></div><div class="right movementAmount"><b style="color:${x.type==='income'?'var(--green)':'var(--red)'}">${x.type==='income'?'+':'-'}${money(x.amount)}</b><small>›</small></div></div>`};
  const roadCounts={};if(!q)a.forEach(x=>{if(isRoadFee(x))roadCounts[x.date]=(roadCounts[x.date]||0)+1});const shownRoad=new Set();
  const groups=new Map();
  a.forEach(x=>{if(!q&&isRoadFee(x)&&roadCounts[x.date]>1){if(shownRoad.has(x.date))return;shownRoad.add(x.date);const items=roadFeeItemsForDate(x.date),total=items.reduce((n,z)=>n+(+(z.actualAmount??z.amount)||0),0),cashN=items.filter(z=>z.source!=='card').length,cardN=items.filter(z=>z.source==='card').length;const html=`<div class="item searchResultItem movementRow roadFeeGroup" data-action="roadFeeGroup" data-date="${x.date}"><div class="ico premiumIco">${catPremiumIcon('Ulaşım')}</div><div class="movementMain"><b>YOL ÜCRETLERİ</b><small>${items.length} HAREKET · ${cashN?cashN+' NAKİT':''}${cashN&&cardN?' · ':''}${cardN?cardN+' KART':''}</small></div><div class="right movementAmount"><b style="color:var(--red)">-${money(total)}</b><small>›</small></div></div>`;if(!groups.has(x.date))groups.set(x.date,[]);groups.get(x.date).push(html);return}if(!groups.has(x.date||''))groups.set(x.date||'',[]);groups.get(x.date||'').push(rr(x))});
  const today=iso(),yesterday=(()=>{const d=new Date();d.setDate(d.getDate()-1);return iso(d)})();
  const dateLabel=d=>d===today?'BUGÜN':d===yesterday?'DÜN':(d?new Date(d+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'long',weekday:'long'}).toLocaleUpperCase('tr-TR'):'TARİHSİZ');
  const rows=[...groups.entries()].map(([d,rows])=>`<section class="movementDay"><div class="movementDayHead"><b>${dateLabel(d)}</b><span>${rows.length} KAYIT</span></div><div class="list movementList">${rows.join('')}</div></section>`).join('');
  return `<div class="movementsPage">${monthNavigator()}<div class="movementSearchRow"><div class="liveTxSearch premiumMovementSearch"><span>⌕</span><input id="txSearch" autocomplete="off" placeholder="Hareketlerde ara..." value="${esc(txSearch)}">${q?'<button type="button" data-action="clearTxSearch">×</button>':''}</div><button type="button" class="txAdvancedBtn ${txDate||txCategory||txPay||txMin||txMax||txMember?'active':''}" data-action="openTxFilters" aria-label="Gelişmiş filtre">${premiumIcon('settings',21)}</button></div><div class="seg movementSeg">${B('all','Tümü')}${B('income','Gelir')}${B('expense','Gider')}${B('card','Ödeme')}</div><div class="movementMeta"><b>${q?'ARAMA SONUÇLARI':monthLabel(m)}</b><span>${a.length} KAYIT</span></div>${a.length?rows:'<div class="notice movementEmpty">Eşleşen hareket bulunamadı.</div>'}</div>`
}
function fixedCategoryDetail(cat){
  const useRange=current==='reports',range=useRange?periodRange():{start:state.selectedMonth+'-01',end:state.selectedMonth+'-31',label:monthLabel(state.selectedMonth)};
  const items=actualExpenseEntriesInRange(range.start,range.end).filter(x=>(x.category||'Diğer')===cat).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const total=items.reduce((n,x)=>n+(+x.amount||0),0);
  return `<div class="fixedCatDetail"><div class="fixedCatDetailHero"><div><small>${esc(range.label)} · KATEGORİ</small><h2>${esc(cat)}</h2></div><strong>${money(total)}</strong></div><div class="section"><b>DÖNEM GİDER HAREKETLERİ</b><span>${items.length} KAYIT</span></div><div class="list">${items.length?items.map(x=>{const fixed=!!x.recurring,card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;return `<div class="item fixedCatDetailItem" data-action="${fixed?'editStatementFixedPayment':'editExpense'}" data-id="${fixed?(x.paymentId||x.id):x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div class="fixedCatDetailMain"><b>${esc(x.title)}</b><small>${x.date||''} · ${fixed?'SABİT GİDER':'NORMAL GİDER'} · ${x.source==='card'?'KART'+(card?' · '+esc(card.bank):''):'NAKİT'}</small></div><div class="fixedCatDetailRight"><strong>${money(x.amount)}</strong><small class="tapDetailHint">AYRINTI ›</small></div></div>`}).join(''):'<div class="notice">BU DÖNEM BU KATEGORİDE GİDER YOK.</div>'}</div></div>`
}
function fixed(){
  const m=state.selectedMonth;
  const normalItems=state.expenses.filter(x=>!x.recurring&&String(x.date||'').startsWith(m)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const fixedItems=state.expenses.filter(x=>x.recurring).sort((a,b)=>{const ap=fixedPaidForMonth(a,m)?1:0,bp=fixedPaidForMonth(b,m)?1:0;if(ap!==bp)return ap-bp;return String(a.dueDate||a.date||'').localeCompare(String(b.dueDate||b.date||''))});
  const normalTotal=normalItems.reduce((n,x)=>n+(isCardRefund(x)?-(Math.abs(+(x.actualAmount??x.amount)||0)):(+(x.actualAmount??x.amount)||0)),0);
  const fixedPaid=(state.fixedPayments||[]).filter(p=>p.month===m).reduce((n,p)=>n+(+(p.actualAmount??p.amount)||0),0);
  const fixedPlanned=fixedItems.reduce((n,x)=>n+fixedBillAmount(x),0);
  const total=normalTotal+fixedPaid;
  const summary=`<div class="expenseSummary"><div><small>TOPLAM</small><b>${money(total)}</b></div><div><small>NORMAL</small><b>${money(normalTotal)}</b></div><div><small>SABİT</small><b>${money(fixedPaid)}</b></div></div>`;
  const tabs=`<div class="expenseTabs"><button data-action="expenseView" data-view="normal" class="${expenseView==='normal'?'active':''}">NORMAL</button><button data-action="expenseView" data-view="fixed" class="${expenseView==='fixed'?'active':''}">SABİT</button></div>`;

  const groups=new Map();
  normalItems.forEach(x=>{const key=(x.date||'')+'|'+(x.category||'Diğer');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)});
  const normalRows=[...groups.values()].map(items=>{
    const x=items[0], total=items.reduce((n,z)=>n+(+(z.actualAmount??z.amount)||0),0), multi=items.length>1;
    if(multi){return `<div class="item expenseCenterRow" data-action="expenseGroupDetail" data-date="${esc(x.date||'')}" data-cat="${esc(x.category||'Diğer')}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div class="expenseCenterMain"><b>${esc(x.category||'Diğer')}</b><small>${prettyDate(x.date)} · ${items.length} İŞLEM</small></div><div class="expenseCenterRight"><b>-${money(total)}</b><small>AYRINTI ›</small></div></div>`}
    const card=x.cardId?state.cards.find(c=>c.id===x.cardId):null, refund=isCardRefund(x);
    return `<div class="item expenseCenterRow" data-action="editExpense" data-id="${x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div class="expenseCenterMain"><b>${esc(x.title||x.category||'GİDER')}</b><small>${prettyDate(x.date)} · ${esc(x.category||'Diğer')} · ${x.source==='card'?'KART'+(card?' · '+esc(card.bank):''):'NAKİT'}</small></div><div class="expenseCenterRight"><b style="color:${refund?'var(--green)':'var(--red)'}">${refund?'+':'-'}${money(Math.abs(+(x.actualAmount??x.amount)||0))}</b><small>AYRINTI ›</small></div></div>`;
  }).join('');
  const normalPanel=`<div class="section expenseSectionHead"><b>NORMAL GİDERLER</b><button class="miniAddBtn" data-action="addExpense">+ GİDER EKLE</button></div><div class="list expenseCenterList">${normalRows||'<div class="notice">BU AY NORMAL GİDER YOK.</div>'}</div>`;

  const fixedRows=fixedItems.map(x=>{const paid=fixedPaidForMonth(x,m),pay=fixedPaymentFor(x,m),expected=fixedBillAmount(x),actual=paid?(+(pay?.actualAmount??pay?.amount)||expected):expected,diff=paid?actual-expected:0,diffText=paid&&Math.abs(diff)>.009?(diff>0?` · +${money(diff)} EK MASRAF`:` · ${money(Math.abs(diff))} DAHA DÜŞÜK`):'';return `<div class="item expenseCenterRow fixedExpenseCenterRow ${paid?'isPaid':''}" data-fixed-id="${x.id}"><div class="ico premiumIco" data-action="editFixedExpense" data-id="${x.id}">${catPremiumIcon(x.category)}</div><div class="expenseCenterMain" data-action="editFixedExpense" data-id="${x.id}"><b>${esc(x.title)}</b><small>${prettyDate(dateForSelectedMonth(x.dueDate||x.date,m))} · ${esc(x.category||'Diğer')}${paid?' · ÖDENDİ'+(pay?.date?' '+prettyDate(pay.date):'')+diffText:' · BEKLİYOR'}</small></div><div class="expenseCenterRight"><b style="color:${paid?'var(--green)':'var(--red)'}">${money(actual)}</b><button type="button" class="paidToggle ${paid?'on':''}" data-action="toggleFixedPaid" data-id="${x.id}">${paid?'↶ GERİ AL':'ÖDEDİM'}</button></div></div>`}).join('');
  const fixedPanel=`<div class="section expenseSectionHead"><b>SABİT GİDERLER</b><button class="miniAddBtn" data-action="addFixedExpense">+ SABİT GİDER</button></div><div class="expenseFixedMeta"><span>PLANLANAN ${money(fixedPlanned)}</span><span>ÖDENEN ${money(fixedPaid)}</span></div><div class="list expenseCenterList">${fixedRows||'<div class="notice">SABİT GİDER YOK.</div>'}</div>`;
  return `<div class="expensesCenter">${monthNavigator()}${summary}${tabs}${expenseView==='fixed'?fixedPanel:normalPanel}</div>`;
}
function expenseGroupDetailBody(date,cat){
  const items=state.expenses.filter(x=>!x.recurring&&x.date===date&&(x.category||'Diğer')===cat).sort((a,b)=>String(b.id||'').localeCompare(String(a.id||'')));
  const total=items.reduce((n,x)=>n+(+(x.actualAmount??x.amount)||0),0);
  return `<div class="expenseGroupHero"><small>${prettyDate(date)} · ${esc(cat)}</small><b>${money(total)}</b><span>${items.length} işlem</span></div><div class="list expenseCenterList">${items.map(x=>{const card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;return `<div class="item expenseCenterRow" data-action="editExpense" data-direct-edit="1" data-id="${x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div class="expenseCenterMain"><b>${esc(x.title||x.category||'GİDER')}</b><small>${x.source==='card'?'KART'+(card?' · '+esc(card.bank):''):'NAKİT'}</small></div><div class="expenseCenterRight"><b>-${money(+(x.actualAmount??x.amount)||0)}</b><small>DÜZENLE ›</small></div></div>`}).join('')}</div>`;
}

function cards(){
  if(!['cards','accounts','debts'].includes(financeTab))financeTab='cards';
  const label=financeTab==='accounts'?'HESAPLAR':financeTab==='debts'?'BORÇLAR':'KARTLAR';
  const panel=financeTab==='accounts'?accountsPanel():financeTab==='debts'?debtsPanel():cardsPanel();
  return `<div class="financeHub"><button class="financeModeButton" data-action="financePicker"><span>${label}</span><b>⌄</b></button>${panel}</div>`
}
function cardsPanel(){return `<div class="section financeSectionHead"><b>KARTLARIM</b><button class="miniAddBtn" data-action="addCard">+ KART EKLE</button></div><div class="financeCarousel">${state.cards.map(credit).join('')||'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}</div><div class="financeCardList">${state.cards.map((c,i)=>`<button class="financeCardListRow" data-action="scrollCard" data-index="${i}"><span><b>${esc(c.bank)}</b><small>${esc(c.name||'KREDİ KARTI')}</small></span><strong>${money(c.balance)}${sharedCardLimitInfo(c)?`<small>ORTAK KALAN ${money(sharedCardLimitInfo(c).available)}</small>`:''}</strong><i>›</i></button>`).join('')}</div>`}
function sharedCardLimitInfo(c){
  const group=String(c?.sharedLimitGroup||'').trim();
  if(!group)return null;
  const members=(state.cards||[]).filter(x=>String(x.sharedLimitGroup||'').trim()===group);
  const total=Math.max(0,...members.map(x=>+x.sharedLimit||0));
  const used=members.reduce((n,x)=>n+Math.max(0,+x.balance||0),0);
  return{group,total,used,available:Math.max(0,total-used),count:members.length};
}
function credit(c){const pi=cardPaymentInfo(c),network=esc(c.network||'VISA');return `<div class="credit card luxuryCard clickableCredit haneVerticalCard ${c.style||'blackgold'}" data-action="cardStatement" data-id="${c.id}" data-card-id="${c.id}" role="button" tabindex="0"><div class="hvcGlow"></div><div class="hvcPattern"></div><div class="hvcTop"><div class="hvcBrand"><img src="icons/hane-app-icon.png" alt="HANE"><div><strong>HANE</strong><small>DAHA DÜZENLİ BİR YAŞAM</small></div></div></div><div class="hvcBankRow"><div class="hvcBank"><b>${esc(c.bank)}</b><small>${esc(c.name||'KREDİ KARTI')}</small></div><span class="hvcNetwork">${network}</span></div><div class="hvcChip"></div><div class="hvcDebt"><small>GÜNCEL BORÇ</small><b>${money(c.balance)}</b>${sharedCardLimitInfo(c)?`<small>ORTAK LİMİT · ${esc(sharedCardLimitInfo(c).group)} · KALAN ${money(sharedCardLimitInfo(c).available)}</small>`:""}</div><div class="hvcGrid compact"><div class="statementBox"><small>HESAP KESİM TARİHİ</small><b>${pi.statementDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR')}</b></div><div class="dueBox"><small>SON ÖDEME TARİHİ</small><b>${pi.dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR')}</b></div></div><div class="hvcFooter"><span>${esc(c.bank)}</span><small>DOKUN · EKSTRE</small></div></div>`}
function accountsPanel(){return `<div class="section financeSectionHead"><b>HESAPLAR</b><button class="miniAddBtn" data-action="addAccount">+ HESAP EKLE</button></div><div class="financeAccountList">${state.accounts.map(a=>`<div class="financeAccountRow" data-action="editAccount" data-id="${a.id}"><div class="financeAccountIcon">${premiumIcon('finance',22)}</div><div><b>${esc(a.bank)}</b><small>${esc(a.name)} · •••• ${esc(a.last4||'0000')}</small></div><strong>${money(a.balance)}</strong><span>›</span></div>`).join('')||'<div class="notice">HENÜZ HESAP EKLENMEDİ.</div>'}</div>`}
function debtsPanel(){
  const cards=(state.cards||[]).map(c=>({kind:'card',id:c.id,title:`${c.bank} · ${c.name||'KREDİ KARTI'}`,last4:c.last4,amount:+c.balance||0,due:cardPaymentInfo(c).dueDate,action:'cardStatement'}));
  const flex=(state.flexAccounts||[]).map(a=>({kind:'flex',id:a.id,title:`${a.bank} · ${a.name||'ESNEK HESAP'}`,amount:+a.balance||0,due:a.dueDate?new Date(a.dueDate+'T12:00:00'):null,action:'editFlex'}));
  const rows=[...cards,...flex].filter(x=>x.amount>0),total=rows.reduce((n,x)=>n+x.amount,0);
  return `<div class="financeDebtHero"><small>TOPLAM BORÇ</small><b>${money(total)}</b><span>${rows.length} BORÇ KALEMİ</span></div><div class="section financeSectionHead"><b>BORÇLAR</b><span>DETAY İÇİN DOKUN</span></div><div class="financeDebtList">${rows.map(x=>`<div class="financeDebtRow" data-action="${x.action}" data-id="${x.id}"><div><b>${esc(x.title)}</b><small>${x.due&&!Number.isNaN(x.due.getTime())?'SON ÖDEME · '+x.due.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR'):x.kind==='flex'?'ESNEK HESAP':'KREDİ KARTI'}${x.last4?' · •••• '+esc(x.last4):''}</small></div><strong>${money(x.amount)}</strong><span>›</span></div>`).join('')||'<div class="notice">AKTİF BORÇ YOK.</div>'}</div>`
}
function flexPanel(){return `<div class="section"><b>ESNEK HESAPLAR</b><button class="miniAddBtn" data-action="addFlex">+ ESNEK HESAP</button></div><div class="financeCarousel flexSameCards">${state.flexAccounts.map(a=>{const available=Math.max(0,(+a.limit||0)-(+a.balance||0));return`<div class="credit card luxuryCard ${a.style||'blackgold'} flexCredit" data-flex-id="${a.id}"><div class="haneCardBrand"><img src="icons/hane-app-icon.png" alt="HANE"><div><strong>HANE</strong><small>DAHA DÜZENLİ BİR YAŞAM</small></div></div><div class="cardTop"><b>${esc(a.bank)}</b><span>ESNEK HESAP</span></div><small class="cardName">${esc(a.name||'ESNEK HESAP')}</small><div class="chip"></div><div class="digits flexLabel">KULLANILABİLİR · ${money(available)}</div><div class="grid"><div><small>TOPLAM LİMİT</small><b>${money(a.limit)}</b></div><div><small>KULLANILAN LİMİT</small><b>${money(a.balance)}</b></div><div><small>HESAP KESİM TARİHİ</small><b>${prettyDate(a.statementDate)}</b></div><div><small>SON ÖDEME TARİHİ</small><b>${prettyDate(a.dueDate)}</b></div></div><div class="cardActions"><button class="btn" data-action="flexSpend" data-id="${a.id}">HARCAMA EKLE</button><button class="btn gold" data-action="flexPay" data-id="${a.id}">ÖDEME YAPTIM</button><button class="iconEdit" data-action="editFlex" data-id="${a.id}">✎</button></div></div>`}).join('')||'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}</div>`}
function periodRange(){
  const today=new Date();
  if(reportPeriod==='day'){const d=iso(today);return{start:d,end:d,label:'BUGÜN'}}
  if(reportPeriod==='week'){const d=new Date(today),n=(d.getDay()+6)%7,start=new Date(d);start.setDate(d.getDate()-n);const end=new Date(start);end.setDate(start.getDate()+6);return{start:iso(start),end:iso(end),label:'BU HAFTA'}}
  if(reportPeriod==='year'){const y=state.selectedMonth.slice(0,4);return{start:y+'-01-01',end:y+'-12-31',label:y}}
  if(reportPeriod==='custom'){const start=reportCustomStart||state.selectedMonth+'-01',end=reportCustomEnd||iso(today);return{start:start<=end?start:end,end:start<=end?end:start,label:(start<=end?start:end)+' → '+(start<=end?end:start)}}
  const [y,m]=state.selectedMonth.split('-').map(Number),last=new Date(y,m,0).getDate();return{start:state.selectedMonth+'-01',end:state.selectedMonth+'-'+String(last).padStart(2,'0'),label:state.selectedMonth}
}
function periodTotals(){const r=periodRange(),i=incomeEntriesInRange(r.start,r.end).reduce((a,x)=>a+(+x.amount||0),0),e=actualExpenseEntriesInRange(r.start,r.end).reduce((a,x)=>a+(+x.amount||0),0);return{i,e,r:i-e,range:r}}
function prettyDate(v){if(!v)return '-';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}
function calendarItems(date){
 const inc=incomeEntriesForMonth(String(date||'').slice(0,7)).filter(x=>x.date===date).map(x=>({...x,_kind:'income'}));
 const exp=state.expenses.filter(x=>!x.recurring&&x.source!=='flex'&&x.date===date).map(x=>({...x,_kind:'expense'}));
 const fixed=(state.fixedPayments||[]).filter(x=>x.date===date).map(x=>{const e=state.expenses.find(z=>z.id===x.expenseId);return {...x,title:x.title||e?.title||'SABİT GİDER',category:x.category||e?.category||'Sabit',memberId:e?.memberId||x.memberId||'',_kind:'fixedPayment',expenseId:x.expenseId}});
 const cp=(state.cardPayments||[]).filter(x=>x.date===date).map(x=>({...x,_kind:'cardPayment'}));
 const ft=(state.flexTransactions||[]).filter(x=>x.date===date).map(x=>({...x,_kind:x.kind==='pay'?'flexPayment':'flexSpend'}));
 return [...inc,...exp,...fixed,...cp,...ft].sort((a,b)=>String(b.createdAt||b.updatedAt||b.id||'').localeCompare(String(a.createdAt||a.updatedAt||a.id||'')));
}
function calendar(){
 if(!calendarMonth)calendarMonth=state.selectedMonth||ym(new Date());
 const [y,m]=calendarMonth.split('-').map(Number),first=new Date(y,m-1,1),last=new Date(y,m,0).getDate(),offset=(first.getDay()+6)%7;
 if(!calendarDay||!calendarDay.startsWith(calendarMonth))calendarDay=calendarMonth+'-'+String(Math.min(new Date().getDate(),last)).padStart(2,'0');
 const cells=[];for(let i=0;i<offset;i++)cells.push('<div class="calBlank"></div>');
 for(let d=1;d<=last;d++){
   const ds=calendarMonth+'-'+String(d).padStart(2,'0'),items=calendarItems(ds),future=upcomingPayments().filter(x=>x.date===ds&&!x.paid),kinds=[...new Set([...items.map(x=>x._kind),...future.map(x=>'future'+x.kind)])];
   cells.push(`<button class="calDay ${ds===calendarDay?'active':''}" data-action="calendarDay" data-date="${ds}"><b>${d}</b><span class="calDots">${kinds.slice(0,5).map(k=>`<i class="calDot ${k}"></i>`).join('')}</span></button>`)
 }
 const futureDue=upcomingPayments().filter(x=>x.date===calendarDay&&!x.paid);
 const items=calendarItems(calendarDay),income=items.filter(x=>x._kind==='income').reduce((a,x)=>a+(+x.amount||0),0),expense=items.filter(x=>['expense','flexSpend'].includes(x._kind)).reduce((a,x)=>a+(+x.amount||0),0);
 const row=x=>{const map={income:['GELİR','var(--green)','editIncome'],expense:['GİDER','var(--red)','editExpense'],fixedPayment:['SABİT GİDER','var(--z-accent)','editStatementFixedPayment'],cardPayment:['KART ÖDEMESİ','#35a7ff','editCardPayment'],flexSpend:['ESNEK HESAP','#b66cff','editExpense'],flexPayment:['ESNEK ÖDEME','#29d3c2','editFlexPayment']},refund=x._kind==='expense'&&isCardRefund(x),z=refund?['İADE','var(--green)','editExpense']:map[x._kind],idv=x._kind==='fixedPayment'?x.id:x._kind==='flexSpend'?x.expenseId:x.id,c=x.cardId?state.cards.find(q=>q.id===x.cardId):null,member=x.memberId?memberName(x.memberId):'',pay=x._kind==='expense'||x._kind==='fixedPayment'?(x.source==='card'?'KART'+(c?' • '+c.bank+' '+c.name:''):'NAKİT'):'';return `<button class="calendarMove calendarMoveTap ${refund?'refund':x._kind}" data-action="${z[2]}" data-id="${idv}" data-direct-edit="1"><i></i><div><b>${esc(x.title||z[0])}</b><small>${z[0]}${x.category?' · '+esc(x.category):''}${pay?' · '+esc(pay):''}${member?' · '+esc(member):''}</small></div><strong style="color:${z[1]}">${x._kind==='income'||refund?'+':x._kind==='expense'||x._kind==='flexSpend'?'-':''}${money(Math.abs(x.amount))}</strong><span class="calendarChevron">›</span></button>`};
 const dateObj=new Date(calendarDay+'T12:00:00'),dayTitle=dateObj.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR'),dayName=dateObj.toLocaleDateString('tr-TR',{weekday:'long'}).toLocaleUpperCase('tr-TR');
 const dailyPanel=`<div class="calendarDayPanel" data-day-panel="1"><div class="calendarDayNav"><button data-action="calendarDayPrev">‹</button><div><b>${dayTitle}</b><small>${dayName}</small></div><button data-action="calendarDayNext">›</button></div><div class="calendarSummary calendarSummary2"><div class="calIncome"><small>GELİR</small><b>${money(income)}</b></div><div class="calExpense"><small>GİDER</small><b>${money(expense)}</b></div></div><div class="calendarMoves">${futureDue.length?futureDue.map(x=>`<div class="calendarMove future${x.kind}"><i></i><div><b>${esc(x.title)}</b><small>HATIRLATMA · ${x.kind==='fixed'?'SABİT GİDER':x.kind==='card'?'KART':'ESNEK HESAP'}</small></div><strong>${money(x.amount)}</strong><span class="calendarChevron">›</span></div>`).join(''):''}${items.length?items.map(row).join(''):'<div class="notice">BU GÜN KAYIT YOK.</div>'}</div><button class="calendarAddMain" data-action="calendarAddMenu">＋ KAYIT EKLE</button><div class="calendarSwipeHint">Sağa / sola kaydırarak gün değiştir</div></div>`;
 return `<div class="calendarPage calendarPremium"><div class="calendarHead"><button data-action="calendarPrev">‹</button><b>${new Date(y,m-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR')}</b><button data-action="calendarNext">›</button><button class="calendarTodayBtn" data-action="monthToday">BUGÜN</button></div><div class="calWeek">${['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calGrid">${cells.join('')}</div><div class="calLegend"><span><i class="calDot income"></i>Gelir</span><span><i class="calDot expense"></i>Gider</span><span><i class="calDot fixedPayment"></i>Sabit</span><span><i class="calDot cardPayment"></i>Kart</span><span><i class="calDot futurefixed"></i>Hatırlatma</span></div>${dailyPanel}</div>`
}
function reports(){
 const m=state.selectedMonth,[yy,mm]=m.split('-').map(Number),pm=ym(new Date(yy,mm-2,1)),cur=totals(m),prev=totals(pm);
 const pct=(a,b)=>b?((a-b)/Math.abs(b)*100):0,fmtPct=n=>(n>=0?'+':'')+n.toFixed(1)+'%';
 const monthExpenses=actualExpenseEntriesForMonth(m),cats={};monthExpenses.forEach(x=>{const k=x.category||'Diğer';cats[k]=(cats[k]||0)+(+x.amount||0)});const catRows=Object.entries(cats).sort((a,b)=>b[1]-a[1]),catTotal=catRows.reduce((a,x)=>a+x[1],0)||1;
 const fixed=(state.expenses||[]).filter(x=>x.recurring),fixedRows=fixed.map(x=>{const p=fixedPaymentFor(x,m),expected=fixedBillAmount(x),actual=p?(+p.amount||0):0;return{x,p,expected,actual,diff:actual-expected}}),fixedExpected=fixedRows.reduce((a,z)=>a+z.expected,0),fixedActual=fixedRows.reduce((a,z)=>a+z.actual,0),fixedDiff=fixedActual-fixedExpected;
 const cardSpend=(state.expenses||[]).filter(x=>!x.recurring&&x.source==='card'&&String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0),cardPaid=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0),interest=monthExpenses.filter(x=>/faiz|vergi|kkdf|bsmv/i.test((x.category||'')+' '+(x.title||''))).reduce((a,x)=>a+(+x.amount||0),0);
 const nav=`<div class="reportModeTabs"><button data-action="reportView" data-view="summary" class="${reportView==='summary'?'active':''}">${premiumIcon('report',18)}<span>AYLIK ÖZET</span></button><button data-action="reportView" data-view="categories" class="${reportView==='categories'?'active':''}"><span class="reportMiniPie">◔</span><span>GİDER DAĞILIMI</span></button><button data-action="reportView" data-view="fixed" class="${reportView==='fixed'?'active':''}">${premiumIcon('fixed',18)}<span>SABİT GİDERLER</span></button><button data-action="reportView" data-view="cards" class="${reportView==='cards'?'active':''}">${premiumIcon('cards',18)}<span>KARTLAR</span></button></div>`;
 const head=`<div class="reportMonthRow">${monthNavigator()}<div class="reportRange"><button data-action="reportMonths" data-months="6" class="${reportMonths===6?'active':''}">6 AY</button><button data-action="reportMonths" data-months="12" class="${reportMonths===12?'active':''}">12 AY</button></div></div>`;
 const summary=`<div class="reportHero3"><button data-action="summaryDetail" data-kind="income"><small>TOPLAM GELİR</small><b class="inc">${money(cur.i)}</b><span>${fmtPct(pct(cur.i,prev.i))} · geçen aya göre</span></button><button data-action="summaryDetail" data-kind="expense"><small>TOPLAM GİDER</small><b class="exp">${money(cur.e)}</b><span>${fmtPct(pct(cur.e,prev.e))} · geçen aya göre</span></button><button data-action="summaryDetail" data-kind="remain"><small>NET DURUM</small><b class="net">${money(cur.r)}</b><span>${fmtPct(pct(cur.r,prev.r))} · geçen aya göre</span></button></div><div class="reportChartCard"><div class="reportCardTitle"><b>SON ${reportMonths} AY GELİR / GİDER</b><span><i class="incDot"></i>Gelir <i class="expDot"></i>Gider</span></div><canvas id="chart" data-report-chart="trend"></canvas></div><div class="reportDashboardGrid"><div class="reportPanel"><div class="reportCardTitle"><b>GİDER DAĞILIMI</b><button data-action="reportView" data-view="categories">TÜMÜ ›</button></div>${catRows.slice(0,5).map(([k,v])=>`<button class="reportBarRow" data-action="fixedCategoryDetail" data-cat="${esc(k)}"><span>${esc(k)}</span><i><em style="width:${Math.max(4,v/catTotal*100)}%"></em></i><b>${money(v)}</b></button>`).join('')||'<div class="notice">BU AY GİDER YOK.</div>'}</div><div class="reportPanel"><div class="reportCardTitle"><b>SABİT GİDERLER</b><button data-action="reportView" data-view="fixed">DETAY ›</button></div><div class="fixedCompare"><div><small>BEKLENEN</small><b>${money(fixedExpected)}</b></div><div><small>GERÇEK</small><b>${money(fixedActual)}</b></div></div><div class="reportDiff ${fixedDiff>0?'bad':fixedDiff<0?'good':''}">FARK <b>${fixedDiff>=0?'+':''}${money(fixedDiff)}</b></div></div><div class="reportPanel"><div class="reportCardTitle"><b>KART HARCAMALARI</b><button data-action="reportView" data-view="cards">DETAY ›</button></div><div class="reportStatLine"><span>Toplam Harcama</span><b>${money(cardSpend)}</b></div><div class="reportStatLine"><span>Kart Ödemesi</span><b>${money(cardPaid)}</b></div><div class="reportStatLine"><span>Faiz / Vergi</span><b>${money(interest)}</b></div></div></div><div class="reportCompare"><b>GEÇEN AYLA KARŞILAŞTIRMA</b><div><span>Gelir <strong class="inc">${cur.i-prev.i>=0?'+':''}${money(cur.i-prev.i)}</strong></span><span>Gider <strong class="exp">${cur.e-prev.e>=0?'+':''}${money(cur.e-prev.e)}</strong></span><span>Net <strong class="net">${cur.r-prev.r>=0?'+':''}${money(cur.r-prev.r)}</strong></span></div></div>`;
 const categories=`<div class="reportPanel reportFull"><div class="reportCardTitle"><b>GİDER DAĞILIMI · ${monthLabel(m)}</b><span>${catRows.length} kategori</span></div>${catRows.map(([k,v])=>`<button class="reportBarRow large" data-action="fixedCategoryDetail" data-cat="${esc(k)}"><span>${esc(k)}<small>${(v/catTotal*100).toFixed(1)}%</small></span><i><em style="width:${Math.max(3,v/catTotal*100)}%"></em></i><b>${money(v)}</b></button>`).join('')||'<div class="notice">BU AY GİDER YOK.</div>'}</div>`;
 const fixedView=`<div class="reportHero3 two"><div><small>BEKLENEN</small><b>${money(fixedExpected)}</b></div><div><small>GERÇEK ÖDENEN</small><b>${money(fixedActual)}</b></div><div><small>FARK</small><b class="${fixedDiff>0?'exp':'inc'}">${fixedDiff>=0?'+':''}${money(fixedDiff)}</b></div></div><div class="reportPanel reportFull">${fixedRows.map(z=>`<button class="fixedReportRow" data-action="editFixedExpense" data-id="${z.x.id}"><span><b>${esc(z.x.title||'Sabit Gider')}</b><small>Normal ${money(z.expected)}${z.p?' · Ödendi':' · Bekliyor'}</small></span><strong>${z.p?money(z.actual):'—'}</strong><em class="${z.diff>0?'bad':z.diff<0?'good':''}">${z.p?(z.diff>0?'+':'')+money(z.diff):''}</em></button>`).join('')||'<div class="notice">SABİT GİDER YOK.</div>'}</div>`;
 const cardsView=`<div class="reportHero3"><div><small>KART HARCAMASI</small><b>${money(cardSpend)}</b></div><div><small>KART ÖDEMESİ</small><b>${money(cardPaid)}</b></div><div><small>FAİZ / VERGİ</small><b>${money(interest)}</b></div></div><div class="reportPanel reportFull">${(state.cards||[]).map(c=>{const sp=(state.expenses||[]).filter(x=>x.cardId===c.id&&!x.recurring&&String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0),pa=(state.cardPayments||[]).filter(x=>x.cardId===c.id&&String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0);return `<button class="cardReportRow" data-action="openCardStatement" data-id="${c.id}"><span><b>${esc(c.bank)} · ${esc(c.name)}</b><small>Bu ay</small></span><span><small>HARCAMA</small><b>${money(sp)}</b></span><span><small>ÖDEME</small><b>${money(pa)}</b></span><i>›</i></button>`}).join('')||'<div class="notice">KART YOK.</div>'}</div>`;
 return `<div class="reportsPremium">${nav}${head}${reportView==='summary'?summary:reportView==='categories'?categories:reportView==='fixed'?fixedView:cardsView}</div>`
}
function profile(){return`<div class="profile card">
  <div class="ava profileAvatarLarge">${state.profile.photo?`<img src="${state.profile.photo}">`:esc((state.profile.name||'H')[0])}</div>
  <h2>${esc(state.profile.name||'HANE')}</h2>
  <small>${esc(state.profile.motto||'')}</small>
  <button class="btn profileEditBtn" data-action="editProfile">PROFİLİ DÜZENLE</button>
</div>
<div class="card" style="margin-top:12px">
  <div class="setting" data-action="editProfile"><span class="settingIco">${premiumIcon("home",24)}</span><span>PROFİL RESMİ VE İSİM</span><b>›</b></div>
  <div class="setting" data-action="changePin"><span class="settingIco">${premiumIcon("lock",24)}</span><span>PIN DEĞİŞTİR</span><b>›</b></div>
  <div class="setting"><span class="settingIco">${premiumIcon("lock",24)}</span><span>OTOMATİK KİLİT</span><b>${state.settings.lockMinutes} Dakika</b></div>
  <div class="setting" data-action="openTheme"><span class="settingIco">${premiumIcon("palette",24)}</span><span>TEMA STÜDYOSU</span><b>›</b></div>
  <div class="setting" data-tab="backup"><span class="settingIco">${premiumIcon("backup",24)}</span><span>YEDEKLEME</span><b>›</b></div>
  <div class="setting" data-tab="settings"><span class="settingIco">${premiumIcon("settings",24)}</span><span>UYGULAMA AYARLARI</span><b>›</b></div>
</div>`}
function backup(){return`<div class="card" style="padding:15px"><div class="section"><b>Yedek Oluştur</b><span></span></div><div class="notice">Tüm verilerini şifreli .hane dosyası olarak dışa aktar.</div><button class="btn gold" style="width:100%;margin-top:12px" data-action="backupNow">Yedek Oluştur</button></div><div class="card" style="padding:15px;margin-top:12px"><div class="section"><b>Yedekten Geri Yükle</b><span></span></div><button class="btn" style="width:100%" data-action="restoreNow">Yedekten Geri Yükle</button></div>`}
function settings(){return`<div class="card"><div class="setting" data-action="togglePrivacy"><span class="settingIco">👁</span><span>GİZLİLİK MODU</span><b>${state.settings.privacy?'Açık':'Kapalı'}</b></div><div class="setting" data-tab="homeEdit"><span class="settingIco">⌂</span><span>ANA SAYFAYI DÜZENLE</span><b>›</b></div><div class="setting" data-tab="members"><span class="settingIco">👥</span><span>HANE ÜYELERİ</span><b>›</b></div><div class="setting" data-tab="categories"><span class="settingIco">🎨</span><span>KATEGORİLERİ DÜZENLE / EKLE</span><b>›</b></div><div class="setting" data-tab="tara"><span class="settingIco">✓</span><span>TARA · SİSTEM SAĞLIĞI</span><b>›</b></div><div class="setting" data-action="toggleDarkMode"><span class="settingIco">${premiumIcon("palette",30)}</span><span>KARANLIK MOD</span><b>${state.settings.darkMode!==false?'Açık':'Kapalı'}</b></div><div class="setting" data-tab="about"><span class="settingIco">${premiumIcon("info",30)}</span><span>HAKKINDA</span><b>›</b></div><div class="setting" data-action="clearAll"><span class="settingIco dangerIco">${premiumIcon("trash",30)}</span><span style="color:var(--red)">TÜM VERİLERİ SIFIRLA</span><b></b></div></div>`}
function notes(){
  const rows=[...(state.notes||[])].sort((a,b)=>String(b.updatedAt||b.date||'').localeCompare(String(a.updatedAt||a.date||'')));
  return `<div class="section"><b>NOTLAR</b><button class="miniAddBtn" data-action="addNote">+ NOT EKLE</button></div><div class="notice">Kısa notlarını burada tutabilirsin. Notlar HANE verileriyle birlikte cihazında saklanır.</div><div class="list notesList">${rows.length?rows.map(n=>`<button class="item noteItem" data-action="editNote" data-id="${n.id}"><div class="ico premiumIco">${premiumIcon('note',22)}</div><div><b>${esc(n.title||'NOT')}</b><small>${esc((n.body||'').slice(0,90))}${(n.body||'').length>90?'…':''}</small></div><div class="right"><small>${esc(n.date||'')}</small><b>›</b></div></button>`).join(''):'<div class="notice">Henüz not yok.</div>'}</div>`
}
function noteForm(n={}){return `<form class="form" id="noteForm">${input('title','Başlık',n.title||'')}<div class="field"><label>Not</label><textarea name="body" rows="7" autocapitalize="sentences" autocorrect="on" spellcheck="true">${esc(n.body||'')}</textarea></div>${input('date','Tarih',n.date||iso(),'date')}<button class="btn gold" type="submit">KAYDET</button>${n.id?`<button type="button" class="btn" data-action="delNote" data-id="${n.id}">SİL</button>`:''}</form>`}
function categoryLearningRows(){const rules=state?.statementCategoryRules&&typeof state.statementCategoryRules==='object'?state.statementCategoryRules:{};return Object.entries(rules).filter(([k,v])=>k&&v).sort((a,b)=>a[0].localeCompare(b[0],'tr'))}
function categories(){const shown=visibleCategoryList(),learned=categoryLearningRows(),byCat={};learned.forEach(([merchant,cat])=>(byCat[cat]||(byCat[cat]=[])).push(merchant));return `<div class="section"><b>KATEGORİLER</b><button class="miniAddBtn" data-action="addCategory">+ EKLE</button></div><div class="notice categoryVisibilityNote">${shown.length?`${shown.length} kullanılan kategori gösteriliyor.`:'Henüz kullanılan kategori yok.'} Ekstrede bir işyerinin kategorisini değiştirdiğinde HANE bunu öğrenir ve sonraki ekstrelerde aynı işyerine otomatik uygular.</div><div class="categoryManage">${shown.length?shown.map(c=>`<button data-action="editCategory" data-cat="${esc(c)}"><span>${catPremiumIcon(c)}</span><b>${esc(c)}</b><em>${(byCat[c]||[]).length?`${(byCat[c]||[]).length} ÖĞRENİLEN`:'✎'}</em></button>`).join(''):'<div class="notice">İlk gider kaydından sonra kullanılan kategoriler burada görünecek.</div>'}</div><div class="section"><b>KATEGORİ ÖĞRENME</b><span>${learned.length} KURAL</span></div>${learned.length?`<div class="list">${learned.map(([merchant,cat])=>`<div class="item"><div class="ico premiumIco">${catPremiumIcon(cat)}</div><div><b>${esc(merchant)}</b><small>SONRAKİ EKSTRELERDE → ${esc(cat)}</small></div><button class="btn" style="width:auto;padding:8px 10px" data-action="delCategoryRule" data-merchant="${esc(merchant)}">SİL</button></div>`).join('')}</div><button class="btn" style="width:100%;margin-top:10px" data-action="clearCategoryRules">ÖĞRENİLEN KURALLARI TEMİZLE</button>`:'<div class="notice">Henüz öğrenilmiş işyeri-kategori kuralı yok. Ekstre okuturken bir işlemin kategorisini değiştirirsen burada görünür.</div>'}`}

function categoryForm(old=''){const icon=old?catIcon(old):'✨',color=old?catColor(old):'#d8ad4f';return `<form class="form" id="categoryForm">${input('name','Kategori Adı',old)}${input('icon','İkon / Emoji',icon)}<div class="field"><label>İkon Rengi</label><input type="color" name="color" value="${color}"></div><button class="btn gold" type="submit">KAYDET</button>${old&&state.customCategories.includes(old)?`<button class="btn" type="button" data-action="delCategory" data-cat="${esc(old)}">KATEGORİYİ SİL</button>`:''}</form>`}
function theme(){
  if(!themeDraft) themeDraft={...(state.theme||{bg:'#05080d',accent:'#47bfff',income:'#2bd48e',expense:'#ff616d',remain:'#58c7ff'})};
  const t=themeDraft;
  return`<div class="section"><b>Tema Stüdyosu</b><span>Kaydetmeden uygulanmaz</span></div><div class="preview" style="background:${t.bg};border-color:${t.accent}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:${t.accent}">Canlı Önizleme</b><small style="color:#aaa">Sadece önizleme</small></div><div class="summary"><div class="sum" style="border-color:${t.accent}55"><label>Gelir</label><strong style="color:${t.income}">₺25.000</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Gider</label><strong style="color:${t.expense}">₺12.550</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Kalan</label><strong style="color:${t.remain}">₺12.450</strong></div></div><div style="height:10px;border-radius:99px;background:linear-gradient(90deg,${t.income} 0 33%,${t.expense} 33% 66%,${t.remain} 66% 100%);margin-top:10px"></div></div><div class="card" style="margin-top:12px"><div class="setting" data-action="pickBg"><span>◼</span><span>Arka Plan Rengi</span><b style="color:${t.bg};text-shadow:0 0 0 #777">■</b></div><div class="setting" data-action="pickAccent"><span>✦</span><span>Detay Rengi</span><b style="color:${t.accent}">■</b></div><div class="setting" data-action="pickIncome"><span>●</span><span>Grafik · Gelir</span><b style="color:${t.income}">■</b></div><div class="setting" data-action="pickExpense"><span>●</span><span>Grafik · Gider</span><b style="color:${t.expense}">■</b></div><div class="setting" data-action="pickRemain"><span>●</span><span>Grafik · Kalan</span><b style="color:${t.remain}">■</b></div></div><div class="section"><b>Hazır Temalar</b><span></span></div><div class="themeGrid">${[['Z Tasarım','#05080d','#47bfff'],['Lacivert','#06111f','#4da3ff'],['Koyu Yeşil','#05130d','#41d98c'],['Bordo','#1a080b','#e4a0aa']].map(a=>`<div class="themeCard" data-action="preset" data-bg="${a[1]}" data-accent="${a[2]}"><div class="swatch" style="background:${a[1]};border:1px solid ${a[2]}"></div><b>${a[0]}</b></div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><button class="btn" data-action="resetTheme">Varsayılana Dön</button><button class="btn gold" data-action="saveTheme">Kaydet</button></div><button class="btn" style="width:100%;margin-top:8px" data-action="cancelTheme">İptal</button>`
}
function upcomingPayments(){
 const today=new Date(iso()+'T12:00:00'),out=[];const add=(kind,id,title,amount,date,paid=false)=>{if(!date)return;const d=new Date(date+'T12:00:00');if(Number.isNaN(d.getTime()))return;const days=Math.ceil((d-today)/86400000);out.push({kind,id,title,amount:+amount||0,date,days,paid})};
 state.expenses.filter(x=>x.recurring).forEach(x=>{let due=x.dueDate||x.date;if(!due)return;const b=new Date(due+'T12:00:00'),t=today;let d=new Date(t.getFullYear(),t.getMonth(),Math.min(b.getDate(),new Date(t.getFullYear(),t.getMonth()+1,0).getDate()));if(d<new Date(t.getFullYear(),t.getMonth(),1))d.setMonth(d.getMonth()+1);const ds=iso(d),month=ds.slice(0,7);add('fixed',x.id,x.title,x.amount,ds,fixedPaidForMonth(x,month))});
 state.cards.forEach(c=>{const pi=cardPaymentInfo(c,today);add('card',c.id,c.bank+' '+c.name,c.balance,iso(pi.dueDate),(+c.balance||0)<=0)});
 state.flexAccounts.forEach(f=>{let due=rollMonthlyDate(f.dueDate,today);if(due<today)due=rollMonthlyDate(f.dueDate,new Date(today.getFullYear(),today.getMonth()+1,1));add('flex',f.id,f.bank+' '+(f.name||'ESNEK HESAP'),f.balance,iso(due),(+f.balance||0)<=0)});
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function paymentBucket(x){if(x.paid)return'ÖDENDİ';if(x.days<0)return'GECİKMİŞ';if(x.days===0)return'BUGÜN';if(x.days===1)return'YARIN';if(x.days<=7)return'BU HAFTA';return'YAKLAŞIYOR'}
function alerts(){const all=upcomingPayments(),groups=['GECİKMİŞ','BUGÜN','YARIN','BU HAFTA','YAKLAŞIYOR','ÖDENDİ'];return `<div class="section"><b>YAKLAŞAN ÖDEMELER</b><span>${all.filter(x=>!x.paid).length} BEKLEYEN</span></div>${groups.map(g=>{const a=all.filter(x=>paymentBucket(x)===g);if(!a.length)return'';return `<div class="paymentGroup"><div class="section"><b>${g}</b><span>${a.length}</span></div>${a.map(x=>`<div class="item paymentDue ${x.paid?'isPaid':''}"><div class="ico premiumIco">${x.kind==='fixed'?'🧾':x.kind==='card'?'💳':'🏦'}</div><div><b>${esc(x.title)}</b><small>${prettyDate(x.date)} · ${x.kind==='fixed'?'SABİT GİDER':x.kind==='card'?'KREDİ KARTI':'ESNEK HESAP'}</small></div><div class="reportMoveRight"><b>${money(x.amount)}</b><small>${g}</small></div></div>`).join('')}</div>`}).join('')||'<div class="notice">YAKLAŞAN ÖDEME YOK.</div>'}`}

function about(){return`<div class="profile"><div class="aboutV5Logo">${haneFullLogo("aboutV5")}</div><p>SÜRÜM 19.4.8 · V113 VIEW FUNCTIONS RESTORE</p><p>PREMİUM EV BÜTÇEN.<br>VERİLERİN CİHAZINDA ŞİFRELİ SAKLANIR.</p></div>`}
function memberExpenseRows(memberId,m=state.selectedMonth){
  return actualExpenseEntriesForMonth(m).filter(x=>(x.memberId||'')===(memberId||''));
}
function memberName(memberId){if(!memberId)return'HANE GENELİ / ATANMAMIŞ';const m=state.members.find(x=>x.id===memberId);return m?m.name:'ATANMAMIŞ'}
function memberDetailBody(memberId,m=state.selectedMonth){
  const rows=memberExpenseRows(memberId,m).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),total=rows.reduce((a,x)=>a+(+x.amount||0),0);
  return `<div class="memberDetailSummary"><small>${monthLabel(m)} TOPLAM HARCAMA</small><b>${money(total)}</b><span>${rows.length} hareket</span></div>${rows.length?`<div class="list memberMovementList">${rows.map(x=>{const card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;const pay=x.source==='card'?`KREDİ KARTI${card?' · '+esc(card.name):''}`:'NAKİT';const fixed=x.recurring&&x.paymentId,action=fixed?'editStatementFixedPayment':'editExpense',del=fixed?'delFixedPaymentExact':'delExpense',rid=fixed?x.paymentId:x.id;return `<div class="item memberMove"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div><b>${esc(x.title||x.category||'GİDER')}</b><small>${x.date||''} · ${esc(x.category||'Diğer')} · ${pay}</small></div><div class="right"><b>${money(x.amount)}</b><div class="memberRowActions"><button data-action="${action}" data-direct-edit="1" data-id="${rid}">DÜZENLE</button><button data-action="${del}" data-id="${rid}">SİL</button></div></div></div>`}).join('')}</div>`:'<div class="notice">Bu ay bu kişiye atanmış gider yok.</div>'}`;
}

function members(){
  const m=state.selectedMonth,assigned=new Set(state.expenses.map(x=>x.memberId).filter(Boolean)),virtual=[...state.members];
  if(state.expenses.some(x=>!x.memberId))virtual.push({id:'',name:'HANE GENELİ / ATANMAMIŞ',icon:'⌂',virtual:true});
  const cards=virtual.map(mem=>{const rows=memberExpenseRows(mem.id,m),total=rows.reduce((a,x)=>a+(+x.amount||0),0),cash=rows.filter(x=>x.source!=='card').reduce((a,x)=>a+(+x.amount||0),0),card=rows.filter(x=>x.source==='card').reduce((a,x)=>a+(+x.amount||0),0);return `<button class="memberSummaryCard" data-action="memberDetail" data-id="${mem.id}"><span class="memberAvatar">${esc(mem.icon||'👤')}</span><span class="memberSummaryText"><b>${esc(mem.name)}</b><small>${rows.length} hareket · Nakit ${money(cash)} · Kart ${money(card)}</small></span><strong>${money(total)}</strong><em>›</em></button>`}).join('');
  return `${monthNavigator()}<div class="section"><b>HANE ÜYELERİ</b><button class="miniAddBtn" data-action="addMember">+ ÜYE EKLE</button></div><div class="notice memberInfoNotice">Her kişinin toplamı seçili aya göre hesaplanır. İsme dokununca o kişinin hareketlerini düzenleyebilir veya silebilirsin.</div><div class="memberSummaryList">${cards||'<div class="notice">Henüz hane üyesi yok.</div>'}</div>`
}
function memberForm(m={}){return `<form class="form" id="memberForm">${input('name','Üye Adı',m.name||'')}${input('icon','İkon',m.icon||'👤')}<button class="btn gold">KAYDET</button>${m.id&&m.id!=='me'?`<button type="button" class="btn" data-action="delMember" data-id="${m.id}">SİL</button>`:''}</form>`}
const HOME_LABELS={summary:'Gelir / Gider / Kalan',quick:'Hızlı İşlemler',quote:'Bugünün Sözü',chart:'Ana Grafik',month:'Bu Ay',recommended:'Önerilen Kart',monthly:'Aylık Finans Özeti'};
function homeEdit(){return `<div class="notice">Bölümleri yukarı/aşağı taşıyabilir veya gizleyebilirsin.</div><div class="list homeEditList">${state.homeLayout.map((k,i)=>`<div class="item"><div><b>${HOME_LABELS[k]||k}</b><small>${state.homeHidden.includes(k)?'GİZLİ':'GÖRÜNÜR'}</small></div><div class="homeEditActions"><button data-action="homeMove" data-key="${k}" data-dir="-1">↑</button><button data-action="homeMove" data-key="${k}" data-dir="1">↓</button><button data-action="homeToggle" data-key="${k}">${state.homeHidden.includes(k)?'GÖSTER':'GİZLE'}</button></div></div>`).join('')}</div>`}
function view(){return({home,transactions,fixed,cards,calendar,reports,tara,profile,backup,settings,categories,theme,alerts,about,monthSpent,monthPaid,members,homeEdit,notes}[current]||home)()}
function input(n,l,v='',type='text',extra=''){const attrs=type==='text'?'autocapitalize="characters" autocorrect="on" autocomplete="on" spellcheck="true"':'';return`<div class="field"><label>${l}</label><input name="${n}" type="${type}" value="${esc(v)}" ${attrs} ${extra}></div>`}
function select(n,l,opts,v=''){return`<div class="field"><label>${l}</label><select name="${n}">${opts.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}
function memberSelect(v=''){return `<div class="field"><label>Hane Üyesi <small style="opacity:.65">(isteğe bağlı)</small></label><select name="memberId"><option value="" ${!v?'selected':''}>HANE GENELİ / ATANMAMIŞ</option>${state.members.map(m=>`<option value="${m.id}" ${v===m.id?'selected':''}>${esc(m.icon)} ${esc(m.name)}</option>`).join('')}</select></div>`}
function incomeForm(x={}){return`<form class="form" id="incomeForm">${input('title','Gelir Adı',x.title||'')}${input('amount','Tutar',x.amount||0,'number')}${input('date','Tarih',x.date||iso(),'date')}${memberSelect(x.memberId||'me')}<div class="field"><label>Sabit Gelir</label><select name="recurring"><option value="false" ${!x.recurring?'selected':''}>Hayır</option><option value="true" ${x.recurring?'selected':''}>Evet · Her Ay</option></select></div><div class="notice">SABİT GELİR seçilirse başlangıç tarihindeki gün korunarak sonraki aylara otomatik yansır. Örn. maaş her ay aynı gün gelir hesabına katılır.</div><button class="btn gold" type="submit">Kaydet</button>${x.id?`<button type="button" class="btn" data-action="delIncome" data-id="${x.id}">Sil</button>`:''}</form>`}
function expenseForm(x={}){
  const isRefund=isCardRefund(x),isFixed=!!x.recurring&&!isRefund,isCustomNormal=!isFixed&&x.category&&!NORMAL_C.includes(x.category),currentCat=isCustomNormal?'Diğer':(x.category||(isFixed?'Kira':'Market')),normalCats=NORMAL_C;
  const source=x.source==='card'?'card':'cash',cards=state.cards||[];
  const catTiles=(cats,name)=>`<div class="premiumCatGrid" data-select-name="${name}">${cats.map(c=>`<button type="button" class="premiumCatBtn ${c===currentCat?'active':''}" data-cat="${esc(c)}">${catPremiumIcon(c)}<b>${esc(c)}</b></button>`).join('')}</div><select class="hiddenCatSelect" name="${name}">${cats.map(c=>`<option ${c===currentCat?'selected':''}>${esc(c)}</option>`).join('')}</select>`;
  return`<form class="form" id="expenseForm"><div class="field"><label>Gider Türü</label><select name="expenseType" id="expenseType"><option value="normal" ${!isFixed?'selected':''}>Normal Gider</option><option value="fixed" ${isFixed?'selected':''}>Sabit Gider</option></select></div>${input('title','Açıklama',x.title||'')}${input('amount',isRefund?'İade Tutarı':(isFixed?'Fatura Tutarı':'Tutar'),isRefund?Math.abs(+(x.actualAmount??x.amount)||0):(x.billAmount??x.amount??0),'number','step="0.01" min="0"')}${isRefund?'<input type="hidden" name="importedRefund" value="true">':''}<div class="field" id="normalCategoryWrap" style="${isFixed?'display:none':''}"><label>Kategori</label>${catTiles(normalCats,'normalCategory')}<div id="customCategoryWrap" style="${currentCat==='Diğer'?'':'display:none'};margin-top:10px">${input('customCategory','Diğer Kategori Adı',isCustomNormal?x.category:'')}</div></div><div class="field" id="fixedCategoryWrap" style="${isFixed?'':'display:none'}"><label>Sabit Gider Kategorisi</label>${catTiles(FIXED_C,'fixedCategory')}</div><div class="field"><label>Ödeme Kaynağı</label><div class="paySourceSeg"><button type="button" data-pay-source="cash" class="${source==='cash'?'active':''}">NAKİT</button><button type="button" data-pay-source="card" class="${source==='card'?'active':''}">KART</button></div><input type="hidden" name="source" id="expenseSource" value="${source}"></div><div class="field" id="expenseCardWrap" style="${source==='card'?'':'display:none'}"><label>Hangi Kart?</label><select name="cardId" id="expenseCardId"><option value="">Kart seç</option>${cards.map(c=>`<option value="${c.id}" ${c.id===x.cardId?'selected':''}>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</option>`).join('')}</select>${!cards.length?'<small class="fieldHint">Önce KARTLAR bölümünden bir kart eklemelisin.</small>':''}</div><div id="normalDateWrap" style="${isFixed?'display:none':''}">${input('date','Harcama Tarihi',x.date||iso(),'date')}</div><div id="fixedDueWrap" style="${isFixed?'':'display:none'}">${input('dueDate','Son Ödeme Tarihi',x.dueDate||x.date||iso(),'date')}</div>${memberSelect(x.memberId||'')}<div class="notice" id="expenseHelp">${isFixed?'AYNI KATEGORİDEN BİRDEN FAZLA SABİT GİDER EKLEYEBİLİRSİN.':'NORMAL GİDERDE HARCAMA TARİHİ VE ÖDEME KAYNAĞI KAYDEDİLİR.'}</div><button type="button" class="btn" id="expenseReceiptBtn" data-action="attachReceipt">📷 FİŞ / FOTOĞRAF</button><small id="expenseReceiptStatus" class="fieldHint" style="display:${(modal?.attachment||x.attachment)?'block':'none'}">✓ FİŞ / FOTOĞRAF HAZIR</small><button class="btn gold" type="submit">KAYDET</button>${x.id?`<button type="button" class="btn" data-action="delExpense" data-id="${x.id}">SİL</button>`:''}</form>`
}
function cardForm(c={}){
  const info=c.id?cardPaymentInfo(c,new Date()):null;
  const statementDate=c.statementDate||(info?iso(info.statementDate):iso());
  const dueDate=c.dueDate||(info?iso(info.dueDate):iso(new Date(Date.now()+10*86400000)));
  return`<form class="form" id="cardForm">
    ${input('bank','Banka',c.bank||'')}
    ${input('name','Kart Adı',c.name||'')}
    ${input('last4','Son 4 Hane',c.last4||'','text','maxlength="4" inputmode="numeric"')}
    <div class="row2">${input('limit','Kart Limiti',c.limit||0,'number')}${input('balance','Güncel Borç',c.balance||0,'number')}</div>
    <div class="row2">${input('sharedLimitGroup','Ortak Limit Grubu',c.sharedLimitGroup||'','text','placeholder="Örn: ZİRAAT AİLE"')}${input('sharedLimit','Ortak Limit Toplamı',c.sharedLimit||0,'number','step="0.01" min="0"')}</div>
    <div class="notice">AYNI LİMİTİ PAYLAŞAN KARTLARA AYNI "ORTAK LİMİT GRUBU" ADINI VE AYNI TOPLAM LİMİTİ YAZ. BOŞ BIRAKIRSAN KART BAĞIMSIZ ÇALIŞIR.</div>
    <div class="row2">${input('statementDate','Hesap Kesim Tarihi',statementDate,'date')}${input('dueDate','Son Ödeme Tarihi',dueDate,'date')}</div>
    ${select('style','Kart Stili',['blackgold','titanium','blue','burgundy','green','purple','silver'],c.style||'blackgold')}
    <div class="notice">TARİHLERİ TAKVİMDEN SEÇ. HANE SONRAKİ AYLARDA AYNI GÜNLERİ OTOMATİK İLERİ TAŞIR.</div>
    <button class="btn gold" type="submit">KAYDET</button>
    ${c.id?`<button type="button" class="btn" data-action="delCard" data-id="${c.id}">KARTI SİL</button>`:''}
  </form>`
}
function cardSpendForm(c){return`<form class="form" id="cardSpendForm">${input('amount','Toplam Tutar',0,'number','step="0.01" min="0"')}${input('title','Açıklama','')}${select('category','Kategori',C,'Market')}${input('date','Tarih',iso(),'date')}${memberSelect('')}<div class="field"><label>ÖDEME ŞEKLİ</label><input type="hidden" name="paymentType" id="cardPaymentType" value="Tek Çekim"><div class="cardPayTypeSeg"><button type="button" class="active" data-action="cardPayType" data-value="Tek Çekim">TEK ÇEKİM</button><button type="button" data-action="cardPayType" data-value="Taksitli">TAKSİTLİ</button></div></div><div class="field installmentField" id="installmentField"><label>TAKSİT SAYISI</label><input name="installmentCount" type="number" min="2" max="36" value="2"><small>2–36 taksit seçebilirsin. Taksitli seçildiğinde toplam tutar aylara otomatik dağıtılır.</small></div><button type="button" class="btn" data-action="receipt">📷 Fiş / Kamera</button><button class="btn gold" type="submit">HARCAMAYI KAYDET</button></form>`}
function cardPayForm(c){return`<form class="form" id="cardPayForm">${input('amount','Ödeme Tutarı',Math.max(0,+c.balance||0),'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',iso(),'date')}<div class="notice">Kart ödemesi gider olarak ikinci kez sayılmaz. Sadece “Bu Ay Ödenen” tutarına ve hareketlere eklenir.</div><button class="btn gold" type="submit">Ödemeyi Kaydet</button></form>`}
function accountForm(a={}){return `<form class="form" id="accountForm">${input('bank','Banka Adı',a.bank||'')}${input('name','Hesap Adı',a.name||'VADESİZ HESAP')}${input('last4','IBAN Son 4 Hane',a.last4||'','text','maxlength="4" inputmode="numeric"')}${input('balance','Bakiye',a.balance||0,'number','step="0.01"')}<button class="btn gold" type="submit">KAYDET</button>${a.id?`<button type="button" class="btn" data-action="delAccount" data-id="${a.id}">SİL</button>`:''}</form>`}
function flexForm(a={}){return `<form class="form" id="flexForm">${input('bank','Banka Adı',a.bank||'')}${input('name','Esnek Hesap Adı',a.name||'ESNEK HESAP')}<div class="row2">${input('limit','Limit',a.limit||0,'number')}${input('balance','Kullanılan',a.balance||0,'number')}</div><div class="row2">${input('statementDate','Hesap Kesim Tarihi',a.statementDate||iso(),'date')}${input('dueDate','Son Ödeme Tarihi',a.dueDate||iso(new Date(Date.now()+10*86400000)),'date')}</div>${select('style','Kart Stili',['blackgold','titanium','blue','burgundy','green','purple','silver'],a.style||'blackgold')}<button class="btn gold" type="submit">KAYDET</button>${a.id?`<button type="button" class="btn" data-action="delFlex" data-id="${a.id}">SİL</button>`:''}</form>`}
function simpleAmountForm(kind,obj){return `<form class="form" id="simpleAmountForm" data-kind="${kind}" data-id="${obj.id}">${input('amount','Tutar',0,'number','step="0.01" min="0"')}${input('title','Açıklama','')}${input('date','Tarih',iso(),'date')}<button class="btn gold" type="submit">KAYDET</button></form>`}
function cardPaymentEditForm(x){return `<form class="form" id="cardPaymentEditForm">${input('amount','Ödeme Tutarı',x.amount,'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',x.date,'date')}<button class="btn gold" type="submit">KAYDET</button><button type="button" class="btn" data-action="delCardPayment" data-id="${x.id}">SİL</button></form>`}
function profileForm(){return`<form class="form" id="profileForm"><button type="button" class="btn" data-action="pickProfile">PROFİL RESMİNİ DEĞİŞTİR</button>${input('name','İsim',state.profile.name)}<div class="field"><label>Motto</label><textarea name="motto" autocapitalize="characters" autocorrect="on" autocomplete="on" spellcheck="true">${esc(state.profile.motto||'')}</textarea></div>${input('lockMinutes','Otomatik Kilit (dakika)',state.settings.lockMinutes,'number')}<button class="btn gold" type="submit">Kaydet</button></form>`}
function colorForm(k,label){
  if(!themeDraft) themeDraft={...(state.theme||{})};
  return`<div class="field"><label>${label}</label><input id="nativeColor" type="color" value="${themeDraft[k]}" style="height:54px"></div><div class="notice">Bu seçim yalnızca önizlemeyi değiştirir. Tema, Tema Stüdyosu ekranındaki Kaydet düğmesine basınca uygulanır.</div><button class="btn gold" style="width:100%;margin-top:12px" data-action="saveColor" data-kind="${k}">Önizlemeye Uygula</button>`
}
function showToast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}

async function reorderFixed(sourceId,targetId){if(!sourceId||!targetId||sourceId===targetId)return;const fixed=state.expenses.filter(x=>x.recurring).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)),from=fixed.findIndex(x=>x.id===sourceId),to=fixed.findIndex(x=>x.id===targetId);if(from<0||to<0)return;const [moved]=fixed.splice(from,1);fixed.splice(to,0,moved);fixed.forEach((x,i)=>x.sortOrder=i);await save();render();showToast('SIRALAMA KAYDEDİLDİ')}
function bindFixedSorting(){let dragId=null,touchId=null,touchTarget=null;$$('.fixedItem').forEach(item=>{item.addEventListener('dragstart',e=>{dragId=item.dataset.fixedId;e.dataTransfer?.setData('text/plain',dragId);item.classList.add('dragging')});item.addEventListener('dragend',()=>item.classList.remove('dragging'));item.addEventListener('dragover',e=>e.preventDefault());item.addEventListener('drop',e=>{e.preventDefault();reorderFixed(dragId||e.dataTransfer?.getData('text/plain'),item.dataset.fixedId)});const h=item.querySelector('.dragHandle');if(!h)return;h.addEventListener('touchstart',e=>{touchId=item.dataset.fixedId;touchTarget=item;e.stopPropagation()},{passive:true});h.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(!t)return;const over=document.elementFromPoint(t.clientX,t.clientY)?.closest?.('.fixedItem');$$('.fixedItem').forEach(x=>x.classList.remove('dragOver'));if(over){over.classList.add('dragOver');touchTarget=over}},{passive:true});h.addEventListener('touchend',()=>{const targetId=touchTarget?.dataset?.fixedId;$$('.fixedItem').forEach(x=>x.classList.remove('dragOver'));if(targetId)reorderFixed(touchId,targetId);touchId=null;touchTarget=null},{passive:true})})}
function rollMonthlyDate(dateStr,ref=new Date()){
  if(!dateStr)return null;
  let d=new Date(dateStr+'T12:00:00');
  if(Number.isNaN(d.getTime()))return null;
  const today=new Date(ref.getFullYear(),ref.getMonth(),ref.getDate());
  while(d<today){
    const day=d.getDate();
    const next=new Date(d.getFullYear(),d.getMonth()+1,1);
    const last=new Date(next.getFullYear(),next.getMonth()+1,0).getDate();
    next.setDate(Math.min(day,last));
    d=next;
  }
  return d;
}
async function saveIncome(d,i){const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<0)throw new Error('Tutar geçersiz');const isNew=!i,x={id:i||id(),title:upper((d.title||'GELİR').trim()||'GELİR'),amount,date:d.date||iso(),memberId:d.memberId||'me',recurring:d.recurring==='true'};if(i){const n=state.incomes.findIndex(z=>z.id===i);state.incomes[n]={...state.incomes[n],...x}}else state.incomes.push(x);if(isNew&&String(x.date||'').slice(0,7)!==ym(new Date())){state.selectedMonth=ym(new Date());calendarMonth=state.selectedMonth;calendarDay=''}await save();modal=null;render()}
async function saveExpense(d,i){
  const old=i?state.expenses.find(z=>z.id===i):null,refund=d.importedRefund==='true'||isCardRefund(old),rawAmount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(rawAmount)||rawAmount<0)throw new Error('Tutar geçersiz');
  const amount=refund?-Math.abs(rawAmount):rawAmount,fixed=d.expenseType==='fixed'&&!refund,source=d.source==='card'?'card':'cash';
  if(source==='card'&&!d.cardId)throw new Error('Lütfen hangi kartla ödendiğini seçin.');
  const x={id:i||id(),title:upper((d.title||(refund?'KART İADESİ':fixed?'SABİT GİDER':'GİDER')).trim()||(refund?'KART İADESİ':fixed?'SABİT GİDER':'GİDER')),amount,actualAmount:fixed?null:amount,billAmount:fixed?amount:null,category:fixed?(d.fixedCategory||'Kira'):((d.normalCategory==='Diğer'&&(d.customCategory||'').trim())?upper(d.customCategory.trim()):(d.normalCategory||'Diğer')),date:fixed?(d.dueDate||iso()):(d.date||iso()),dueDate:fixed?(d.dueDate||iso()):null,recurring:fixed,paid:fixed?(old?.paid||false):true,sortOrder:old?.sortOrder??state.expenses.length,paidMonths:[...(old?.paidMonths||[])],source,memberId:(d.memberId??old?.memberId??''),cardId:source==='card'?d.cardId:null,attachment:modal?.attachment||old?.attachment||'',cardTxId:fixed?null:(old?.cardTxId||id()),importedRefund:refund||undefined};
  const isNew=!i;
  if(i){const n=state.expenses.findIndex(z=>z.id===i);state.expenses[n]={...state.expenses[n],...x};(state.fixedPayments||[]).filter(p=>p.expenseId===i).forEach(p=>{p.title=x.title;p.category=x.category||'Diğer'})}else state.expenses.push(x);
  if(isNew&&String(x.date||'').slice(0,7)!==ym(new Date())){state.selectedMonth=ym(new Date());calendarMonth=state.selectedMonth;calendarDay=''}
  await save();modal=null;render()
}
async function act(a,el){if(a&&a.startsWith('edit')){const c=document.querySelector('.content');if(c)returnScrollTop=c.scrollTop;}if(a==='expenseView'){expenseView=el.dataset.view==='fixed'?'fixed':'normal';render();return;}if(a==='expenseGroupDetail'){open((el.dataset.date||'')+' · '+(el.dataset.cat||'GİDER'),expenseGroupDetailBody(el.dataset.date||'',el.dataset.cat||'Diğer'));return;}if(a==='toggleExpenseSection'){if(el.dataset.section==='normal')normalExpensesOpen=!normalExpensesOpen;else fixedExpensesOpen=!fixedExpensesOpen;render();return;}if(a==='editStatementFixedPayment'){const p=(state.fixedPayments||[]).find(z=>z.id===el.dataset.id),x=p?state.expenses.find(z=>z.id===p.expenseId):null;if(x&&p){open('ÖDEMEYİ DÜZENLE',`<form class="form" id="fixedPaymentForm"><div class="notice"><b>FATURA TUTARI: ${money(fixedBillAmount(x))}</b><br>GERÇEK ÖDENEN TUTAR gider hesabında esas alınır.</div>${input('amount','Gerçek Ödenen Tutar',p.amount||fixedBillAmount(x),'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',p.date||iso(),'date')}${select('category','Kategori',C,p.category||x.category||'Diğer')}<div class="field"><label>Ödeme Şekli</label><select name="source"><option value="cash" ${(p.source||'cash')==='cash'?'selected':''}>NAKİT</option><option value="card" ${p.source==='card'?'selected':''}>KART</option></select></div><div class="field"><label>Kullanılan Kart</label><select name="cardId"><option value="">Kart seç</option>${state.cards.map(c=>`<option value="${c.id}" ${p.cardId===c.id?'selected':''}>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</option>`).join('')}</select></div><button class="btn gold" type="submit">KAYDET</button><button class="btn" type="button" data-action="toggleFixedPaid" data-id="${x.id}">ÖDEMEYİ GERİ AL</button></form>`,{id:x.id,paymentId:p.id});return}}else if(a==='paymentSourceDetail'){open(el.dataset.source==='card'?'KREDİ KARTI HARCAMALARI':'NAKİT HARCAMALAR',paymentSourceDetailBody(el.dataset.source));return}else if(a==='cardStatement'){cardStatementMonth=state.selectedMonth;open('KART EKSTRESİ',cardStatementBody(el.dataset.id,cardStatementMonth),{cardId:el.dataset.id});return}else if(a==='cardStatementShift'){const [y,m]=(cardStatementMonth||state.selectedMonth).split('-').map(Number),d=new Date(y,m-1+(+(el.dataset.dir||0)),1);cardStatementMonth=ym(d);open('KART EKSTRESİ',cardStatementBody(el.dataset.id,cardStatementMonth),{cardId:el.dataset.id});return}else if(a==='statementImport'){const c=state.cards.find(x=>x.id===el.dataset.id);if(!c)return;statementImportCardId=c.id;statementImportRows=[];statementImportMeta={};const input=document.getElementById('statementImportInput');if(!input)return alert('Ekstre dosya seçici bulunamadı.');input.value='';input.click();return}else if(a==='statementImportConfirm'){await confirmStatementImport();return}if(a&&a.startsWith('edit')&&el?.dataset?.directEdit!=='1'){const d=haneRecordDetailSpec(a,el.dataset.id);if(d){open(d.title,d.body,{recordDetail:true});return}}if(a==='openTxFilters'){open('HAREKET FİLTRELERİ',txAdvancedFilterBody());return}else if(a==='roadFeeGroup'){open((el.dataset.date||'')+' · YOL ÜCRETLERİ',roadFeeGroupBody(el.dataset.date),{roadFeeDate:el.dataset.date})}else if(a==='clearTxSearch'){txSearch='';render()}else if(a==='runTxSearch'){txSearch=$('#txSearch')?.value||'';render()}else if(a==='togglePrivacy'){state.settings.privacy=!state.settings.privacy;await save();render()}else if(a==='clearTxFilters'){txDate=txCategory=txPay=txMin=txMax=txMember='';modal=null;render()}else if(a==='memberDetail'){open(memberName(el.dataset.id)+' · '+monthLabel(state.selectedMonth),memberDetailBody(el.dataset.id),{memberId:el.dataset.id})}else if(a==='addMember'){open('ÜYE EKLE',memberForm())}else if(a==='editMember'){const m=state.members.find(x=>x.id===el.dataset.id);if(m)open('ÜYEYİ DÜZENLE',memberForm(m),{id:m.id})}else if(a==='delMember'){state.members=state.members.filter(x=>x.id!==el.dataset.id);state.incomes.forEach(x=>{if(x.memberId===el.dataset.id)x.memberId=''});state.expenses.forEach(x=>{if(x.memberId===el.dataset.id)x.memberId=''});await save();modal=null;render()}else if(a==='homeMove'){const k=el.dataset.key,d=+el.dataset.dir,i=state.homeLayout.indexOf(k),j=Math.max(0,Math.min(state.homeLayout.length-1,i+d));if(i>=0&&i!==j){[state.homeLayout[i],state.homeLayout[j]]=[state.homeLayout[j],state.homeLayout[i]];await save();render()}}else if(a==='homeToggle'){const k=el.dataset.key;state.homeHidden=state.homeHidden.includes(k)?state.homeHidden.filter(x=>x!==k):[...state.homeHidden,k];await save();render()}else if(a==='receiptView'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x?.attachment)open('FİŞ / FATURA',`<div class="receiptViewer"><img src="${x.attachment}" alt="Fiş"><button class="btn" data-action="receiptReplace" data-id="${x.id}">DEĞİŞTİR</button><button class="btn" data-action="receiptDelete" data-id="${x.id}">SİL</button></div>`,{id:x.id})}else if(a==='receiptReplace'){modal={...modal,id:el.dataset.id};$('#receiptInput').click()}else if(a==='receiptDelete'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x){x.attachment='';await save();modal=null;render()}}else if(a==='openMenu')open('MENÜ',menuBody());else if(a==='menuGo'){goTo(el.dataset.go)}else if(a==='homeSummaryNav'){txFilter=el.dataset.kind==='income'?'income':el.dataset.kind==='expense'?'expense':'all';txSearch='';goTo('transactions')}else if(a==='summaryDetail'){open(el.dataset.kind==='income'?'GELİR DETAYI':el.dataset.kind==='expense'?'GİDER DETAYI':'KALAN DETAYI',summaryDetailBody(el.dataset.kind))}else if(a==='financeTab'){financeTab=el.dataset.finance;modal=null;render()}else if(a==='financePicker'){open('FİNANS',`<div class="financePickerList"><button data-action="financeTab" data-finance="cards">KARTLAR</button><button data-action="financeTab" data-finance="accounts">HESAPLAR</button><button data-action="financeTab" data-finance="debts">BORÇLAR</button></div>`);return}else if(a==='scrollCard'){document.querySelectorAll('.financeCarousel .luxuryCard')[+el.dataset.index]?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})}else if(a==='fixedCategoryDetail'){const cat=el.dataset.cat||'Diğer';open(cat+' · DETAY',fixedCategoryDetail(cat),{category:cat})}else if(a==='delCategoryRule'){const k=el.dataset.merchant||'';if(k&&state.statementCategoryRules){delete state.statementCategoryRules[k];await save();render();showToast('ÖĞRENME KURALI SİLİNDİ')}}else if(a==='clearCategoryRules'){if(confirm('Öğrenilen tüm işyeri-kategori kuralları temizlensin mi?')){state.statementCategoryRules={};await save();render();showToast('KATEGORİ ÖĞRENME TEMİZLENDİ')}}else if(a==='addCategory')open('KATEGORİ EKLE',categoryForm(),{oldCat:''});else if(a==='editCategory'){open('KATEGORİYİ DÜZENLE',categoryForm(el.dataset.cat),{oldCat:el.dataset.cat})}else if(a==='delCategory'){const c=el.dataset.cat;if(confirm(c+' kategorisi silinsin mi?')){state.customCategories=state.customCategories.filter(x=>x!==c);delete state.categoryMeta[c];state.expenses.forEach(x=>{if(x.category===c)x.category='Diğer'});normalizeV19(state);await save();modal=null;render()}}else if(a==='addAccount')open('HESAP EKLE',accountForm());else if(a==='editAccount'){const x=state.accounts.find(z=>z.id===el.dataset.id);open('HESABI DÜZENLE',accountForm(x),{id:x.id})}else if(a==='delAccount'){state.accounts=state.accounts.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='accountSpend'||a==='accountIncome'){const x=state.accounts.find(z=>z.id===el.dataset.id);open(a==='accountSpend'?'HARCAMA EKLE':'GELİR EKLE',simpleAmountForm(a,x))}else if(a==='addFlex')open('ESNEK HESAP EKLE',flexForm());else if(a==='editFlex'){const x=state.flexAccounts.find(z=>z.id===el.dataset.id);open('ESNEK HESABI DÜZENLE',flexForm(x),{id:x.id})}else if(a==='delFlex'){state.flexAccounts=state.flexAccounts.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='flexSpend'||a==='flexPay'){const x=state.flexAccounts.find(z=>z.id===el.dataset.id);open(a==='flexSpend'?'HARCAMA EKLE':'ÖDEME YAPTIM',simpleAmountForm(a,x))}else if(a==='editFlexPayment'){const x=(state.flexTransactions||[]).find(z=>z.id===el.dataset.id);if(x)open('ESNEK HESAP ÖDEMESİNİ DÜZENLE',`<form class="form" id="flexPaymentEditForm">${input('amount','Tutar',x.amount,'number','step="0.01" min="0"')}${input('date','Tarih',x.date,'date')}${input('title','Açıklama',x.title||'')}<button class="btn gold">KAYDET</button><button type="button" class="btn" data-action="delFlexPayment" data-id="${x.id}">SİL</button></form>`,{id:x.id})}else if(a==='delFlexPayment'){const x=(state.flexTransactions||[]).find(z=>z.id===el.dataset.id);if(x){const f=state.flexAccounts.find(a=>a.id===x.flexId);if(f)f.balance=(+f.balance||0)+(+x.amount||0);state.flexTransactions=state.flexTransactions.filter(z=>z.id!==x.id);await save();modal=null;render();showToast('SİLİNDİ')}}else if(a==='delFixedPaymentExact'){const p=(state.fixedPayments||[]).find(z=>z.id===el.dataset.id);if(p){state.fixedPayments=state.fixedPayments.filter(z=>z.id!==p.id);const ex=state.expenses.find(z=>z.id===p.expenseId);if(ex){ex.paidMonths=(ex.paidMonths||[]).filter(m=>m!==p.month);if(String(ex.date||'').slice(0,7)===p.month)ex.paid=false}await save();modal=null;render();showToast('SİLİNDİ')}}else if(a==='editCardPayment'){const x=state.cardPayments.find(z=>z.id===el.dataset.id);if(x)open('ÖDEMEYİ DÜZENLE',cardPaymentEditForm(x),{id:x.id})}else if(a==='delCardPayment'){state.cardPayments=state.cardPayments.filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('SİLİNDİ')}else if(a==='back'){goBack()}else if(a==='txFilter'){txFilter=el.dataset.filter||'all';render()}else if(a==='goCards'){goTo('cards')}else if(a==='calendarTab'){calendarView=el.dataset.view==='day'?'day':'month';render()}else if(a==='calendarDayPrev'){const d=new Date(calendarDay+'T12:00:00');d.setDate(d.getDate()-1);calendarDay=iso(d);calendarMonth=calendarDay.slice(0,7);state.selectedMonth=calendarMonth;calendarView='day';save().then(()=>render())}else if(a==='calendarDayNext'){const d=new Date(calendarDay+'T12:00:00');d.setDate(d.getDate()+1);calendarDay=iso(d);calendarMonth=calendarDay.slice(0,7);state.selectedMonth=calendarMonth;calendarView='day';save().then(()=>render())}else if(a==='monthPrev'){state.selectedMonth=monthShiftValue(state.selectedMonth,-1);calendarMonth=state.selectedMonth;calendarDay='';await save();render()}else if(a==='monthNext'){state.selectedMonth=monthShiftValue(state.selectedMonth,1);calendarMonth=state.selectedMonth;calendarDay='';await save();render()}else if(a==='monthToday'){state.selectedMonth=ym(new Date());calendarMonth=state.selectedMonth;calendarDay='';await save();render()}else if(a==='calendarDay'){calendarDay=el.dataset.date;calendarMonth=calendarDay.slice(0,7);state.selectedMonth=calendarMonth;calendarView='day';render()}else if(a==='calendarPrev'){let [y,m]=calendarMonth.split('-').map(Number);m--;if(m<1){m=12;y--}calendarMonth=y+'-'+String(m).padStart(2,'0');state.selectedMonth=calendarMonth;calendarDay='';save().then(()=>render())}else if(a==='calendarNext'){let [y,m]=calendarMonth.split('-').map(Number);m++;if(m>12){m=1;y++}calendarMonth=y+'-'+String(m).padStart(2,'0');state.selectedMonth=calendarMonth;calendarDay='';save().then(()=>render())}else if(a==='taraRun'){recalculateFinanceCore();await save();render();showToast('TARA TAMAMLANDI')}else if(a==='reportPeriod'){reportPeriod=el.dataset.period||'month';render()}else if(a==='reportView'){reportView=el.dataset.view||'summary';render()}else if(a==='reportMonths'){reportMonths=+(el.dataset.months||6);render()}else if(a==='cardPayType'){const v=el.dataset.value||'Tek Çekim',inp=document.getElementById('cardPaymentType'),field=document.getElementById('installmentField');if(inp)inp.value=v;document.querySelectorAll('.cardPayTypeSeg button').forEach(b=>b.classList.toggle('active',b.dataset.value===v));if(field)field.classList.toggle('show',v==='Taksitli')}else if(a==='openTheme'){themeDraft={...(state.theme||{bg:'#05080d',accent:'#47bfff',income:'#2bd48e',expense:'#ff616d',remain:'#58c7ff'})};current='theme';modal=null;render()}else if(a==='quickCards'){financeTab='cards';goTo('cards')}else if(a==='addNote'){open('Not Ekle',noteForm())}else if(a==='editNote'){const n=(state.notes||[]).find(x=>x.id===el.dataset.id);if(n)open('Notu Düzenle',noteForm(n),{id:n.id})}else if(a==='delNote'){state.notes=(state.notes||[]).filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('NOT SİLİNDİ')}else if(a==='calendarAddMenu'){open('Kayıt Ekle',`<div class="calendarAddChoices"><button class="btn" data-action="addIncome">+ GELİR</button><button class="btn" data-action="addExpense">+ GİDER</button><button class="btn" data-action="addFixedExpense">+ SABİT GİDER</button></div>`)}else if(a==='addIncome')open('Gelir Ekle',incomeForm());else if(a==='editIncome'){const x=state.incomes.find(z=>z.id===el.dataset.id);open('Geliri Düzenle',incomeForm(x),{id:x.id})}else if(a==='delIncome'){state.incomes=state.incomes.filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('SİLİNDİ')}else if(a==='addExpense')open('Gider Ekle',expenseForm());else if(a==='addFixedExpense')open('Gider Ekle',expenseForm({recurring:true,category:'Kira',dueDate:iso()}));else if(a==='editFixedExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='editExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='delExpense'){const ex=state.expenses.find(x=>x.id===el.dataset.id);if(ex?.cardTxId)state.cardTransactions=state.cardTransactions.filter(t=>t.id!==ex.cardTxId);state.fixedPayments=(state.fixedPayments||[]).filter(p=>p.expenseId!==el.dataset.id);state.flexTransactions=(state.flexTransactions||[]).filter(t=>t.expenseId!==el.dataset.id);state.expenses=state.expenses.filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('SİLİNDİ')}else if(a==='toggleFixedPaid'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x){x.paidMonths=Array.isArray(x.paidMonths)?x.paidMonths:[];state.fixedPayments=Array.isArray(state.fixedPayments)?state.fixedPayments:[];const m=state.selectedMonth,was=fixedPaidForMonth(x,m);if(was){x.paidMonths=x.paidMonths.filter(v=>v!==m);state.fixedPayments=state.fixedPayments.filter(p=>!(p.expenseId===x.id&&p.month===m));await save();render();showToast('ÖDEME GERİ ALINDI')}else{const expected=fixedBillAmount(x),payDate=dateForSelectedMonth(x.dueDate||x.date,m);open('SABİT GİDER ÖDEMESİ',`<form class="form" id="fixedPaymentConfirmForm"><div class="notice fixedPayCompare"><small>BEKLENEN / NORMAL TUTAR</small><b>${money(expected)}</b><div id="fixedPayDiff">Tutar aynıysa doğrudan onaylayabilirsin.</div></div>${input('amount','Gerçek Ödenen Tutar',expected,'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',payDate,'date')}<div class="field"><label>Ödeme Şekli</label><select name="source" id="fixedPaySourceNew"><option value="cash" ${x.source!=='card'?'selected':''}>NAKİT</option><option value="card" ${x.source==='card'?'selected':''}>KART</option></select></div><div class="field" id="fixedPayCardWrapNew"><label>Kullanılan Kart</label><select name="cardId"><option value="">Kart seç</option>${state.cards.map(c=>`<option value="${c.id}" ${x.cardId===c.id?'selected':''}>${esc(c.bank)} · ${esc(c.name)}</option>`).join('')}</select></div><button class="btn gold" type="submit">ÖDEMEYİ ONAYLA</button></form>`,{id:x.id,fixedMonth:m,expectedAmount:expected});return}}}else if(a==='editFixedPayment'){const x=state.expenses.find(z=>z.id===el.dataset.id),p=fixedPaymentFor(x);if(x&&p)open('ÖDEMEYİ DÜZENLE',`<form class="form" id="fixedPaymentForm"><div class="notice"><b>FATURA TUTARI: ${money(fixedBillAmount(x))}</b><br>GERÇEK ÖDENEN TUTAR gider hesabında esas alınır.</div>${input('amount','Gerçek Ödenen Tutar',p.amount||fixedBillAmount(x),'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',p.date||iso(),'date')}${select('category','Kategori',C,p.category||x.category||'Diğer')}<div class="field"><label>Ödeme Şekli</label><select name="source" id="fixedPaySource"><option value="cash" ${(p.source||'cash')==='cash'?'selected':''}>NAKİT</option><option value="card" ${p.source==='card'?'selected':''}>KART</option></select></div><div class="field"><label>Kullanılan Kart</label><select name="cardId"><option value="">Kart seç</option>${state.cards.map(c=>`<option value="${c.id}" ${p.cardId===c.id?'selected':''}>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</option>`).join('')}</select></div><button class="btn gold" type="submit">KAYDET</button><button class="btn" type="button" data-action="toggleFixedPaid" data-id="${x.id}">ÖDEMEYİ GERİ AL</button></form>`,{id:x.id,paymentId:p.id})}else if(a==='addCard')open('Kart Ekle',cardForm());else if(a==='editCard'){const c=state.cards.find(z=>z.id===el.dataset.id);open('Kartı Düzenle',cardForm(c),{id:c.id})}else if(a==='delCard'){const cid=el.dataset.id,linkedExpense=(state.expenses||[]).some(x=>x.cardId===cid),linkedFixed=(state.fixedPayments||[]).some(x=>x.cardId===cid),linkedPay=(state.cardPayments||[]).some(x=>x.cardId===cid);if(linkedExpense||linkedFixed||linkedPay){alert('Bu karta bağlı geçmiş harcama veya ödeme kayıtları var. Ekstre ve finans geçmişinin bozulmaması için kart silinemez.');return}state.cards=state.cards.filter(x=>x.id!==cid);await save();modal=null;render();showToast('KART SİLİNDİ')}else if(a==='cardSpend'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Kart Harcaması Ekle',cardSpendForm(c),{cardId:c.id})}else if(a==='cardPay'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Ödeme Yaptım',cardPayForm(c),{cardId:c.id})}else if(a==='cashDetails'){const F=cashFlow();open('Bu Ay · Harcanan / Ödenen',`<div class="cashDetail"><div class="notice"><b>Bu Ay Harcanan: ${money(F.spent)}</b><br>Bu ay yaptığın gerçek ev harcamalarıdır.</div><div class="notice" style="margin-top:8px"><b>Bu Ay Ödenen: ${money(F.paid)}</b><br>Kart ödemeleri ${money(F.cardPaid)} + nakit/ödenmiş giderler ${money(F.directPaid)}.</div><div class="notice" style="margin-top:8px">Kart ödemeleri yeniden gider sayılmaz. Önceki aylardan gelen kart borcu ödesen bile sadece “Bu Ay Ödenen” bölümünde görünür.</div></div>`)}else if(a==='editProfile')open('Profili Düzenle',profileForm());else if(a==='pickProfile')$('#profileInput').click();else if(a==='attachReceipt'){rememberModalForm();$('#receiptInput').click()}else if(a==='receipt'){rememberModalForm();$('#receiptInput').click()}else if(a==='close'){modal=null;render()}else if(a==='pickBg')open('Arka Plan Rengi',colorForm('bg','Arka Plan Rengi'));else if(a==='pickAccent')open('Detay Rengi',colorForm('accent','Detay Rengi'));else if(a==='pickIncome')open('Grafik Gelir',colorForm('income','Gelir Rengi'));else if(a==='pickExpense')open('Grafik Gider',colorForm('expense','Gider Rengi'));else if(a==='pickRemain')open('Grafik Kalan',colorForm('remain','Kalan Rengi'));else if(a==='saveColor'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft[el.dataset.kind]=$('#nativeColor').value;modal=null;render()}else if(a==='preset'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft.bg=el.dataset.bg;themeDraft.accent=el.dataset.accent;render()}else if(a==='resetTheme'){themeDraft={bg:'#05080d',accent:'#47bfff',income:'#2bd48e',expense:'#ff616d',remain:'#58c7ff'};render()}else if(a==='saveTheme'){state.theme={...themeDraft};await save();themeDraft=null;applyTheme();current='profile';render();alert('Tema kaydedildi.')}else if(a==='cancelTheme'){themeDraft=null;current='profile';render()}else if(a==='backupNow')backupNow();else if(a==='restoreNow')$('#restoreInput').click();else if(a==='changePin')changePin();else if(a==='toggleDarkMode'){state.settings.darkMode=!(state.settings.darkMode!==false);await save();applyTheme();render();showToast(state.settings.darkMode?'KARANLIK MOD AÇILDI':'KARANLIK MOD KAPATILDI')}else if(a==='clearAll'){if(confirm('Tüm HANE verileri silinsin mi?')){localStorage.removeItem(META);localStorage.removeItem(DATA);location.reload()}}}

function bind(){
  // Sabit giderlerde manuel sürükle-bırak kapatıldı; durum sıralaması otomatik.
  // Takvimde yatay kaydırma: sola sonraki ay, sağa önceki ay.
  const calPage=document.querySelector('.calendarPage');
  if(calPage){
    let sx=0,sy=0,tracking=false;
    calPage.addEventListener('touchstart',e=>{const t=e.touches&&e.touches[0];if(!t)return;sx=t.clientX;sy=t.clientY;tracking=true},{passive:true});
    calPage.addEventListener('touchend',e=>{
      if(!tracking)return;tracking=false;const t=e.changedTouches&&e.changedTouches[0];if(!t)return;
      const dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)<55||Math.abs(dx)<=Math.abs(dy)*1.25)return;
      let [y,m]=calendarMonth.split('-').map(Number);
      if(dx<0){m++;if(m>12){m=1;y++}}else{m--;if(m<1){m=12;y--}}
      calendarMonth=y+'-'+String(m).padStart(2,'0');state.selectedMonth=calendarMonth;calendarDay='';save().then(()=>render());
    },{passive:true});
  }
  const calDayPanel=document.querySelector('.calendarDayPanel');
  if(calDayPanel){
    let dsx=0,dsy=0,dtracking=false;
    calDayPanel.addEventListener('touchstart',e=>{const t=e.touches&&e.touches[0];if(!t)return;dsx=t.clientX;dsy=t.clientY;dtracking=true},{passive:true});
    calDayPanel.addEventListener('touchend',e=>{
      if(!dtracking)return;dtracking=false;const t=e.changedTouches&&e.changedTouches[0];if(!t)return;
      const dx=t.clientX-dsx,dy=t.clientY-dsy;if(Math.abs(dx)<45||Math.abs(dx)<=Math.abs(dy)*1.1)return;
      const d=new Date(calendarDay+'T12:00:00');
      d.setDate(d.getDate()+(dx<0?1:-1));
      calendarDay=iso(d);calendarMonth=calendarDay.slice(0,7);state.selectedMonth=calendarMonth;calendarView='day';save().then(()=>render());
    },{passive:true});
  }
  $$('[data-tab]').forEach(x=>x.onclick=()=>{const next=x.dataset.tab;if(next==='theme')themeDraft={...(state.theme||{})};else if(current==='theme')themeDraft=null;goTo(next)});
  $$('[data-action]').forEach(x=>x.onclick=e=>{if(x.closest('form')&&x.type==='submit')return;e.stopPropagation();act(x.dataset.action,x)});
  const liveTxSearch=$('#txSearch');
  if(liveTxSearch) liveTxSearch.oninput=e=>{txSearch=e.currentTarget.value;render();const n=$('#txSearch');if(n){n.focus();const L=n.value.length;try{n.setSelectionRange(L,L)}catch(_){}}};

  const txAdvancedFilterForm=$('#txAdvancedFilterForm');
  if(txAdvancedFilterForm) txAdvancedFilterForm.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());txDate=d.date||'';txCategory=d.category||'';txPay=d.pay||'';txMin=d.min||'';txMax=d.max||'';txMember=d.member||'';modal=null;render()};

  const noteFormEl=$('#noteForm');
  if(noteFormEl) noteFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),nid=modal?.id||id(),old=(state.notes||[]).find(x=>x.id===nid);const n={id:nid,title:upper((d.title||'NOT').trim()||'NOT'),body:String(d.body||'').trim(),date:d.date||iso(),createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};state.notes=Array.isArray(state.notes)?state.notes:[];const i=state.notes.findIndex(x=>x.id===nid);if(i>=0)state.notes[i]=n;else state.notes.push(n);await save();modal=null;render();showToast('NOT KAYDEDİLDİ')};

  const incomeFormEl=$('#incomeForm');
  if(incomeFormEl) incomeFormEl.onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const btn=form.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='Kaydediliyor…'}
    try{
      await saveIncome(Object.fromEntries(new FormData(form).entries()),modal?.id);
      showToast('Gelir kaydedildi');
    }catch(err){
      console.error('Gelir kaydetme hatası',err);
      alert('Gelir kaydedilemedi: '+(err?.message||err));
      if(btn){btn.disabled=false;btn.textContent='Kaydet'}
    }
  };

  $$('.premiumCatBtn').forEach(b=>b.onclick=()=>{const grid=b.closest('.premiumCatGrid'),name=grid?.dataset.selectName,sel=document.querySelector(`select[name="${name}"]`);if(sel)sel.value=b.dataset.cat;grid?.querySelectorAll('.premiumCatBtn').forEach(x=>x.classList.toggle('active',x===b));if(name==='normalCategory'){const w=$('#customCategoryWrap');if(w)w.style.display=b.dataset.cat==='Diğer'?'block':'none'}});
  $$('[data-pay-source]').forEach(b=>b.onclick=()=>{const v=b.dataset.paySource;$('#expenseSource').value=v;$$('[data-pay-source]').forEach(x=>x.classList.toggle('active',x===b));const w=$('#expenseCardWrap');if(w)w.style.display=v==='card'?'block':'none'});
  const expenseTypeEl=$('#expenseType');
  if(expenseTypeEl) expenseTypeEl.onchange=e=>{
    const fixed=e.currentTarget.value==='fixed';
    const normalCategoryWrap=$('#normalCategoryWrap');
    const fixedCategoryWrap=$('#fixedCategoryWrap');
    const normalDateWrap=$('#normalDateWrap');
    const fixedDueWrap=$('#fixedDueWrap');
    const help=$('#expenseHelp');
    if(normalCategoryWrap)normalCategoryWrap.style.display=fixed?'none':'block';
    if(fixedCategoryWrap)fixedCategoryWrap.style.display=fixed?'block':'none';
    if(normalDateWrap)normalDateWrap.style.display=fixed?'none':'block';
    if(fixedDueWrap)fixedDueWrap.style.display=fixed?'block':'none';
    if(help)help.textContent=fixed?'AYNI KATEGORİDEN BİRDEN FAZLA SABİT GİDER EKLEYEBİLİRSİN. ÖRN: CEP TELEFONU · HAT 1 / HAT 2 / HAT 3 / HAT 4.':'NORMAL GİDERDE SADECE HARCAMA TARİHİ KULLANILIR.';
  };
  const expenseFormEl=$('#expenseForm');
  if(expenseFormEl){
    expenseFormEl.addEventListener('input',rememberModalForm);
    expenseFormEl.addEventListener('change',rememberModalForm);
    syncExpenseFormUI();
  }
  const cardSpendFormDraftEl=$('#cardSpendForm');
  if(cardSpendFormDraftEl){cardSpendFormDraftEl.addEventListener('input',rememberModalForm);cardSpendFormDraftEl.addEventListener('change',rememberModalForm);}
  if(expenseFormEl) expenseFormEl.onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const btn=form.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='Kaydediliyor…'}
    try{
      const wasEdit=!!modal?.id;await saveExpense(Object.fromEntries(new FormData(form).entries()),modal?.id);
      showToast(wasEdit?'GÜNCELLENDİ':'KAYDEDİLDİ');
    }catch(err){
      console.error('Gider kaydetme hatası',err);
      alert('Gider kaydedilemedi: '+(err?.message||err));
      if(btn){btn.disabled=false;btn.textContent='Kaydet'}
    }
  };

  const cardFormEl=$('#cardForm');
  if(cardFormEl) cardFormEl.onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const btn=form.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='Kaydediliyor…'}
    try{
      await saveCard(Object.fromEntries(new FormData(form).entries()),modal?.id);
      showToast('Kart kaydedildi');
    }catch(err){
      console.error('Kart kaydetme hatası',err);
      alert('Kart kaydedilemedi: '+(err?.message||err));
      if(btn){btn.disabled=false;btn.textContent='Kaydet'}
    }
  };

  const profileFormEl=$('#profileForm');
  if(profileFormEl) profileFormEl.onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const d=Object.fromEntries(new FormData(form).entries());
    try{
      state.profile.name=d.name;
      state.profile.motto=d.motto;
      state.settings.lockMinutes=+d.lockMinutes||15;
      await save();
      modal=null;
      render();
      showToast('Profil kaydedildi');
    }catch(err){
      console.error('Profil kaydetme hatası',err);
      alert('Profil kaydedilemedi: '+(err?.message||err));
    }
  };
  const categoryFormEl=$('#categoryForm');if(categoryFormEl)categoryFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),old=modal?.oldCat||'',name=upper((d.name||'').trim());if(!name)return alert('Kategori adı gerekli');if(old&&old!==name){state.customCategories=state.customCategories.filter(x=>x!==old);if(!C.includes(name))state.customCategories.push(name);state.expenses.forEach(x=>{if(x.category===old)x.category=name});(state.fixedPayments||[]).forEach(x=>{if(x.category===old)x.category=name});(state.cardTransactions||[]).forEach(x=>{if(x.category===old)x.category=name});Object.keys(state.statementCategoryRules||{}).forEach(k=>{if(state.statementCategoryRules[k]===old)state.statementCategoryRules[k]=name});delete state.categoryMeta[old]}else if(!C.includes(name))state.customCategories.push(name);state.categoryMeta[name]={icon:d.icon||'✨',color:d.color||'#d8ad4f'};normalizeV19(state);await save();modal=null;render();showToast('KATEGORİ KAYDEDİLDİ')};
  const memberFormEl=$('#memberForm');if(memberFormEl)memberFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),name=upper((d.name||'').trim());if(!name)return alert('Üye adı gerekli');const x={id:modal?.id||id(),name,icon:(d.icon||'👤').trim()||'👤'};const n=state.members.findIndex(m=>m.id===x.id);n>=0?state.members[n]={...state.members[n],...x}:state.members.push(x);await save();modal=null;render();showToast(n>=0?'ÜYE GÜNCELLENDİ':'ÜYE EKLENDİ')};
  const accountFormEl=$('#accountForm');if(accountFormEl)accountFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x={id:modal?.id||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'HESAP'),last4:(d.last4||'0000').replace(/\D/g,'').slice(-4),balance:+d.balance||0};const n=state.accounts.findIndex(a=>a.id===x.id);n>=0?state.accounts[n]=x:state.accounts.push(x);await save();modal=null;render()};
  const flexFormEl=$('#flexForm');if(flexFormEl)flexFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x={id:modal?.id||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'ESNEK HESAP'),limit:+d.limit||0,balance:+d.balance||0,statementDate:d.statementDate,dueDate:d.dueDate,style:d.style||'blackgold'};const n=state.flexAccounts.findIndex(a=>a.id===x.id);n>=0?state.flexAccounts[n]=x:state.flexAccounts.push(x);await save();modal=null;render()};
  const reportCustomForm=$('#reportCustomForm');if(reportCustomForm)reportCustomForm.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(!d.start||!d.end){alert('Başlangıç ve bitiş tarihini seçin.');return}reportCustomStart=d.start;reportCustomEnd=d.end;reportPeriod='custom';render()};
  const simpleAmountFormEl=$('#simpleAmountForm');if(simpleAmountFormEl)simpleAmountFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),kind=e.currentTarget.dataset.kind,objId=e.currentTarget.dataset.id,amt=+d.amount||0;if(amt<=0)return alert('Tutar girin');if(kind.startsWith('account')){const a=state.accounts.find(x=>x.id===objId);if(kind==='accountSpend'){a.balance-=amt;state.expenses.push({id:id(),title:upper(d.title||a.bank+' HARCAMA'),amount:amt,category:'Diğer',date:d.date,recurring:false,paid:true,source:'cash'})}else{a.balance+=amt;state.incomes.push({id:id(),title:upper(d.title||a.bank+' GELİR'),amount:amt,date:d.date,recurring:false})}}else{const a=state.flexAccounts.find(x=>x.id===objId);state.flexTransactions=Array.isArray(state.flexTransactions)?state.flexTransactions:[];if(kind==='flexSpend'){a.balance+=amt;const eid=id(),txid=id(),title=upper(d.title||a.bank+' ESNEK HESAP HARCAMASI');state.expenses.push({id:eid,flexTxId:txid,flexId:a.id,title,amount:amt,category:'Diğer',date:d.date,recurring:false,paid:true,source:'flex'});state.flexTransactions.push({id:txid,expenseId:eid,flexId:a.id,kind:'spend',title,amount:amt,date:d.date})}else{a.balance=Math.max(0,a.balance-amt);state.flexTransactions.push({id:id(),flexId:a.id,kind:'pay',title:upper(d.title||a.bank+' ESNEK HESAP ÖDEMESİ'),amount:amt,date:d.date})}}await save();modal=null;render()};
  const flexPaymentEditFormEl=$('#flexPaymentEditForm');if(flexPaymentEditFormEl)flexPaymentEditFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=(state.flexTransactions||[]).find(z=>z.id===modal?.id);if(!x)return;const f=state.flexAccounts.find(a=>a.id===x.flexId),old=+x.amount||0,next=+d.amount||0;if(f)f.balance=Math.max(0,(+f.balance||0)+old-next);x.amount=next;x.date=d.date||x.date;x.title=upper(d.title||x.title);await save();modal=null;render();showToast('ESNEK HESAP ÖDEMESİ GÜNCELLENDİ')};
  const fixedPaymentConfirmFormEl=$('#fixedPaymentConfirmForm');if(fixedPaymentConfirmFormEl){const amountEl=fixedPaymentConfirmFormEl.querySelector('[name="amount"]'),diffEl=$('#fixedPayDiff'),sourceEl=$('#fixedPaySourceNew'),cardWrap=$('#fixedPayCardWrapNew'),expected=+(modal?.expectedAmount||0);const refreshDiff=()=>{const actual=Number(String(amountEl?.value||'0').replace(',','.')),diff=actual-expected;if(!diffEl||!Number.isFinite(actual))return;if(Math.abs(diff)<.01)diffEl.innerHTML='<b>NORMAL TUTAR</b> · Fark yok';else if(diff>0)diffEl.innerHTML='<b>EK MASRAF +'+money(diff)+'</b> · Gerçek gider '+money(actual);else diffEl.innerHTML='<b>'+money(Math.abs(diff))+' DAHA DÜŞÜK</b> · Gerçek gider '+money(actual)};const refreshSource=()=>{if(cardWrap)cardWrap.style.display=sourceEl?.value==='card'?'block':'none'};amountEl?.addEventListener('input',refreshDiff);sourceEl?.addEventListener('change',refreshSource);refreshDiff();refreshSource();fixedPaymentConfirmFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),ex=state.expenses.find(x=>x.id===modal?.id),m=modal?.fixedMonth||state.selectedMonth;if(!ex)return;const actual=Number(String(d.amount||'0').replace(',','.')),expected=fixedBillAmount(ex),source=d.source==='card'?'card':'cash';if(!Number.isFinite(actual)||actual<0)return alert('Geçerli tutar girin.');if(source==='card'&&!d.cardId)return alert('Kart seçin.');if(fixedPaymentFor(ex,m))return alert('Bu sabit gider bu ay zaten ödenmiş.');const payment={id:id(),expenseId:ex.id,month:m,amount:actual,actualAmount:actual,expectedAmount:expected,difference:actual-expected,date:d.date||dateForSelectedMonth(ex.dueDate||ex.date,m),title:ex.title,category:ex.category||'Diğer',source,cardId:source==='card'?d.cardId:null};state.fixedPayments.push(payment);ex.paidMonths=[...new Set([...(ex.paidMonths||[]),m])];await save();modal=null;render();showToast(Math.abs(payment.difference)<.01?'ÖDEME KAYDEDİLDİ':payment.difference>0?'ÖDEME KAYDEDİLDİ · EK MASRAF '+money(payment.difference):'ÖDEME KAYDEDİLDİ · '+money(Math.abs(payment.difference))+' DAHA DÜŞÜK')}};
const fixedPaymentFormEl=$('#fixedPaymentForm');if(fixedPaymentFormEl)fixedPaymentFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),p=(state.fixedPayments||[]).find(p=>p.id===modal?.paymentId),ex=state.expenses.find(x=>x.id===modal?.id);if(!p)return;const nextAmount=Number(String(d.amount||'0').replace(',','.')),nextSource=d.source==='card'?'card':'cash',nextDate=d.date||p.date||iso(),nextMonth=String(nextDate).slice(0,7),oldMonth=p.month||String(p.date||'').slice(0,7);if(!Number.isFinite(nextAmount)||nextAmount<0)return alert('Geçerli tutar girin.');if(nextSource==='card'&&!d.cardId)return alert('Kart seçin.');if((state.fixedPayments||[]).some(fp=>fp.id!==p.id&&fp.expenseId===p.expenseId&&fp.month===nextMonth))return alert('Bu sabit gider için '+nextMonth+' ayında zaten bir ödeme kaydı var.');p.amount=nextAmount;p.actualAmount=nextAmount;p.expectedAmount=ex?fixedBillAmount(ex):+(p.expectedAmount??p.amount??0);p.difference=nextAmount-p.expectedAmount;p.date=nextDate;p.month=nextMonth;p.category=d.category||ex?.category||'Diğer';p.source=nextSource;p.cardId=nextSource==='card'?d.cardId:null;if(ex){ex.category=p.category;ex.paidMonths=[...new Set([...(ex.paidMonths||[]).filter(m=>m!==oldMonth),nextMonth])];(state.fixedPayments||[]).filter(fp=>fp.expenseId===ex.id).forEach(fp=>fp.category=ex.category||'Diğer')}await save();modal=null;render();showToast('ÖDEME GÜNCELLENDİ')};
  const cardPaymentEditFormEl=$('#cardPaymentEditForm');if(cardPaymentEditFormEl)cardPaymentEditFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.cardPayments.find(x=>x.id===modal?.id);if(!x)return;x.amount=+d.amount||0;x.date=d.date;await save();modal=null;render()};
  const cardSpendFormEl=$('#cardSpendForm');
  if(cardSpendFormEl) cardSpendFormEl.onsubmit=async e=>{
    e.preventDefault();const form=e.currentTarget;
    try{await saveCardSpend(Object.fromEntries(new FormData(form).entries()),modal?.cardId);showToast('KAYDEDİLDİ')}
    catch(err){console.error(err);alert('Harcama kaydedilemedi: '+(err?.message||err))}
  };
  const cardPayFormEl=$('#cardPayForm');
  if(cardPayFormEl) cardPayFormEl.onsubmit=async e=>{
    e.preventDefault();const form=e.currentTarget;
    try{await saveCardPayment(Object.fromEntries(new FormData(form).entries()),modal?.cardId);showToast('Kart ödemesi kaydedildi')}
    catch(err){console.error(err);alert('Ödeme kaydedilemedi: '+(err?.message||err))}
  };
}

function haneRecordDetailSpec(action,rid){
  const find=(arr,id)=>Array.isArray(arr)?arr.find(x=>String(x.id)===String(id)):null;
  let x=null,type='',edit=action,del='',editId=rid;
  if(action==='editIncome'){x=find(state.incomes,rid);type='GELİR';del='delIncome'}
  else if(action==='editExpense'){x=find(state.expenses,rid);type=x?.recurring?'SABİT GİDER':'GİDER';del='delExpense'}
  else if(action==='editFixedExpense'){x=find(state.expenses,rid);type='SABİT GİDER';del='delExpense'}
  else if(action==='editFixedPayment'){
    const ex=find(state.expenses,rid),pay=ex?fixedPaymentFor(ex):null;
    if(ex&&pay){x={...pay,title:ex.title,category:pay.category||ex.category,amount:pay.amount||ex.amount,source:pay.source||'cash',cardId:pay.cardId,expenseId:ex.id};type='SABİT GİDER ÖDEMESİ';del='toggleFixedPaid';editId=ex.id}
  }
  else if(action==='editCardPayment'){x=find(state.cardPayments,rid);type='KART ÖDEMESİ';del='delCardPayment'}
  else if(action==='editFlexPayment'){x=find(state.flexTransactions,rid);type='ESNEK HESAP ÖDEMESİ';del='delFlexPayment'}
  else if(action==='editCard'){x=find(state.cards,rid);type='KREDİ KARTI';del='delCard'}
  else if(action==='editFlex'){x=find(state.flexAccounts,rid);type='ESNEK HESAP';del='delFlex'}
  else if(action==='editAccount'){x=find(state.accounts,rid);type='HESAP';del='delAccount'}
  else if(action==='editMember'){x=find(state.members,rid);type='HANE ÜYESİ';del='delMember'}
  if(!x)return null;
  const card=x.cardId?find(state.cards,x.cardId):null;
  const fields=[];
  const add=(k,v)=>{if(v!==undefined&&v!==null&&String(v)!=='')fields.push([k,String(v)])};
  add('TARİH',x.date||x.dueDate); add('KATEGORİ',x.category); 
  if(x.source)add('ÖDEME',x.source==='card'?'KART':'NAKİT');
  if(card)add('KULLANILAN KART',(card.bank||'')+(card.name?' · '+card.name:'')+(card.last4?' · •••• '+card.last4:''));
  add('AÇIKLAMA / NOT',x.note||x.description||x.title); add('KAYIT TÜRÜ',type);
  if(type==='KREDİ KARTI'){add('BANKA',x.bank);add('KART',x.name);add('SON 4 HANE',x.last4);add('BORÇ',money(x.balance||0))}
  if(type==='ESNEK HESAP'||type==='HESAP'){add('BANKA',x.bank||x.name);add('BAKİYE',money(x.balance||0))}
  const title=esc(x.title||x.name||x.bank||type), refund=isCardRefund(x),amt=(x.amount!==undefined?money(Math.abs(+x.amount||0)):'');
  const body=`<div class="haneRecordDetail"><div class="haneRecordHero"><div><small>${esc(refund?'İADE':type)}</small><h2>${title}</h2></div>${amt?`<strong>${type==='GELİR'||refund?'+':'-'}${amt}</strong>`:''}</div><div class="haneRecordGrid">${fields.map(([k,v])=>`<div class="haneRecordField"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div><div class="haneRecordActions"><button class="btn gold" data-action="${edit}" data-id="${editId}" data-direct-edit="1">✎ DÜZENLE</button>${del?`<button class="btn danger" data-action="${del}" data-id="${editId}">× SİL</button>`:''}</div></div>`;
  return {title:'KAYIT AYRINTISI',body};
}

function captureModalFormDraft(){
  if(!modal)return;
  const f=document.querySelector('.modal form');
  if(!f)return;
  const draft={};
  f.querySelectorAll('input[name],select[name],textarea[name]').forEach(el=>{
    if((el.type==='checkbox'||el.type==='radio')&&!el.checked)return;
    draft[el.name]=el.value;
  });
  modal.formDraft=draft;
}
function syncExpenseFormUI(){
  const f=document.getElementById('expenseForm');if(!f)return;
  const fixed=f.elements.expenseType?.value==='fixed';
  const n=$('#normalCategoryWrap'),fx=$('#fixedCategoryWrap'),nd=$('#normalDateWrap'),fd=$('#fixedDueWrap'),help=$('#expenseHelp');
  if(n)n.style.display=fixed?'none':'block';if(fx)fx.style.display=fixed?'block':'none';if(nd)nd.style.display=fixed?'none':'block';if(fd)fd.style.display=fixed?'block':'none';
  if(help)help.textContent=fixed?'AYNI KATEGORİDEN BİRDEN FAZLA SABİT GİDER EKLEYEBİLİRSİN. ÖRN: CEP TELEFONU · HAT 1 / HAT 2 / HAT 3 / HAT 4.':'NORMAL GİDERDE SADECE HARCAMA TARİHİ KULLANILIR.';
  const src=f.elements.source?.value==='card'?'card':'cash';const cw=$('#expenseCardWrap');if(cw)cw.style.display=src==='card'?'block':'none';
  $$('[data-pay-source]').forEach(b=>b.classList.toggle('active',b.dataset.paySource===src));
  const normalCat=f.elements.normalCategory?.value;if(normalCat){const grid=document.querySelector('.premiumCatGrid[data-select-name="normalCategory"]');grid?.querySelectorAll('.premiumCatBtn').forEach(b=>b.classList.toggle('active',b.dataset.cat===normalCat));const cc=$('#customCategoryWrap');if(cc)cc.style.display=normalCat==='Diğer'?'block':'none'}
  const fixedCat=f.elements.fixedCategory?.value;if(fixedCat){const grid=document.querySelector('.premiumCatGrid[data-select-name="fixedCategory"]');grid?.querySelectorAll('.premiumCatBtn').forEach(b=>b.classList.toggle('active',b.dataset.cat===fixedCat))}
  const st=$('#expenseReceiptStatus');if(st)st.style.display=(modal?.attachment||modal?.id&&state.expenses.find(x=>x.id===modal.id)?.attachment)?'block':'none';
}
function restoreModalFormDraft(){
  if(!modal?.formDraft)return;
  const f=document.querySelector('.modal form');if(!f)return;
  Object.entries(modal.formDraft).forEach(([name,val])=>{const els=f.querySelectorAll(`[name="${CSS.escape(name)}"]`);els.forEach(el=>{if(el.type==='checkbox'||el.type==='radio')el.checked=el.value===val;else el.value=val})});
  syncExpenseFormUI();
}
function rememberModalForm(){if(modal)captureModalFormDraft()}
function open(t,b,d={}){modal={title:t,body:b,...d};render()}

function stmtCleanTitle(v){return String(v||'').replace(/\s+/g,' ').replace(/[|]/g,' ').trim().slice(0,100)}
function stmtMoney(v){
  let x=String(v||'').trim().replace(/TL|TRY|₺|USD|EUR|GBP/gi,'').replace(/\s/g,'');
  // TR banka yazımı: 300,- / 1.423,- sıfır kuruş demektir; eksi işlem değildir.
  x=x.replace(/([.,])-$/,'$100');
  let neg=false;if(/^\(.*\)$/.test(x)){neg=true;x=x.slice(1,-1)}if(/-$/.test(x)){neg=true;x=x.slice(0,-1)}if(/^-/.test(x)){neg=true;x=x.slice(1)}x=x.replace(/^\+/,'').replace(/\+$/,'');
  x=x.replace(/[^0-9,.]/g,'');if(!x)return NaN;
  const lc=x.lastIndexOf(','),ld=x.lastIndexOf('.');
  if(lc>=0&&ld>=0){
    if(lc>ld)x=x.replace(/\./g,'').replace(',','.');
    else x=x.replace(/,/g,'');
  }else if(lc>=0){
    const parts=x.split(',');
    if(parts.length>2){const last=parts.pop();x=last.length===2?parts.join('')+'.'+last:parts.join('')+last}
    else if(parts[1]?.length===2)x=parts[0]+'.'+parts[1];
    else if(parts[1]?.length===3)x=parts.join('');
    else x=parts.join('.');
  }else if(ld>=0){
    const parts=x.split('.');
    if(parts.length>2){const last=parts.pop();x=last.length===2?parts.join('')+'.'+last:parts.join('')+last}
    else if(parts[1]?.length===2)x=parts[0]+'.'+parts[1];
    else if(parts[1]?.length===3)x=parts.join('');
  }
  const n=Number(x);return Number.isFinite(n)?(neg?-Math.abs(n):n):NaN
}
const STMT_MONTHS={OCAK:1,OCA:1,ŞUBAT:2,ŞUB:2,MART:3,MAR:3,NİSAN:4,NİS:4,MAYIS:5,MAY:5,HAZİRAN:6,HAZ:6,TEMMUZ:7,TEM:7,AĞUSTOS:8,AĞU:8,EYLÜL:9,EYL:9,EKİM:10,EKİ:10,KASIM:11,KAS:11,ARALIK:12,ARA:12};
const STMT_DATE_NUM_RE=/(?:\b\d{4}[.\/-]\d{1,2}[.\/-]\d{1,2}\b|\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b)/gi;
const STMT_DATE_TXT_RE=/\b\d{1,2}\s+(?:OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)(?:\s+(?:20\d{2}|\d{2}))?\b/gi;
function stmtValidDate(y,m,d){const x=new Date(y,m-1,d,12,0,0);return x.getFullYear()===y&&x.getMonth()===m-1&&x.getDate()===d}
function stmtValidIsoDate(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return !!m&&stmtValidDate(+m[1],+m[2],+m[3])}
function stmtAnchorInfo(text){
  const found=[],raw=String(text||''),up=raw.toLocaleUpperCase('tr-TR');
  for(const m of raw.matchAll(/\b(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})\b/g)){const y=+m[1],mo=+m[2],d=+m[3];if(stmtValidDate(y,mo,d))found.push({y,mo,d})}
  for(const m of raw.matchAll(/\b(\d{1,2})[.\/-](\d{1,2})[.\/-](20\d{2}|\d{2})\b/g)){let y=+m[3];if(y<100)y+=2000;const mo=+m[2],d=+m[1];if(stmtValidDate(y,mo,d))found.push({y,mo,d})}
  for(const m of up.matchAll(/\b(\d{1,2})\s+(OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)\s+(20\d{2}|\d{2})\b/g)){let y=+m[3];if(y<100)y+=2000;const mo=STMT_MONTHS[m[2]],d=+m[1];if(stmtValidDate(y,mo,d))found.push({y,mo,d})}
  if(found.length){found.sort((a,b)=>new Date(b.y,b.mo-1,b.d)-new Date(a.y,a.mo-1,a.d));return found[0]}
  const fallback=cardStatementMonth||state?.selectedMonth||ym(new Date()),[y,mo]=fallback.split('-').map(Number);return{y:y||new Date().getFullYear(),mo:mo||new Date().getMonth()+1,d:1}
}
function stmtDateInfo(v,anchor){
  const raw=String(v||''),up=raw.toLocaleUpperCase('tr-TR'),a=anchor&&typeof anchor==='object'?anchor:{y:Number(anchor)||new Date().getFullYear(),mo:new Date().getMonth()+1};
  let m=raw.match(/\b(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})\b/);
  if(m){const y=+m[1],mo=+m[2],d=+m[3];if(stmtValidDate(y,mo,d))return{date:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,raw:m[0],month:mo,yearExplicit:true}}
  m=raw.match(/\b(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?\b/);
  if(m){let explicit=!!m[3],y=explicit?+m[3]:a.y;if(y<100)y+=2000;const d=+m[1],mo=+m[2];if(!explicit){if(a.mo<=2&&mo>=11)y--;else if(a.mo>=11&&mo<=2)y++}if(stmtValidDate(y,mo,d))return{date:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,raw:m[0],month:mo,yearExplicit:explicit}}
  m=up.match(/\b(\d{1,2})\s+(OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)(?:\s+(\d{2,4}))?\b/);
  if(m){let explicit=!!m[3],y=explicit?+m[3]:a.y;if(y<100)y+=2000;const d=+m[1],mo=STMT_MONTHS[m[2]];if(!explicit){if(a.mo<=2&&mo>=11)y--;else if(a.mo>=11&&mo<=2)y++}if(stmtValidDate(y,mo,d))return{date:`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`,raw:m[0],month:mo,yearExplicit:explicit}}
  return null
}
function stmtDateTokens(v,anchor){
  const src=String(v||''),hits=[];
  const add=(re)=>{for(const m of src.matchAll(re)){const pre=src.slice(Math.max(0,m.index-18),m.index).toLocaleUpperCase('tr-TR'),post=src.slice(m.index+m[0].length,m.index+m[0].length+22).toLocaleUpperCase('tr-TR');if(/İŞLEMİN|ISLEMIN/.test(pre)||/TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT/.test(post))continue;const di=stmtDateInfo(m[0],anchor);if(di)hits.push({index:m.index,raw:m[0],date:di.date})}};
  add(/\b20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}\b/g);
  add(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b/g);
  add(/\b\d{1,2}\s+(?:OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)(?:\s+(?:20\d{2}|\d{2}))?\b/gi);
  hits.sort((a,b)=>a.index-b.index);const out=[];for(const h of hits){if(!out.some(x=>x.index===h.index&&x.raw===h.raw))out.push(h)}return out
}
function stmtDatePreference(text){
  const u=String(text||'').toLocaleUpperCase('tr-TR'),tx=u.search(/İŞLEM\s*TARİH|ISLEM\s*TARIH|HARCAMA\s*TARİH|HARCAMA\s*TARIH/),post=u.search(/PROVİZYON\s*TARİH|PROVIZYON\s*TARIH|VALÖR\s*TARİH|VALOR\s*TARIH|MUHASEBE\s*TARİH|MUHASEBE\s*TARIH/);
  if(tx>=0&&post>=0)return tx<=post?'first':'last';return'first'
}
function stmtPickTransactionDate(blockText,anchor,pref='first'){
  const src=String(blockText||''),direct=src.match(/(?:İŞLEM|ISLEM|HARCAMA)\s*TARİH[İI]?\s*[:\-]?\s*((?:20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2})|(?:\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?))/i);
  if(direct){const d=stmtDateInfo(direct[1],anchor);if(d)return d}
  const dates=stmtDateTokens(src,anchor);if(!dates.length)return null;return stmtDateInfo((pref==='last'?dates.at(-1):dates[0]).raw,anchor)
}
function stmtStripDates(v){return String(v||'').replace(STMT_DATE_NUM_RE,' ').replace(STMT_DATE_TXT_RE,' ').replace(/\s+/g,' ').trim()}
function stmtAmountCandidates(v){
  const s=String(v||''),out=[];
  // Ortak para tokenizer'ı: TR 1.234,56 / TL.300,- ve EN 1,234.56 biçimlerini tek token olarak yakalar.
  const re=/([+-]?\s*(?:(?:TL|TRY|₺|USD|EUR|GBP)\.?\s*)?[+-]?\s*(?:(?:\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2}|,-)?|\d+(?:[.,]\d{2}|,-)?)\s*[+-]?\s*(?:TL|TRY|₺|USD|EUR|GBP)?)/gi;
  for(const m of s.matchAll(re)){
    const raw=String(m[0]||''),currencyHit=raw.match(/(?:TL|TRY|₺|USD|EUR|GBP)/i),currency=(currencyHit?.[0]||'').toUpperCase(),value=stmtMoney(raw);
    if(!Number.isFinite(value)||value===0)continue;
    const digits=raw.replace(/\D/g,'');if(digits.length>12&&!currency)continue;
    const compact=raw.replace(/\s+/g,''),hasCents=/[.,]\d{2}(?:[+-])?(?:TL|TRY|₺|USD|EUR|GBP)?$/i.test(compact),zeroCents=/,-(?:TL|TRY|₺|USD|EUR|GBP)?$/i.test(compact),hasGrouping=/\d[.,]\d{3}(?:[.,]\d{2}|,-)?/.test(compact);
    if(!currency&&!hasCents&&!zeroCents&&!hasGrouping)continue;
    if(Math.abs(value)>999999999)continue;
    let score=(['TL','TRY','₺'].includes(currency)?20:currency?9:0)+(hasCents||zeroCents?7:0)+(hasGrouping?2:0)+(m.index>s.length*.65?2:0);
    out.push({raw,value,index:m.index,currency,score})
  }
  return out
}
function stmtPickAmountForProfile(profile,source,amounts){
  const a=[...(amounts||[])].sort((x,y)=>x.index-y.index);if(!a.length)return null;
  const pid=profile?.id||'generic',u=String(source||'').toLocaleUpperCase('tr-TR');
  if(pid==='denizbank'){
    // DenizBank'ta Bonus(TL) işlem tutarından önce gelir; gerçek tutar en sağdaki TL değeridir.
    const tl=a.filter(x=>['TL','TRY','₺'].includes(x.currency));return (tl.length?tl:a).at(-1)
  }
  if(pid==='teb')return a.at(-1);
  if(pid==='isbank'){
    // İş Bankası'nda tutar ilk parasal kolondur; devamındaki değer taksit toplamı/MaxiPuan olabilir.
    if(/MAX[Iİ]PUAN\s*[Iİ]LAVE/.test(u)&&a.length<=2)return null;
    return a[0]
  }
  const explicit=a.filter(x=>['TL','TRY','₺'].includes(x.currency));return (explicit.length?explicit:a)[0]
}

function stmtMerchantKey(t){return String(t||'').toLocaleUpperCase('tr-TR').replace(/\b(?:POS|PROVİZYON|PROVIZYON|İŞLEM|ISLEM|ŞUBE|SUBE|NO|REF)\b/g,' ').replace(/\d{2,}/g,' ').replace(/[^A-ZÇĞİÖŞÜ\s]/g,' ').replace(/\s+/g,' ').trim().slice(0,72)}
function stmtCategoryBase(t){
  t=String(t||'').toLocaleUpperCase('tr-TR');
  if(/GETİR\s*YEMEK|GETIR\s*YEMEK|YEMEKSEPET[İI]|TRENDYOL\s*YEMEK|RESTAUR|RESTORAN|BURGER|MCDONALD|KFC|DOMINOS|PIZZA|PİZZA/.test(t))return'Yemek';
  if(/MİGROS|MIGROS|BİM|BIM|A101|ŞOK|SOK|CARREFOUR|METRO\s*MARKET|MACROCENTER|F[İI]LE\s*MARKET|GROSS|ONUR\s*(?:MARKET|MRKT)|HAPPY\s*CENTER|HAKMAR|MOPAŞ|MOPAS|BİZİM\s*TOPTAN|BIZIM\s*TOPTAN|TARIM\s*KRED[İI]|SEÇ\s*MARKET|SEC\s*MARKET|KİM\s*MARKET|KIM\s*MARKET|ÇAĞRI\s*MARKET|CAGRI\s*MARKET|ÖZDİLEK\s*(?:MARKET)?|OZDILEK\s*(?:MARKET)?|\bMARKET\b|SÜPERMARKET|SUPERMARKET|HİPERMARKET|HIPERMARKET|GIDA\s*MARKET/.test(t))return'Market';
  if(/GETİR|GETIR/.test(t))return'Market';
  if(/KUYUMCU|KUYUMCULUK|MÜCEVHER|MUCEVHER|PIRLANTA|PIRLANTA|ALTINBAŞ|ALTINBAS|ATASAY|ZEN\s*PIRLANTA|ARİŞ|ARIS\s*PIRLANTA|SİNA\s*KUYUM|SINA\s*KUYUM/.test(t))return'Kuyumculuk';
  if(/İSTANBULKART|ISTANBULKART|BELBİM|BELBIM|İETT|IETT|MARMARAY|METRO\s*İSTANBUL|METRO\s*ISTANBUL|BURULAŞ|BURULAS|BURSARAY|BUDO|ANKARAKART|\bEGO\b|İZMİRİM|IZMIRIM|ESHOT|KENTKART|TCDD\s*TAŞIMACILIK|TCDD\s*TASIMACILIK|TRAMVAY|OTOBÜS|OTOBUS|DOLMUŞ|DOLMUS|VAPUR|FERRY/.test(t))return'Ulaşım';
  if(/MANAV|SEBZE|MEYVE/.test(t))return'Manav';
  if(/FIRIN|PASTANE|EKMEK/.test(t))return'Fırın';
  if(/CAFE|KAFE|STARBUCKS|KAHVE\s*DÜNYASI|KAHVE\s*DUNYASI|ESPRESSOLAB/.test(t))return'Kafe';
  if(/TRENDYOL|HEPSİBURADA|HEPSIBURADA|AMAZON|N11|PAZARAMA|TEMU|ALIEXPRESS/.test(t))return'Online Alışveriş';
  if(/TEKNOSA|MEDIAMARKT|MEDIA\s*MARKT|VATAN\s*BİLGİSAYAR|VATAN\s*BILGISAYAR|APPLE\s*STORE|SAMSUNG/.test(t))return'Elektronik';
  if(/IKEA|İKEA|KOÇTAŞ|KOCTAS|BAUHAUS|ENGLISH\s*HOME|MADAME\s*COCO|MOBİLYA|MOBILYA/.test(t))return'Mobilya';
  if(/NALBUR|TADİLAT|TADILAT|YAPI\s*MARKET|BOYA\s*BADANA/.test(t))return'Ev Bakım';
  if(/LCW|LC\s*WAIKIKI|DEFACTO|KOTON|ZARA|H&M|MAVİ|MAVI|BOYNER|\bFLO\b|GİYİM|GIYIM/.test(t))return'Giyim';
  if(/GRATİS|GRATIS|WATSONS|ROSSMANN|SEPHORA|KOZMETİK|KOZMETIK/.test(t))return'Kozmetik';
  if(/BERBER|KUAFÖR|KUAFOR|GÜZELLİK|GUZELLIK|KİŞİSEL\s*BAKIM|KISISEL\s*BAKIM/.test(t))return'Kişisel Bakım';
  if(/D&R|KİTAPYURDU|KITAPYURDU|BKM\s*KİTAP|BKM\s*KITAP|KİTAP|KITAP/.test(t))return'Kitap';
  if(/KIRTASİYE|KIRTASIYE|OFİS\s*MALZEME|OFIS\s*MALZEME/.test(t))return'Kırtasiye';
  if(/DECATHLON|MACFİT|MACFIT|FITNESS|SPOR\s*SALONU/.test(t))return'Spor';
  if(/STEAM|PLAYSTATION|PSN|XBOX|EPIC\s*GAMES|NINTENDO/.test(t))return'Oyun';
  if(/NETFLIX|SPOTIFY|DISNEY|EXXEN|BLUTV|GAIN|YOUTUBE\s*PREMIUM|APPLE\.COM\/BILL|GOOGLE\s*ONE/.test(t))return'Abonelik';
  if(/BENZİN|BENZIN|PETROL|OPET|SHELL|\bBP\b|TOTAL|AYTEMİZ|AYTEMIZ/.test(t))return'Akaryakıt';
  if(/İSPARK|ISPARK|OTOPARK|PARK\s*ÜCRET|PARK\s*UCRET/.test(t))return'Otopark';
  if(/HGS|OGS|OTOYOL|KÖPRÜ|KOPRU|AVRASYA|KGM/.test(t))return'Otoyol/Köprü';
  if(/OTO\s*SERVİS|OTO\s*SERVIS|LASTİK|LASTIK|ARAÇ\s*BAKIM|ARAC\s*BAKIM|OTO\s*YIKAMA/.test(t))return'Araç Bakım';
  if(/YOL\s*ÜCRET|YOL\s*UCRET|ULAŞIM|ULASIM|TAKSİ|TAKSI|TOPLU\s*TAŞIMA|TOPLU\s*TASIMA|BİLET|BILET/.test(t))return'Ulaşım';
  if(/YURTİÇİ\s*KARGO|YURTICI\s*KARGO|ARAS\s*KARGO|MNG\s*KARGO|SÜRAT\s*KARGO|SURAT\s*KARGO|PTT\s*KARGO|KARGO/.test(t))return'Kargo';
  if(/ECZANE|HASTANE|MEDİKAL|MEDIKAL|SAĞLIK|SAGLIK|DOKTOR|DİŞ|DİS|DIS\s*KLİNİK|DIS\s*KLINIK/.test(t))return'Sağlık';
  if(/OKUL|KURS|ÜNİVERSİTE|UNIVERSITE|EĞİTİM|EGITIM|DERSHANE/.test(t))return'Eğitim';
  if(/E-BEBEK|EBEBEK|TOYZZ|OYUNCAK|ÇOCUK|COCUK/.test(t))return'Çocuk';
  if(/PETSHOP|PET\s*SHOP|VETERİNER|VETERINER|EVCİL\s*HAYVAN|EVCIL\s*HAYVAN/.test(t))return'Evcil Hayvan';
  if(/TEMİZLİK|TEMIZLIK|DETERJAN/.test(t))return'Temizlik';
  if(/BOOKING|AIRBNB|OTEL|HOTEL|PANSİYON|PANSIYON/.test(t))return'Konaklama';
  if(/TÜRK\s*HAVA\s*YOLLARI|TURKISH\s*AIRLINES|PEGASUS|AJET|ANADOLUJET|UÇAK|UCAK/.test(t))return'Uçak';
  if(/TATİL|TATIL|TUR\s*ŞİRKET|TUR\s*SIRKET/.test(t))return'Tatil';
  if(/HEDİYE|HEDIYE|ÇİÇEKSEPETİ|CICEKSEPETI/.test(t))return'Hediye';
  if(/BAĞIŞ|BAGIS|KIZILAY|LÖSEV|LOSEV/.test(t))return'Bağış';
  if(/SİGORTA|SIGORTA|ALLIANZ|AKSİGORTA|AKSIGORTA|ANADOLU\s*SİGORTA|ANADOLU\s*SIGORTA/.test(t))return'Sigorta';
  if(/\bKKDF\b|\bBSMV\b|\bBSMW\b|BANKA\s+VE\s+SİGORTA\s+MUAMELE|BANKA\s+VE\s+SIGORTA\s+MUAMELE|KREDİ\s+KARTI\s+FAİZ|KREDI\s+KARTI\s+FAIZ|KREDİ\s+FAİZ|KREDI\s+FAIZ|ALIŞVERİŞ\s+FAİZ|ALISVERIS\s+FAIZ|NAKİT\s+AVANS\s+FAİZ|NAKIT\s+AVANS\s+FAIZ|GECİKME\s+FAİZ|GECIKME\s+FAIZ|AKDİ\s+FAİZ|AKDI\s+FAIZ|TEMERRÜT\s+FAİZ|TEMERRUT\s+FAIZ|FAİZ\s+TUTARI|FAIZ\s+TUTARI|TAKSİT(?:LENDİRME)?\s+FAİZ|TAKSIT(?:LENDIRME)?\s+FAIZ|PEŞİNE\s+TAKSİT\s+FAİZ|PESINE\s+TAKSIT\s+FAIZ/.test(t))return'Vergi & Faiz';
  if(/VERGİ|VERGI|GİB|GELİR\s*İDARESİ|GELIR\s*IDARESI/.test(t))return'Vergi';
  if(/KOMİSYON|KOMISYON|KART\s*AİDAT|KART\s*AIDAT|BANKA\s*MASRAF|İŞLEM\s*ÜCRET|ISLEM\s*UCRET/.test(t))return'Banka Masrafı';
  if(/FAİZ|FAIZ|GECİKME\s*FAİZ|GECIKME\s*FAIZ/.test(t))return'Faiz';
  if(/ELEKTRİK|ELEKTRIK/.test(t))return'Elektrik';
  if(/DOĞALGAZ|DOGALGAZ/.test(t))return'Doğalgaz';
  if(/SU\s*FATURA|SU\s*FATURASI/.test(t))return'Su';
  if(/TURKCELL|VODAFONE|TÜRK\s*TELEKOM|TURK\s*TELEKOM/.test(t))return'Cep Telefonu';
  if(/İNTERNET|INTERNET|SUPERONLINE|TÜRKSAT|TURKSAT/.test(t))return'İnternet';
  if(/FATURA/.test(t))return'Faturalar';
  return'Diğer'
}
function stmtCategory(t){const key=stmtMerchantKey(t),learned=state?.statementCategoryRules?.[key];return learned&&C.includes(learned)?learned:stmtCategoryBase(t)}
function stmtFingerprint(cardId,date,title,amount){return [cardId,date,stmtCleanTitle(title).toLocaleUpperCase('tr-TR'),Number(amount).toFixed(2)].join('|')}
function stmtExistingCount(cardId,date,title,amount){const base=stmtFingerprint(cardId,date,title,amount);return (state.expenses||[]).filter(x=>x.importedFromStatement&&x.cardId===cardId&&((x.importBaseFingerprint||String(x.importFingerprint||'').replace(/\|#\d+$/,''))===base||stmtFingerprint(cardId,x.date,x.title,+(x.actualAmount??x.amount)||0)===base)).length}
function stmtTransactionTailOnly(v){
  const s=String(v||'');
  const stops=[
    /\bFA[İI]Z\s+VE\s+[ÜU]CRETLER\b/i,
    /\bAYLIK\s+FA[İI]Z\s+ORANLARI\b/i,
    /\bYILLIK\s+FA[İI]Z\s+ORANLARI\b/i,
    /\bDEVREDEN\s+BAK[İI]YE\b/i,
    /\bHARCAMALAR(?:INIZ)?\b/i,
    /\bFA[İI]Z\s*[ÜU]CRETLER\s*VE\s*KES[İI]NT[İI]LER\b/i,
    /\b[ÖO]DEMELER[İI]N[İI]Z\b/i,
    /\bD[ÖO]NEM\s+BORCU\b/i,
    /\bDOĞUM\s+G[ÜU]N[ÜU]N[ÜU]Z[ÜU]\b/i
  ];
  let end=s.length;
  for(const rx of stops){const m=s.match(rx);if(m&&m.index!=null)end=Math.min(end,m.index)}
  return s.slice(0,end).trim()
}
function stmtLogicalBlocks(text,anchor){
  const src=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').replace(/[\u200B-\u200D\uFEFF]/g,' ');
  const hits=[];
  const headerBefore=/(?:HESAP\s*KES[İI]M(?:\s*TAR[İI]H[İI]?)?|SON\s*ÖDEME(?:\s*TAR[İI]H[İI]?)?|EKSTRE\s*TAR[İI]H[İI]?|DÖNEM\s*TAR[İI]H[İI]?|ASGAR[İI].{0,12})\s*[:\-]?\s*$/i;
  const addHits=re=>{for(const m of src.matchAll(re)){const preShort=src.slice(Math.max(0,m.index-18),m.index).toLocaleUpperCase('tr-TR'),postShort=src.slice(m.index+m[0].length,m.index+m[0].length+22).toLocaleUpperCase('tr-TR');if(/İŞLEMİN|ISLEMIN/.test(preShort)||/TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT/.test(postShort))continue;const di=stmtDateInfo(m[0],anchor);if(!di)continue;const pre=src.slice(Math.max(0,m.index-70),m.index).replace(/\s+/g,' ');if(headerBefore.test(pre))continue;hits.push({index:m.index,end:m.index+m[0].length,raw:m[0],date:di.date})}};
  addHits(/\b20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}\b/g);
  addHits(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b/gi);
  addHits(/\b\d{1,2}\s+(?:OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)(?:\s+(?:20\d{2}|\d{2}))?\b/gi);
  hits.sort((a,b)=>a.index-b.index||b.end-a.end);
  const uniq=[];for(const h of hits){const last=uniq.at(-1);if(last&&h.index<last.end)continue;uniq.push(h)}
  const blocks=[];let cur=null;
  const flush=()=>{if(cur){const body=cur.parts.join(' ').replace(/\s+/g,' ').trim();if(body){const rawKey=body.toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim();blocks.push({date:cur.date,lines:[body],dateCount:cur.dateCount,rawKey,sourceStart:cur.sourceStart,sourceEnd:cur.sourceEnd})}cur=null}};
  for(let i=0;i<uniq.length;i++){
    const h=uniq[i],next=uniq[i+1],sliceEnd=next?next.index:src.length,tail=stmtTransactionTailOnly(src.slice(h.end,sliceEnd).replace(/\s+/g,' ').trim());
    if(!cur)cur={date:h.date,parts:[h.raw],dateCount:1,sourceStart:h.index,sourceEnd:sliceEnd};else{cur.parts.push(h.raw);cur.dateCount++;cur.sourceEnd=sliceEnd}
    if(tail)cur.parts.push(tail);
    // Her fiziksel satırın kaynak konumunu koru. Aynı gün/işyeri/tutar tekrarı gerçek bir işlem olabilir.
    if(stmtAmountCandidates(stmtStripDates(tail)).length)flush();
    else if(cur.dateCount>=3)flush();
  }
  flush();return blocks
}
function stmtInstallmentInfo(blockText,selectedAmount){
  const u=String(blockText||'').toLocaleUpperCase('tr-TR');
  let no=null,count=null,total=null;
  const frac=u.match(/(?:İŞLEMİN|ISLEMIN)\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)?/i)||u.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)/i);
  if(frac){no=+frac[1];count=+frac[2];if(!(no>=1&&count>=2&&no<=count)){no=null;count=null}}
  const totalMatch=String(blockText||'').match(/([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})|[0-9]+(?:,[0-9]{2}))\s*(?:TL|TRY|₺)?[^0-9]{0,20}(?:İŞLEMİN|ISLEMIN)/i);
  if(totalMatch){const n=stmtParseLooseMoney(totalMatch[1]);if(Number.isFinite(n)&&n>Math.abs(selectedAmount||0))total=n}
  return{installmentNo:no,installmentCount:count,installmentTotal:total}
}
const STMT_BANK_PROFILES=[
  {id:'ziraat',label:'ZİRAAT / BANKKART',detect:/ZIRAAT|BANKKART/,preferLine:false},
  {id:'halkbank',label:'HALKBANK / PARAF',detect:/HALKBANK|PARAF/,preferLine:true,summary:{
    previousBalance:/Bir\s+Önceki\s+Dönem(?:\s+Ekstre\s+Borcu)?\s*[:\-]?\s*({M})(?:\s*TL)?(?:\s+Ekstre\s+Borcu)?/i,
    spendingTotal:/Dönem\s+İçi\s+Borç\s+Tutarı\s*[:\-]?\s*({M})/i,
    feesTotal:/Toplam\s+Faiz,?\s*Ücret,?(?:\s+Vergiler)?\s*[:\-]?\s*({M})(?:\s*TL)?(?:\s+Vergiler)?/i,
    paymentsTotal:/Dönemsel\s+Alacak(?:\s+Kayıtları)?\s*[:\-]?\s*({M})(?:\s*TL)?(?:\s+Kayıtları)?/i,
    periodDebt:/Hesap\s+Bakiyesi\s*[:\-]?\s*({M})/i
  }},
  {id:'vakifbank',label:'VAKIFBANK',detect:/VAKIFBANK|VAKIFKART|WORLD.*VAKIF/,preferLine:false},
  {id:'garanti',label:'GARANTİ BBVA',detect:/GARANTI|BBVA/,preferLine:false},
  {id:'akbank',label:'AKBANK',detect:/AKBANK|AXESS/,preferLine:false},
  {id:'yapikredi',label:'YAPI KREDİ',detect:/YAPI\s*KREDI|WORLD/,preferLine:false},
  {id:'isbank',label:'İŞ BANKASI',detect:/IS\s*BANKASI|MAXIMUM/,preferLine:false,summary:{
    previousBalance:/B[İI]R\s+[ÖO]NCEK[İI]\s+HESAP\s+[ÖO]ZET[İI]\s+BAK[İI]YEN[İI]Z[^0-9+-]*({M})/i,
    spendingTotal:/\bTOPLAM\s+({M})\s*TL/i,
    feesTotal:/FA[İI]Z\s+VE\s+[ÜU]CRETLER[^0-9+-]*({M})/i,
    paymentsTotal:/HESAPTAN\s+AKTARIM[^0-9+-]*(-?{M})/i,
    periodDebt:/HESAP\s+[ÖO]ZET[İI]\s+BORCU[^0-9+-]*({M})/i
  }},
  {id:'qnb',label:'QNB',detect:/QNB|FINANSBANK|CARDFINANS/,preferLine:false},
  {id:'denizbank',label:'DENİZBANK',detect:/DENIZBANK/,preferLine:false,summary:{
    previousBalance:/[ÖO]NCEK[İI]\s+HESAP\s+BAK[İI]YEN[İI]Z[^0-9+-]*({M})/i,
    spendingTotal:/D[ÖO]NEM\s+[İI][ÇC][İI]\s+HARCAMANIZ[^0-9+-]*({M})/i,
    feesTotal:/TOPLAM\s+FA[İI]Z\s+VE\s+[ÜU]CRETLER[^0-9+-]*({M})/i,
    paymentsTotal:/[ÖO]DEMELER[^0-9+-]*({M})/i,
    periodDebt:/D[ÖO]NEM\s+BORCU[^0-9+-]*({M})/i
  }},
  {id:'teb',label:'TEB',detect:/TURK\s*EKONOMI\s*BANKASI|\bTEB\b|BONUS\s*CARD/,preferLine:false,summary:{
    previousBalance:/[ÖO]NCEK[İI]\s+D[ÖO]NEMDEN\s+DEV[İI]R\s+ED[İI]LEN\s+TUTAR[^0-9+-]*(?:TL\.?)?({M})/i,
    spendingTotal:/BU\s+KARTINIZLA\s+YAPILAN\s+[İI][ŞS]LEM\s+TOPLAMLARI[^0-9+-]*(?:TL\.?)?({M})/i,
    feesTotal:/TOPLAM\s+FA[İI]Z\s+VE\s+[ÜU]CRETLER[^0-9+-]*({M})/i,
    paymentsTotal:/CEPTETEB\s+[ÖO]DEME[^0-9+-]*(-?{M})/i,
    periodDebt:/D[ÖO]NEM\s+BORCU[^0-9+-]*(?:TL\.?)?({M})/i
  }},
  {id:'ing',label:'ING',detect:/\bING\b/,preferLine:false},
  {id:'generic',label:'GENEL BANKA',detect:null,preferLine:false}
];
function stmtDetectBank(text,cardId=''){
  // Önce yalnızca ekstre metnini kullan. Seçili kart bankası PDF tanımını asla ezmemeli.
  const norm=v=>String(v||'').toLocaleUpperCase('tr-TR').replace(/İ/g,'I');
  const textOnly=norm(text);
  if(textOnly){for(const p of STMT_BANK_PROFILES){if(p.detect&&p.detect.test(textOnly))return{id:p.id,label:p.label,source:'statement'}}}
  // Ekstre üzerinde banka imzası bulunamazsa seçili kart bankasını yalnızca yedek olarak kullan.
  const card=state?.cards?.find?.(x=>x.id===cardId),cardOnly=norm(card?.bank||'');
  if(cardOnly){for(const p of STMT_BANK_PROFILES){if(p.detect&&p.detect.test(cardOnly))return{id:p.id,label:p.label,source:'card'}}}
  return{id:'generic',label:card?.bank?String(card.bank).toLocaleUpperCase('tr-TR'):'GENEL BANKA',source:'generic'}
}
function stmtBankProfile(text,cardId=''){
  const d=stmtDetectBank(text,cardId);return STMT_BANK_PROFILES.find(p=>p.id===d.id)||STMT_BANK_PROFILES.at(-1)
}
function stmtFeeLike(blockText){
  const u=String(blockText||'').toLocaleUpperCase('tr-TR');
  return /\bKKDF\b|\bBSMV\b|\bBSMW\b|BANKA\s+VE\s+SİGORTA\s+MUAMELE|BANKA\s+VE\s+SIGORTA\s+MUAMELE|KREDİ\s+KARTI\s+FAİZ|KREDI\s+KARTI\s+FAIZ|KREDİ\s+FAİZ|KREDI\s+FAIZ|ALIŞVERİŞ\s+FAİZ|ALISVERIS\s+FAIZ|NAKİT\s+AVANS\s+FAİZ|NAKIT\s+AVANS\s+FAIZ|GECİKME\s+FAİZ|GECIKME\s+FAIZ|AKDİ\s+FAİZ|AKDI\s+FAIZ|TEMERRÜT\s+FAİZ|TEMERRUT\s+FAIZ|FAİZ\s+TUTARI|FAIZ\s+TUTARI|TAKSİT(?:LENDİRME)?\s+FAİZ|TAKSIT(?:LENDIRME)?\s+FAIZ|PEŞİNE\s+TAKSİT\s+FAİZ|PESINE\s+TAKSIT\s+FAIZ|KART\s+AİDAT|KART\s+AIDAT|BANKA\s+MASRAF|KOMİSYON|KOMISYON|İŞLEM\s+ÜCRET|ISLEM\s+UCRET/.test(u)
}
function stmtPaymentLike(blockText){
  const u=String(blockText||'').toLocaleUpperCase('tr-TR');
  return /(?:ŞUBE|SUBE)?\s*-?\s*OTOMATİK\s*ÖDEME|OTOMATIK\s*ODEME|İNTERAKTİF\s*ÖDEME|INTERAKTIF\s*ODEME|İNTERNET\s*ŞUBE(?:Sİ)?\s*ÖDEME|INTERNET\s*SUBE(?:SI)?\s*ODEME|MOBİL\s*ÖDEME|MOBIL\s*ODEME|ÖDEME\s*-?\s*TEŞEKK|ODEME\s*-?\s*TESEKK|HESAPTAN\s+ÖDEME|HESAPTAN\s+ODEME|KART\s*ÖDEMESİ|KART\s*ODEMESI|KREDİ\s*KARTI\s*ÖDEME|KREDI\s*KARTI\s*ODEME|BORÇ\s*ÖDEME|BORC\s*ODEME|HESAPTAN\s+AKTARIM.{0,40}İNTERAKTİF|HESAPTAN\s+AKTARIM.{0,40}INTERAKTIF|CEPTETEB\s+ÖDEME|CEPTETEB\s+ODEME/.test(u)
}
function stmtCarryForwardLike(blockText){
  const u=String(blockText||'').toLocaleUpperCase('tr-TR').replace(/İ/g,'I').replace(/\s+/g,' ').trim();
  if(!u)return false;
  // Ekstre tablosunda bilgi amaçlı gösterilen önceki dönem/devir satırları gerçek işlem değildir.
  // Ödeme satırlarını etkilememek için yalnızca devir + ekstre borcu/bakiye bağlamı filtrelenir.
  return /BIR\s+ONCEKI\s+DONEM(?:.{0,90})?(?:EKSTRE\s+BORCU|DONEM\s+BORCU|DEVIR|DEVREDEN|BAKIYE)/.test(u)
    || /ONCEKI\s+DONEM(?:.{0,90})?(?:EKSTRE\s+BORCU|DONEM\s+BORCU|DEVIR|DEVREDEN|BAKIYE)/.test(u)
    || /(?:DEVREDEN\s+BAKIYE|ONCEKI\s+AYDAN\s+DEVIR|ONCEKI\s+DONEMDEN\s+DEVIR\s+EDILEN\s+TUTAR|BIR\s+ONCEKI\s+HESAP\s+OZETI\s+BAKIYENIZ)/.test(u)
    || /EKSTRE\s+BORCU(?:.{0,80})?KART\s+NO/.test(u);
}
function stmtDropChronologyBreakingDuplicates(rows){
  const a=[...(rows||[])],groups={};
  a.forEach((r,i)=>{if(r?.semanticKey)(groups[r.semanticKey]||(groups[r.semanticKey]=[])).push(i)});
  const drop=new Set(),penalty=i=>{const cur=a[i]?.date||'',prev=i>0?(a[i-1]?.date||''):'',next=i<a.length-1?(a[i+1]?.date||''):'';let p=0;if(prev&&cur&&prev>cur)p+=2;if(cur&&next&&cur>next)p+=2;if(prev&&next&&cur&&prev===next&&cur!==prev)p+=1;return p};
  for(const idxs of Object.values(groups)){if(idxs.length!==2||Math.abs(idxs[1]-idxs[0])===1)continue;const ps=idxs.map(i=>({i,p:penalty(i)})),min=Math.min(...ps.map(x=>x.p)),max=Math.max(...ps.map(x=>x.p));if(max>min)for(const x of ps)if(x.p>min)drop.add(x.i)}
  return a.filter((_,i)=>!drop.has(i))
}
function stmtCommonIgnoreLine(v){
  const u=String(v||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim();if(!u)return true;if(stmtCarryForwardLike(u))return true;
  return /^(?:İŞLEM|ISLEM|TARİHİ|TARIHI|AÇIKLAMA|ACIKLAMA|TUTAR|KALAN|BORÇ|BORC|TAKSİT|TAKSIT|PARAFPARA)$/.test(u)
    || /(?:İŞLEM|ISLEM).*TARİH|(?:AÇIKLAMA|ACIKLAMA).*TUTAR|TUTAR\s*\(TL\)|KALAN.*BORÇ|KALAN.*BORC|BORÇ.*TAKSİT|BORC.*TAKSIT/.test(u)
    || /TÜRKİYE\s+HALK\s+BANKASI|TURKIYE\s+HALK\s+BANKASI|MERSİS|MERSIS|MÜKELLEFLER\s+VERGİ|MUKELLEFLER\s+VERGI|TİCARET\s+SİCİL|TICARET\s+SICIL|DIALOG|PARAF\.COM\.TR|FAİZ\s+ORANLARI|FAIZ\s+ORANLARI|AYLIK\s+YILLIK/.test(u)
    || /BİR\s+SONRAKİ\s+(?:HESAP|SON\s+ÖDEME)|BIR\s+SONRAKI\s+(?:HESAP|SON\s+ODEME)|EKSTRE\s+İLE\s+İLGİLİ|EKSTRE\s+ILE\s+ILGILI/.test(u)
}
function stmtMakeRow(cardId,di,sourceText,amountPick,sourceStart,profileId,occSeen,installments=true){
  if(!di||!amountPick||stmtCarryForwardLike(sourceText))return null;const rawAmount=amountPick.value;if(!Number.isFinite(rawAmount)||rawAmount===0)return null;
  const payment=stmtPaymentLike(sourceText),fee=!payment&&stmtFeeLike(sourceText),refund=!payment&&!fee&&(/\bİADE\b|\bIADE\b|\bİPTAL\b|\bIPTAL\b|\bREFUND\b|\bALACAK\b/i.test(sourceText)||rawAmount<0);
  const amount=payment?Math.abs(rawAmount):(refund?-Math.abs(rawAmount):Math.abs(rawAmount));
  let title=stmtStripDates(sourceText),amounts=stmtAmountCandidates(title);[...amounts].sort((a,b)=>b.index-a.index).forEach(a=>{title=title.replace(a.raw,' ')});
  title=title.replace(/\b(?:İŞLEM|ISLEM|PROVİZYON|PROVIZYON|VALÖR|VALOR)\s*TARİHİ\b/gi,' ').replace(/\b(?:AÇIKLAMA|ACIKLAMA|İŞYERİ|ISYERI|TUTAR|BORÇ|BORC|ALACAK|PARA\s*BİRİMİ|PARA\s*BIRIMI|PARAFPARA)\b/gi,' ').replace(/\b(?:TL|TRY|USD|EUR|GBP|₺)\b/gi,' ').replace(/^[\s+\-–—|:;,]+|[\s+\-–—|:;,]+$/g,' ').replace(/\s+/g,' ');
  title=title.replace(/\b(?:İŞLEMİN|ISLEMIN)?\s*\d{1,2}\s*\/\s*\d{1,2}\s*(?:TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)?\b/gi,' ').replace(/\b(?:İŞLEMİN|ISLEMIN|TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)\b/gi,' ').replace(/\s+/g,' ');title=stmtCleanTitle(title);
  if(!title)title=payment?'KART ÖDEMESİ':refund?'KART İADESİ':fee?'VERGİ / FAİZ':'KART HARCAMASI';
  const inst=installments&&!payment&&!refund&&!fee?stmtInstallmentInfo(sourceText,amount):{installmentNo:null,installmentCount:null,installmentTotal:null},kind=payment?'payment':refund?'refund':fee?'fee':'spend';
  const baseFp=stmtFingerprint(cardId,di.date,title,payment?-amount:amount),instKey=`${inst.installmentNo||0}/${inst.installmentCount||0}/${Number(inst.installmentTotal||0).toFixed(2)}`,semanticKey=`${baseFp}|${kind}|${instKey}`,occ=(occSeen[semanticKey]=(occSeen[semanticKey]||0)+1);
  return{date:di.date,title,amount,category:payment?'Kart Ödemesi':fee?'Vergi & Faiz':stmtCategory(title),baseFp,semanticKey,rawKey:String(sourceText).toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim(),physicalKey:sourceStart!=null?`LN|${sourceStart}|${semanticKey}`:null,sourceStart,sourceEnd:sourceStart,occurrence:occ,fp:`${semanticKey}|#${occ}`,checked:true,refund,payment,kind,...inst,bankProfile:profileId}
}
// Ortak satır motoru: banka bağımsızdır. Banka profili yalnızca tercih/etiket sağlar.
function stmtParseLineEngine(text,cardId,profile){
  const anchor=stmtAnchorInfo(text),lines=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean),rows=[],seen={};let pending=[],last=null,started=false;
  const appendPendingToLast=()=>{if(last&&pending.length){last.title=stmtCleanTitle(`${last.title} ${pending.join(' ')}`);if(last.kind==='spend')last.category=stmtCategory(last.title);pending=[]}};
  for(let i=0;i<lines.length;i++){
    const line=lines[i],u=line.toLocaleUpperCase('tr-TR'),m=line.match(/^\s*(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\b\s*(.*)$/);
    if(started&&/^(?:BİR\s+SONRAKİ|BIR\s+SONRAKI)$/.test(u)){pending=[];break}
    if(!started&&/^(?:İŞLEM|ISLEM)$/.test(u)){started=true;continue}
    if(!m){if(stmtCarryForwardLike(line)){pending=[];continue}if(!started||stmtCommonIgnoreLine(line))continue;const hasLetters=/[A-ZÇĞİÖŞÜa-zçğıöşü]/.test(line),hasMoney=stmtAmountCandidates(line).length>0;if(hasLetters&&!hasMoney)pending.push(line);continue}
    started=true;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;const rest=m[2]||'',amounts=stmtAmountCandidates(rest).sort((a,b)=>a.index-b.index);
    if(!amounts.length){if(!stmtCommonIgnoreLine(rest)&&/[A-ZÇĞİÖŞÜa-zçğıöşü]/.test(rest))pending.push(rest);continue}
    let titleProbe=rest;[...amounts].sort((a,b)=>b.index-a.index).forEach(a=>titleProbe=titleProbe.replace(a.raw,' '));titleProbe=stmtCleanTitle(titleProbe.replace(/\b(?:TL|TRY|₺)\b/gi,' '));
    let source=rest;if(pending.length){if(titleProbe&&/[A-ZÇĞİÖŞÜa-zçğıöşü]{2}/.test(titleProbe)){if(last)appendPendingToLast();else pending=[]}else{source=`${pending.join(' ')} ${rest}`;pending=[]}}
    const sourceAmounts=stmtAmountCandidates(source).sort((a,b)=>a.index-b.index),pick=stmtPickAmountForProfile(profile,source,sourceAmounts);const row=stmtMakeRow(cardId,di,source,pick,i,profile.id,seen,true);if(row){rows.push(row);last=row}
  }
  appendPendingToLast();return stmtDropChronologyBreakingDuplicates(rows)
}
function stmtParseBlockEngine(text,cardId,profile){
  const anchor=stmtAnchorInfo(text),datePref=stmtDatePreference(text),bad=/(?:D[ÖO]NEM\s+BORCU|TOPLAM\s+BOR[ÇC]|TOPLAM\s+HARCAMA|ASGAR[İI]\s*(?:[ÖO]DEME|TUTAR)|KULLANILAB[İI]L[İI]R\s+L[İI]M[İI]T|KART\s+L[İI]M[İI]T[İI]|SON\s+[ÖO]DEME\s+TAR[İI]H|HESAP\s+KES[İI]M\s+TAR[İI]H|[ÖO]NCEK[İI]\s+AYDAN\s+DEV[İI]R|DEVREDEN\s+BAK[İI]YE)/i,out=[],seen={};
  for(const block of stmtLogicalBlocks(text,anchor)){
    const blockText=block.lines.join(' ').replace(/\s+/g,' ').trim();if(!blockText||bad.test(blockText)||stmtCarryForwardLike(blockText))continue;const di=stmtPickTransactionDate(blockText,anchor,datePref);if(!di)continue;const noDates=stmtStripDates(blockText),amounts=stmtAmountCandidates(noDates);if(!amounts.length)continue;
    const upperNoDates=noDates.toLocaleUpperCase('tr-TR'),taksitPos=Math.max(upperNoDates.indexOf('TAKSİDİ'),upperNoDates.indexOf('TAKSIDI'),upperNoDates.indexOf('TAKSİT'),upperNoDates.indexOf('TAKSIT'));let pick=null;
    if(taksitPos>=0){const islemPos=Math.max(upperNoDates.indexOf('İŞLEMİN'),upperNoDates.indexOf('ISLEMIN')),before=islemPos>=0?amounts.filter(a=>a.index<islemPos).sort((a,b)=>a.index-b.index):[],totalCandidate=before.length?before.at(-1):null,cands=amounts.filter(a=>!totalCandidate||a.index!==totalCandidate.index).sort((a,b)=>a.index-b.index);if(cands.length)pick=cands[0]}
    if(!pick)pick=stmtPickAmountForProfile(profile,blockText,amounts)
    if(!pick)continue;const row=stmtMakeRow(cardId,di,blockText,pick,Number.isFinite(block.sourceStart)?block.sourceStart:null,profile.id,seen,true);if(row){row.sourceEnd=Number.isFinite(block.sourceEnd)?block.sourceEnd:row.sourceStart;row.physicalKey=row.sourceStart!=null?`${row.sourceStart}:${row.sourceEnd||row.sourceStart}|${row.semanticKey}`:null;if(!(row.physicalKey&&out.some(x=>x.physicalKey===row.physicalKey)))out.push(row)}
  }
  return stmtDropChronologyBreakingDuplicates(out)
}

function stmtParseDenizBankFixedEngine(text,cardId,profile){
  if(profile?.id!=='denizbank')return[];
  const anchor=stmtAnchorInfo(text),rows=[],seen={},lines=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){
    const line=lines[i],m=line.match(/^(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\s+(.+)$/);if(!m)continue;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;
    const rest=m[2].trim();if(stmtCarryForwardLike(rest))continue;
    // DenizBank tablo yapısında gerçek İşlem Tutarı en sağ sütundur.
    // Bonus(TL) / Kalan Borç / Taksit sütunlarındaki sayıları ASLA işlem fiyatı olarak seçme.
    const end=rest.match(/([+-]?\s*(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})\s*\+?)\s*TL\s*$/i);
    if(!end)continue;
    const raw=end[0],value=stmtMoney(raw);if(!Number.isFinite(value)||value===0)continue;
    const pick={raw,value,index:Math.max(0,rest.length-raw.length),currency:'TL',score:1000};
    const row=stmtMakeRow(cardId,di,rest,pick,i,profile.id,seen,true);if(!row)continue;
    row.sourceEnd=i;row.physicalKey=`DENIZ|${i}|${row.semanticKey}`;row.parserStrategy='deniz-fixed-right-column';rows.push(row)
  }
  return rows
}

// V73: Halkbank / Paraf fixed row engine.
// Halkbank işlem tablosunda tarihli satırın sonunda çoğunlukla iki parasal kolon vardır:
// gerçek TUTAR(TL) + ParafPara. Abone/referans numaraları tutar değildir.
// Bu motor devir satırından bağımsız olarak her tarihli fiziksel satırı yeniden kurar.
function stmtParseHalkbankFixedEngine(text,cardId,profile){
  if(profile?.id!=='halkbank')return[];
  const anchor=stmtAnchorInfo(text),rows=[],seen={},lines=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\s+(.+)$/);if(!m)continue;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;
    let seg=m[2].trim();
    if(stmtCarryForwardLike(seg))continue;
    // V74: Halkbank footer/özet tarihleri işlem değildir. PDF metni bazen
    // "Bir Sonraki Hesap Kesim Tarihi" başlığını önceki satırlara, tarihi ise
    // tek başına yeni satıra koyar; bu durumda bakiye/toplam tutarı harcama sanılmamalı.
    const prevCtx=lines.slice(Math.max(0,i-4),i).join(' ').toLocaleUpperCase('tr-TR');
    if(/BİR\s+SONRAKİ\s+(?:HESAP\s+KESİM|SON\s+ÖDEME)\s+TARİHİ|BIR\s+SONRAKI\s+(?:HESAP\s+KESIM|SON\s+ODEME)\s+TARIHI/.test(prevCtx))continue;
    if(/^(?:TOPLAM|GENEL\s+TOPLAM|ARA\s+TOPLAM|HESAP\s+BAKİYESİ|HESAP\s+BAKIYESI|DÖNEM\s+BORCU|DONEM\s+BORCU)\b/i.test(seg))continue;
    // Açıklama alt satıra taşmışsa, sonraki tarihli satıra kadar en fazla 2 metin satırını ekle.
    for(let j=i+1;j<Math.min(lines.length,i+3);j++){
      if(/^\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2})\b/.test(lines[j]))break;
      if(stmtCommonIgnoreLine(lines[j])||/TÜRKİYE\s+HALK\s+BANKASI|TURKIYE\s+HALK\s+BANKASI|MERSİS|MERSIS|PARAF\.COM\.TR/i.test(lines[j]))break;
      if(/BİR\s+SONRAKİ\s+(?:HESAP\s+KESİM|SON\s+ÖDEME)\s+TARİHİ|BIR\s+SONRAKI\s+(?:HESAP\s+KESIM|SON\s+ODEME)\s+TARIHI|^(?:TOPLAM|GENEL\s+TOPLAM|ARA\s+TOPLAM|HESAP\s+BAKİYESİ|HESAP\s+BAKIYESI|DÖNEM\s+BORCU|DONEM\s+BORCU)\b/i.test(lines[j]))break;
      // Sadece açıklama devamı veya parasal kolon satırı olabilecek kısa satırları ekle.
      if(lines[j].length<180)seg+=' '+lines[j];
    }
    const amounts=stmtAmountCandidates(seg).sort((a,b)=>a.index-b.index);if(!amounts.length)continue;
    // TUTAR(TL), ParafPara kolonundan önce gelir. Son aday küçük bir ParafPara ise bir önceki tutarı seç.
    let pick=null;
    const explicit=amounts.filter(a=>['TL','TRY','₺'].includes(a.currency));
    if(explicit.length)pick=explicit[0];
    else if(amounts.length>=2){
      const last=amounts.at(-1),prev=amounts.at(-2);
      const rewardLike=Math.abs(+last.value||0)<=5 && Math.abs(+prev.value||0)>=5;
      pick=rewardLike?prev:amounts[0];
    }else pick=amounts[0];
    if(!pick||!Number.isFinite(+pick.value)||Math.abs(+pick.value)<=.004)continue;
    const row=stmtMakeRow(cardId,di,seg,pick,i,profile.id,seen,true);if(!row)continue;
    row.sourceEnd=i;row.physicalKey=`HALK|${i}|${row.semanticKey}`;row.parserStrategy='halkbank-fixed-row';rows.push(row)
  }
  return stmtDropChronologyBreakingDuplicates(rows)
}


// V84: Halkbank coordinate-table final parser.
// V79 koordinat motorunun ürettiği satırlar zaten fiziksel tablo satırlarıdır.
// Bunları eski multiline parser'a tekrar sokmak açıklamaların komşu işlemlerle birleşmesine neden oluyordu.
// Marker varsa her tarihli satır bağımsız ve nihai işlem kabul edilir.
function stmtParseHalkbankCoordinateEngine(text,cardId,profile){
  if(profile?.id!=='halkbank'||!String(text||'').includes('__HANE_HALKBANK_TABLE_ENGINE__'))return[];
  const anchor=stmtAnchorInfo(text),rows=[],seen={};
  const lines=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\s+(.+)$/);if(!m)continue;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;
    const seg=m[2].trim();if(stmtCarryForwardLike(seg))continue;
    const amounts=stmtAmountCandidates(seg).sort((a,b)=>a.index-b.index);if(!amounts.length)continue;
    let pick=null;
    const explicit=amounts.filter(a=>['TL','TRY','₺'].includes(a.currency));
    if(explicit.length)pick=explicit[0];
    else if(amounts.length>=2){
      const last=amounts.at(-1),prev=amounts.at(-2);
      const rewardLike=Math.abs(+last.value||0)<=5&&Math.abs(+prev.value||0)>=5;
      pick=rewardLike?prev:amounts[0];
    }else pick=amounts[0];
    if(!pick||!Number.isFinite(+pick.value)||Math.abs(+pick.value)<=.004)continue;
    const row=stmtMakeRow(cardId,di,seg,pick,500000+i,profile.id,seen,true);if(!row)continue;
    row.sourceEnd=500000+i;row.physicalKey=`HALKCOORD|${i}|${row.semanticKey}`;row.parserStrategy='halkbank-coordinate-final';rows.push(row)
  }
  return stmtDropChronologyBreakingDuplicates(rows)
}

function stmtParseTebFixedEngine(text,cardId,profile){
  if(profile?.id!=='teb')return[];
  const anchor=stmtAnchorInfo(text),rows=[],seen={},lines=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){
    const line=lines[i],m=line.match(/^(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\s+(.+)$/);if(!m)continue;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;
    const rest=m[2].trim();if(stmtCarryForwardLike(rest))continue;
    // TEB SADE ekstrelerinde gerçek hareket tutarı satırın sonundaki TL. tutarıdır.
    // Örn: TL.300,- / TL.2.297,40 / -TL.14.826,69. Başka sayıları tutar sayma.
    const end=rest.match(/([+-]?\s*(?:TL|TRY|₺)\.?\s*[+-]?\s*(?:(?:\d{1,3}(?:[.]\d{3})+|\d+)(?:,\d{2}|,-)?))\s*$/i);
    if(!end)continue;
    const raw=end[1],value=stmtMoney(raw);if(!Number.isFinite(value)||value===0)continue;
    const pick={raw,value,index:Math.max(0,rest.length-end[0].length),currency:'TL',score:1000};
    const row=stmtMakeRow(cardId,di,rest,pick,i,profile.id,seen,true);if(!row)continue;
    row.sourceEnd=i;row.physicalKey=`TEB|${i}|${row.semanticKey}`;row.parserStrategy='teb-fixed-final-tl';rows.push(row)
  }
  return rows
}

// TEB SADE için tarih segmenti motoru: toplam satırları hiçbir zaman işlem tutarı olamaz.
function stmtParseTebSegmentEngine(text,cardId,profile){
  if(profile?.id!=='teb')return[];
  const anchor=stmtAnchorInfo(text),rows=[],seen={};
  let flat=String(text||'').replace(/\r/g,' ').replace(/\n/g,' ').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
  // İşlem tablosundan önceki özet ve işlem tablosundan sonraki toplam/bilgilendirme alanlarını kes.
  const tablePos=flat.search(/İŞLEM\s+TARİHİ\s+İŞLEM\s+AÇIKLAMASI\s+TUTAR/i);
  if(tablePos>=0)flat=flat.slice(tablePos);
  const stopPos=flat.search(/BU\s+KARTINIZLA\s+YAPILAN\s+İŞLEM\s+TOPLAMLARI|GENEL\s+TOPLAM|Kart'a\s+ait\s+MN/i);
  if(stopPos>=0)flat=flat.slice(0,stopPos);
  const dateRx=/(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))/g;
  const hits=[...flat.matchAll(dateRx)];
  for(let j=0;j<hits.length;j++){
    const start=hits[j].index,end=j+1<hits.length?hits[j+1].index:flat.length;
    const dateRaw=hits[j][1],di=stmtDateInfo(dateRaw,anchor);if(!di)continue;
    let seg=flat.slice(start,end).trim();
    if(stmtCarryForwardLike(seg))continue;
    // TEB hareket tutarı, segment içindeki TL. formatlı son parasal değerdir.
    // Segment sonuna toplam satırları ulaşamaz; yukarıda kesin kesildi.
    const vals=[...seg.matchAll(/-?\s*(?:TL|TRY|₺)\.?\s*[+-]?\s*(?:(?:\d{1,3}(?:[.]\d{3})+|\d+)(?:,\d{2}|,-)?)/gi)];
    if(!vals.length)continue;
    const m=vals.at(-1),raw=m[0],value=stmtMoney(raw);if(!Number.isFinite(value)||value===0)continue;
    const pick={raw,value,index:m.index||0,currency:'TL',score:1200};
    const row=stmtMakeRow(cardId,di,seg,pick,start,profile.id,seen,true);if(!row)continue;
    row.sourceEnd=end;row.physicalKey=`TEBSEG|${start}|${row.semanticKey}`;row.parserStrategy='teb-date-segment';rows.push(row)
  }
  return rows
}
function stmtParseProfileLayoutEngine(text,cardId,profile){
  if(!['denizbank','teb','isbank'].includes(profile?.id))return[];
  const anchor=stmtAnchorInfo(text),rows=[],seen={},lines=String(text||'').replace(/\r/g,'\n').split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){
    const line=lines[i],m=line.match(/^(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\s+(.+)$/);if(!m)continue;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;const rest=m[2].trim(),u=rest.toLocaleUpperCase('tr-TR');
    if(profile.id==='isbank'&&/MAX[Iİ]PUAN\s*[Iİ]LAVE/.test(u))continue;
    if(stmtCarryForwardLike(rest))continue;
    const amounts=stmtAmountCandidates(rest).sort((a,b)=>a.index-b.index),pick=stmtPickAmountForProfile(profile,rest,amounts);if(!pick)continue;
    const row=stmtMakeRow(cardId,di,rest,pick,i,profile.id,seen,true);if(!row)continue;
    row.sourceEnd=i;row.physicalKey=`PL|${i}|${row.semanticKey}`;row.parserStrategy='profile-layout';rows.push(row)
  }
  return rows
}
function stmtStrategyQuality(rows,text,profile,kind){
  const r=rows||[],raw=parseStatementSummary(text),sum=(k)=>r.filter(x=>x.kind===k).reduce((a,x)=>a+Math.abs(+x.amount||0),0);let score=r.length*3;
  const checks=[['spendingTotal','spend',60],['paymentsTotal','payment',35],['feesTotal','fee',30]];for(const [mk,rk,w] of checks){if(Number.isFinite(+raw?.[mk])){const diff=Math.abs((+raw[mk])-sum(rk));score+=Math.max(0,w-Math.min(w,diff*2))}}
  for(let i=1;i<r.length;i++)if(r[i-1].date>r[i].date)score-=8;score-=r.filter(x=>!stmtValidIsoDate(x.date)||!Number.isFinite(+x.amount)||Math.abs(+x.amount)<=0).length*25;if(profile.preferLine&&kind==='line')score+=10;return score
}


function stmtHalkbankPostProcess(text,cardId,rows,profile){
  let out=[...(rows||[])];if(profile?.id!=='halkbank')return out;
  const anchor=stmtAnchorInfo(text),rawText=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' '),lines=rawText.split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean),seen={};
  const addPayment=(di,src,sourceStart,strategy)=>{
    if(!di||!stmtPaymentLike(src))return;
    const amounts=stmtAmountCandidates(src).sort((a,b)=>a.index-b.index);if(!amounts.length)return;
    // Halkbank ödeme satırında önceki dönem borcu / ParafPara gibi başka sayılar aynı blokta bulunabilir.
    // Bu nedenle tutarı genel ilk-sayı kuralından değil, ödeme ifadesinden SONRAKİ ilk sıfır-olmayan parasal değerden seç.
    const up=String(src||'').toLocaleUpperCase('tr-TR');
    const km=up.match(/ÖDEME\s*-?\s*TEŞEKK|ODEME\s*-?\s*TESEKK|HESAPTAN\s+ÖDEME|HESAPTAN\s+ODEME|KART\s*ÖDEMESİ|KART\s*ODEMESI|BORÇ\s*ÖDEME|BORC\s*ODEME/);
    let pick=null;
    if(km){
      const kpos=km.index+km[0].length;
      const after=amounts.filter(a=>a.index>=kpos&&Number.isFinite(+a.value)&&Math.abs(+a.value)>.004);
      if(after.length)pick=after[0];
    }
    if(!pick){
      // Artı işaretli değer Halkbank'ta kart ödemesinin güçlü göstergesidir.
      const signed=amounts.find(a=>/\+/.test(String(a.raw||''))&&Number.isFinite(+a.value)&&Math.abs(+a.value)>.004);
      pick=signed||stmtPickAmountForProfile(profile,src,amounts);
    }
    if(!pick)return;
    const amount=Math.abs(+pick.value||0);if(!Number.isFinite(amount)||amount<=0)return;
    const exists=out.some(r=>r?.kind==='payment'&&r.date===di.date&&Math.abs(Math.abs(+r.amount||0)-amount)<.005);if(exists)return;
    // Devir/önceki dönem borcu aynı mantıksal blokta ödeme ile birleşmiş olabilir.
    // stmtMakeRow tüm bloğu devir bilgisi sanıp null döndürmesin diye yalnız ödeme kısmını kullan.
    let paymentSrc=String(src||'');
    const payStart=paymentSrc.toLocaleUpperCase('tr-TR').search(/HESAPTAN\s+[ÖO]DEME|[ÖO]DEME\s*-?\s*TE[ŞS]EKK|KART\s*[ÖO]DEMES[Iİ]|BOR[ÇC]\s*[ÖO]DEME/);
    if(payStart>=0)paymentSrc=paymentSrc.slice(payStart).trim();
    let row=stmtMakeRow(cardId,di,paymentSrc,pick,sourceStart,profile.id,seen,false);
    if(!row){
      // Son emniyet: Halkbank ödeme olduğu kesinleştiyse devir filtresini bypass ederek ödeme satırını doğrudan oluştur.
      const title='HESAPTAN ÖDEME';
      const baseFp=stmtFingerprint(cardId,di.date,title,-amount),semanticKey=`${baseFp}|payment|0/0/0.00`,occ=(seen[semanticKey]=(seen[semanticKey]||0)+1);
      row={date:di.date,title,amount,category:'Kart Ödemesi',baseFp,semanticKey,rawKey:String(paymentSrc).toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim(),physicalKey:sourceStart!=null?`LN|${sourceStart}|${semanticKey}`:null,sourceStart,sourceEnd:sourceStart,occurrence:occ,fp:`${semanticKey}|#${occ}`,checked:true,refund:false,payment:true,kind:'payment',installmentNo:null,installmentCount:null,installmentTotal:null,bankProfile:profile.id};
    }
    row.kind='payment';row.payment=true;row.refund=false;row.category='Kart Ödemesi';row.amount=amount;row.parserStrategy=strategy;out.push(row)
  };
  // Tarih aynı satırda ya da tek başına olabilir; sonraki fiziksel satırlar ödeme açıklamasının devamı sayılır.
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))(?:\s+(.+))?$/);if(!m)continue;
    const di=stmtDateInfo(m[1],anchor);if(!di)continue;
    let parts=[];if(m[2])parts.push(m[2]);
    for(let j=i+1;j<Math.min(lines.length,i+6);j++){
      if(/^\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2})\b/.test(lines[j]))break;
      if(/TÜRKİYE\s+HALK\s+BANKASI|TURKIYE\s+HALK\s+BANKASI|MERSİS|MERSIS|PARAF\.COM\.TR/i.test(lines[j]))break;
      parts.push(lines[j]);
    }
    addPayment(di,parts.join(' ').replace(/\s+/g,' ').trim(),i,'halkbank-payment-line-rescue')
  }
  // PDF.js bazı Halkbank ekstrelerinde tarihi ve ödeme metnini ayrı bloklara koyar.
  // Her tarih işaretinden bir sonraki tarihe kadar olan bölümü ayrıca tara.
  const dateRx=/(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))/g,matches=[];let dm;
  while((dm=dateRx.exec(rawText))!==null)matches.push({raw:dm[1],index:dm.index,end:dateRx.lastIndex});
  for(let i=0;i<matches.length;i++){
    const cur=matches[i],next=matches[i+1],di=stmtDateInfo(cur.raw,anchor);if(!di)continue;
    const seg=rawText.slice(cur.end,next?next.index:Math.min(rawText.length,cur.end+600)).replace(/\s+/g,' ').trim();
    if(!seg)continue;
    addPayment(di,seg,100000+i,'halkbank-payment-segment-rescue')
  }
  // Son koruma: Halkbank'ın tablo satırı tek parça geldiyse, ödeme ifadesi ve tutarı doğrudan satırdan yakala.
  const flatPayRx=/(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\s+([^\n]{0,180}?(?:HESAPTAN\s+[ÖO]DEME|[ÖO]DEME\s*-?\s*TE[ŞS]EKK[^\n]{0,80}))\s+([+\-]?\s*(?:\d{1,3}(?:[.,]\d{3})*|\d+)(?:[.,]\d{2})\s*\+?)/giu;
  let pm;
  while((pm=flatPayRx.exec(rawText))!==null){
    const di=stmtDateInfo(pm[1],anchor);if(!di)continue;
    const val=stmtMoney(pm[3]);if(!Number.isFinite(val)||Math.abs(val)<=.004)continue;
    const pick={raw:pm[3],value:val,index:Math.max(0,pm[0].lastIndexOf(pm[3])),currency:'TL',score:2000};
    const exists=out.some(r=>r?.kind==='payment'&&r.date===di.date&&Math.abs(Math.abs(+r.amount||0)-Math.abs(val))<.005);
    if(exists)continue;
    let flatSrc=String(pm[0]||'');
    const flatStart=flatSrc.toLocaleUpperCase('tr-TR').search(/HESAPTAN\s+[ÖO]DEME|[ÖO]DEME\s*-?\s*TE[ŞS]EKK/);
    if(flatStart>=0)flatSrc=flatSrc.slice(flatStart).trim();
    let row=stmtMakeRow(cardId,di,flatSrc,pick,200000+pm.index,profile.id,seen,false);
    if(!row){
      const amount=Math.abs(val),title='HESAPTAN ÖDEME',baseFp=stmtFingerprint(cardId,di.date,title,-amount),semanticKey=`${baseFp}|payment|0/0/0.00`,occ=(seen[semanticKey]=(seen[semanticKey]||0)+1);
      row={date:di.date,title,amount,category:'Kart Ödemesi',baseFp,semanticKey,rawKey:String(flatSrc).toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim(),physicalKey:`LN|${200000+pm.index}|${semanticKey}`,sourceStart:200000+pm.index,sourceEnd:200000+pm.index,occurrence:occ,fp:`${semanticKey}|#${occ}`,checked:true,refund:false,payment:true,kind:'payment',installmentNo:null,installmentCount:null,installmentTotal:null,bankProfile:profile.id};
    }
    row.kind='payment';row.payment=true;row.refund=false;row.category='Kart Ödemesi';row.amount=Math.abs(val);row.parserStrategy='halkbank-payment-flat-rescue';out.push(row)
  }
  // V72: Halkbank carry-forward first-transaction rescue.
  // Some Paraf statements place the first real purchase in the same logical PDF block
  // immediately after "Bir Önceki Dönem Ekstre Borcu". Generic carry-forward filtering
  // can drop that first dated row. Recover only the first dated non-payment transaction
  // after the carry-forward marker and keep the carry-forward line itself excluded.
  try{
    const srcCarry=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ');
    const upCarry=srcCarry.toLocaleUpperCase('tr-TR');
    const carryMatch=upCarry.match(/B[İI]R\s+[ÖO]NCEK[İI]\s+D[ÖO]NEM(?:\s+\([^)]*\))?\s+EKSTRE\s+BORCU|[ÖO]NCEK[İI]\s+D[ÖO]NEM\s+EKSTRE\s+BORCU/);
    if(carryMatch){
      const start=(carryMatch.index||0)+carryMatch[0].length;
      const tail=srcCarry.slice(start,start+2600);
      const firstDate=tail.match(/(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))/);
      if(firstDate){
        const di=stmtDateInfo(firstDate[1],anchor);
        if(di){
          const segStart=(firstDate.index||0)+firstDate[0].length;
          const rest=tail.slice(segStart);
          const nextDate=rest.match(/\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2})/);
          let seg=rest.slice(0,nextDate?nextDate.index:Math.min(rest.length,700)).replace(/\s+/g,' ').trim();
          if(seg && !stmtPaymentLike(seg) && !stmtCarryForwardLike(seg)){
            const amounts=stmtAmountCandidates(seg).sort((a,b)=>a.index-b.index);
            // Halkbank row usually ends with transaction amount + ParafPara.
            // Prefer the largest non-zero monetary value to avoid picking 0.05 / 0.00 reward values.
            const valid=amounts.filter(a=>Number.isFinite(+a.value)&&Math.abs(+a.value)>.004);
            let pick=null;
            if(valid.length){
              pick=valid.reduce((best,a)=>!best||Math.abs(+a.value)>Math.abs(+best.value)?a:best,null);
            }
            if(pick){
              const amount=Math.abs(+pick.value||0);
              const exists=out.some(r=>r?.date===di.date&&r?.kind!=='payment'&&Math.abs(Math.abs(+r.amount||0)-amount)<.005);
              if(!exists){
                const rescueSeen={};
                let row=stmtMakeRow(cardId,di,seg,pick,400000+start+(firstDate.index||0),profile.id,rescueSeen,false);
                if(row){
                  row.parserStrategy='halkbank-carry-first-transaction-rescue';
                  row.sourceStart=400000+start+(firstDate.index||0);
                  row.sourceEnd=row.sourceStart;
                  out.push(row);
                }
              }
            }
          }
        }
      }
    }
  }catch(_e){}

  // V71: Halkbank summary-backed payment rescue.
  // Açıklama biçimi değişse bile banka özetindeki Dönemsel Alacak Kayıtları / ödeme toplamı
  // işlem tablosunda aynı tutarlı, tarihli ve ödeme yönlü (+ / ödeme / tahsilat / aktarım) hareketi doğrular.
  try{
    const sm=parseStatementSummary(text);
    const target=Number(sm?.paymentsTotal);
    const current=out.filter(r=>r?.kind==='payment').reduce((a,r)=>a+Math.abs(+r.amount||0),0);
    if(Number.isFinite(target)&&target>0&&Math.abs(current-target)>.02){
      const anchor2=stmtAnchorInfo(text),src2=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ');
      const dr=/\b(\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2}))\b/g,ds=[];let z;
      while((z=dr.exec(src2))!==null)ds.push({raw:z[1],index:z.index,end:dr.lastIndex});
      for(let i=0;i<ds.length;i++){
        const d=ds[i],n=ds[i+1],di=stmtDateInfo(d.raw,anchor2);if(!di)continue;
        const seg=src2.slice(d.end,n?n.index:Math.min(src2.length,d.end+700)).replace(/\s+/g,' ').trim();
        if(!seg)continue;
        const am=stmtAmountCandidates(seg).filter(a=>Math.abs(Math.abs(+a.value||0)-target)<.02);if(!am.length)continue;
        const u=seg.toLocaleUpperCase('tr-TR');
        const payCue=stmtPaymentLike(seg)||/TAHS[İI]LAT|ALACAK|AKTARIM|BOR[ÇC].{0,20}[ÖO]DEME/.test(u)||am.some(a=>/\+/.test(String(a.raw||'')));
        if(!payCue)continue;
        const exists=out.some(r=>r?.kind==='payment'&&r.date===di.date&&Math.abs(Math.abs(+r.amount||0)-target)<.02);if(exists)break;
        const title='HESAPTAN ÖDEME',baseFp=stmtFingerprint(cardId,di.date,title,-target),semanticKey=`${baseFp}|payment|0/0/0.00`,occ=1;
        out.push({date:di.date,title,amount:target,category:'Kart Ödemesi',baseFp,semanticKey,rawKey:String(seg).toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim(),physicalKey:`SUM|${d.index}|${semanticKey}`,sourceStart:300000+d.index,sourceEnd:300000+d.index,occurrence:occ,fp:`${semanticKey}|#${occ}`,checked:true,refund:false,payment:true,kind:'payment',installmentNo:null,installmentCount:null,installmentTotal:null,bankProfile:profile.id,parserStrategy:'halkbank-summary-payment-rescue'});
        break;
      }
    }
  }catch(_e){}
  // V76: Halkbank footer guard daraltıldı.
  // Gerçek vergi/faiz satırlarının rawKey sonuna "Bir Sonraki..." metni yapışabilir.
  // Bu nedenle yalnızca görünen işlem başlığı gerçekten footer ile BAŞLIYORSA silinir.
  out=out.filter(r=>{
    if(!r||r.kind==='payment')return true;
    const title=String(r.title||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim();
    const own=`${r.title||''} ${r.rawKey||''}`.toLocaleUpperCase('tr-TR').replace(/\s+/g,' ');
    const feeCue=/\b(KKDF|BSMV|BSMW)\b|FA[İI]Z|VERG[İI]|[ÜU]CRET|KOM[İI]SYON/.test(title);
    // V77: Banka özetindeki "Toplam Faiz, Ücret, Vergiler" gerçek hareket değildir.
    // Bu satır yalnız uzlaştırma toplamıdır; işlem listesine giremez.
    const feeSummary=/^TOPLAM\s+FA[İI]Z(?:\s*,?\s*[ÜU]CRET)?(?:\s*,?\s*VERG[İI]LER?)?\b/.test(title)
      ||/TOPLAM\s+FA[İI]Z.{0,40}(?:[ÜU]CRET|VERG[İI])/.test(own);
    if(feeSummary)return false;
    // Vergi/faiz/ücret işlemi ise footer metni rawKey'e yapışmış olsa da koru.
    if((r.kind==='fee'||r.category==='Vergi & Faiz'||feeCue)&&!/^\s*(B[İI]R\s+SONRAK[İI]|HESAP\s+KES[İI]M|SON\s+[ÖO]DEME)/.test(title))return true;
    const footerStart=/^(?:B[İI]R\s+SONRAK[İI](?:\s+HESAP\s+KES[İI]M|\s+SON\s+[ÖO]DEME)?|HESAP\s+KES[İI]M(?:\s+TAR[İI]H[İI])?|SON\s+[ÖO]DEME(?:\s+TAR[İI]H[İI])?|HESAP\s+BAK[İI]YES[İI]|D[ÖO]NEM\s+BORCU|GENEL\s+TOPLAM|ARA\s+TOPLAM|TOPLAM\b)/.test(title);
    const weekday=/\b(PAZARTES[İI]|SALI|[ÇC]AR[ŞS]AMBA|PER[ŞS]EMBE|CUMA|CUMARTES[İI]|PAZAR)\b/.test(own);
    // V78: Halkbank bazen footer tarihini işlem başlığına yalnızca "Hesap : Perşembe"
    // şeklinde taşır. Bu, sonraki hesap kesim özetidir ve gerçek hareket değildir.
    const compactAccountDay=/^HESAP\s*:\s*(?:PAZARTES[İI]|SALI|[ÇC]AR[ŞS]AMBA|PER[ŞS]EMBE|CUMA|CUMARTES[İI]|PAZAR)\b/.test(title);
    if(compactAccountDay)return false;
    if(footerStart&&(weekday||/^(?:B[İI]R\s+SONRAK[İI]|HESAP\s+KES[İI]M|SON\s+[ÖO]DEME|GENEL\s+TOPLAM|ARA\s+TOPLAM|TOPLAM\b)/.test(title)))return false;
    return true;
  });
  out.sort((a,b)=>(a.sourceStart??Number.MAX_SAFE_INTEGER)-(b.sourceStart??Number.MAX_SAFE_INTEGER));
  return out
}

function stmtZiraatPostProcess(text,cardId,rows,profile){
  let out=[...(rows||[])];
  const upper=v=>String(v||'').toLocaleUpperCase('tr-TR');
  const zFeeRx=/\bKKDF\b|\bBSMV\b|\bBSMW\b|TAKSİT(?:LENDİRME)?\s+FAİZ|TAKSIT(?:LENDIRME)?\s+FAIZ|PEŞİNE\s+TAKSİT\s+FAİZ|PESINE\s+TAKSIT\s+FAIZ|KREDİ\s+(?:KARTI\s+)?FAİZ|KREDI\s+(?:KARTI\s+)?FAIZ|GECİKME\s+FAİZ|GECIKME\s+FAIZ|ALIŞVERİŞ\s+FAİZ|ALISVERIS\s+FAIZ/;
  const zFeeLabel=(v)=>{
    const u=upper(v).replace(/\s+/g,' ');
    if(/TAKSİT(?:LENDİRME)?\s+FAİZ|TAKSIT(?:LENDIRME)?\s+FAIZ|PEŞİNE\s+TAKSİT\s+FAİZ|PESINE\s+TAKSIT\s+FAIZ/.test(u))return 'TAKSİT FAİZİ';
    if(/KREDİ\s+(?:KARTI\s+)?FAİZ|KREDI\s+(?:KARTI\s+)?FAIZ/.test(u))return 'KREDİ FAİZİ';
    if(/GECİKME\s+FAİZ|GECIKME\s+FAIZ/.test(u))return 'GECİKME FAİZİ';
    if(/ALIŞVERİŞ\s+FAİZ|ALISVERIS\s+FAIZ/.test(u))return 'ALIŞVERİŞ FAİZİ';
    if(/\bKKDF\b/.test(u))return 'KKDF';
    if(/\bBSMV\b|\bBSMW\b/.test(u))return 'BSMV';
    return '';
  };
  // Sınıflandırma ve görünen ad yalnızca ilgili hareketin kendi ham metninden belirlenir.
  for(const r of out){
    const own=upper(`${r?.title||''} ${r?.rawKey||''}`);
    if(r?.kind!=='payment'&&zFeeRx.test(own)){
      r.kind='fee';r.category='Vergi & Faiz';r.refund=false;r.payment=false;
      const label=zFeeLabel(own);if(label)r.title=label;
    }
  }
  // Aynı Ziraat faiz satırı parser katmanlarından iki kez geldiyse tekilleştir.
  // Böylece "Kredi faizi" + "Kredi faizi faizi" gibi yankılar oluşmaz.
  const feeSeen=new Set(),feeClean=[];
  for(const r of out){
    if(r?.kind==='fee'){
      const label=zFeeLabel(`${r.title||''} ${r.rawKey||''}`)||upper(r.title||'').replace(/\bFAİZİ?\s+FAİZİ?\b/g,'FAİZİ').trim();
      if(label)r.title=label;
      const key=`${r.date}|${Math.abs(+r.amount||0).toFixed(2)}|${label}`;
      if(label&&feeSeen.has(key))continue;
      if(label)feeSeen.add(key);
    }
    feeClean.push(r)
  }
  out=feeClean;
  // PDF.js/OCR aynı vergi satırını aynen iki kez üretirse yalnızca parser yankısını temizle.
  // Aynı tarih+tutar fakat farklı ham satırlar gerçek iki hareket olabilir; onlara dokunma.
  const seen=new Map(),dedup=[];
  for(const r of out){
    const own=upper(`${r?.title||''} ${r?.rawKey||''}`),isTax=/\b(?:BSMV|BSMW|KKDF)\b/.test(own);
    if(r?.kind==='fee'&&isTax){
      const rawNorm=upper(r.rawKey||'').replace(/\s+/g,' ').trim();
      if(rawNorm){
        const key=`${r.date}|${Math.abs(+r.amount||0).toFixed(2)}|${rawNorm}`;
        if(seen.has(key))continue;
        seen.set(key,true);
      }
    }
    dedup.push(r)
  }
  out=dedup;
  // Seçilen parser taksit faizi satırını kaçırdıysa, yalnızca açıkça tarih+taksit faizi+tutar içeren
  // Ziraat bloğundan eksik kaydı tamamla. Başlık/özet metninden kayıt üretme.
  // Ana parser gerçek bir Taksit Faizi kaydı bulduysa kurtarma katmanı hiç çalışmaz.
  // Bu, aynı günkü Kredi Faizi tutarının yanlışlıkla ikinci bir Taksit Faizi olarak eklenmesini engeller.
  const hasInstallmentInterest=out.some(x=>x?.kind==='fee'&&/(?:TAKSİT|TAKSIT).*(?:FAİZ|FAIZ)/.test(upper(`${x.title||''} ${x.rawKey||''}`)));
  if(!hasInstallmentInterest){
    const anchor=stmtAnchorInfo(text),blocks=stmtLogicalBlocks(text,anchor),occSeen={};
    for(const b of blocks){
      const src=String((b.lines||[]).join(' ')),u=upper(src);
      if(!/(?:TAKSİT(?:LENDİRME)?\s+FAİZ|TAKSIT(?:LENDIRME)?\s+FAIZ|PEŞİNE\s+TAKSİT\s+FAİZ|PESINE\s+TAKSIT\s+FAIZ)/.test(u))continue;
      const amounts=stmtAmountCandidates(src),pick=stmtPickAmountForProfile(profile,src,amounts);if(!pick)continue;
      const di={date:b.date};if(!stmtValidIsoDate(di.date))continue;
      const row=stmtMakeRow(cardId,di,src,pick,b.sourceStart,profile.id,occSeen,false);if(!row)continue;
      row.kind='fee';row.category='Vergi & Faiz';row.refund=false;row.payment=false;row.title='TAKSİT FAİZİ';row.parserStrategy='ziraat-fee-supplement';
      // Kurtarma kaydı, başka bir faiz türünün aynı tarih+tutarını kopyalayamaz.
      const conflictsOtherFee=out.some(x=>x?.kind==='fee'&&x.date===row.date&&Math.abs(Math.abs(+x.amount||0)-Math.abs(+row.amount||0))<.005&&!/(?:TAKSİT|TAKSIT).*(?:FAİZ|FAIZ)/.test(upper(`${x.title||''} ${x.rawKey||''}`)));
      if(!conflictsOtherFee)out.push(row)
      break;
    }
  }
  out.sort((a,b)=>(a.sourceStart??Number.MAX_SAFE_INTEGER)-(b.sourceStart??Number.MAX_SAFE_INTEGER));
  return out
}
function parseStatementText(text,cardId){
  const profile=stmtBankProfile(text,cardId),line=stmtParseLineEngine(text,cardId,profile),block=stmtParseBlockEngine(text,cardId,profile),profileRows=stmtParseProfileLayoutEngine(text,cardId,profile),denizRows=stmtParseDenizBankFixedEngine(text,cardId,profile),halkCoordRows=stmtParseHalkbankCoordinateEngine(text,cardId,profile),halkRows=stmtParseHalkbankFixedEngine(text,cardId,profile),tebRows=stmtParseTebFixedEngine(text,cardId,profile),tebSegRows=stmtParseTebSegmentEngine(text,cardId,profile),ls=stmtStrategyQuality(line,text,profile,'line'),bs=stmtStrategyQuality(block,text,profile,'block'),ps=stmtStrategyQuality(profileRows,text,profile,'profile'),hs=stmtStrategyQuality(halkRows,text,profile,'halk-fixed');
  let rows=line,strategy='common-line',best=ls;if(bs>best){rows=block;strategy='common-block';best=bs}if(ps>best){rows=profileRows;strategy='profile-layout';best=ps}
  // DenizBank'ta fiyat yalnızca en sağdaki İşlem Tutarı sütunundan alınır; Bonus/Kalan Borç sütunları yok sayılır.
  if(profile.id==='denizbank'&&denizRows.length>=3){rows=denizRows;strategy='deniz-fixed-right-column'}
  else if(profile.id==='halkbank'&&halkCoordRows.length>=1){rows=halkCoordRows;strategy='halkbank-coordinate-final'}
  else if(profile.id==='halkbank'&&halkRows.length>=3&&(halkRows.length>rows.length||hs>=best-2)){rows=halkRows;strategy='halkbank-fixed-row';best=hs}
  else if(profile.id==='teb'&&tebSegRows.length>=3){rows=tebSegRows;strategy='teb-date-segment'}
  else if(profile.id==='teb'&&tebRows.length>=3){rows=tebRows;strategy='teb-fixed-final-tl'}
  else if(profile.id==='isbank'&&profileRows.length>=3){rows=profileRows;strategy='profile-layout'}
  if(profile.id==='halkbank'){
    const coordFinal=String(text||'').includes('__HANE_HALKBANK_TABLE_ENGINE__')&&strategy==='halkbank-coordinate-final';
    // Koordinat motoru fiziksel tablonun kendisidir. Eski rescue/footer yamalarını yeniden çalıştırmak
    // temiz satırları bozabiliyordu. Legacy post-process yalnız koordinat motoru yoksa fallback olarak kalır.
    if(!coordFinal)rows=stmtHalkbankPostProcess(text,cardId,rows,profile);
  }
  if(profile.id==='ziraat')rows=stmtZiraatPostProcess(text,cardId,rows,profile);
  rows.forEach(r=>{r.bankProfile=profile.id;if(!r.parserStrategy)r.parserStrategy=strategy});return rows
}

function stmtParseLooseMoney(v){return stmtMoney(v)}
function parseStatementSummary(text){
  const src=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' '),flat=src.replace(/\s+/g,' '),lines=src.split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const profile=stmtBankProfile(text);
  if(profile.summary){
    const mv='[+-]?(?:(?:\\d{1,3}(?:[.,]\\d{3})+)(?:[.,]\\d{2})?|\\d+(?:[.,]\\d{2}))';
    const grab=rx=>{const src=rx.source.replace('{M}',mv),m=flat.match(new RegExp(src,rx.flags||'i'));return m?stmtMoney(m[1]):null};
    const previousBalance=grab(profile.summary.previousBalance),spendingTotal=grab(profile.summary.spendingTotal),feesTotal=grab(profile.summary.feesTotal),paymentsTotal=grab(profile.summary.paymentsTotal),periodDebt=grab(profile.summary.periodDebt);
    if([previousBalance,spendingTotal,feesTotal,paymentsTotal,periodDebt].some(Number.isFinite))return{previousBalance,spendingTotal,feesTotal,paymentsTotal,periodDebt}
  }
  const moneyRe=/(-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2}))\s*(?:TL|TRY|₺)?/gi;
  const values=line=>[...String(line||'').matchAll(moneyRe)].map(m=>stmtParseLooseMoney(m[1])).filter(v=>Number.isFinite(v));
  const find=(rx)=>{for(const line of lines){rx.lastIndex=0;if(!rx.test(line))continue;rx.lastIndex=0;const vals=values(line);if(vals.length)return vals.at(-1)}return null};
  // Bazı banka PDF'leri özet kutularını metin katmanında farklı sırada düzleştirir.
  // Bu ilk okuma sadece aday üretir; aşağıdaki normalizeStatementSummary fonksiyonu
  // işlem satırları + muhasebe eşitliği ile adayları yeniden doğrular.
  const near=(labelRx)=>{const m=flat.match(labelRx);if(!m)return null;const tail=flat.slice((m.index||0)+m[0].length,(m.index||0)+m[0].length+90),vals=values(tail);return vals.length?vals[0]:null};
  const previousBalance=near(/(?:DEVREDEN\s+BAK[İI]YE|[ÖO]NCEK[İI]\s+AYDAN\s+DEV[İI]R)/i)??find(/(?:DEVREDEN\s+BAK[İI]YE|[ÖO]NCEK[İI]\s+AYDAN\s+DEV[İI]R)/i);
  const spendingTotal=near(/(?:HARCAMALAR(?:INIZ)?|TOPLAM\s+HARCAMA|HARCAMALAR\s+TOPLAMI|D[ÖO]NEM\s+[İI]Ç[İI]\s+HARCAMA|D[ÖO]NEM\s+HARCAMALARI)/i)??find(/(?:HARCAMALAR(?:INIZ)?|TOPLAM\s+HARCAMA|HARCAMALAR\s+TOPLAMI|D[ÖO]NEM\s+[İI]Ç[İI]\s+HARCAMA|D[ÖO]NEM\s+HARCAMALARI)/i);
  const feesTotal=near(/(?:FA[İI]Z\s*[ÜU]CRETLER\s*VE\s*KES[İI]NT[İI]LER|FA[İI]Z\s*VE\s*[ÜU]CRETLER|[ÜU]CRET\s*VE\s*KES[İI]NT[İI]LER)/i)??find(/(?:FA[İI]Z\s*[ÜU]CRETLER\s*VE\s*KES[İI]NT[İI]LER|FA[İI]Z\s*VE\s*[ÜU]CRETLER|[ÜU]CRET\s*VE\s*KES[İI]NT[İI]LER)/i);
  const paymentsTotal=near(/(?:[ÖO]DEMELER[İI]N[İI]Z|[ÖO]DEMELER\s+TOPLAMI)/i)??find(/(?:[ÖO]DEMELER[İI]N[İI]Z|[ÖO]DEMELER\s+TOPLAMI)/i);
  const periodDebt=near(/(?:D[ÖO]NEM\s+BORCU|HESAP\s+[ÖO]ZET[İI]\s+BORCU|EKSTRE\s+BORCU|TOPLAM\s+BOR[ÇC])/i)??find(/(?:D[ÖO]NEM\s+BORCU|HESAP\s+[ÖO]ZET[İI]\s+BORCU|EKSTRE\s+BORCU|TOPLAM\s+BOR[ÇC])/i);
  return{previousBalance,spendingTotal,feesTotal,paymentsTotal,periodDebt}
}
function stmtAllMoneyValues(text){
  const re=/(-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2}))\s*(?:TL|TRY|₺)?/gi;
  return [...String(text||'').matchAll(re)].map(m=>stmtParseLooseMoney(m[1])).filter(v=>Number.isFinite(v)&&Math.abs(v)<1e9)
}
function normalizeStatementSummary(text,rows,raw){
  const meta={...(raw||{})},round2=n=>Math.round((+n||0)*100)/100,finite=n=>Number.isFinite(+n);
  const detectedBank=stmtDetectBank(text,statementImportCardId||'');
  const pays=(rows||[]).filter(r=>r?.kind==='payment').reduce((a,r)=>a+Math.abs(+r.amount||0),0);
  const paymentCount=(rows||[]).filter(r=>r?.kind==='payment').length;
  const parsedFees=round2((rows||[]).filter(r=>r?.kind==='fee').reduce((a,r)=>a+Math.abs(+r.amount||0),0));
  const parsedSpend=round2((rows||[]).filter(r=>r?.kind==='spend').reduce((a,r)=>a+Math.abs(+r.amount||0),0));
  const parsedRefunds=round2((rows||[]).filter(r=>r?.kind==='refund').reduce((a,r)=>a+Math.abs(+r.amount||0),0));
  const feeCount=(rows||[]).filter(r=>r?.kind==='fee').length;
  let repaired=false;
  // V87: Halkbank/Paraf özetini banka etiketlerinden doğrudan oku.
  // Regex literal kullanılır; JS string içindeki \\s kaçışlarının bozulmasına izin verilmez.
  if(detectedBank?.id==='halkbank'){
    const flat=String(text||'').replace(/\s+/g,' ');
    const money='([+-]?(?:(?:\\d{1,3}(?:[.,]\\d{3})+)(?:[.,]\\d{2})?|\\d+(?:[.,]\\d{2})))';
    const grab=(re)=>{const m=flat.match(re);return m?stmtMoney(m[1]):null};
    const hbPrev=grab(/Bir\s+Önceki\s+Dönem(?:\s+Ekstre)?\s+Borcu\s*[:\-]?\s*([+-]?(?:(?:\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2})?|\d+(?:[.,]\d{2})))/i);
    const hbSpend=grab(/Dönem\s+İçi\s+Borç\s+Tutarı\s*[:\-]?\s*([+-]?(?:(?:\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2})?|\d+(?:[.,]\d{2})))/i);
    const hbFees=grab(/Toplam\s+Faiz\s*,?\s*Ücret\s*,?\s*Vergiler\s*[:\-]?\s*([+-]?(?:(?:\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2})?|\d+(?:[.,]\d{2})))/i);
    const hbPay=grab(/Dönemsel\s+Alacak\s+Kayıtları\s*[:\-]?\s*([+-]?(?:(?:\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2})?|\d+(?:[.,]\d{2})))/i);
    const hbDebt=grab(/Hesap\s+Bakiyesi\s*[:\-]?\s*([+-]?(?:(?:\d{1,3}(?:[.,]\d{3})+)(?:[.,]\d{2})?|\d+(?:[.,]\d{2})))/i);
    if(finite(hbPrev))meta.previousBalance=round2(hbPrev);
    if(finite(hbSpend))meta.spendingTotal=round2(hbSpend);
    if(finite(hbFees))meta.feesTotal=round2(hbFees);
    if(finite(hbPay))meta.paymentsTotal=round2(Math.abs(hbPay));
    if(finite(hbDebt))meta.periodDebt=round2(hbDebt);

    // V92: Halkbank PDF'lerinde bazı özet hücreleri PDF.js tarafından 0,00 gibi yanlış eşleşebiliyor.
    // Gerçek işlem satırları pozitif toplam veriyorsa, bu sahte sıfırlar banka özeti kabul edilmez.
    // İşlem tablosu + dönem borcu birlikte kullanılarak eksik özet alanları güvenli biçimde tamamlanır.
    if(parsedSpend>0&&(!finite(meta.spendingTotal)||+meta.spendingTotal===0)){meta.spendingTotal=parsedSpend;repaired=true;meta.halkbankSpendFromRows=true}
    if(parsedFees>0&&(!finite(meta.feesTotal)||+meta.feesTotal===0)){meta.feesTotal=parsedFees;repaired=true;meta.halkbankFeesFromRows=true}
    if(pays>0&&(!finite(meta.paymentsTotal)||+meta.paymentsTotal===0)){meta.paymentsTotal=round2(pays);repaired=true;meta.halkbankPaymentsFromRows=true}
    if(finite(meta.periodDebt)&&finite(meta.spendingTotal)&&finite(meta.feesTotal)&&finite(meta.paymentsTotal)){
      const impliedPrev=round2((+meta.periodDebt)-(+meta.spendingTotal)-(+meta.feesTotal)+(+meta.paymentsTotal)+parsedRefunds);
      if(impliedPrev>=0&&(!finite(meta.previousBalance)||(+meta.previousBalance===0&&impliedPrev>0))){
        meta.previousBalance=impliedPrev;repaired=true;meta.halkbankPreviousFromEquation=true;
      }
    }
    if([meta.previousBalance,meta.spendingTotal,meta.feesTotal,meta.paymentsTotal,meta.periodDebt].every(finite)){
      meta.summaryRepaired=repaired;
      meta.summaryEquationOk=Math.abs((+meta.previousBalance)+(+meta.spendingTotal)+(+meta.feesTotal)-(+meta.paymentsTotal)-parsedRefunds-(+meta.periodDebt))<.02;
      meta.halkbankExplicitSummary=true;
      return meta;
    }
  }
  if(feeCount&&parsedFees>0&&(!finite(meta.feesTotal)||Math.abs(+meta.feesTotal-parsedFees)>.01)){meta.feesTotal=parsedFees;repaired=true}
  // İşlem tablosundaki ödeme satırları, özet kutusunun PDF metin sırasından daha güvenilir.
  if(paymentCount&&pays>0){if(!finite(meta.paymentsTotal)||Math.abs(+meta.paymentsTotal-pays)>.01)repaired=true;meta.paymentsTotal=round2(pays)}
  const prev=finite(meta.previousBalance)?+meta.previousBalance:null,debt=finite(meta.periodDebt)?+meta.periodDebt:null,payment=finite(meta.paymentsTotal)?+meta.paymentsTotal:null;
  if(prev!=null&&debt!=null&&payment!=null){
    const spendPlusFees=round2(debt-prev+payment);
    if(spendPlusFees>=0){
      // Muhasebe eşitliği: Devreden + Harcamalar + Faiz/Ücret - Ödemeler = Dönem Borcu.
      // PDF'deki tüm parasal adaylar arasından Harcamalar+Ücret toplamına en yakın büyük değeri seç.
      const all=stmtAllMoneyValues(text).filter(v=>v>=0);
      const excluded=[prev,debt,payment];
      const candidates=all.filter(v=>v>=Math.max(1,spendPlusFees*.45)&&v<=spendPlusFees+.01&&!excluded.some(x=>Math.abs(v-x)<.01));
      candidates.sort((a,b)=>Math.abs(spendPlusFees-a)-Math.abs(spendPlusFees-b)||b-a);
      const cand=candidates[0];
      if(finite(cand)){
        const fee=round2(spendPlusFees-cand);
        // Ücret farkı negatif olamaz; ekstre toplamının %15'ini aşan farkı da otomatik kabul etme.
        if(fee>=-.01&&fee<=Math.max(50,spendPlusFees*.15)){
          if(!finite(meta.spendingTotal)||Math.abs(+meta.spendingTotal-cand)>.01)repaired=true;
          if(!finite(meta.feesTotal)||Math.abs(+meta.feesTotal-Math.max(0,fee))>.01)repaired=true;
          meta.spendingTotal=round2(cand);meta.feesTotal=round2(Math.max(0,fee));
        }
      }
      // Hâlâ eşitlik bozuksa, güvenilir dört bileşenden Harcamaları türet.
      const fee=finite(meta.feesTotal)&&+meta.feesTotal>=0?+meta.feesTotal:0;
      const expectedSpend=round2(spendPlusFees-fee);
      const eqOk=finite(meta.spendingTotal)&&Math.abs((prev+(+meta.spendingTotal)+fee-payment)-debt)<.02;
      if(!eqOk&&expectedSpend>=0){meta.spendingTotal=expectedSpend;repaired=true}
    }
  }
  meta.summaryRepaired=repaired;
  meta.summaryEquationOk=finite(meta.previousBalance)&&finite(meta.spendingTotal)&&finite(meta.feesTotal)&&finite(meta.paymentsTotal)&&finite(meta.periodDebt)
    ?Math.abs((+meta.previousBalance)+(+meta.spendingTotal)+(+meta.feesTotal)-(+meta.paymentsTotal)-(+meta.periodDebt))<.02:false;
  return meta
}


function stmtFinalizeSummaryConfidence(meta,rows){
  const m={...(meta||{})},round2=n=>Math.round((+n||0)*100)/100,finite=n=>Number.isFinite(+n);
  const spendRows=(rows||[]).filter(r=>r?.kind==='spend');
  const paymentRows=(rows||[]).filter(r=>r?.kind==='payment'),feeRows=(rows||[]).filter(r=>r?.kind==='fee');
  const parsedSpend=round2(spendRows.reduce((a,r)=>a+Math.abs(+r.amount||0),0));
  const parsedPayments=round2(paymentRows.reduce((a,r)=>a+Math.abs(+r.amount||0),0));
  const parsedFees=round2(feeRows.reduce((a,r)=>a+Math.abs(+r.amount||0),0));
  m.parsedSpendingTotal=parsedSpend;m.parsedPaymentsTotal=parsedPayments;m.parsedFeesTotal=parsedFees;
  m.spendingRowsMatch=finite(m.spendingTotal)&&Math.abs((+m.spendingTotal)-parsedSpend)<.02;
  m.paymentRowsMatch=!paymentRows.length||!finite(m.paymentsTotal)||Math.abs((+m.paymentsTotal)-parsedPayments)<.02;
  m.feeRowsMatch=!feeRows.length||!finite(m.feesTotal)||Math.abs((+m.feesTotal)-parsedFees)<.02;
  m.summaryEquationOk=finite(m.previousBalance)&&finite(m.spendingTotal)&&finite(m.feesTotal)&&finite(m.paymentsTotal)&&finite(m.periodDebt)
    ?Math.abs((+m.previousBalance)+(+m.spendingTotal)+(+m.feesTotal)-(+m.paymentsTotal)-(+m.periodDebt))<.02:false;
  const detected=stmtDetectBank('',statementImportCardId||'');
  if(detected?.id==='halkbank'&&finite(m.previousBalance)&&finite(m.periodDebt)){
    const refunds=round2((rows||[]).filter(r=>r?.kind==='refund').reduce((a,r)=>a+Math.abs(+r.amount||0),0));
    const rowDebt=round2((+m.previousBalance)+parsedSpend+parsedFees-parsedPayments-refunds);
    m.halkbankRowEquationTotal=rowDebt;
    m.halkbankRowEquationOk=Math.abs(rowDebt-(+m.periodDebt))<.02;
    if(m.halkbankRowEquationOk)m.summaryTrusted=true;
  }
  m.summaryTrusted=!!(m.summaryTrusted||(m.summaryEquationOk&&m.spendingRowsMatch&&m.paymentRowsMatch&&m.feeRowsMatch));
  return m
}
function stmtChronologyPenalty(rows,i){
  const cur=rows[i]?.date||'',prev=i>0?(rows[i-1]?.date||''):'',next=i<rows.length-1?(rows[i+1]?.date||''):'';
  let p=0;if(prev&&cur&&prev>cur)p+=2;if(cur&&next&&cur>next)p+=2;if(prev&&next&&cur&&prev===next&&cur!==prev)p+=1;return p
}
function stmtDuplicateRemovalCandidates(list,idxs){
  const sorted=[...idxs].sort((a,b)=>(Number.isFinite(list[a]?.sourceStart)?list[a].sourceStart:a)-(Number.isFinite(list[b]?.sourceStart)?list[b].sourceStart:b));
  const scored=sorted.map(i=>({i,penalty:stmtChronologyPenalty(list,i),raw:String(list[i]?.rawKey||'')}));
  const rawCounts={};for(const x of scored)if(x.raw)rawCounts[x.raw]=(rawCounts[x.raw]||0)+1;
  return scored.filter(x=>{
    if(x.penalty>0)return true;
    if(x.raw&&rawCounts[x.raw]>1){const first=scored.find(y=>y.raw===x.raw);return first&&first.i!==x.i}
    return false
  }).map(x=>x.i)
}
function stmtUniqueSubsetIndexes(rows,kind,target,maxItems=4){
  const cents=Math.round((+target||0)*100);if(cents<=0)return null;
  const cand=[];(rows||[]).forEach((r,i)=>{if(r?.kind!==kind)return;const c=Math.round(Math.abs(+r.amount||0)*100);if(c>0&&c<=cents)cand.push({i,c})});
  const found=[];const dfs=(start,left,pick)=>{if(found.length>1)return;if(left===0){found.push([...pick]);return}if(left<0||pick.length>=maxItems)return;for(let j=start;j<cand.length;j++){const x=cand[j];if(x.c>left)continue;pick.push(x.i);dfs(j+1,left-x.c,pick);pick.pop();if(found.length>1)return}};dfs(0,cents,[]);return found.length===1?found[0]:null
}
function stmtImportGuardStatus(meta,rows,bankId,cardId=''){
  const reasons=[],known=v=>v!==null&&v!==''&&v!==undefined&&Number.isFinite(Number(v)),sum=k=>(rows||[]).filter(r=>r?.kind===k).reduce((a,r)=>a+Math.abs(+r.amount||0),0),diff=(a,b)=>Math.abs(Number(a)-Number(b));
  const cents=v=>Math.round((Number(v)||0)*100),spendSum=sum('spend'),paymentSum=sum('payment'),feeSum=sum('fee'),refundSum=sum('refund');
  // V89: Halkbank uzlaştırması kuruş bazında ve doğrudan işlem toplamları üzerinden yapılır.
  // PDF'deki Devreden alanı bazı sürümlerde konumsal olarak zor okunabildiği için, banka özetindeki
  // Harcamalar + Ödemeler + Faiz/Ücret satır toplamları birebir uyuşuyorsa gereksiz blok koyma.
  let halkbankEquationOk=false;
  if(bankId==='halkbank'){
    // V92: Özet hücresindeki sahte 0,00 değerleri gerçek pozitif işlem toplamlarının önüne geçemez.
    if(spendSum>0&&(!known(meta?.spendingTotal)||cents(meta.spendingTotal)===0)){meta.spendingTotal=Math.round(spendSum*100)/100;meta.halkbankSpendFromRows=true}
    if(paymentSum>0&&(!known(meta?.paymentsTotal)||cents(meta.paymentsTotal)===0)){meta.paymentsTotal=Math.round(paymentSum*100)/100;meta.halkbankPaymentsFromRows=true}
    if(feeSum>0&&(!known(meta?.feesTotal)||cents(meta.feesTotal)===0)){meta.feesTotal=Math.round(feeSum*100)/100;meta.halkbankFeesFromRows=true}
    const spendMatch=known(meta?.spendingTotal)&&cents(meta.spendingTotal)===cents(spendSum);
    const payMatch=known(meta?.paymentsTotal)&&cents(meta.paymentsTotal)===cents(paymentSum);
    const feeMatch=known(meta?.feesTotal)&&cents(meta.feesTotal)===cents(feeSum);
    const directTotalsOk=spendMatch&&payMatch&&feeMatch;
    let prev=known(meta?.previousBalance)?Number(meta.previousBalance):null;
    const debt=known(meta?.periodDebt)?Number(meta.periodDebt):null;
    // Üç doğrudan banka toplamı doğruysa eksik/bozuk devreden değerini muhasebe denkleminden türet.
    if(directTotalsOk&&debt!==null&&(prev===null||!Number.isFinite(prev))){
      prev=Math.round((debt-spendSum-feeSum+paymentSum+refundSum)*100)/100;
      meta.previousBalance=prev;
      meta.halkbankDerivedPreviousBalance=true;
    }
    let equationOk=false;
    if(prev!==null&&debt!==null){
      const calcCents=cents(prev)+cents(spendSum)+cents(feeSum)-cents(paymentSum)-cents(refundSum);
      equationOk=calcCents===cents(debt);
      meta.halkbankRowEquationTotal=calcCents/100;
    }
    // Doğrudan üç işlem toplamı bankayla birebir eşleşiyorsa güvenlidir; hesap denklemi de varsa ayrıca doğrulanır.
    halkbankEquationOk=directTotalsOk&&(debt===null||equationOk||!known(meta?.previousBalance));
    if(directTotalsOk&&debt!==null&&!equationOk){
      const derived=Math.round((debt-spendSum-feeSum+paymentSum+refundSum)*100)/100;
      // Devreden özet hücresi yanlış okunmuşsa güvenilir üç toplam + dönem borcundan yeniden kur.
      meta.previousBalance=derived;
      meta.halkbankDerivedPreviousBalance=true;
      const recalc=cents(derived)+cents(spendSum)+cents(feeSum)-cents(paymentSum)-cents(refundSum);
      equationOk=recalc===cents(debt);
      meta.halkbankRowEquationTotal=recalc/100;
      halkbankEquationOk=equationOk;
    }
    meta.halkbankRowEquationOk=halkbankEquationOk;
    meta.halkbankDirectTotalsOk=directTotalsOk;
  }
  if(!halkbankEquationOk&&known(meta?.spendingTotal)&&diff(meta.spendingTotal,spendSum)>.02)reasons.push(`Harcama toplamı banka ile uyuşmuyor (${Number(spendSum).toFixed(2)} / ${Number(meta.spendingTotal).toFixed(2)})`);
  if(!halkbankEquationOk&&known(meta?.paymentsTotal)&&Number(meta.paymentsTotal)>0&&diff(meta.paymentsTotal,paymentSum)>.02)reasons.push(`Ödeme toplamı banka ile uyuşmuyor (${Number(paymentSum).toFixed(2)} / ${Number(meta.paymentsTotal).toFixed(2)})`);
  if(!halkbankEquationOk&&known(meta?.feesTotal)&&Number(meta.feesTotal)>0&&diff(meta.feesTotal,feeSum)>.02)reasons.push(`Faiz/ücret toplamı banka ile uyuşmuyor (${Number(feeSum).toFixed(2)} / ${Number(meta.feesTotal).toFixed(2)})`);
  if(bankId==='halkbank'&&!halkbankEquationOk&&known(meta?.periodDebt)&&!reasons.length)reasons.push(`Halkbank hesap bakiyesi işlem toplamlarıyla uyuşmuyor`);
  const card=state?.cards?.find?.(x=>x.id===cardId),cardDetected=stmtDetectBank('',cardId);
  if(bankId&&bankId!=='generic'&&cardDetected.id&&cardDetected.id!=='generic'&&bankId!==cardDetected.id){
    const stmtLabel=STMT_BANK_PROFILES.find(p=>p.id===bankId)?.label||bankId.toLocaleUpperCase('tr-TR');
    reasons.push(`Ekstre ${stmtLabel}, seçili kart ${card?.bank||cardDetected.label}. Yanlış karta içe aktarma engellendi`)
  }
  return{blocked:reasons.length>0,reasons,bankId}
}
function stmtReconcileRowsToBankSpending(rows,meta){
  const list=[...(rows||[])];
  const target=Number(meta?.spendingTotal);
  if(!Number.isFinite(target)||target<0)return{rows:list,removed:0,amount:0};
  const spendIdx=[];let parsed=0,hasRefund=false;
  list.forEach((r,i)=>{if(r?.kind==='refund'){hasRefund=true;return}if(r?.kind==='spend'){const a=Math.abs(+r.amount||0);if(a>0){parsed+=a;spendIdx.push(i)}}});
  // Bazı bankalar faiz/ücreti işlem tablosunda normal satır gibi gösterir. Banka özetindeki harcama+ücret ayrımı
  // benzersiz bir küçük satır kombinasyonuyla birebir açıklanıyorsa bu satırları güvenle Vergi & Faiz'e taşı.
  const feeTarget=Number(meta?.feesTotal),spendTarget=Number(meta?.spendingTotal),feeParsed=list.filter(r=>r?.kind==='fee').reduce((a,r)=>a+Math.abs(+r.amount||0),0);
  const needFee=Math.round((feeTarget-feeParsed)*100)/100,excessSpend=Math.round((parsed-spendTarget)*100)/100;
  if(Number.isFinite(feeTarget)&&feeTarget>0&&Number.isFinite(spendTarget)&&needFee>.001&&Math.abs(needFee-excessSpend)<.011){
    const idxs=stmtUniqueSubsetIndexes(list,'spend',needFee,4);if(idxs?.length){for(const i of idxs){const r=list[i];r.kind='fee';r.category='Vergi & Faiz';r.refund=false;r.payment=false;r.semanticKey=(r.semanticKey||'')+'|fee-reconciled'};return{rows:list,removed:0,amount:0,reclassified:idxs.length,reclassifiedAmount:needFee}}
  }
  // İadeli ekstrelerde banka özetinin iadeyi nasıl mahsuplaştırdığı bankadan bankaya değişebilir.
  // Bu yüzden otomatik satır azaltma yalnızca iadesiz ekstrelerde yapılır.
  if(hasRefund)return{rows:list,removed:0,amount:0};
  const diff=Math.round((parsed-target)*100);
  if(diff<=1)return{rows:list,removed:0,amount:0};
  const groups=new Map();
  for(const i of spendIdx){const r=list[i],cents=Math.round(Math.abs(+r.amount||0)*100);if(cents<=0)continue;const k=r.semanticKey||`${r.date}|${stmtCleanTitle(r.title).toLocaleUpperCase('tr-TR')}|${cents}`;if(!groups.has(k))groups.set(k,{k,cents,idx:[]});groups.get(k).idx.push(i)}
  // Aynı tarih + aynı açıklama + aynı tutar tek başına silme nedeni değildir.
  // Yalnızca kronolojiyi bozan veya aynı ham kaynak bloğunun parser yankısı olan kopyalar adaydır.
  const cand=[...groups.values()].filter(g=>g.idx.length>=2&&g.cents<=diff).map(g=>{
    const removable=stmtDuplicateRemovalCandidates(list,g.idx);
    return {...g,removable,max:Math.min(g.idx.length-1,removable.length)}
  }).filter(g=>g.max>0);
  if(!cand.length)return{rows:list,removed:0,amount:0};
  // Güvenli otomatik uzlaştırma: farkı TEK BAŞINA açıklayabilen yalnız bir tekrar kümesi varsa uygula.
  // Birden fazla olası kombinasyon varsa gerçek işlemi yanlışlıkla silmemek için otomatik karar verme.
  const exact=[];
  for(let gi=0;gi<cand.length;gi++){
    const g=cand[gi];
    if(diff%g.cents!==0)continue;
    const n=diff/g.cents;
    if(Number.isInteger(n)&&n>=1&&n<=g.max)exact.push([gi,n])
  }
  if(exact.length!==1)return{rows:list,removed:0,amount:0,ambiguous:exact.length>1};
  const drop=new Set();
  const [gi,n]=exact[0],g=cand[gi];
  const ranked=[...g.removable].sort((a,b)=>stmtChronologyPenalty(list,b)-stmtChronologyPenalty(list,a)||((Number.isFinite(list[b]?.sourceStart)?list[b].sourceStart:b)-(Number.isFinite(list[a]?.sourceStart)?list[a].sourceStart:a)));
  for(const i of ranked.slice(0,n))drop.add(i)
  if(!drop.size)return{rows:list,removed:0,amount:0};
  const out=list.filter((_,i)=>!drop.has(i));
  const after=out.filter(r=>r.kind==='spend').reduce((a,r)=>a+Math.abs(+r.amount||0),0);
  if(Math.abs(after-target)>.011)return{rows:list,removed:0,amount:0};
  return{rows:out,removed:drop.size,amount:diff/100}
}

function statementImportMonthForRows(card,rows){
  const ds=rows.map(r=>r.date).filter(stmtValidIsoDate).sort();if(!ds.length)return state.selectedMonth;
  return statementMonthFor(card,ds.at(-1))
}
function statementSnapshot(cardId,m){return (state.statementImports||[]).find(x=>x.cardId===cardId&&x.month===m)||null}
function statementRowsMonthBreakdown(rows){
  const counts={};for(const r of rows||[]){if(!stmtValidIsoDate(r.date))continue;const m=r.date.slice(0,7);counts[m]=(counts[m]||0)+1}
  return Object.entries(counts).sort().map(([m,n])=>{const [y,mo]=m.split('-').map(Number),label=new Date(y,mo-1,1,12).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR');return`${label}: ${n}`}).join(' • ')
}
function statementPreview(cardId,rows){
  const orderedRows=[...(rows||[])].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||((Number.isFinite(a.sourceStart)?a.sourceStart:Number.MAX_SAFE_INTEGER)-(Number.isFinite(b.sourceStart)?b.sourceStart:Number.MAX_SAFE_INTEGER))||((a.occurrence||0)-(b.occurrence||0)));
  // Önizleme, sayaç ve içe aktarma aynı son doğrulanmış hareket kümesini kullanır.
  // Parser'ın özet/footer/tanımsız artıkları artık ne sayıya ne de içe aktarma listesine girebilir.
  const finalRows=orderedRows.filter(r=>['spend','payment','refund','fee'].includes(r?.kind)&&stmtValidIsoDate(r?.date)&&Number.isFinite(+r?.amount)&&Math.abs(+r.amount)>0);
  const c=state.cards.find(x=>x.id===cardId),month=statementImportMonthForRows(c,finalRows),monthBreakdown=statementRowsMonthBreakdown(finalRows),existingImported=(state.expenses||[]).filter(x=>x.importedFromStatement&&x.cardId===cardId&&((x.statementImportMonth&&x.statementImportMonth===month)||statementMonthFor(c,x.date)===month)).length;
  const usable=existingImported?finalRows:finalRows.filter(r=>r.payment||r.occurrence>stmtExistingCount(cardId,r.date,r.title,r.amount));statementImportRows=usable;
  const skipped=existingImported?0:finalRows.length-usable.length;
  // Sayaçlar ekranda gerçekten gösterilen / içe aktarılabilir satırlarla birebir aynı kaynaktan hesaplanır.
  const spendRows=usable.filter(r=>r.kind==='spend'),refundRows=usable.filter(r=>r.kind==='refund'),paymentRows=usable.filter(r=>r.kind==='payment'),feeRows=usable.filter(r=>r.kind==='fee'),bankProfile=STMT_BANK_PROFILES.find(p=>p.id===statementImportMeta.bankProfileId)||stmtDetectBank('',cardId);
  const movementCount=usable.length;
  const autoSpend=Number.isFinite(statementImportMeta.spendingTotal)?statementImportMeta.spendingTotal:spendRows.reduce((a,r)=>a+r.amount,0);
  const debt=Number.isFinite(statementImportMeta.periodDebt)?statementImportMeta.periodDebt:'';
  const prev=Number.isFinite(statementImportMeta.previousBalance)?statementImportMeta.previousBalance:'';
  const fees=Number.isFinite(statementImportMeta.feesTotal)?statementImportMeta.feesTotal:feeRows.reduce((a,r)=>a+Math.abs(+r.amount||0),0);
  const pays=Number.isFinite(statementImportMeta.paymentsTotal)?statementImportMeta.paymentsTotal:paymentRows.reduce((a,r)=>a+r.amount,0);
  return `<div class="notice"><b>${esc(c?.bank||'KART')} · •••• ${esc(c?.last4||'')}</b><br><small>Ekstre bankası: <b>${esc(bankProfile.label)}</b></small><br><b>${movementCount} hareket bulundu</b> · ${spendRows.length} harcama · ${paymentRows.length} ödeme · ${refundRows.length} iade · ${feeRows.length} vergi/faiz${skipped?` · ${skipped} mükerrer atlandı`:''}.<br>${statementImportMeta.autoDuplicateRemoved?`<small><b>${statementImportMeta.autoDuplicateRemoved} yinelenen satır</b> banka harcama toplamıyla karşılaştırılarak çıkarıldı (${money(statementImportMeta.autoDuplicateAmount||0)}).</small><br>`:''}${statementImportMeta.autoFeeReclassified?`<small><b>${statementImportMeta.autoFeeReclassified} satır</b> banka özetiyle uzlaştırılarak Vergi & Faiz'e ayrıldı (${money(statementImportMeta.autoFeeReclassifiedAmount||0)}).</small><br>`:''}${statementImportMeta.importBlocked?`<small><b>⛔ İÇE AKTARMA KİLİTLİ:</b> ${esc((statementImportMeta.importGuardReasons||[]).join(' · '))}</small><br>`:''}${statementImportMeta.summaryRepaired?`<small><b>Ekstre özeti doğrulandı ve PDF metin sırası otomatik düzeltildi.</b></small><br>`:''}${statementImportMeta.summaryTrusted?`<small>✓ Banka özeti ve işlem satırları birlikte doğrulandı.</small><br>`:statementImportMeta.summaryEquationOk?`<small>⚠ Banka özeti matematiksel olarak tutuyor; işlem satırlarıyla tam doğrulama bekleniyor.</small><br>`:''}<small>Motor: ORTAK HANE EKSTRE MOTORU · Profil: ${esc(bankProfile.label)} · Satır ve blok stratejileri otomatik karşılaştırılır; gerekirse OCR yedeği kullanılır.</small><br><small>Taksitli alışverişlerde yalnızca bu ekstreye yansıyan taksit tutarı gider olarak eklenir.</small></div>
  <div class="statementReconcileBox statementBankEquation">
    <b>BANKA EKSTRE ÖZETİ</b>
    <div class="stmtEquationGrid"><label>Devreden Bakiye<input id="stmtSummaryPrevious" type="number" step="0.01" value="${prev!==''?Number(prev).toFixed(2):''}" placeholder="0,00"></label><label>Harcamalar<input id="stmtSummarySpend" type="number" step="0.01" value="${Number(autoSpend||0).toFixed(2)}"></label><label>Faiz / Ücret<input id="stmtSummaryFees" type="number" step="0.01" value="${Number(fees||0).toFixed(2)}"></label><label>Ödemeler<input id="stmtSummaryPayments" type="number" step="0.01" value="${pays!==''?Number(pays).toFixed(2):''}" placeholder="0,00"></label><label>Dönem Borcu<input id="stmtSummaryDebt" type="number" step="0.01" value="${debt!==''?Number(debt).toFixed(2):''}" placeholder="0,00"></label></div>
    <label class="form-check"><input id="stmtSyncDebt" type="checkbox" ${debt!==''?'checked':''}> <span>Dönem borcunu kart borcu için esas al</span></label>
    ${existingImported?`<label class="form-check"><input id="stmtReplacePeriod" type="checkbox" checked> <span>Bu ekstre dönemindeki önceki içe aktarmayı yenileriyle değiştir</span></label>`:''}
  </div>
  ${monthBreakdown?`<div class="notice statementMonthCheck"><b>İŞLEM TARİHLERİ</b><br>${esc(monthBreakdown)}</div>`:''}
  <div class="statementImportList">${usable.length?usable.map((r,i)=>`<div class="statementImportRow"><input type="checkbox" data-stmt-check="${i}" checked><div class="stmtEditGrid"><input type="date" data-stmt-date="${i}" value="${esc(r.date)}"><input type="text" data-stmt-title="${i}" value="${esc(r.title)}" maxlength="100"><input type="number" step="0.01" data-stmt-amount="${i}" value="${Number(r.amount).toFixed(2)}" ${r.payment?'readonly':''}><select data-stmt-category="${i}" ${r.payment?'disabled':''}>${r.payment?`<option value="Kart Ödemesi" selected>Kart Ödemesi</option>`:C.map(cat=>`<option value="${esc(cat)}" ${cat===r.category?'selected':''}>${esc(cat)}</option>`).join('')}</select></div><small class="stmtRowType">${r.payment?'KART ÖDEMESİ':r.refund?'İADE':r.kind==='fee'?'VERGİ / FAİZ':r.installmentCount?`TAKSİT ${r.installmentNo||'?'} / ${r.installmentCount}${r.installmentTotal?` · TOPLAM ${money(r.installmentTotal)}`:''}`:'HARCAMA'}</small></div>`).join(''):'<div class="notice">EKLENECEK YENİ HAREKET BULUNMADI.</div>'}</div>${usable.length&&!statementImportMeta.importBlocked?'<button class="btn gold" style="width:100%;margin-top:12px" data-action="statementImportConfirm">SEÇİLENLERİ EKLE</button>':usable.length?'<button class="btn" style="width:100%;margin-top:12px;opacity:.55" disabled>BANKA TOPLAMLARI UYUŞMUYOR</button>':''}`
}

const HANE_OCR_SCRIPT='./__hane_engine__/tesseract/tesseract.min.js';
const HANE_OCR_WORKER='./__hane_engine__/tesseract/worker.min.js';
const HANE_OCR_CORE='./__hane_engine__/tesseract/core';
const HANE_PDF_MODULE='./__hane_engine__/pdf/pdf.min.mjs';
const HANE_PDF_WORKER='./__hane_engine__/pdf/pdf.worker.min.mjs';
let statementOcrWorker=null,statementOcrLabel='OCR',statementPdfjs=null,statementPdfWorker=null,statementPrivacyPrepared=false,statementPrivacyPreparePromise=null,statementEngineMode='local';
const HANE_SW_BUILD='20260922-V113-S3-FIX4-CACHE-UPDATE';
const HANE_SW_URL='./sw.js?v='+encodeURIComponent(HANE_SW_BUILD);
const HANE_ENGINE_CACHE='hane-v19-4-8-V113-VIEW-FUNCTIONS-RESTORE';
const HANE_ENGINE_PACKAGES=[
  {url:'https://registry.npmjs.org/tesseract.js/-/tesseract.js-5.1.1.tgz',integrity:'sha512-lzVl/Ar3P3zhpUT31NjqeCo1f+D5+YfpZ5J62eo2S14QNVOmHBTtbchHm/YAbOOOzCegFnKf4B3Qih9LuldcYQ==',files:{'package/dist/tesseract.min.js':'__hane_engine__/tesseract/tesseract.min.js','package/dist/worker.min.js':'__hane_engine__/tesseract/worker.min.js'}},
  {url:'https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-5.1.1.tgz',integrity:'sha512-KX3bYSU5iGcO1XJa+QGPbi+Zjo2qq6eBhNjSGR5E5q0JtzkoipJKOUQD7ph8kFyteCEfEQ0maWLu8MCXtvX5uQ==',files:{'package/tesseract-core.wasm.js':'__hane_engine__/tesseract/core/tesseract-core.wasm.js','package/tesseract-core-simd.wasm.js':'__hane_engine__/tesseract/core/tesseract-core-simd.wasm.js','package/tesseract-core-lstm.wasm.js':'__hane_engine__/tesseract/core/tesseract-core-lstm.wasm.js','package/tesseract-core-simd-lstm.wasm.js':'__hane_engine__/tesseract/core/tesseract-core-simd-lstm.wasm.js','package/tesseract-core.wasm':'__hane_engine__/tesseract/core/tesseract-core.wasm','package/tesseract-core-simd.wasm':'__hane_engine__/tesseract/core/tesseract-core-simd.wasm','package/tesseract-core-lstm.wasm':'__hane_engine__/tesseract/core/tesseract-core-lstm.wasm','package/tesseract-core-simd-lstm.wasm':'__hane_engine__/tesseract/core/tesseract-core-simd-lstm.wasm'}},
  {url:'https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-4.10.38.tgz',integrity:'sha512-/Y3fcFrXEAsMjJXeL9J8+ZG9U01LbuWaYypvDW2ycW1jL269L3js3DVBjDJ0Up9Np1uqDXsDrRihHANhZOlwdQ==',files:{'package/build/pdf.min.mjs':'__hane_engine__/pdf/pdf.min.mjs','package/build/pdf.worker.min.mjs':'__hane_engine__/pdf/pdf.worker.min.mjs'}}
];
function haneB64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s)}
async function haneVerifySha512(buffer,integrity){const [alg,want]=String(integrity).split('-',2);if(alg!=='sha512'||!want)throw new Error('Motor bütünlük bilgisi geçersiz.');const got=haneB64(new Uint8Array(await crypto.subtle.digest('SHA-512',buffer)));if(got!==want)throw new Error('Motor paketi SHA-512 doğrulamasını geçemedi.');}
function haneTarStr(u8,start,len){const p=u8.subarray(start,start+len);let e=p.indexOf(0);if(e<0)e=p.length;return new TextDecoder().decode(p.subarray(0,e)).trim()}
function haneOct(s){const x=String(s||'').replace(/\0/g,'').trim();return x?parseInt(x,8)||0:0}
async function haneGunzip(buffer){if(typeof DecompressionStream!=='function')throw new Error('Bu tarayıcı güvenli motor paketini açmayı desteklemiyor.');const st=new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));return new Uint8Array(await new Response(st).arrayBuffer())}
function haneExtractTar(tar,needed){const found=new Map();for(let off=0;off+512<=tar.length;){const name=haneTarStr(tar,off,100),prefix=haneTarStr(tar,off+345,155);if(!name)break;const full=prefix?`${prefix}/${name}`:name,size=haneOct(haneTarStr(tar,off+124,12)),type=String.fromCharCode(tar[off+156]||48),ds=off+512,de=ds+size;if((type==='0'||type==='\0')&&needed.has(full))found.set(full,tar.slice(ds,de));off=ds+Math.ceil(size/512)*512}return found}
function haneEngineMime(path){if(path.endsWith('.wasm'))return'application/wasm';if(path.endsWith('.mjs')||path.endsWith('.js'))return'text/javascript; charset=utf-8';return'application/octet-stream'}
async function installVerifiedEnginesInPage(packages=HANE_ENGINE_PACKAGES){
  const cache=await caches.open(HANE_ENGINE_CACHE);
  for(const pkg of packages){
    let ready=true;for(const dst of Object.values(pkg.files)){if(!(await cache.match(new URL(dst,location.href).href))){ready=false;break}}
    if(ready)continue;
    const res=await fetch(pkg.url,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});if(!res.ok)throw new Error('Doğrulanmış motor paketi indirilemedi.');
    const archive=await res.arrayBuffer();await haneVerifySha512(archive,pkg.integrity);const tar=await haneGunzip(archive),need=new Set(Object.keys(pkg.files)),found=haneExtractTar(tar,need);if(found.size!==need.size)throw new Error('Doğrulanmış motor paketinde gerekli dosya eksik.');
    for(const [src,dst] of Object.entries(pkg.files)){const url=new URL(dst,location.href).href;await cache.put(url,new Response(found.get(src),{status:200,headers:{'Content-Type':haneEngineMime(dst),'Cache-Control':'public, max-age=31536000, immutable','X-HANE-Verified':'sha512-package-page'}}))}
  }
  return true
}
async function haneEnginePackageReady(pkg){const cache=await caches.open(HANE_ENGINE_CACHE);for(const dst of Object.values(pkg.files)){if(!(await cache.match(new URL(dst,location.href).href)))return false}return true}
async function ensurePdfEngineReady(){
  // PDF okuma Service Worker controller'a bagli degildir.
  // Paket sabit npm surumunden indirilir, SHA-512 dogrulanir ve CacheStorage'a yazilir.
  // Sayfa daha sonra dogrulanmis byte'lari dogrudan cache'den Blob olarak calistirir.
  const pkg=HANE_ENGINE_PACKAGES[2];
  if(!(await haneEnginePackageReady(pkg)))await installVerifiedEnginesInPage([pkg]);
  statementPdfjs=null;statementPdfWorker=null;
  return true
}
async function ensureOcrEngineReady(){
  // OCR da PDF gibi Service Worker controller'a bagli degildir.
  // Sabit surum paketleri sayfa tarafinda SHA-512 dogrulanip CacheStorage'a yazilir.
  const pkgs=[HANE_ENGINE_PACKAGES[0],HANE_ENGINE_PACKAGES[1]];
  for(const pkg of pkgs)if(!(await haneEnginePackageReady(pkg))){await installVerifiedEnginesInPage(pkgs);break}
  return true
}
async function loadTesseract(){
  if(window.Tesseract)return window.Tesseract;
  await new Promise((res,rej)=>{const old=document.querySelector('script[data-hane-ocr="1"]');if(old)old.remove();const sc=document.createElement('script');sc.dataset.haneOcr='1';sc.src=HANE_OCR_SCRIPT;sc.onload=res;sc.onerror=()=>rej(new Error('OCR motoru yüklenemedi.'));document.head.appendChild(sc)});
  return window.Tesseract
}
async function getStatementOcrWorker(label='OCR'){
  statementOcrLabel=label;if(statementOcrWorker)return statementOcrWorker;
  await ensureOcrEngineReady();
  const T=await loadTesseract(),langPath=new URL('./vendor/tesseract/lang',location.href).href.replace(/\/$/,'');
  statementOcrWorker=await T.createWorker(['tur','eng'],1,{workerPath:HANE_OCR_WORKER,langPath,corePath:HANE_OCR_CORE,logger:m=>{const e=document.getElementById('statementImportProgress');if(e&&m.progress)e.textContent=`${statementOcrLabel} · %${Math.round(m.progress*100)}`}});return statementOcrWorker
}
async function releaseStatementOcrWorker(){if(statementOcrWorker){try{await statementOcrWorker.terminate()}catch{}statementOcrWorker=null}}
let statementPdfBlobUrls=[];
async function haneCachedEngineBlobUrl(rel,mime='application/octet-stream'){
  const cache=await caches.open(HANE_ENGINE_CACHE),href=new URL(rel,location.href).href,res=await cache.match(href);
  if(!res)throw new Error('Dogrulanmis PDF motoru cache icinde bulunamadi.');
  const buf=await res.arrayBuffer(),url=URL.createObjectURL(new Blob([buf],{type:mime}));statementPdfBlobUrls.push(url);return url
}
async function getStatementPdfRuntime(){
  if(statementPdfjs)return statementPdfjs;
  await ensurePdfEngineReady();
  try{
    const moduleUrl=await haneCachedEngineBlobUrl('__hane_engine__/pdf/pdf.min.mjs','text/javascript'),workerUrl=await haneCachedEngineBlobUrl('__hane_engine__/pdf/pdf.worker.min.mjs','text/javascript');
    const pdfjs=await import(moduleUrl);pdfjs.GlobalWorkerOptions.workerSrc=workerUrl;
    try{statementPdfWorker=new pdfjs.PDFWorker({name:'hane-private-pdf'});await statementPdfWorker.promise}catch{}
    statementPdfjs=pdfjs;return pdfjs
  }catch(e){console.error('HANE PDF runtime:',e);throw new Error('PDF motoru yüklenemedi.')}
}
async function pingStatementWorker(worker){if(!worker)return false;return await new Promise(resolve=>{const channel=new MessageChannel();let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);resolve(v)},timer=setTimeout(()=>finish(false),1500);channel.port1.onmessage=e=>{const d=e.data||{};finish(d.ok===true&&d.build===HANE_SW_BUILD)};try{worker.postMessage({type:'PING'},[channel.port2])}catch{finish(false)}})}
async function ensureStatementServiceWorkerController(){
  if(!('serviceWorker'in navigator))throw new Error('Güvenli yerel okuma bu tarayıcıda desteklenmiyor.');
  // Fast path: do not hit the network or call update when the correct worker already controls this page.
  const current=navigator.serviceWorker.controller;
  if(current&&await pingStatementWorker(current))return current;

  let reg=await navigator.serviceWorker.getRegistration('./');
  if(!reg)reg=await navigator.serviceWorker.register(HANE_SW_URL,{scope:'./',updateViaCache:'none'});
  else {
    const activeUrl=reg.active?.scriptURL||reg.waiting?.scriptURL||reg.installing?.scriptURL||'';
    if(!activeUrl.includes(encodeURIComponent(HANE_SW_BUILD))&&!activeUrl.includes(HANE_SW_BUILD)){
      reg=await navigator.serviceWorker.register(HANE_SW_URL,{scope:'./',updateViaCache:'none'});
    }
  }
  // Ask for an update only when the current controller is absent/wrong; this keeps normal statement opens fast.
  try{await reg.update()}catch{}
  const deadline=Date.now()+5000;
  while(Date.now()<deadline){
    const ctl=navigator.serviceWorker.controller;
    if(ctl&&await pingStatementWorker(ctl))return ctl;
    const target=reg.waiting||reg.installing||reg.active;
    if(target&&await pingStatementWorker(target)){
      if(target.state==='installed')try{target.postMessage({type:'SKIP_WAITING'})}catch{}
      // Activated workers call clients.claim(); controllerchange can happen without reloading the page.
      await new Promise(r=>setTimeout(r,180));
      const claimed=navigator.serviceWorker.controller;
      if(claimed&&await pingStatementWorker(claimed))return claimed;
    }
    await new Promise(r=>setTimeout(r,220));
    reg=await navigator.serviceWorker.getRegistration('./')||reg;
  }
  throw new Error('HANE güvenli okuma servisi bu sayfayı kontrol edemedi. Sayfayı bir kez yenileyip tekrar deneyin.')
}
async function requestVerifiedEnginePreparation(controller){return await new Promise((resolve,reject)=>{const channel=new MessageChannel();let done=false;const finish=(ok,v)=>{if(done)return;done=true;clearTimeout(timer);ok?resolve(v):reject(v)},timer=setTimeout(()=>finish(false,new Error('Güvenli PDF/OCR motorları hazırlanırken zaman aşımı oluştu.')),120000);channel.port1.onmessage=e=>{const d=e.data||{};if(d.build!==HANE_SW_BUILD)return finish(false,new Error('Ekstre motoru farklı HANE sürümünden yanıt verdi.'));d.ok?finish(true,true):finish(false,new Error(d.error||'Güvenli motor hazırlanamadı.'))};try{controller.postMessage({type:'PREPARE_ENGINES'},[channel.port2])}catch(e){finish(false,e)}})}
async function prepareStatementPrivacyRuntime(){
  if(statementPrivacyPrepared)return true;if(statementPrivacyPreparePromise)return statementPrivacyPreparePromise;
  // Lazy-engine mode: only make sure the exact HANE worker controls the page here.
  // PDF/OCR packages are prepared later, only for the selected file type.
  statementPrivacyPreparePromise=(async()=>{statementEngineMode='lazy-verified';statementPrivacyPrepared=true;return true})().finally(()=>{if(!statementPrivacyPrepared)statementPrivacyPreparePromise=null});
  return statementPrivacyPreparePromise
}

async function statementImageForOcr(file,maxSide=2400){
  if(typeof createImageBitmap!=='function')return file;
  const bmp=await createImageBitmap(file);try{const scale=Math.min(1,maxSide/Math.max(bmp.width,bmp.height));if(scale===1)return file;const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));c.getContext('2d',{alpha:false}).drawImage(bmp,0,0,c.width,c.height);return c}finally{bmp.close?.()}
}
function stmtInterpretationScore(text,cardId){
  const rows=parseStatementText(text,cardId),raw=parseStatementSummary(text),meta0=normalizeStatementSummary(text,rows,raw),rec=stmtReconcileRowsToBankSpending(rows,meta0),meta=stmtFinalizeSummaryConfidence(meta0,rec.rows);
  const spend=rec.rows.filter(r=>r.kind==='spend').reduce((a,r)=>a+Math.abs(+r.amount||0),0),payments=rec.rows.filter(r=>r.kind==='payment').reduce((a,r)=>a+Math.abs(+r.amount||0),0),fees=rec.rows.filter(r=>r.kind==='fee').reduce((a,r)=>a+Math.abs(+r.amount||0),0);
  let score=Math.min(rec.rows.length,120)*2;
  if(meta.summaryEquationOk)score+=80;
  if(meta.summaryTrusted)score+=120;
  if(Number.isFinite(+meta.spendingTotal))score+=Math.max(0,50-Math.min(50,Math.abs(spend-(+meta.spendingTotal))*2));
  if(Number.isFinite(+meta.paymentsTotal)&&payments>0)score+=Math.max(0,30-Math.min(30,Math.abs(payments-(+meta.paymentsTotal))*2));
  if(Number.isFinite(+meta.feesTotal)&&fees>0)score+=Math.max(0,24-Math.min(24,Math.abs(fees-(+meta.feesTotal))*2));
  score-=rec.rows.filter(r=>!stmtValidIsoDate(r.date)||!Number.isFinite(+r.amount)||Math.abs(+r.amount)<=0).length*25;
  return{score,rows:rec.rows,meta}
}
async function stmtPdfPageTexts(pg){
  const ct=await pg.getTextContent(),items=(ct.items||[]).filter(i=>String(i.str||'').trim());
  const raw=items.map(i=>i.str+(i.hasEOL?'\n':' ')).join('');
  const lines=[];
  for(const it of items){const x=Number(it.transform?.[4]||0),y=Number(it.transform?.[5]||0),h=Math.max(1,Math.abs(Number(it.height||it.transform?.[3]||8)));let line=lines.find(l=>Math.abs(l.y-y)<=Math.max(2.2,Math.min(5,h*.42)));if(!line){line={y,items:[]};lines.push(line)}line.items.push({x,s:String(it.str||'')})}
  lines.sort((a,b)=>b.y-a.y);for(const l of lines)l.items.sort((a,b)=>a.x-b.x);
  const layout=lines.map(l=>l.items.map(i=>i.s).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');

  // V87: HALKBANK DETERMINISTIC TABLE ENGINE
  // Halkbank/Paraf işlem tablosu artık satır metni yamalarıyla değil, kolon koordinatlarıyla kurulur.
  // Tarih, Tutar ve ParafPara kolonları bağımsız toplanır; tarih-tutar eşleşmesi Y konumuna göre yapılır.
  // Açıklama parçaları iki işlem arasındaki gerçek dikey banda atanır. Böylece bir işlemin açıklaması
  // komşu işleme yapışamaz ve tutar aynı PDF satır objesinde olmasa bile işlem kaybolmaz.
  const pageU=layout.toLocaleUpperCase('tr-TR');
  let halkLayout=layout;
  const amountHeadLine=lines.findIndex(l=>l.items.some(i=>/TUTAR\s*\(?TL\)?/i.test(i.s)));
  const parafHeadLine=lines.findIndex(l=>l.items.some(i=>/PARAFPARA/i.test(i.s)));
  const amountHead=amountHeadLine>=0?lines[amountHeadLine].items.find(i=>/TUTAR\s*\(?TL\)?/i.test(i.s)):null;
  const parafHead=parafHeadLine>=0?lines[parafHeadLine].items.find(i=>/PARAFPARA/i.test(i.s)):null;
  const hasHalkTable=!!amountHead&&!!parafHead&&(pageU.includes('AÇIKLAMA')||pageU.includes('ACIKLAMA'));

  // V88: HALKBANK COORDINATE SUMMARY ENGINE
  // Halkbank özet kutusunda çok satırlı etiketlerin rakamları PDF.js metin sırasına göre
  // etiketin arasına/yanına düşebiliyor. Bu yüzden özet değerlerini metin regex'inden değil,
  // sol özet kolonundaki etiketlerin Y merkezine en yakın parasal hücreden okuyoruz.
  const hbLeft=lines.map((l,k)=>({k,y:Number(l.y),text:l.items.filter(i=>Number(i.x)<370).map(i=>String(i.s||'')).join(' ').replace(/\s+/g,' ').trim()}));
  const hbMoney=[];
  for(const l of lines)for(const it of l.items){
    const raw=String(it.s||'').trim(),x=Number(it.x),y=Number(l.y);
    if(x<210||x>365)continue;
    if(!/^[+\-]?\s*(?:\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d{2})$/.test(raw))continue;
    const value=stmtMoney(raw);if(Number.isFinite(value))hbMoney.push({x,y,raw,value});
  }
  const hbFindLine=(rx,afterY=null)=>{for(const l of hbLeft){if(afterY!=null&&l.y<=afterY)continue;if(rx.test(l.text.toLocaleUpperCase('tr-TR')))return l}return null};
  const hbNearestMoney=(targetY,maxDist=18)=>{let best=null,bd=Infinity;for(const m of hbMoney){const d=Math.abs(m.y-targetY);if(d<bd&&d<=maxDist){best=m;bd=d}}return best};
  const hbBetween=(rx1,rx2)=>{const a=hbFindLine(rx1),b=hbFindLine(rx2);if(!a||!b)return null;return hbNearestMoney((a.y+b.y)/2)};
  const hbAt=(rx)=>{const a=hbFindLine(rx);return a?hbNearestMoney(a.y):null};
  const hbPrev=hbBetween(/B[İI]R\s+[ÖO]NCEK[İI]\s+D[ÖO]NEM/,/EKSTRE\s+BORCU/);
  const hbSpend=hbAt(/D[ÖO]NEM\s+[İI][ÇC][İI]\s+BOR[ÇC]\s+TUTARI/);
  const hbFees=hbBetween(/TOPLAM\s+FA[İI]Z/,/VERG[İI]LER/);
  const hbPay=hbBetween(/D[ÖO]NEMSEL\s+ALACAK/,/KAYITLARI/);
  const hbDebtCandidates=hbLeft.filter(l=>/HESAP\s+BAK[İI]YES[İI]/.test(l.text.toLocaleUpperCase('tr-TR'))).map(l=>hbNearestMoney(l.y)).filter(Boolean);
  const hbDebt=hbDebtCandidates.find(m=>Math.abs(m.value)>0)||hbDebtCandidates[0]||null;
  const hbSummary={previousBalance:hbPrev?.value,spendingTotal:hbSpend?.value,feesTotal:hbFees?.value,paymentsTotal:hbPay?Math.abs(hbPay.value):null,periodDebt:hbDebt?.value};
  const hbSummaryKnown=Object.values(hbSummary).filter(v=>Number.isFinite(v)).length;
  const hasHalkSummary=hbSummaryKnown>=4;
  const hbSummaryLines=hasHalkSummary?[
    '__HANE_HALKBANK_SUMMARY_COORD__',
    Number.isFinite(hbSummary.previousBalance)?`Bir Önceki Dönem Ekstre Borcu: ${hbSummary.previousBalance.toFixed(2)}`:'',
    Number.isFinite(hbSummary.spendingTotal)?`Dönem İçi Borç Tutarı: ${hbSummary.spendingTotal.toFixed(2)}`:'',
    Number.isFinite(hbSummary.feesTotal)?`Toplam Faiz, Ücret, Vergiler: ${hbSummary.feesTotal.toFixed(2)}`:'',
    Number.isFinite(hbSummary.paymentsTotal)?`Dönemsel Alacak Kayıtları: ${hbSummary.paymentsTotal.toFixed(2)}`:'',
    Number.isFinite(hbSummary.periodDebt)?`Hesap Bakiyesi: ${hbSummary.periodDebt.toFixed(2)}`:''
  ].filter(Boolean):[];
  if(hasHalkSummary&&!hasHalkTable)halkLayout=[layout,...hbSummaryLines].join('\n');

  if(hasHalkTable){
    const amountX=Number(amountHead.x),parafX=Number(parafHead.x);
    const start=Math.max(amountHeadLine,parafHeadLine,0);
    let end=lines.length;
    for(let k=start+1;k<lines.length;k++){
      const t=lines[k].items.map(i=>i.s).join(' ').replace(/\s+/g,' ').trim().toLocaleUpperCase('tr-TR');
      if(/BİR\s+SONRAKİ|BIR\s+SONRAKI|TÜRKİYE\s+HALK\s+BANKASI|TURKIYE\s+HALK\s+BANKASI/.test(t)){end=k;break}
    }
    const dateRe=/^\d{1,2}[.\/-]\d{1,2}[.\/-](?:20\d{2}|\d{2})$/;
    const moneyRe=/^[+\-]?\s*(?:\d{1,3}(?:[.,]\d{3})*|\d+)[.,]\d{2}\s*\+?$/;
    const dateAnchors=[],amountCells=[],rewardCells=[];
    for(let k=start+1;k<end;k++){
      const li=lines[k];
      for(const it of li.items){
        const raw=String(it.s||'').trim(),x=Number(it.x),y=Number(li.y);
        if(dateRe.test(raw)&&x<amountX-80)dateAnchors.push({k,y,x,raw});
        if(moneyRe.test(raw)&&x>=amountX-32&&x<parafX-34)amountCells.push({k,y,x,raw});
        if(moneyRe.test(raw)&&x>=parafX-30)rewardCells.push({k,y,x,raw});
      }
    }
    // Sayfadaki görsel sırayı koru. lines dizisi zaten yukarıdan aşağı sıralı.
    dateAnchors.sort((a,b)=>a.k-b.k||b.y-a.y);
    const usedAmount=new Set();
    const txAnchors=[];
    for(const d of dateAnchors){
      let best=null,bestIdx=-1,bestDist=Infinity;
      for(let ai=0;ai<amountCells.length;ai++){
        if(usedAmount.has(ai))continue;
        const a=amountCells[ai],dist=Math.abs(a.y-d.y);
        // Tutar hücresi aynı işlem satırına çok yakın olmalı. PDF.js bazı fontlarda birkaç px kaydırabilir.
        if(dist<=13&&dist<bestDist){best=a;bestIdx=ai;bestDist=dist}
      }
      if(!best)continue;
      usedAmount.add(bestIdx);
      txAnchors.push({date:d,amount:best,y:(d.y+best.y)/2,k:d.k});
    }
    // Her açıklama fiziksel satırını yalnız en yakın GERÇEK tarih+tutar çiftine bağla.
    // Dış başlık/footer satırları için maksimum uzaklık da uygulanır.
    const descByIndex=txAnchors.map(()=>[]);
    for(let k=start+1;k<end;k++){
      const li=lines[k];
      const part=li.items.filter(i=>Number(i.x)>135&&Number(i.x)<amountX-12).map(i=>String(i.s||'')).join(' ').replace(/\s+/g,' ').trim();
      if(!part)continue;
      const pu=part.toLocaleUpperCase('tr-TR');
      if(/^(?:İŞLEM|ISLEM|TARİHİ|TARIHI|AÇIKLAMA|ACIKLAMA|TUTAR|KALAN|BORÇ|BORC|TAKSİT|TAKSIT|PARAFPARA)$/.test(pu))continue;
      if(/KART\s+NO|####-?\d+\/|ZEKİYE\s+EDA|^KIZAN$|BİR\s+ÖNCEKİ|BIR\s+ONCEKI|EKSTRE\s+BORCU/.test(pu))continue;
      let bi=-1,bd=Infinity;
      for(let i=0;i<txAnchors.length;i++){
        const dist=Math.abs(Number(li.y)-Number(txAnchors[i].y));
        if(dist<bd){bd=dist;bi=i}
      }
      // Halkbank satır aralığı tipik olarak 15-24 px. 14 px üstü başka blok/başlık kabul edilir.
      if(bi>=0&&bd<=14.5)descByIndex[bi].push({k,y:Number(li.y),text:part});
    }
    const tx=[];
    for(let i=0;i<txAnchors.length;i++){
      const a=txAnchors[i],parts=descByIndex[i].sort((x,y)=>x.k-y.k).map(x=>x.text);
      // Aynı fiziksel açıklama parçası PDF.js tarafından iki kez dönerse tekilleştir.
      const cleanParts=[];for(const q of parts){if(!cleanParts.length||cleanParts.at(-1)!==q)cleanParts.push(q)}
      const desc=cleanParts.join(' ').replace(/\s+/g,' ').trim();
      if(!desc)continue;
      let reward='';let rd=Infinity;
      for(const r of rewardCells){const d=Math.abs(r.y-a.y);if(d<=13&&d<rd){reward=r.raw;rd=d}}
      tx.push(`${a.date.raw} ${desc} ${a.amount.raw}${reward?' '+reward:''}`);
    }
    // Marker yalnız koordinatla doğrulanmış işlem satırlarının kullanılmasını sağlar.
    halkLayout=[...hbSummaryLines,'__HANE_HALKBANK_TABLE_ENGINE__','İşlem Tarihi Açıklama TUTAR(TL) ParafPara',...tx].join('\n');
  }
  return{raw,layout,halkLayout,hasHalkTable,hasHalkSummary}
}
const MAX_STATEMENT_FILE_BYTES=20*1024*1024;
async function readStatementFile(file){
  if(!file)throw new Error('Ekstre dosyası seçilmedi.');
  if(file.size>MAX_STATEMENT_FILE_BYTES)throw new Error('Ekstre dosyası 20 MB sınırını aşıyor.');
  const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name||'');
  if(!isPdf&&!String(file.type||'').startsWith('image/'))throw new Error('Yalnızca PDF veya fotoğraf ekstre desteklenir.');
  if(isPdf){
    const pe=document.getElementById('statementImportProgress');if(pe)pe.textContent='PDF MOTORU HAZIRLANIYOR...';
    await ensurePdfEngineReady();
    const pdfjs=await getStatementPdfRuntime();
    const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;let rawText='',layoutText='',halkText='',pages=[];
    for(let n=1;n<=Math.min(pdf.numPages,12);n++){
      const pg=await pdf.getPage(n),pt=await stmtPdfPageTexts(pg);pages.push(pg);rawText+='\n'+pt.raw;layoutText+='\n'+pt.layout;
      // Özet sayfalarını aynen, işlem tablosu olan sayfaları yalnız koordinat-doğrulanmış satırlarla taşı.
      halkText+='\n'+((pt.hasHalkTable||pt.hasHalkSummary)?pt.halkLayout:pt.layout)
    }
    const rawEval=rawText.replace(/\s/g,'').length>40?stmtInterpretationScore(rawText,statementImportCardId):{score:-1,rows:[],meta:{}},layoutEval=layoutText.replace(/\s/g,'').length>40?stmtInterpretationScore(layoutText,statementImportCardId):{score:-1,rows:[],meta:{}};
    let text=layoutEval.score>=rawEval.score?layoutText:rawText,textEval=layoutEval.score>=rawEval.score?layoutEval:rawEval;
    const layoutBank=stmtDetectBank(layoutText,statementImportCardId);
    if(layoutBank.id==='halkbank'&&halkText.replace(/\s/g,'').length>40){
      const halkEval=stmtInterpretationScore(halkText,statementImportCardId);
      // Halkbank'ta koordinat tablosu tek gerçek kaynak: regex yamalarının ürettiği footer/özet hareketlerini kökten önler.
      text=halkText;textEval=halkEval;
    }else if(['denizbank','teb','isbank'].includes(layoutBank.id)&&layoutEval.rows.length>=3){text=layoutText;textEval=layoutEval}
    const textChars=text.replace(/\s/g,'').length,dateTokens=(text.match(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b/g)||[]).length;
    // V90: Metin katmanında yeterli gerçek işlem varsa OCR zorunlu değildir.
    // summaryTrusted yalnız uzlaştırma kalitesidir; tek başına OCR'a düşürme sebebi olamaz.
    const minExpected=dateTokens>=6?Math.max(3,Math.floor(dateTokens*.25)):1;
    const hasUsableText=textChars>80&&textEval.rows.length>=minExpected;
    const suspicious=!hasUsableText;
    if(!suspicious)return text;
    // OCR yalnız metin katmanı gerçekten yetersizse denenir. OCR yüklenemezse mevcut metin
    // en az bir işlem içeriyorsa HANE dosyayı tamamen reddetmez; metin sonucuyla devam eder.
    try{
      let ocr='';const w=await getStatementOcrWorker('PDF OCR');for(let n=1;n<=pages.length;n++){statementOcrLabel=`PDF SAYFA ${n}/${pages.length}`;const pg=pages[n-1],vp=pg.getViewport({scale:1.8}),canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await pg.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;const r=await w.recognize(canvas);ocr+='\n'+(r.data.text||'')}
      const ocrEval=ocr.replace(/\s/g,'').length>40?stmtInterpretationScore(ocr,statementImportCardId):{score:-1,rows:[],meta:{}};
      if(textEval.score<0&&ocrEval.score<0)throw new Error('PDF içindeki işlem satırları okunamadı.');
      return ocrEval.score>textEval.score?ocr:text;
    }catch(ocrErr){
      console.warn('OCR yedeği kullanılamadı; PDF metin katmanıyla devam ediliyor.',ocrErr);
      if(textChars>80&&textEval.rows.length>0)return text;
      throw ocrErr;
    }
  }
  const pe=document.getElementById('statementImportProgress');if(pe)pe.textContent='OCR MOTORU HAZIRLANIYOR...';
  const w=await getStatementOcrWorker('FOTOĞRAF OKUNUYOR'),source=await statementImageForOcr(file);const r=await w.recognize(source);return r.data.text||''
}
function reconcileImportedStatementMultiplicity(card,period,rows){
  if(!card||!period)return 0;
  const expected={};
  for(const r of (rows||[]).filter(x=>!x.payment)){
    const signed=r.refund?-Math.abs(r.amount):Math.abs(r.amount);
    const k=stmtFingerprint(card.id,r.date,r.title,signed)+'|'+(r.installmentNo||0)+'/'+(r.installmentCount||0);
    expected[k]=(expected[k]||0)+1;
  }
  const groups={};
  for(const x of (state.expenses||[])){
    if(x.recurring||x.source!=='card'||x.cardId!==card.id)continue;
    if(String(x.date||'')<period.start||String(x.date||'')>period.end)continue;
    if(!x.importedFromStatement&&!x.statementImportMonth&&!x.importFingerprint&&!x.importBaseFingerprint)continue;
    const amt=+(x.actualAmount??x.amount)||0;
    const k=stmtFingerprint(card.id,x.date,x.title,amt)+'|'+(x.installmentNo||0)+'/'+(x.installmentCount||0);
    (groups[k]||(groups[k]=[])).push(x);
  }
  const drop=new Set();
  for(const [k,arr] of Object.entries(groups)){
    const keep=Math.max(0,expected[k]||0);
    if(arr.length<=keep)continue;
    arr.sort((a,b)=>String(a.id||'').localeCompare(String(b.id||'')));
    for(const x of arr.slice(keep))drop.add(x.id);
  }
  if(drop.size)state.expenses=(state.expenses||[]).filter(x=>!drop.has(x.id));
  return drop.size
}
async function confirmStatementImport(){
  if(statementImportMeta?.importBlocked){alert('Banka ekstre toplamları işlem satırlarıyla uyuşmuyor. Güvenlik nedeniyle içe aktarma kapalı.');return}
  if(statementImportBusy){showToast('EKSTRE KAYDI DEVAM EDİYOR');return}
  statementImportBusy=true;
  try{
  const c=state.cards.find(x=>x.id===statementImportCardId);if(!c)throw new Error('Seçilen kart artık bulunamadı.');
  const checks=[...document.querySelectorAll('[data-stmt-check]')],selected=[];let skipped=0;
  for(const el of checks){if(!el.checked)continue;const i=+el.dataset.stmtCheck,r=statementImportRows[i];if(!r)continue;const date=document.querySelector(`[data-stmt-date="${i}"]`)?.value||r.date,title=stmtCleanTitle(document.querySelector(`[data-stmt-title="${i}"]`)?.value||r.title),amount=Number(document.querySelector(`[data-stmt-amount="${i}"]`)?.value),categoryRaw=document.querySelector(`[data-stmt-category="${i}"]`)?.value||r.category,category=r.payment?'Kart Ödemesi':C.includes(categoryRaw)?categoryRaw:'Diğer';if(!stmtValidIsoDate(date)||!title||!Number.isFinite(amount)||amount===0){skipped++;continue}selected.push({...r,date,title,amount:Math.abs(amount),category})}
  if(!selected.length)throw new Error('Eklenecek geçerli hareket seçilmedi.');
  // Kayıt öncesi yalnızca aynı fiziksel parser bloğunun tekrarını kaldır.
  // Semantik olarak aynı olan gerçek tekrarları (örn. aynı gün 3 x 45,50 TL toplu taşıma) koru.
  const uniqueSelected=[];const selectedSeen=new Set();
  for(const r of selected){const k=r.physicalKey||null;if(k&&selectedSeen.has(k)){skipped++;continue}if(k)selectedSeen.add(k);uniqueSelected.push(r)}
  selected.length=0;selected.push(...uniqueSelected);
  state.statementCategoryRules=state.statementCategoryRules&&typeof state.statementCategoryRules==='object'?state.statementCategoryRules:{};for(const r of selected.filter(x=>!x.payment&&x.kind!=='fee')){const k=stmtMerchantKey(r.title),auto=stmtCategoryBase(r.title);if(k&&r.category&&r.category!==auto)state.statementCategoryRules[k]=r.category}
  const month=statementImportMonthForRows(c,selected),period=statementPeriodRange(c,month),preserveBalance=+c.balance||0;
  const replace=document.getElementById('stmtReplacePeriod')?.checked!==false;
  if(replace){const inPeriod=x=>String(x?.date||'')>=period.start&&String(x?.date||'')<=period.end;state.expenses=(state.expenses||[]).filter(x=>!(x.importedFromStatement&&x.cardId===c.id&&(inPeriod(x)||(x.statementImportMonth&&x.statementImportMonth===month)||statementMonthFor(c,x.date)===month)));state.cardPayments=(state.cardPayments||[]).filter(x=>!(x.importedFromStatement&&x.cardId===c.id&&(inPeriod(x)||(x.statementImportMonth&&x.statementImportMonth===month)||statementMonthFor(c,x.date)===month)))}
  const seen={},paySeen={},payExisting={},manualMatchedIds=new Set();let added=0,payAdded=0,feeAdded=0;
  for(const p of (state.cardPayments||[])){const k=[p.cardId,p.date,stmtCleanTitle(p.title||'KART ÖDEMESİ').toLocaleUpperCase('tr-TR'),Number(+p.amount||0).toFixed(2)].join('|');payExisting[k]=(payExisting[k]||0)+1}
  for(const r of selected){
    if(r.payment){const pk=[c.id,r.date,stmtCleanTitle(r.title||'KART ÖDEMESİ').toLocaleUpperCase('tr-TR'),Number(r.amount).toFixed(2)].join('|'),ord=(paySeen[pk]=(paySeen[pk]||0)+1);if(ord<=(payExisting[pk]||0)){skipped++;continue}state.cardPayments.push({id:id(),financeLinkId:'fin_'+id(),cardId:c.id,amount:r.amount,date:r.date,title:upper(r.title||'KART ÖDEMESİ'),importedFromStatement:true,statementMatched:true,statementImportMonth:month});payAdded++;continue}
    const signed=r.refund?-Math.abs(r.amount):Math.abs(r.amount),base=stmtFingerprint(c.id,r.date,r.title,signed);
    // S2 FIX: Manuel kayıt eşleştirmesinde banka açıklamasının birebir aynı olması zorunlu değildir.
    // Ana anahtar: aynı kart + aynı tarih + aynı tutar. Kategori ve başlık yalnızca en iyi adayı seçmek için kullanılır.
    const manualCandidates=(state.expenses||[]).filter(x=>!x.importedFromStatement&&!manualMatchedIds.has(x.id)&&x.source==='card'&&x.cardId===c.id&&x.date===r.date&&Math.abs((+(x.actualAmount??x.amount)||0)-signed)<.005).map(x=>{let score=0;if(String(x.category||'')===String(r.category||''))score+=4;if(stmtCleanTitle(x.title).toLocaleUpperCase('tr-TR')===stmtCleanTitle(r.title).toLocaleUpperCase('tr-TR'))score+=8;return{x,score}}).sort((a,b)=>b.score-a.score);
    const manualDup=manualCandidates[0]?.x||null;
    if(manualDup){manualMatchedIds.add(manualDup.id);manualDup.financeLinkId=manualDup.financeLinkId||'fin_'+id();manualDup.statementMatched=true;manualDup.statementImportMonth=month;manualDup.statementMatchFingerprint=base;manualDup.statementTitle=upper(r.title);skipped++;continue}
    const ord=(seen[base]=(seen[base]||0)+1),ex={id:id(),financeLinkId:'fin_'+id(),statementMatched:true,title:upper(r.title),amount:signed,actualAmount:signed,date:r.date,category:r.category,source:'card',cardId:c.id,recurring:false,memberId:'',attachment:'',importBaseFingerprint:base,importFingerprint:`${base}|#${ord}`,importedFromStatement:true,importedRefund:r.refund,statementImportMonth:month,installmentNo:r.installmentNo||null,installmentCount:r.installmentCount||null,totalAmount:r.installmentTotal||null,baseTitle:r.title};state.expenses.push(ex);added++;if(r.kind==='fee')feeAdded++
  }
  const num=id=>{const v=String(document.getElementById(id)?.value||'').trim();if(v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null};
  const previousBalance=num('stmtSummaryPrevious'),spendingInput=num('stmtSummarySpend'),feesTotal=num('stmtSummaryFees'),paymentsInput=num('stmtSummaryPayments'),debtInput=num('stmtSummaryDebt');
  const spendingTotal=spendingInput!=null&&spendingInput>=0?spendingInput:selected.filter(x=>x.kind==='spend').reduce((a,x)=>a+x.amount,0),paymentsTotal=paymentsInput!=null&&paymentsInput>=0?paymentsInput:selected.filter(x=>x.payment).reduce((a,x)=>a+x.amount,0),periodDebt=debtInput!=null&&debtInput>=0?debtInput:null;
  state.statementImports=Array.isArray(state.statementImports)?state.statementImports:[];state.statementImports=state.statementImports.filter(x=>!(x.cardId===c.id&&x.month===month));state.statementImports.push({id:id(),cardId:c.id,month,start:period.start,end:period.end,previousBalance,spendingTotal,feesTotal:feesTotal||0,paymentsTotal,periodDebt,rowCount:added,matchedExistingCount:(state.expenses||[]).filter(x=>x.cardId===c.id&&x.statementMatched&&x.statementImportMonth===month&&!x.importedFromStatement).length,paymentRowCount:payAdded,feeRowCount:feeAdded,importedAt:iso()});
  const reconciledRemoved=reconcileImportedStatementMultiplicity(c,period,selected);if(reconciledRemoved)skipped+=reconciledRemoved
  recalculateFinanceCore();const syncDebt=document.getElementById('stmtSyncDebt')?.checked&&periodDebt!=null;
  if(syncDebt){c.balanceAnchorDate=period.end;c.balanceAnchorAmount=periodDebt;c.balance=periodDebt+cardDerivedNet(c.id)}else{const derivedNow=cardDerivedNet(c.id);if(c.balanceAnchorDate&&Number.isFinite(+c.balanceAnchorAmount))c.balanceAnchorAmount=preserveBalance-derivedNow;else c.openingBalance=preserveBalance-derivedNow;c.balance=preserveBalance;}
  await save();modal=null;render();showToast(`${Math.max(0,added-feeAdded)} HARCAMA · ${feeAdded} VERGİ/FAİZ · ${payAdded} ÖDEME EKLENDİ${skipped?` · ${skipped} ATLANDI`:''}`)

  } finally { statementImportBusy=false }
}

async function saveCard(d,i){
  const sd=d.statementDate||iso(),dd=d.dueDate||iso();
  const sdate=new Date(sd+'T12:00:00'),ddate=new Date(dd+'T12:00:00');
  if(Number.isNaN(sdate.getTime())||Number.isNaN(ddate.getTime()))throw new Error('KART TARİHLERİ GEÇERSİZ');
  if(ddate<=sdate)throw new Error('SON ÖDEME TARİHİ HESAP KESİM TARİHİNDEN SONRA OLMALI');
  const existing=i?state.cards.find(z=>z.id===i):null,requestedBalance=Number(String(d.balance||'0').replace(',','.'))||0,derived=existing?cardDerivedNet(existing.id):0;
  const sharedLimitGroup=upper(String(d.sharedLimitGroup||'').trim()),sharedLimit=Math.max(0,Number(String(d.sharedLimit||'0').replace(',','.'))||0);
  const x={id:i||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'KART'),last4:(d.last4||'0000').replace(/\D/g,'').slice(-4).padStart(4,'0'),limit:+d.limit||0,sharedLimitGroup,sharedLimit:sharedLimitGroup?sharedLimit:0,balance:requestedBalance,openingBalance:requestedBalance-derived,statementDate:sd,dueDate:dd,statementDay:sdate.getDate(),dueDay:ddate.getDate(),style:d.style||'blackgold',network:'VISA'};
  if(existing?.balanceAnchorDate&&Number.isFinite(+existing.balanceAnchorAmount)){x.balanceAnchorDate=existing.balanceAnchorDate;x.balanceAnchorAmount=requestedBalance-derived;x.openingBalance=existing.openingBalance}
  if(i){const n=state.cards.findIndex(z=>z.id===i);state.cards[n]={...state.cards[n],...x}}else state.cards.push(x);
  await save();modal=null;render()
}
async function saveCardSpend(d,cardId){
  const c=state.cards.find(x=>x.id===cardId);if(!c)throw new Error('Kart bulunamadı');
  const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<=0)throw new Error('Tutar geçersiz');
  const date=d.date||iso(),title=upper((d.title||d.category||'KART HARCAMASI').trim()),category=d.category||'Diğer',count=d.paymentType==='Taksitli'?Math.max(2,Math.min(36,+d.installmentCount||2)):1,groupId=id();
  state.cardTransactions=state.cardTransactions||[];state.installments=state.installments||[];
  const per=Math.round(amount/count*100)/100;let allocated=0;
  for(let n=1;n<=count;n++){
    const base=new Date(date+'T12:00:00');base.setMonth(base.getMonth()+n-1);const partDate=iso(base),part=n===count?Math.round((amount-allocated)*100)/100:per;allocated+=part;
    const txId=id(),stmt=statementMonthFor(c,partDate),label=count>1?`${title} · ${n}/${count}`:title;
    state.cardTransactions.push({id:txId,cardId,amount:part,totalAmount:amount,title:label,baseTitle:title,category,date:partDate,purchaseDate:date,statementMonth:stmt,attachment:modal?.attachment||'',installmentGroup:groupId,installmentNo:n,installmentCount:count});
    state.expenses.push({id:id(),cardTxId:txId,source:'card',cardId,title:label,baseTitle:title,amount:part,actualAmount:part,totalAmount:amount,category,date:partDate,dueDate:partDate,recurring:false,paid:true,memberId:d.memberId||'',installmentGroup:groupId,installmentNo:n,installmentCount:count});
  }
  state.installments.push({id:groupId,cardId,title,category,totalAmount:amount,count,startDate:date,createdAt:iso()});
  await save();modal=null;render();
}
async function saveCardPayment(d,cardId){
  const c=state.cards.find(x=>x.id===cardId);if(!c)throw new Error('Kart bulunamadı');
  const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<=0)throw new Error('Tutar geçersiz');
  state.cardPayments=state.cardPayments||[];
  state.cardPayments.push({id:id(),cardId,amount,date:d.date||iso(),title:c.bank+' '+c.name+' ödeme'});
  await save();modal=null;render();
}
function drawChart(){
 const c=$('#chart');if(!c)return;const ctx=c.getContext('2d'),box=c.getBoundingClientRect(),dpr=devicePixelRatio||1,h=220,w=Math.max(280,box.width);c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);
 const [yy,mm]=state.selectedMonth.split('-').map(Number),labels=[],inc=[],exp=[];for(let n=reportMonths-1;n>=0;n--){const d=new Date(yy,mm-1-n,1),m=ym(d),t=totals(m);labels.push(d.toLocaleDateString('tr-TR',{month:'short'}).replace('.','').toLocaleUpperCase('tr-TR'));inc.push(t.i);exp.push(t.e)}
 ctx.clearRect(0,0,w,h);const pad={l:34,r:12,t:18,b:30},max=Math.max(1,...inc,...exp),plotH=h-pad.t-pad.b,plotW=w-pad.l-pad.r;ctx.font='9px sans-serif';ctx.textAlign='right';ctx.fillStyle='#71879a';ctx.strokeStyle='rgba(105,164,199,.12)';for(let j=0;j<=4;j++){const y=pad.t+plotH*j/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillText(Math.round(max*(1-j/4)/1000)+'K',pad.l-5,y+3)}
 const cs=getComputedStyle(document.documentElement),series=[[inc,cs.getPropertyValue('--gi').trim()||'#2bd48e'],[exp,cs.getPropertyValue('--ge').trim()||'#ff616d']];series.forEach(([arr,color])=>{const pts=arr.map((v,i)=>[pad.l+(arr.length===1?plotW/2:i*plotW/(arr.length-1)),pad.t+plotH-(v/max*plotH)]);const grad=ctx.createLinearGradient(0,pad.t,0,h-pad.b);grad.addColorStop(0,color+'33');grad.addColorStop(1,color+'00');ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.lineTo(pts.at(-1)[0],h-pad.b);ctx.lineTo(pts[0][0],h-pad.b);ctx.closePath();ctx.fillStyle=grad;ctx.fill();ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.stroke();pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],3.5,0,Math.PI*2);ctx.fillStyle='#071019';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke()})});ctx.textAlign='center';ctx.fillStyle='#91a7b8';ctx.font='9px sans-serif';labels.forEach((x,i)=>ctx.fillText(x,pad.l+(labels.length===1?plotW/2:i*plotW/(labels.length-1)),h-9));
}
let cropState=null;
function openProfileCrop(file,forSetup=false){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{cropState={img,zoom:1,x:0,y:0,setup:forSetup,drag:false,sx:0,sy:0,bx:0,by:0};const el=document.createElement('div');el.id='cropOverlay';el.className='cropOverlay';el.innerHTML=`<div class="cropSheet"><div class="cropHead"><b>PROFİL FOTOĞRAFINI AYARLA</b><button id="cropClose">×</button></div><div class="cropStage"><canvas id="cropCanvas" width="320" height="320"></canvas><div class="cropGuide"></div></div><label class="cropZoomLabel">YAKINLAŞTIR / UZAKLAŞTIR</label><input id="cropZoom" type="range" min="1" max="4" step="0.01" value="1"><div class="cropActions"><button class="btn" id="cropCancel">İPTAL</button><button class="btn gold" id="cropUse">KADRAJI KULLAN</button></div></div>`;document.body.appendChild(el);bindCrop()};img.src=r.result};r.readAsDataURL(file)}
function cropGeom(){const c=320,img=cropState?.img;if(!img)return null;const base=Math.max(c/img.width,c/img.height),scale=base*cropState.zoom,w=img.width*scale,h=img.height*scale;return{c,w,h}}
function clampCrop(){const g=cropGeom();if(!g)return;const mx=Math.max(0,(g.w-g.c)/2),my=Math.max(0,(g.h-g.c)/2);cropState.x=Math.max(-mx,Math.min(mx,cropState.x));cropState.y=Math.max(-my,Math.min(my,cropState.y))}
function drawCrop(){const cv=$('#cropCanvas'),g=cropGeom();if(!cv||!g)return;const ctx=cv.getContext('2d');ctx.clearRect(0,0,320,320);ctx.fillStyle='#000';ctx.fillRect(0,0,320,320);ctx.drawImage(cropState.img,(320-g.w)/2+cropState.x,(320-g.h)/2+cropState.y,g.w,g.h);ctx.save();ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.rect(0,0,320,320);ctx.arc(160,160,128,0,Math.PI*2,true);ctx.fill('evenodd');ctx.restore();ctx.beginPath();ctx.arc(160,160,128,0,Math.PI*2);ctx.strokeStyle='#f1cf7a';ctx.lineWidth=3;ctx.stroke()}
function closeCrop(){document.getElementById('cropOverlay')?.remove();cropState=null;const p=$('#profileInput');if(p)p.value=''}
function bindCrop(){const cv=$('#cropCanvas'),z=$('#cropZoom');drawCrop();z.oninput=e=>{cropState.zoom=+e.target.value;clampCrop();drawCrop()};const pos=e=>{const r=cv.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*320/r.width,y:(p.clientY-r.top)*320/r.height}};const down=e=>{e.preventDefault();const p=pos(e);cropState.drag=true;cropState.sx=p.x;cropState.sy=p.y;cropState.bx=cropState.x;cropState.by=cropState.y};const move=e=>{if(!cropState.drag)return;e.preventDefault();const p=pos(e);cropState.x=cropState.bx+p.x-cropState.sx;cropState.y=cropState.by+p.y-cropState.sy;clampCrop();drawCrop()};const up=()=>cropState.drag=false;cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('touchstart',down,{passive:false});cv.addEventListener('touchmove',move,{passive:false});cv.addEventListener('touchend',up,{passive:true});$('#cropClose').onclick=closeCrop;$('#cropCancel').onclick=closeCrop;$('#cropUse').onclick=async()=>{const g=cropGeom(),tmp=document.createElement('canvas');tmp.width=320;tmp.height=320;tmp.getContext('2d').drawImage(cropState.img,(320-g.w)/2+cropState.x,(320-g.h)/2+cropState.y,g.w,g.h);const out=document.createElement('canvas');out.width=512;out.height=512;out.getContext('2d').drawImage(tmp,32,32,256,256,0,0,512,512);const data=out.toDataURL('image/jpeg',.88),setup=cropState.setup;closeCrop();if(setup){setupPhoto=data;return}state.profile.photo=data;await save();render();showToast('PROFİL FOTOĞRAFI KAYDEDİLDİ')}}
function readImg(f,cb,max=420){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',.78))};img.src=r.result};r.readAsDataURL(f)}

async function backupNow(){
  await beginStorageExclusive('backup');
  try{
    const m=meta()||{},stored=localStorage.getItem(DATA);
    if(!m.salt||!stored)throw new Error('Yedeklenecek şifreli veri bulunamadı.');
    const p={format:'HANE-LOCKED-BACKUP',meta:{salt:m.salt},data:JSON.parse(stored),date:new Date().toISOString()},b=new Blob([JSON.stringify(p)],{type:'application/octet-stream'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='HANE-'+iso()+'.hane';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
  }catch(err){
    console.error('HANE backup error',err);
    alert('YEDEK OLUŞTURULAMADI: '+(err.message||err));
  }finally{
    endStorageExclusive();
  }
}

async function changePin(){
  const o=prompt('Mevcut PIN');
  if(!o)return;
  const n=prompt('Yeni 4 haneli PIN');
  if(!/^\d{4}$/.test(n||'')){alert('PIN 4 haneli olmalı');return}
  await beginStorageExclusive('pin-change');
  try{
    // Önce bekleyen kayıtlar diske tamamlanır, sonra mevcut PIN en güncel veri üzerinde doğrulanır.
    if(!(await unlock(o))){alert('PIN yanlış');return}
    recalculateFinanceCore();
    const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(n,salt),snapshot=cloneStateSnapshot(state),box=await encrypt(snapshot,k),nextData=JSON.stringify(box),nextMeta=JSON.stringify({salt:b64(salt)});
    commitEncryptedPair(nextMeta,nextData);
    key=k;
    alert('PIN değiştirildi');
  }catch(err){
    console.error('HANE PIN change error',err);
    alert('PIN DEĞİŞTİRİLEMEDİ: '+(err.message||err));
  }finally{
    endStorageExclusive();
  }
}
function schedule(){clearTimeout(timer);if(state)timer=setTimeout(lock,Math.max(1,+state.settings.lockMinutes||15)*60000)}function lock(){state=null;key=null;pin='';renderLock()}
function renderSetup(){$('#app').innerHTML=`<div class="setup premiumSetup"><div class="setupOfficialLogo">${haneFullLogo("setupBrandLogo")}</div><p class="setupBrandLine">DAHA DÜZENLİ BİR YAŞAM</p><form class="form" id="setupForm" style="width:100%"><button type="button" class="btn" id="photoBtn">PROFİL RESMİNİ DEĞİŞTİR</button>${input('name','İsim','')}${input('pin','4 Haneli PIN','','password','inputmode="numeric" maxlength="4"')}${input('pin2','PIN Tekrar','','password','inputmode="numeric" maxlength="4"')}<button class="btn gold">HANE’yi Kur</button></form><div class="notice" style="margin-top:12px;width:100%">İlk kurulumda tüm tutarlar ₺0 başlar.</div></div>`;$('#photoBtn').onclick=()=>$('#profileInput').click();$('#setupForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries());if(!/^\d{4}$/.test(d.pin)||d.pin!==d.pin2){alert('PIN 4 haneli ve aynı olmalı');return}const st=def();st.profile.name=upper(d.name||'HANE');st.profile.photo=setupPhoto;await setup(d.pin,st);render();schedule()}}
function renderLock(){if(!meta()){renderSetup();return}pin='';const preview=state?.profile||getLockPreview()||{},photo=(preview.photo||''),initial=esc(((preview.name||'H')+'').trim()[0]||'H');$('#app').innerHTML=`<div class="lock haneUltraLock"><div class="ultraLeftRails"></div><div class="ultraCenter"><div class="ultraTopBrand">${haneFullLogo("ultraBrandLogo")}</div><div class="ultraPortraitWrap"><div class="ultraPortraitInner">${photo?`<div class="portraitFallback" style="display:none">${initial}</div><img src="${photo}" alt="Profil" onerror="this.style.display='none'; if(this.previousElementSibling) this.previousElementSibling.style.display='grid'">`:`<div class="portraitFallback">${initial}</div>`}</div></div><div class="ultraWelcome">HOŞ GELDİN</div><div class="ultraSub">HANE SENİNLE DAHA GÜÇLÜ</div><div class="ultraName">${esc(preview.name||'PROFİL ADI')}</div><div class="pinDots signatureDots ultraDots">${[0,1,2,3].map(i=>`<i data-dot="${i}"></i>`).join('')}</div><div class="keypad signatureKeypad ultraKeypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-key="${n}">${n}</button>`).join('')}<button type="button" class="bioKey" data-key="bio">⌁</button><button type="button" data-key="0">0</button><button type="button" class="del" data-key="del">⌫</button></div><div class="signatureFooter ultraFooter"><span></span><b>PLANLA, UYGULA, BAŞAR</b><span></span></div></div><aside class="ultraQuote"><div class="quoteCardMini">${haneLogo(58,'quoteMiniLogo')}</div><div class="quoteColumn"><strong>DAHA İYİ<br>BİR SEN<br>HER GÜN<br>BAŞLAR.</strong><i></i><b>PLANLA<br>UYGULA<br>BAŞAR</b><i></i><b>HEDEFİNE<br>HER GÜN<br>BİR ADIM<br>DAHA YAKLAŞ.</b></div></aside><div class="ultraRightRails"></div></div>`;$$('[data-key]').forEach(b=>b.onclick=()=>{if(b.dataset.key==='bio'){showToast('Biyometrik giriş yakında');return}pinKey(b.dataset.key)});installPinKeyboard()}
async function pinKey(k){if(k==='del')pin=pin.slice(0,-1);else if(/^\d$/.test(String(k))&&pin.length<4)pin+=String(k);$$('[data-dot]').forEach((d,i)=>d.classList.toggle('on',i<pin.length));if(pin.length===4)setTimeout(()=>confirmPin(),140)}
function installPinKeyboard(){if(window.__hanePinKeyboardInstalled)return;window.__hanePinKeyboardInstalled=true;document.addEventListener('keydown',e=>{if(state||!document.querySelector('.haneSignatureLock, .haneUltraLock'))return;const k=e.key;if(/^\d$/.test(k)){e.preventDefault();pinKey(k);return}if(k==='Backspace'||k==='Delete'){e.preventDefault();pinKey('del');return}if(k==='Enter'||k==='NumpadEnter'){e.preventDefault();if(pin.length===4)confirmPin()}})}
async function confirmPin(){
  if(pin.length!==4){alert('4 HANELİ PIN GİR');return}
  const entered=pin;
  try{
    const ok=await unlock(entered);
    if(!ok){pin='';$$('[data-dot]').forEach(d=>d.classList.remove('on'));alert('PIN YANLIŞ');return}
    pin='';
    // Kilit açıldıktan sonra eski veriden kalan eksik alanları bir kez daha güvenli biçimde tamamla.
    state=normalizeV19(state||def());
    recalculateFinanceCore();
    current='home';modal=null;navHistory=[];
    render();
    schedule();
  }catch(err){
    console.error('HANE unlock/render error',err);
    pin='';
    // PIN doğrulandıysa kullanıcıyı kilit ekranında bırakma. Hata ayrıntısını veri silmeden görünür kıl.
    const app=document.getElementById('app');
    if(app)app.innerHTML=`<main class="phone"><div class="content"><div class="notice" style="margin:24px"><b>HANE AÇILIŞ HATASI</b><br><br>${esc(String(err?.message||err))}<br><br><button class="btn gold" id="haneRetryAfterUnlock">TEKRAR DENE</button></div></div></main>`;
    document.getElementById('haneRetryAfterUnlock')?.addEventListener('click',()=>{try{current='home';modal=null;render();schedule()}catch(e){console.error(e)}});
  }
}
function modalWrap(){return modal?`<div class="modal"><div class="sheet"><div class="sheetHead"><b>${esc(modal.title)}</b><button class="close" data-action="close">×</button></div>${modal.body}</div></div>`:''}
function render(){captureModalFormDraft();if(state)initBrowserNav();applyTheme();$('#app').innerHTML=`<main class="phone">${buildTopBar()}<div class="content">${view()}</div>${nav()}</main>${modalWrap()}`;bind();restoreModalFormDraft();if(returnScrollTop!=null){const y=returnScrollTop;returnScrollTop=null;requestAnimationFrame(()=>{const c=document.querySelector('.content');if(c)c.scrollTop=y})}if(current==='reports')requestAnimationFrame(drawChart)}



function bootHane(){
  try{
    recoverStorageTransaction();
    const profileInput=document.getElementById('profileInput');
    const receiptInput=document.getElementById('receiptInput');
    const restoreInput=document.getElementById('restoreInput');
    const statementImportInput=document.getElementById('statementImportInput');
    const appRoot=document.getElementById('app');
    if(!appRoot) throw new Error('Uygulama kök alanı bulunamadı');

    if(profileInput){
      profileInput.addEventListener('change',e=>{
        const f=e.target.files&&e.target.files[0];if(!f)return;
        if(!String(f.type||'').startsWith('image/')){alert('LÜTFEN BİR RESİM SEÇ');return}
        openProfileCrop(f,!state);
      });
    }
    if(receiptInput){
      receiptInput.addEventListener('change',e=>{
        const f=e.target.files&&e.target.files[0];if(!f||!modal)return;
        readImg(f,x=>{if(!modal)return;rememberModalForm();modal.attachment=x;const st=document.getElementById('expenseReceiptStatus');if(st)st.style.display='block';const btn=document.getElementById('expenseReceiptBtn');if(btn)btn.textContent='✓ FİŞ / FOTOĞRAF HAZIR';e.currentTarget.value=''},1280);
      });
    }

    if(statementImportInput){
      statementImportInput.addEventListener('change',async e=>{
        const input=e.currentTarget,f=input.files&&input.files[0];if(!f||!statementImportCardId)return;
        open('EKSTRE OKUNUYOR',`<div class="notice"><b id="statementImportProgress">DOSYA HAZIRLANIYOR...</b><br>Ekstre dosyası cihazdan dışarı gönderilmez. HANE yalnızca seçilen dosya türü için gereken okuma motorunu hazırlar; okuma cihazında yapılır. Yalnızca tarih, açıklama, tutar ve kategori HANE’ye kaydedilir.</div>`,{cardId:statementImportCardId});
        try{const text=await readStatementFile(f);const parsedRows=parseStatementText(text,statementImportCardId);let meta=normalizeStatementSummary(text,parsedRows,parseStatementSummary(text));const reconciled=stmtReconcileRowsToBankSpending(parsedRows,meta);meta=stmtFinalizeSummaryConfidence(meta,reconciled.rows);meta.autoDuplicateRemoved=reconciled.removed||0;meta.autoDuplicateAmount=reconciled.amount||0;meta.autoFeeReclassified=reconciled.reclassified||0;meta.autoFeeReclassifiedAmount=reconciled.reclassifiedAmount||0;const detected=stmtDetectBank(text,statementImportCardId),guard=stmtImportGuardStatus(meta,reconciled.rows,detected.id,statementImportCardId);meta.importBlocked=guard.blocked;meta.importGuardReasons=guard.reasons;meta.bankProfileId=detected.id;statementImportMeta=meta;open('EKSTRE ÖNİZLEME',statementPreview(statementImportCardId,reconciled.rows),{cardId:statementImportCardId})}catch(err){console.error(err);open('EKSTRE OKUNAMADI',`<div class="notice">${esc(err.message||'Dosya okunamadı.')}</div>`,{cardId:statementImportCardId})}finally{input.value=''}
      });
    }

    if(restoreInput){
      restoreInput.addEventListener('change',async e=>{
        const input=e.currentTarget;
        const f=input.files&&input.files[0];
        if(!f)return;
        try{
          const raw=await f.text();
          let p;
          try{p=JSON.parse(raw)}catch{throw new Error('DOSYA OKUNAMADI')}
          if(!p||typeof p!=='object')throw new Error('YEDEK İÇERİĞİ GEÇERSİZ');
          if(p.format!=='HANE-LOCKED-BACKUP')throw new Error('BU DOSYA HANE YEDEĞİ DEĞİL');
          if(!p.meta||!p.data||!p.meta.salt||!p.data.iv||!p.data.data)throw new Error('ŞİFRELİ YEDEK EKSİK VEYA BOZUK');
          const backupPin=prompt('Bu yedeğin PIN kodunu gir');
          if(!backupPin)throw new Error('GERİ YÜKLEME İPTAL EDİLDİ');
          let testState,backupKey;
          try{
            backupKey=await derive(backupPin,ub64(p.meta.salt));
            testState=await decrypt(p.data,backupKey);
            if(!testState||typeof testState!=='object'||!Array.isArray(testState.expenses)||!Array.isArray(testState.incomes))throw new Error('YEDEK VERİ YAPISI GEÇERSİZ');
            normalizeV19(testState);
          }catch{throw new Error('YEDEK PIN YANLIŞ VEYA DOSYA BOZUK')}
          // Yedek doğrulanmadan mevcut veri değişmez. Önce bekleyen tüm kayıtlar bitirilir,
          // sonra geri yükleme özel kilit altında tek işlem olarak yazılır.
          await beginStorageExclusive('restore');
          try{
            commitEncryptedPair(JSON.stringify({salt:p.meta.salt}),JSON.stringify(p.data));
            input.value='';
            alert('YEDEK DOĞRULANDI VE GERİ YÜKLENDİ. HANE YENİDEN AÇILACAK.');
            // Başarılı restore sonrasında eski oturumun hiçbir save() işlemi yeni yedeğin üstüne yazamaz.
            abortStorageExclusiveWaiters('Yedek geri yüklendi; uygulama yeniden açılıyor.');
            location.reload();
            return;
          }catch(restoreWriteErr){
            endStorageExclusive();
            throw restoreWriteErr;
          }
        }catch(err){
          console.error('HANE restore error',err);
          input.value='';
          alert('YEDEK AÇILAMADI: '+(err.message||err));
        }
      });
    }
    ['click','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(state)schedule()},{passive:true}));
    renderLock();
  }catch(err){
    console.error('HANE boot error',err);
    const app=document.getElementById('app');
    if(app){app.innerHTML='<div style="min-height:100vh;background:#000;color:#fff;padding:32px;font-family:sans-serif"><h2 style="color:#d8ad4f">HANE başlatılamadı</h2><p>'+esc(String(err.message||err))+'</p><button id="haneRetryBoot" style="padding:12px 16px">Tekrar Dene</button></div>';document.getElementById('haneRetryBoot')?.addEventListener('click',()=>location.reload())}
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootHane,{once:true});
else bootHane();
