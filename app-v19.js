
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
const META='HANE_LOCKED_META_V1',DATA='HANE_LOCKED_DATA_V1';
const enc=new TextEncoder(),dec=new TextDecoder();let state=null,key=null,current='home',modal=null,pin='',timer=null,setupPhoto='',themeDraft=null,reportPeriod='month',reportCustomStart='',reportCustomEnd='',txFilter='all',financeTab='cards',navHistory=[],calendarMonth='',calendarDay='',txSearch='',txDate='',txCategory='',txPay='',txMin='',txMax='',txMember='',cardStatementMonth='',statementImportCardId='',statementImportRows=[],statementImportMeta={};
let browserNavReady=false;
let normalExpensesOpen=true,fixedExpensesOpen=true,returnScrollTop=null;
const Q=['Bugün küçük adımlar, yarın büyük rahatlık getirir.','Disiplin, özgürlüğün kapısını açar.','Küçük birikimler büyük huzur getirir.','Planlı para, güçlü yarınlar demektir.'];
const BASE_C=['Kira','Aidat','Market','Manav','Fırın','Harçlık','Kafe','Yemek','Restoran','Giyim','Online Alışveriş','Elektronik','Mobilya','Ev Bakım','Kırtasiye','Kitap','Kozmetik','Kişisel Bakım','Spor','Oyun','Abonelik','Akaryakıt','Otopark','Otoyol/Köprü','Araç Bakım','Ulaşım','Kuyumculuk','Kargo','Sağlık','Eğitim','Çocuk','Evcil Hayvan','Ev','Temizlik','Eğlence','Tatil','Konaklama','Uçak','Hediye','Bağış','Sigorta','Vergi','Banka Masrafı','Faiz','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Diğer'];
const BASE_NORMAL_C=['Market','Manav','Fırın','Harçlık','Kafe','Yemek','Restoran','Giyim','Online Alışveriş','Elektronik','Mobilya','Ev Bakım','Kırtasiye','Kitap','Kozmetik','Kişisel Bakım','Spor','Oyun','Abonelik','Akaryakıt','Otopark','Otoyol/Köprü','Araç Bakım','Ulaşım','Kuyumculuk','Kargo','Sağlık','Eğitim','Çocuk','Evcil Hayvan','Ev','Temizlik','Eğlence','Tatil','Konaklama','Uçak','Hediye','Bağış','Sigorta','Vergi','Banka Masrafı','Faiz','Diğer'];
const BASE_FIXED_C=['Kira','Aidat','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Abonelik','Sigorta','Vergi'];
let C=[...BASE_C];
let NORMAL_C=[...BASE_NORMAL_C];
let FIXED_C=[...BASE_FIXED_C];
const I={Kira:'🏠',Aidat:'🏢',Market:'🛒',Manav:'🍎',Fırın:'🥖',Harçlık:'💵',Kafe:'☕',Yemek:'🍽️',Restoran:'🍴',Giyim:'👕',Akaryakıt:'⛽',Faturalar:'🧾',İnternet:'📡',Elektrik:'⚡',Su:'💧',Doğalgaz:'🔥','Cep Telefonu':'📱',Ulaşım:'◆',Sağlık:'✚',Eğitim:'✎',Ev:'⌂',Temizlik:'✦',Çocuk:'★','Evcil Hayvan':'♣','Kişisel Bakım':'✧',Abonelik:'◎',Eğlence:'♪',Tatil:'☀',Hediye:'🎁',Sigorta:'◇',Vergi:'▤',Diğer:'●'};
const CAT_COLORS={Kira:'#d8ad4f',Aidat:'#a86ef7',Market:'#19d77d',Manav:'#7ed957',Fırın:'#e5a85b',Harçlık:'#d9b44a',Kafe:'#c58a52',Yemek:'#ff8b5c',Restoran:'#ff6f61',Giyim:'#c084fc','Online Alışveriş':'#8b5cf6',Elektronik:'#38bdf8',Mobilya:'#c4a484','Ev Bakım':'#f59e0b',Kırtasiye:'#60a5fa',Kitap:'#818cf8',Kozmetik:'#f472b6','Kişisel Bakım':'#ec4899',Spor:'#22c55e',Oyun:'#a78bfa',Abonelik:'#6366f1',Akaryakıt:'#f59e0b',Otopark:'#64748b','Otoyol/Köprü':'#94a3b8','Araç Bakım':'#f97316',Ulaşım:'#4dd6c7',Kuyumculuk:'#e0b341',Kargo:'#06b6d4',Sağlık:'#ff5f78',Eğitim:'#60a5fa',Çocuk:'#fb7185','Evcil Hayvan':'#34d399',Ev:'#d8ad4f',Temizlik:'#22d3ee',Eğlence:'#f06dad',Tatil:'#fbbf24',Konaklama:'#eab308',Uçak:'#0ea5e9',Hediye:'#e879f9',Bağış:'#14b8a6',Sigorta:'#38bdf8',Vergi:'#94a3b8','Banka Masrafı':'#a3a3a3',Faiz:'#ef4444',Faturalar:'#ff8c42','İnternet':'#6ed4ff',Elektrik:'#ffd84d',Su:'#3fa9ff','Doğalgaz':'#ff6b45','Cep Telefonu':'#b879ff',Diğer:'#9ca3af'};
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
  const alias={'Online Alışveriş':'Market','Elektronik':'Cep Telefonu','Mobilya':'Ev','Ev Bakım':'Ev','Kırtasiye':'Eğitim','Kitap':'Eğitim','Kozmetik':'Sağlık','Kişisel Bakım':'Sağlık','Spor':'Sağlık','Oyun':'Eğlence','Abonelik':'Faturalar','Otopark':'Ulaşım','Otoyol/Köprü':'Ulaşım','Araç Bakım':'Akaryakıt','Kuyumculuk':'Hediye','Kargo':'Ulaşım','Çocuk':'Harçlık','Evcil Hayvan':'Sağlık','Tatil':'Eğlence','Konaklama':'Ev','Uçak':'Ulaşım','Hediye':'Harçlık','Bağış':'Harçlık','Sigorta':'Faturalar','Vergi':'Faturalar','Banka Masrafı':'Faturalar','Faiz':'Faturalar'};
  const path=P[cat]||P[alias[cat]]||P['Diğer'];
  return `<svg class="catSvg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${path}</svg>`;
}
function catIcon(cat){return categoryIconSvg(cat,22)}
function catColor(cat){return state?.categoryMeta?.[cat]?.color||CAT_COLORS[cat]||'#d8ad4f'}
function catPremiumIcon(cat){return `<span class="catGem" style="--cat:${catColor(cat)}">${categoryIconSvg(cat,22)}</span>`}
function paymentLabel(x){if(x.source==='card'){const c=state.cards.find(c=>c.id===x.cardId);return c?`KART · ${esc(c.bank)} ${esc(c.name)}`:'KART'}return 'NAKİT'}
const id=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),iso=(d=new Date())=>{const x=d instanceof Date?d:new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')},ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const money=n=>state?.settings?.privacy?'••••••':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(+n||0),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const upper=v=>String(v??'').toLocaleUpperCase('tr-TR');
function haneLogo(size=54,cls=''){
  const n=Math.max(28,Number(size)||54);
  return `<img class="haneLogoImg ${cls}" src="icons/hane-app-icon.png?v=1948brand1" width="${n}" alt="HANE">`;
}
function haneFullLogo(cls=''){
  return `<img class="haneFullLogo ${cls}" src="icons/hane-app-icon.png?v=1948brand1" alt="HANE">`;
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
globe:`<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>`
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
  st.incomes=Array.isArray(st.incomes)?st.incomes:[];
  st.cards=Array.isArray(st.cards)?st.cards:[];
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
  st.settings=st.settings||{};if(typeof st.settings.darkMode!=='boolean')st.settings.darkMode=true;
  if(!/^\d{4}-\d{2}$/.test(String(st.selectedMonth||'')))st.selectedMonth=ym(new Date());
  if(!st.settings.monthCoreGroup2Migrated)st.settings.monthCoreGroup2Migrated=true;
  if(typeof st.settings.privacy!=='boolean')st.settings.privacy=false;st.members=Array.isArray(st.members)?st.members:[];if(!st.members.length)st.members=[{id:'me',name:'BEN',icon:'👤'}];st.homeLayout=Array.isArray(st.homeLayout)?st.homeLayout:['summary','quick','quote','chart','month','recommended','monthly'];st.homeHidden=Array.isArray(st.homeHidden)?st.homeHidden:[];
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
  st.fixedPayments.forEach(p=>{const ex=st.expenses.find(x=>x.id===p.expenseId);if(ex)p.category=ex.category||'Diğer';if(p.actualAmount==null)p.actualAmount=+p.amount||0});
  st.expenses.forEach(x=>{if(x.recurring){if(x.billAmount==null)x.billAmount=+x.amount||0}else if(x.actualAmount==null)x.actualAmount=+x.amount||0});
  if(!st.settings.financeCoreGroup1Migrated){
    // Eski kart hareketlerinden ana gider kaydı olmayanları veri kaybetmeden gider kaydına taşı.
    (st.cardTransactions||[]).forEach(t=>{if((st.expenses||[]).some(e=>e.cardTxId===t.id))return;st.expenses.push({id:id(),cardTxId:t.id,source:'card',cardId:t.cardId,title:t.title||'KART HARCAMASI',amount:+t.amount||0,actualAmount:+t.amount||0,category:t.category||'Diğer',date:t.date||iso(),dueDate:t.date||iso(),recurring:false,paid:true,attachment:t.attachment||'',installmentGroup:t.installmentGroup,installmentNo:t.installmentNo,installmentCount:t.installmentCount})});
    // Eski "ödendi" sabit giderleri için eksik ödeme kaydını üret.
    st.expenses.filter(x=>x.recurring).forEach(x=>{const months=[...(x.paidMonths||[])];if(x.paid&&x.date)months.push(String(x.date).slice(0,7));[...new Set(months)].filter(Boolean).forEach(m=>{if(!st.fixedPayments.some(p=>p.expenseId===x.id&&p.month===m))st.fixedPayments.push({id:id(),expenseId:x.id,month:m,amount:fixedBillAmount(x),actualAmount:fixedBillAmount(x),date:(String(x.dueDate||x.date||'').startsWith(m)?(x.dueDate||x.date):(m+'-'+String(new Date((x.dueDate||x.date||iso())+'T12:00:00').getDate()).padStart(2,'0'))),title:x.title,category:x.category||'Diğer',source:x.source||'cash',cardId:(x.source==='card'?x.cardId:null)})})});
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
function fixedPaymentDate(x,m=state?.selectedMonth){return fixedPaymentFor(x,m)?.date||x.dueDate||x.date||iso()}
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
  (state?.expenses||[]).filter(x=>!x.recurring&&x.source==='card'&&x.cardId).forEach(x=>{if(!x.cardTxId)x.cardTxId=id();const c=state.cards.find(c=>c.id===x.cardId);out.push({id:x.cardTxId,expenseId:x.id,cardId:x.cardId,amount:+(x.actualAmount??x.amount)||0,totalAmount:x.totalAmount,title:x.title,baseTitle:x.baseTitle,category:x.category,date:x.date,purchaseDate:x.purchaseDate||x.date,statementMonth:c?statementMonthFor(c,x.date):String(x.date||'').slice(0,7),attachment:x.attachment||'',installmentGroup:x.installmentGroup,installmentNo:x.installmentNo,installmentCount:x.installmentCount,importedRefund:isCardRefund(x),derived:true})});
  (state?.fixedPayments||[]).filter(p=>p.source==='card'&&p.cardId).forEach(p=>{if(!p.cardTxId)p.cardTxId=id();const ex=state.expenses.find(x=>x.id===p.expenseId),c=state.cards.find(c=>c.id===p.cardId);out.push({id:p.cardTxId,fixedPaymentId:p.id,expenseId:p.expenseId,cardId:p.cardId,amount:+(p.actualAmount??p.amount)||0,title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',date:p.date||iso(),statementMonth:c?statementMonthFor(c,p.date||iso()):String(p.date||'').slice(0,7),derived:true})});
  state.cardTransactions=out
}
function recalculateFinanceCore(){
  if(!state)return;
  syncDerivedCardTransactions();
  (state.cards||[]).forEach(c=>{if(!Number.isFinite(+c.openingBalance))c.openingBalance=+c.balance||0;const anchored=!!c.balanceAnchorDate&&Number.isFinite(+c.balanceAnchorAmount),base=anchored?(+c.balanceAnchorAmount||0):(+c.openingBalance||0);c.balance=Math.max(0,base+cardDerivedNet(c.id))})
}
function goTo(next,{replace=false,fromPop=false}={}){if(!next||next===current)return;if(!fromPop)navHistory.push(current);current=next;modal=null;if(browserNavReady&&!fromPop){const st={haneView:next};replace?history.replaceState(st,''):history.pushState(st,'')}render()}
function goBack(){if(current==='theme')themeDraft=null;const prev=navHistory.pop()||'home';current=prev;modal=null;if(browserNavReady)history.replaceState({haneView:current},'');render()}
function initBrowserNav(){if(browserNavReady)return;browserNavReady=true;history.replaceState({haneView:current},'');window.addEventListener('popstate',e=>{if(!state)return;const next=e.state?.haneView||navHistory.pop()||'home';if(next!==current){current=next;modal=null;render()}})}
function summaryDetailBody(kind){
  const m=state.selectedMonth;
  const inc=state.incomes.filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,_kind:'income'}));
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
  return `<div class="summaryDetailBox"><div class="summaryDetailHead"><small>${m}</small><h2>${kind==='income'?money(T.i):kind==='expense'?money(T.e):money(T.r)}</h2><b>${title}</b></div>${kind==='remain'?`<div class="summaryBreakdown"><span>Gelir <b style="color:var(--green)">${money(T.i)}</b></span><span>Gider <b style="color:var(--red)">${money(T.e)}</b></span><span>Kalan <b style="color:var(--gold2)">${money(T.r)}</b></span></div>`:''}<div class="list">${rows||'<div class="notice">KAYIT YOK.</div>'}</div></div>`
}



const b64=a=>{let s='';for(const b of new Uint8Array(a))s+=String.fromCharCode(b);return btoa(s)},ub64=s=>{const r=atob(s),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
async function derive(p,salt){const m=await crypto.subtle.importKey('raw',enc.encode('HANE|LOCKED|'+p),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encrypt(st,k){const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,enc.encode(JSON.stringify(st)));return{iv:b64(iv),data:b64(data)}}
async function decrypt(box,k){const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(box.iv)},k,ub64(box.data));return JSON.parse(dec.decode(p))}
function meta(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch{return null}}
async function save(){
  if(!state)throw new Error('Uygulama verisi hazır değil');
  recalculateFinanceCore();
  if(!key)throw new Error('Şifreleme anahtarı hazır değil. Uygulamayı kilitleyip PIN ile tekrar girin.');
  const box=await encrypt(state,key);
  try{localStorage.setItem(DATA,JSON.stringify(box))}catch(e){throw new Error('Cihaz depolamasına kayıt yapılamadı')}
}
async function setup(p,st){const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(p,salt),box=await encrypt(st,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt)}));key=k;state=normalizeV19(st)}
async function unlock(p){const m=meta();if(!m)return false;try{
  const k=await derive(p,ub64(m.salt)),st=await decrypt(JSON.parse(localStorage.getItem(DATA)),k);
  st.cardPayments=Array.isArray(st.cardPayments)?st.cardPayments:[];
  st.fixedPayments=Array.isArray(st.fixedPayments)?st.fixedPayments:[];
  st.flexTransactions=Array.isArray(st.flexTransactions)?st.flexTransactions:[];
  st.installments=Array.isArray(st.installments)?st.installments:[];
  st.cardTransactions=Array.isArray(st.cardTransactions)?st.cardTransactions:[];
  key=k;state=normalizeV19(st);localStorage.setItem(META,JSON.stringify({salt:m.salt}));state.selectedMonth=ym(new Date());calendarMonth=state.selectedMonth;calendarDay='';applyTheme();return true
}catch{return false}}
function def(){return{version:19,selectedMonth:ym(new Date()),profile:{name:'',photo:'',motto:'Disiplin, özgürlüğün kapısını açar.'},settings:{lockMinutes:15,leadDays:3,notifications:false,darkMode:true},theme:{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'},incomes:[],expenses:[],cards:[],accounts:[],flexAccounts:[],customCategories:[],categoryMeta:{},cardTransactions:[],cardPayments:[],statementImports:[],statementCategoryRules:{},fixedPayments:[],flexTransactions:[],installments:[],members:[{id:'me',name:'BEN',icon:'👤'}],homeLayout:['summary','quick','quote','chart','month','recommended','monthly'],homeHidden:[]}}
function applyTheme(){if(!state)return;const t=state.theme||{},dark=state.settings?.darkMode!==false;document.documentElement.classList.toggle('lightMode',!dark);document.documentElement.classList.toggle('darkMode',dark);document.documentElement.style.setProperty('--bg',dark?(t.bg||'#000'):'#f3f1eb');document.documentElement.style.setProperty('--gold',t.accent||'#d8ad4f');document.documentElement.style.setProperty('--gold2',t.accent||'#f0cd77');document.documentElement.style.setProperty('--gi',t.income||'#248ef5');document.documentElement.style.setProperty('--ge',t.expense||'#ff4658');document.documentElement.style.setProperty('--gr',t.remain||'#16d77d')}
function totals(m=state.selectedMonth){const i=state.incomes.filter(x=>String(x.date||'').startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0),e=actualExpenseEntriesForMonth(m).reduce((s,x)=>s+(+x.amount||0),0);return{i,e,r:i-e}}
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
  const expenses=(state.expenses||[]).filter(x=>!x.recurring&&x.source==='card'&&x.cardId===cardId&&inside(x.date)).map(x=>({kind:isCardRefund(x)?'refund':'spend',id:x.id,date:x.date,title:x.title,category:x.category,amount:+(x.actualAmount??x.amount)||0,action:'editExpense'}));
  const fixed=(state.fixedPayments||[]).filter(p=>p.source==='card'&&p.cardId===cardId&&inside(p.date)).map(p=>({kind:'fixed',id:p.id,date:p.date,title:p.title||'SABİT GİDER',category:p.category,amount:+(p.actualAmount??p.amount)||0,action:'editStatementFixedPayment'}));
  const pays=(state.cardPayments||[]).filter(p=>p.cardId===cardId&&inside(p.date)).map(p=>({kind:'payment',id:p.id,date:p.date,title:'KART ÖDEMESİ',category:'Ödeme',amount:+p.amount||0,action:'editCardPayment'}));
  return [...expenses,...fixed,...pays].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
function cardStatementBody(cardId,m=cardStatementMonth||state.selectedMonth){
  const c=state.cards.find(x=>x.id===cardId);if(!c)return '<div class="notice">KART BULUNAMADI.</div>';const period=statementPeriodRange(c,m),items=cardStatementItems(cardId,m),purchases=items.filter(x=>x.kind==='spend'||x.kind==='fixed').reduce((n,x)=>n+Math.max(0,x.amount),0),refunds=items.filter(x=>x.kind==='refund').reduce((n,x)=>n+Math.abs(x.amount),0),paid=items.filter(x=>x.kind==='payment').reduce((n,x)=>n+x.amount,0),net=purchases-refunds-paid,snap=statementSnapshot(cardId,m),bankSpend=snap&&Number.isFinite(+snap.spendingTotal)?+snap.spendingTotal:null,bankDebt=snap&&snap.periodDebt!=null&&Number.isFinite(+snap.periodDebt)?+snap.periodDebt:null,diff=bankSpend==null?0:purchases-bankSpend;
  const reconcile=snap?`<div class="statementBankSummary"><div><small>BANKA HARCAMA TOPLAMI</small><b>${bankSpend==null?'-':money(bankSpend)}</b></div><div><small>BANKA DÖNEM BORCU</small><b>${bankDebt==null?'-':money(bankDebt)}</b></div>${bankSpend!=null&&Math.abs(diff)>.01?`<p>⚠ HANE işlem toplamı ile banka ekstresi arasında <b>${money(Math.abs(diff))}</b> fark var. Eksik/fazla okunan işlem olabilir.</p>`:`<p>✓ Ekstre toplamı ile HANE kayıtları uyumlu.</p>`}</div>`:'';
  return `<div class="statementHead"><button data-action="cardStatementShift" data-dir="-1" data-id="${c.id}">‹</button><div><small>EKSTRE DÖNEMİ</small><b>${period.label}</b></div><button data-action="cardStatementShift" data-dir="1" data-id="${c.id}">›</button></div><div class="statementHero"><small>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</small><h2>${money(c.balance)}</h2><b>KART BORCU</b></div>${reconcile}<div class="statementPrivacyNote">🔒 Ekstre dosyası yüklenmez · cihazda okunur · yalnızca işlem satırları kaydedilir</div><div class="statementCardActions"><button class="btn gold" data-action="statementImport" data-id="${c.id}">▣ EKSTRE OKUT</button><button class="btn" data-action="cardSpend" data-id="${c.id}">＋ HARCAMA EKLE</button><button class="btn" data-action="cardPay" data-id="${c.id}">₺ ÖDEME YAPTIM</button><button class="btn" data-action="editCard" data-id="${c.id}">KARTI DÜZENLE</button></div><div class="statementTotals refundAware"><span>HANE HARCAMALARI <b>${money(purchases)}</b></span><span>İADELER <b style="color:var(--green)">${money(refunds)}</b></span><span>ÖDEMELER <b>${money(paid)}</b></span><span>DÖNEM NET <b>${money(net)}</b></span></div><div class="list">${items.length?items.map(x=>{const refund=x.kind==='refund',payment=x.kind==='payment',label=payment?'ÖDEME':refund?'İADE':x.kind==='fixed'?'SABİT GİDER':'HARCAMA',color=payment||refund?'var(--green)':'var(--red)',sign=payment||refund?'-':'+';return `<div class="item statementItem ${refund?'refundItem':''}" data-action="${x.action}" data-id="${x.id}" data-direct-edit="1"><div class="ico premiumIco">${payment?premiumIcon('cards',22):catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · ${label}${x.category?' · '+esc(x.category):''}</small></div><div class="right"><b style="color:${color}">${sign}${money(Math.abs(x.amount))}</b><small class="tapDetailHint">DÜZENLE / SİL ›</small></div></div>`}).join(''):'<div class="notice">BU EKSTRE DÖNEMİNDE HAREKET YOK.</div>'}</div>`
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
  if(current==='home')return`<div class="top homeTop"><button class="ib premiumTopIcon menuBtn" data-action="openMenu">☰</button><div class="brand brandLogo officialBrand">${haneLogo(44,'brandMark')}</div><div class="topRight"><button class="ib premiumTopIcon" data-tab="alerts">${premiumIcon('bell',30)}</button><button class="ib premiumTopIcon" data-tab="settings">${premiumIcon('settings',30)}</button></div></div>`;
  const t={transactions:'HAREKETLER',fixed:'GİDERLER',cards:'FİNANS',calendar:'TAKVİM',reports:'RAPORLAR',profile:'PROFİL',backup:'YEDEKLEME',settings:'AYARLAR',members:'HANE ÜYELERİ',homeEdit:'ANA SAYFAYI DÜZENLE',categories:'KATEGORİLER',theme:'TEMA STÜDYOSU',alerts:'HATIRLATMALAR',about:'HAKKINDA',monthSpent:'BU AY HARCANAN',monthPaid:'BU AY ÖDENEN'};
  return`<div class="top"><button class="back" data-action="back">‹</button><div class="brand">${t[current]||'HANE'}</div><div class="topRight"><button class="ib premiumTopIcon" data-tab="alerts">${premiumIcon('bell',28)}</button><button class="ib premiumTopIcon" data-tab="settings">${premiumIcon('settings',28)}</button></div></div>`
}
function nav(){const items=[['home','home','ANA EKRAN'],['transactions','transactions','HAREKETLER'],['fixed','fixed','GİDERLER'],['cards','cards','FİNANS'],['reports','report','RAPORLAR'],['profile','profile','PROFİL']];return`<nav class="nav premiumNav v1947CleanNav">${items.map(x=>`<button data-tab="${x[0]}" class="${current===x[0]?'active':''}"><span class="navIcon">${premiumIcon(x[1],30)}</span><span>${x[2]}</span></button>`).join('')}</nav>`}
function menuBody(){const a=[['home','home','ANA EKRAN'],['transactions','transactions','HAREKETLER'],['fixed','expense','GİDERLER'],['cards','cards','KARTLAR / ESNEK HESAP'],['calendar','fixed','TAKVİM'],['reports','report','RAPORLAR'],['alerts','bell','HATIRLATMALAR'],['settings','settings','AYARLAR'],['profile','profile','PROFİL']];return `<div class="menuList">${a.map(x=>`<button data-action="menuGo" data-go="${x[0]}"><i>${premiumIcon(x[1],24)}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div>`}

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
  const m=state.selectedMonth,card=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,kind:'card'})),normalCash=state.expenses.filter(x=>!x.recurring&&x.source!=='card'&&String(x.date||'').startsWith(m)&&x.paid===true).map(x=>({...x,amount:+(x.actualAmount??x.amount??0)||0,kind:'direct'})),fixedCash=(state.fixedPayments||[]).filter(p=>p.source!=='card'&&String(p.date||'').startsWith(m)).map(p=>{const ex=state.expenses.find(x=>x.id===p.expenseId);return {...p,id:p.id,expenseId:p.expenseId,title:p.title||ex?.title||'SABİT GİDER',category:p.category||ex?.category||'Diğer',amount:+(p.actualAmount??p.amount??0)||0,kind:'fixed'}}),direct=[...normalCash,...fixedCash],items=[...card,...direct].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),total=items.reduce((a,x)=>a+(+x.amount||0),0),cardTotal=card.reduce((a,x)=>a+(+x.amount||0),0),directTotal=direct.reduce((a,x)=>a+(+x.amount||0),0),p1=total?cardTotal/total*100:0;
  const byCard={};card.forEach(x=>{const k=x.cardId||'unknown';if(!byCard[k])byCard[k]={cardId:x.cardId,total:0,count:0,dates:[]};byCard[k].total+=+x.amount||0;byCard[k].count++;if(x.date&&!byCard[k].dates.includes(x.date))byCard[k].dates.push(x.date)});const cardGroups=Object.values(byCard).sort((a,b)=>b.total-a.total);
  const perCard=cardGroups.length?`<div class="section"><b>KREDİ KARTLARINA ÖDENEN</b><span>${cardGroups.length} KART</span></div><div class="cardPaymentBreakdown">${cardGroups.map(g=>{const c=state.cards.find(z=>z.id===g.cardId),name=c?`${esc(c.bank)} · ${esc(c.name||'KREDİ KARTI')}`:'KREDİ KARTI',last=c?`•••• ${esc(c.last4)}`:'',dates=g.dates.sort().reverse().slice(0,3).join(' · ');return `<button type="button" class="cardPaymentBreakdownRow" ${c?`data-action="cardStatement" data-id="${c.id}"`:''}><div class="cardPayIcon">${premiumIcon('cards',22)}</div><div class="cardPayInfo"><b>${name}</b><small>${last}${dates?' · '+dates:''}</small></div><div class="cardPayAmount"><b>${money(g.total)}</b><small>${g.count} ÖDEME${c?' · EKSTRE ›':''}</small></div></button>`}).join('')}</div>`:'';
  return`<div class="monthDetailPage"><div class="detailHero card"><div><small>${monthLabel(m)}</small><h2>${money(total)}</h2><span>TOPLAM ÖDENEN</span></div><div class="detailDonut" style="background:${total?`conic-gradient(var(--gold2) 0 ${p1}%,var(--green) ${p1}% 100%)`:'#151515'}"><div><b>${items.length}</b><small>ÖDEME</small></div></div></div><div class="detailMiniGrid"><div class="detailMini"><i>▭</i><span>KART ÖDEMELERİ</span><b>${money(cardTotal)}</b></div><div class="detailMini"><i>✓</i><span>NAKİT / GİDER</span><b>${money(directTotal)}</b></div></div><div class="section"><b>ÖDEME DAĞILIMI</b><span></span></div><div class="detailCategoryList"><div class="detailCat"><div class="detailCatIcon">▭</div><div class="detailCatMid"><div><b>KART ÖDEMELERİ</b><span>${total?Math.round(cardTotal/total*100):0}%</span></div><div class="detailBar"><i style="width:${total?cardTotal/total*100:0}%;background:var(--gold2)"></i></div></div><strong>${money(cardTotal)}</strong></div><div class="detailCat"><div class="detailCatIcon">✓</div><div class="detailCatMid"><div><b>NAKİT / ÖDENEN GİDERLER</b><span>${total?Math.round(directTotal/total*100):0}%</span></div><div class="detailBar"><i style="width:${total?directTotal/total*100:0}%;background:var(--green)"></i></div></div><strong>${money(directTotal)}</strong></div></div>${perCard}<div class="section"><b>ÖDEMELER</b><span>${items.length} İŞLEM</span></div><div class="list detailTxList">${items.length?items.map(x=>`<div class="item" data-action="${x.kind==='card'?'editCardPayment':x.kind==='fixed'?'editStatementFixedPayment':'editExpense'}" data-direct-edit="1" data-id="${x.id}"><div class="ico premiumIco">${x.kind==='card'?premiumIcon('cards',22):catPremiumIcon(x.category)}</div><div><b>${esc(x.kind==='card'?(x.title||'KREDİ KARTI ÖDEMESİ'):x.title)}</b><small>${x.date||''} · ${x.kind==='card'?'KART ÖDEMESİ':'ÖDENDİ'}</small></div><div class="right"><b style="color:var(--green)">${money(x.amount)}</b></div></div>`).join(''):'<div class="notice">BU AY ÖDEME YOK.</div>'}</div></div>`
}
function recentMovementsHome(limit=12){
  const m=state.selectedMonth;
  const incomes=(state.incomes||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,_recentKind:'income'}));
  const expenses=actualExpenseEntriesForMonth(m).map(x=>({...x,_recentKind:x.recurring?'fixed':'expense'}));
  const cardPays=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,_recentKind:'cardPayment'}));
  const rows=[...incomes,...expenses,...cardPays].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.id||'').localeCompare(String(a.id||''))).slice(0,limit);
  const html=rows.map(x=>{let action='editExpense',rid=x.id,label='GİDER',sign='-',color='var(--red)',ico=catPremiumIcon(x.category||'Diğer');if(x._recentKind==='income'){action='editIncome';label='GELİR';sign='+';color='var(--green)';ico=premiumIcon('income',22)}else if(x._recentKind==='fixed'){action='editFixedPayment';rid=x.expenseId||x.id;label='SABİT GİDER';ico=catPremiumIcon(x.category||'Diğer')}else if(x._recentKind==='cardPayment'){action='editCardPayment';label='KART ÖDEMESİ';sign='';color='var(--gold2)';ico=premiumIcon('cards',22)}const card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;const pay=(x._recentKind==='expense'||x._recentKind==='fixed')?(x.source==='card'?'KART'+(card?' · '+esc(card.name):''):'NAKİT'):'';return `<div class="item recentHomeItem" data-action="${action}" data-id="${rid}"><div class="ico premiumIco">${ico}</div><div><b>${esc(x.title||label)}</b><small>${x.date||''} · ${label}${pay?' · '+pay:''}</small></div><div class="right"><b style="color:${color}">${sign}${money(x.amount)}</b><small class="tapDetailHint">AYRINTI ›</small></div></div>`}).join('');
  return `<div class="section"><b>SON HAREKETLER</b><button class="sectionLinkBtn" data-tab="transactions">TÜMÜ ›</button></div><div class="list recentHomeList">${html||'<div class="notice">BU AY HAREKET YOK.</div>'}</div>`;
}
function home(){const T=totals(),F=cashFlow(),s=Math.max(1,Math.abs(T.i)+Math.abs(T.e)+Math.max(0,T.r)),p1=T.i/s*100,p2=p1+T.e/s*100,r=rec(),q=Q[Math.floor(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()).getTime()/86400000)%Q.length];return`<div class="homeHero">
  <div class="homeHeroAvatar ava">${state.profile.photo?`<img src="${state.profile.photo}">`:esc((state.profile.name||'H')[0])}</div>
  <div class="homeHeroText">
    <small>MERHABA</small>
    <h2>${esc(state.profile.name||'HANE')}</h2>
    <div class="date">${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'})}</div>
  </div>
</div><div class="summary"><div class="sum" data-action="summaryDetail" data-kind="income"><label>Gelir</label><strong style="color:var(--green)">${money(T.i)}</strong></div><div class="sum" data-action="summaryDetail" data-kind="expense"><label>Gider</label><strong style="color:var(--red)">${money(T.e)}</strong></div><div class="sum" data-action="summaryDetail" data-kind="remain"><label>Kalan</label><strong style="color:var(--gold2)">${money(T.r)}</strong></div></div><div class="quote"><b>Bugünün Sözü</b><span>“${q}”</span></div><div class="card donutBox" data-tab="reports"><div class="donut" style="--p1:${p1}%;--p2:${p2}%"><div class="donutC"><small>Kalan</small><b>${money(T.r)}</b></div></div><div class="legend"><div><i class="dot" style="background:var(--gi)"></i><span>Gelir</span><b>${money(T.i)}</b></div><div><i class="dot" style="background:var(--ge)"></i><span>Gider</span><b>${money(T.e)}</b></div><div><i class="dot" style="background:var(--gr)"></i><span>Kalan</span><b>${money(T.r)}</b></div></div></div><div class="section"><b>Hızlı İşlemler</b><span></span></div><div class="card quick premiumQuick v1947Quick"><button data-action="addIncome"><i class="qIncome">${premiumIcon("income",27)}</i>GELİR EKLE</button><button data-action="addExpense"><i class="qExpense">${premiumIcon("expense",27)}</i>GİDER EKLE</button><button data-action="addCard"><i class="qCard">${premiumIcon("pluscard",27)}</i>KART EKLE</button><button data-tab="calendar"><i class="qCalendar">${premiumIcon("fixed",27)}</i>TAKVİM</button><button data-tab="reports"><i class="qReport">${premiumIcon("report",27)}</i>RAPORLAR</button></div><div class="section"><b>BU AY</b><span></span></div><div class="monthActionGrid"><button class="monthAction spentAction" data-tab="monthSpent"><i>${premiumIcon("expense",27)}</i><span>BU AY HARCANAN</span><b>${money(F.spent)}</b><em>›</em></button><button class="monthAction paidAction" data-tab="monthPaid"><i>${premiumIcon("cards",27)}</i><span>BU AY ÖDENEN</span><b>${money(F.paid)}</b><em>›</em></button></div><div class="section"><b>Sana Özel Önerilen Kart</b><span data-action="goCards">Tümünü Gör ›</span></div>${r?`<div class="reco"><div class="recoHead"><span>Önerilen Kart</span><span>ⓘ</span></div><div class="recoGrid v1947RecoGrid"><div class="miniCard haneRecoCard ${r.style||'blackgold'}" data-action="editCard" data-id="${r.id}"><div class="haneRecoBrand">${haneLogo(42,'recoLogo')}</div><div class="bank">${esc(r.bank)}</div><div class="sub">${esc(r.name)} · ${esc(r.network||'KREDİ KARTI')}</div><div class="recoChip"></div><div class="num">•••• •••• •••• ${esc(r.last4)}</div><div class="recoLimits"><span>Limit <b>${money(r.limit)}</b></span><span>Kullanılabilir <b>${money(Math.max(0,(+r.limit||0)-(+r.balance||0)))}</b></span></div></div><div class="recoInfo"><div>Hesap Kesim<br><b>Ayın ${r.statementDay}'si</b></div><div>Ödeme Tarihi<br><b>${r.dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div><div>Kesim → Ödeme<br><b>${r.paymentWindowDays} Gün</b></div><button class="btn gold">Bu Kartı Kullan</button></div></div></div>`:`<div class="notice">Henüz kredi kartı eklenmedi.</div>`}${recentMovementsHome()}<div class="monthlyFinanceCompact">${(()=>{const m=state.selectedMonth,[yy,mm]=m.split('-').map(Number),pm=ym(new Date(yy,mm-2,1)),cur=totals(m),prev=totals(pm),paid=cashFlow().paid,monthExp=actualExpenseEntriesForMonth(m),cats={};monthExp.forEach(x=>cats[x.category||'Diğer']=(cats[x.category||'Diğer']||0)+(+x.amount||0));const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0],due=upcomingPayments().filter(x=>!x.paid&&x.days>=0&&x.days<=31).length,chg=prev.e?((cur.e-prev.e)/prev.e*100):0;return `<div class="compactFinanceHead"><div><b>RAPORLAR</b><small>${m}</small></div><button data-tab="reports" data-report-month="1">TÜMÜNÜ GÖR ›</button></div><div class="compactFinanceValues"><button data-action="summaryDetail" data-kind="income"><small>GELİR</small><b>${money(cur.i)}</b></button><button data-action="summaryDetail" data-kind="expense"><small>GİDER</small><b>${money(cur.e)}</b></button><button data-action="summaryDetail" data-kind="remain"><small>KALAN</small><b>${money(cur.r)}</b></button><button data-tab="monthPaid"><small>ÖDENEN</small><b>${money(paid)}</b></button></div><div class="compactFinanceMeta"><span>Geçen aya göre <b>${chg>=0?'+':''}${chg.toFixed(1)}%</b></span><span>En çok <b>${esc(top?.[0]||'-')}</b></span><span>Yaklaşan <b>${due} ödeme</b></span></div>`})()}</div>`}
function transactions(){
  const m=state.selectedMonth,q=txSearch.trim().toLocaleLowerCase('tr-TR');
  let a=[...state.incomes.map(x=>({...x,type:'income'})),...state.expenses.filter(x=>!x.recurring).map(x=>({...x,type:'expense'})),...state.expenses.filter(x=>x.recurring).map(x=>({...x,type:'fixedExpense',date:fixedPaymentDate(x,m),_paid:fixedPaidForMonth(x,m)})),...(state.cardPayments||[]).map(x=>({...x,type:'cardPayment',source:'card'})),...(state.flexTransactions||[]).map(x=>({...x,type:x.kind==='pay'?'flexPayment':'flexSpend',source:'flex'}))];
  if(!q)a=a.filter(x=>String(x.date||'').startsWith(m));
  if(txFilter==='income')a=a.filter(x=>x.type==='income');else if(txFilter==='expense')a=a.filter(x=>['expense','fixedExpense','flexSpend'].includes(x.type)&&x.source!=='card');else if(txFilter==='card')a=a.filter(x=>x.type==='cardPayment'||(x.type==='expense'&&x.source==='card'));
  if(q)a=a.filter(x=>{const card=state.cards.find(c=>c.id===x.cardId),flex=state.flexAccounts.find(f=>f.id===x.flexId),mem=state.members.find(mm=>mm.id===(x.memberId||'me'));return [x.title,x.category,x.note,x.description,x.bank,x.source,x.type,x.date,x.amount,card?.bank,card?.name,flex?.bank,flex?.name,mem?.name].some(v=>String(v||'').toLocaleLowerCase('tr-TR').includes(q))});
  a.sort((a,b)=>String(b.date).localeCompare(String(a.date)));const B=(k,l)=>`<button data-action="txFilter" data-filter="${k}" class="${txFilter===k?'active':''}">${l}</button>`;
  const rr=x=>{const mem=state.members.find(m=>m.id===(x.memberId||'me')),card=state.cards.find(c=>c.id===x.cardId),flex=state.flexAccounts.find(f=>f.id===x.flexId);let kind=x.type==='income'?'GELİR':x.type==='fixedExpense'?'SABİT GİDER':x.type==='cardPayment'?'KART ÖDEMESİ':x.type==='flexPayment'?'ESNEK HESAP ÖDEMESİ':x.type==='flexSpend'?'ESNEK HESAP HARCAMASI':'GİDER';let pay=x.source==='card'?`KART${card?' · '+esc(card.bank)+' '+esc(card.name):''}`:x.source==='flex'?`ESNEK HESAP${flex?' · '+esc(flex.bank):''}`:'NAKİT';let edit=x.type==='income'?'editIncome':x.type==='fixedExpense'?'editFixedExpense':x.type==='cardPayment'?'editCardPayment':x.type==='flexPayment'?'editFlexPayment':'editExpense';return `<div class="item searchResultItem ${x._paid?'isPaid':''}" data-action="${edit}" data-id="${x.id}"><div class="ico premiumIco">${x.type==='income'?premiumIcon('income',22):x.type==='cardPayment'?premiumIcon('cards',22):catPremiumIcon(x.category)}</div><div><b>${esc(x.title||kind)}</b><small>${x.date||''} · ${kind}${x.category?' · '+esc(x.category):''} · ${pay}${mem?' · '+esc(mem.name):''}${x.type==='fixedExpense'?' · '+(x._paid?'ÖDENDİ':'ÖDENMEDİ'):''}</small></div><div class="right"><b style="color:${x.type==='income'?'var(--green)':'var(--red)'}">${x.type==='income'?'+':'-'}${money(x.amount)}</b><small class="tapDetailHint">AYRINTI ›</small></div></div>`};
  const roadCounts={};if(!q)a.forEach(x=>{if(isRoadFee(x))roadCounts[x.date]=(roadCounts[x.date]||0)+1});const shownRoad=new Set();let visible=0;const rows=a.map(x=>{if(!q&&isRoadFee(x)&&roadCounts[x.date]>1){if(shownRoad.has(x.date))return '';shownRoad.add(x.date);visible++;const items=roadFeeItemsForDate(x.date),total=items.reduce((n,z)=>n+(+(z.actualAmount??z.amount)||0),0),cashN=items.filter(z=>z.source!=='card').length,cardN=items.filter(z=>z.source==='card').length;return `<div class="item searchResultItem roadFeeGroup" data-action="roadFeeGroup" data-date="${x.date}"><div class="ico premiumIco">${catPremiumIcon('Ulaşım')}</div><div><b>YOL ÜCRETLERİ</b><small>${x.date} · ${items.length} HAREKET · ${cashN?cashN+' NAKİT':''}${cashN&&cardN?' · ':''}${cardN?cardN+' KART':''}</small></div><div class="right"><b style="color:var(--red)">-${money(total)}</b><small class="tapDetailHint">AÇ ›</small></div></div>`}visible++;return rr(x)}).join('');
  return `${monthNavigator()}<div class="seg">${B('all','Tümü')}${B('income','Gelir')}${B('expense','Gider')}${B('card','Kart')}</div><div class="liveTxSearch"><span>⌕</span><input id="txSearch" autocomplete="off" placeholder="Hareket ara..." value="${esc(txSearch)}">${q?'<button type="button" data-action="clearTxSearch">×</button>':''}</div><div class="section"><b>${q?'ARAMA SONUÇLARI':state.selectedMonth}</b><span>${q?a.length:visible} SATIR · ${a.length} KAYIT</span></div><div class="list">${a.length?rows:'<div class="notice">Eşleşen hareket bulunamadı.</div>'}</div>`
}
function fixedCategoryDetail(cat){
  const useRange=current==='reports',range=useRange?periodRange():{start:state.selectedMonth+'-01',end:state.selectedMonth+'-31',label:monthLabel(state.selectedMonth)};
  const items=actualExpenseEntriesInRange(range.start,range.end).filter(x=>(x.category||'Diğer')===cat).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const total=items.reduce((n,x)=>n+(+x.amount||0),0);
  return `<div class="fixedCatDetail"><div class="fixedCatDetailHero"><div><small>${esc(range.label)} · KATEGORİ</small><h2>${esc(cat)}</h2></div><strong>${money(total)}</strong></div><div class="section"><b>DÖNEM GİDER HAREKETLERİ</b><span>${items.length} KAYIT</span></div><div class="list">${items.length?items.map(x=>{const fixed=!!x.recurring,card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;return `<div class="item fixedCatDetailItem" data-action="${fixed?'editStatementFixedPayment':'editExpense'}" data-id="${fixed?(x.paymentId||x.id):x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div class="fixedCatDetailMain"><b>${esc(x.title)}</b><small>${x.date||''} · ${fixed?'SABİT GİDER':'NORMAL GİDER'} · ${x.source==='card'?'KART'+(card?' · '+esc(card.bank):''):'NAKİT'}</small></div><div class="fixedCatDetailRight"><strong>${money(x.amount)}</strong><small class="tapDetailHint">AYRINTI ›</small></div></div>`}).join(''):'<div class="notice">BU DÖNEM BU KATEGORİDE GİDER YOK.</div>'}</div></div>`
}
function fixed(){
  // GİDERLER ekranı artık yalnızca sabit giderleri değil, bütün normal + sabit giderleri kapsar.
  const m=state.selectedMonth,all=actualExpenseEntriesForMonth(m).sort((x,y)=>String(y.date||'').localeCompare(String(x.date||'')));
  const fixedItems=state.expenses.filter(x=>x.recurring).sort((x,y)=>{const xp=fixedPaidForMonth(x)?1:0,yp=fixedPaidForMonth(y)?1:0;if(xp!==yp)return xp-yp;return String(x.dueDate||x.date||'').localeCompare(String(y.dueDate||y.date||''))||String(x.title||'').localeCompare(String(y.title||''),'tr')});
  const normalItems=state.expenses.filter(x=>!x.recurring&&String(x.date||'').startsWith(m)).sort((x,y)=>String(y.date||'').localeCompare(String(x.date||'')));
  const cats=categoryStats(all),catTotal=cats.reduce((n,x)=>n+(+x[1]||0),0);
  const catHtml=cats.length?`<div class="fixedCategoryTotals">${cats.map(([cat,total])=>`<button type="button" class="fixedCatTotal" data-action="fixedCategoryDetail" data-cat="${esc(cat)}"><span><i>${catPremiumIcon(cat)}</i><b>${esc(cat)}</b></span><strong>${money(total)}</strong></button>`).join('')}<button type="button" class="fixedCatGrand clickableGrand" data-action="summaryDetail" data-kind="expense"><span>TOPLAM GİDER</span><strong>${money(catTotal)}</strong><em>›</em></button></div>`:'<div class="notice">KATEGORİ TOPLAMI İÇİN GİDER KAYDI YOK.</div>';
  const normalRoadCounts={};normalItems.forEach(x=>{if(isRoadFee({...x,type:'expense'}))normalRoadCounts[x.date]=(normalRoadCounts[x.date]||0)+1});const normalRoadShown=new Set();
  const normalHtml=normalItems.length?normalItems.map(x=>{if(isRoadFee({...x,type:'expense'})&&normalRoadCounts[x.date]>1){if(normalRoadShown.has(x.date))return '';normalRoadShown.add(x.date);const items=roadFeeItemsForDate(x.date),total=items.reduce((n,z)=>n+(+(z.actualAmount??z.amount)||0),0),cashN=items.filter(z=>z.source!=='card').length,cardN=items.filter(z=>z.source==='card').length;return `<div class="item fixedItem normalExpenseItem roadFeeGroup" data-action="roadFeeGroup" data-date="${x.date}"><div class="ico premiumIco">${catPremiumIcon('Ulaşım')}</div><div class="fixedMain"><b>YOL ÜCRETLERİ</b><small>${x.date} · ${items.length} HAREKET · ${cashN?cashN+' NAKİT':''}${cashN&&cardN?' · ':''}${cardN?cardN+' KART':''}</small></div><div class="fixedRight"><b style="color:var(--red)">-${money(total)}</b><small class="tapDetailHint">AÇ ›</small></div></div>`}const card=x.cardId?state.cards.find(c=>c.id===x.cardId):null;return `<div class="item fixedItem normalExpenseItem" data-action="editExpense" data-id="${x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div class="fixedMain"><b>${esc(x.title)}</b><small>${x.date||''} · ${isCardRefund(x)?'İADE':'NORMAL GİDER'} · ${esc(x.category||'Diğer')} · ${x.source==='card'?'KART'+(card?' · '+esc(card.bank):''):'NAKİT'}</small></div><div class="fixedRight"><b style="color:${isCardRefund(x)?'var(--green)':'var(--red)'}">${isCardRefund(x)?'+':'-'}${money(Math.abs(x.amount))}</b><small class="tapDetailHint">AYRINTI ›</small></div></div>`}).join(''):'<div class="notice">NORMAL GİDER YOK.</div>';
  const fixedHtml=fixedItems.length?fixedItems.map(x=>{const paid=fixedPaidForMonth(x),pay=fixedPaymentFor(x);return`<div class="item fixedItem ${paid?'isPaid':''}" data-fixed-id="${x.id}"><div class="ico premiumIco" data-action="editFixedExpense" data-id="${x.id}">${catPremiumIcon(x.category)}</div><div class="fixedMain" data-action="editFixedExpense" data-id="${x.id}"><b>${esc(x.title)}</b><small>${x.dueDate||x.date} · SABİT GİDER · ${esc(x.category||'Diğer')}${paid?` · ÖDENDİ ${pay?.date||''} · ${pay?.source==='card'?'KART':'NAKİT'}`:''}</small></div><div class="fixedRight"><b style="color:${paid?'var(--green)':'var(--red)'}">${paid?'✓ ':'-'}${money(x.amount)}</b><button type="button" class="paidToggle ${paid?'on':''}" data-action="toggleFixedPaid" data-id="${x.id}">${paid?'↶ GERİ AL':'ÖDEDİM'}</button>${paid?`<button type="button" class="tinyEdit" data-action="editFixedPayment" data-id="${x.id}">ÖDEMEYİ DÜZENLE</button>`:''}</div></div>`}).join(''):'<div class="notice">SABİT GİDER YOK.</div>';
  return`${monthNavigator()}${paymentSourceSummary()}<div class="section"><b>GİDERLER</b><button class="miniAddBtn" data-action="addExpense">+ GİDER EKLE</button></div><div class="section fixedCatHead"><b>${monthLabel(m)} · KATEGORİ TOPLAMLARI</b><span>${cats.length} KATEGORİ</span></div>${catHtml}<button type="button" class="section collapsibleExpenseHead" data-action="toggleExpenseSection" data-section="normal"><b>NORMAL GİDERLER</b><span>${normalItems.length} KAYIT · ${normalExpensesOpen?'▲':'▼'}</span></button>${normalExpensesOpen?`<div class="list fixedList">${normalHtml}</div>`:''}<button type="button" class="section collapsibleExpenseHead" data-action="toggleExpenseSection" data-section="fixed"><b>SABİT GİDERLER</b><span>${fixedItems.length} KAYIT · ${fixedExpensesOpen?'▲':'▼'}</span></button>${fixedExpensesOpen?`<div class="notice fixedSortNote">ÖDENMEMİŞ SABİT GİDERLER ÜSTTE · ÖDENMİŞLER ALTTA</div><div class="list fixedList">${fixedHtml}</div>`:''}<div class="expenseAddFooter"><button class="miniAddBtn" data-action="addFixedExpense">+ SABİT GİDER</button></div>`
}
function cards(){const B=(k,l)=>`<button data-action="financeTab" data-finance="${k}" class="${financeTab===k?'active':''}">${l}</button>`;if(financeTab==='accounts')financeTab='cards';return `<div class="financeTabs">${B('cards','KARTLAR')}${B('flex','ESNEK HESAP')}</div>${financeTab==='cards'?cardsPanel():flexPanel()}`}
function cardsPanel(){return `<div class="section"><b>KREDİ KARTLARIM</b><button class="miniAddBtn" data-action="addCard">+ KART EKLE</button></div><div class="financeCarousel">${state.cards.map(credit).join('')||'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}</div><div class="financeDots">${state.cards.map((c,i)=>`<button data-action="scrollCard" data-index="${i}">${esc(c.bank)} · •${esc(c.last4)}</button>`).join('')}</div>`}
function credit(c){const pi=cardPaymentInfo(c),available=Math.max(0,(+c.limit||0)-(+c.balance||0)),network=esc(c.network||'VISA');return `<div class="credit card luxuryCard clickableCredit haneVerticalCard ${c.style||'blackgold'}" data-action="cardStatement" data-id="${c.id}" data-card-id="${c.id}" role="button" tabindex="0"><div class="hvcGlow"></div><div class="hvcPattern"></div><div class="hvcTop"><div class="hvcBrand"><img src="icons/hane-app-icon.png" alt="HANE"><div><strong>HANE</strong><small>DAHA DÜZENLİ BİR YAŞAM</small></div></div><div class="hvcTag"><span>FİNANS</span><span>DAHA İYİ</span><span>YARINLAR İÇİN</span><i></i></div></div><div class="hvcBankRow"><div class="hvcBank"><b>${esc(c.bank)}</b><small>${esc(c.name||'KREDİ KARTI')}</small></div><span class="hvcNetwork">${network}</span></div><div class="hvcChip"></div><div class="hvcDigits">•••• •••• •••• <b>${esc(c.last4)}</b></div><div class="hvcGrid"><div class="limitBox"><small>TOPLAM LİMİT</small><b>${money(c.limit)}</b></div><div class="availBox"><small>KULLANILABİLİR LİMİT</small><b>${money(available)}</b></div><div class="statementBox"><small>HESAP KESİM TARİHİ</small><b>${pi.statementDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR')}</b></div><div class="dueBox"><small>SON ÖDEME TARİHİ</small><b>${pi.dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}).toLocaleUpperCase('tr-TR')}</b></div></div><div class="hvcFooter"><span>${esc(c.bank)} •••• ${esc(c.last4)}</span><small>DOKUN · EKSTRE</small></div></div>`}
function accountsPanel(){return `<div class="section"><b>BANKA HESAPLARIM</b><button class="miniAddBtn" data-action="addAccount">+ HESAP EKLE</button></div><div class="financeCarousel">${state.accounts.map(a=>`<div class="bankAccount luxuryCard"><div class="cardTop"><b>${esc(a.bank)}</b><span>HESAP</span></div><small>${esc(a.name)}</small><h2>${money(a.balance)}</h2><div class="digits">IBAN •••• ${esc(a.last4||'0000')}</div><div class="cardActions"><button class="btn" data-action="accountSpend" data-id="${a.id}">− HARCAMA EKLE</button><button class="btn gold" data-action="accountIncome" data-id="${a.id}">＋ GELİR EKLE</button><button class="iconEdit" data-action="editAccount" data-id="${a.id}">✎</button></div></div>`).join('')||'<div class="notice">HENÜZ HESAP EKLENMEDİ.</div>'}</div><div class="financeDots">${state.accounts.map(a=>`<span>${esc(a.bank)} · ${esc(a.name)}</span>`).join('')}</div>`}
function flexPanel(){return `<div class="section"><b>ESNEK HESAPLAR</b><button class="miniAddBtn" data-action="addFlex">+ ESNEK HESAP</button></div><div class="financeCarousel flexSameCards">${state.flexAccounts.map(a=>{const available=Math.max(0,(+a.limit||0)-(+a.balance||0));return`<div class="credit card luxuryCard ${a.style||'blackgold'} flexCredit" data-flex-id="${a.id}"><div class="haneCardBrand"><img src="icons/hane-app-icon.png" alt="HANE"><div><strong>HANE</strong><small>DAHA DÜZENLİ BİR YAŞAM</small></div></div><div class="cardTop"><b>${esc(a.bank)}</b><span>ESNEK HESAP</span></div><small class="cardName">${esc(a.name||'ESNEK HESAP')}</small><div class="chip"></div><div class="digits flexLabel">KULLANILABİLİR · ${money(available)}</div><div class="grid"><div><small>TOPLAM LİMİT</small><b>${money(a.limit)}</b></div><div><small>KULLANILAN LİMİT</small><b>${money(a.balance)}</b></div><div><small>HESAP KESİM TARİHİ</small><b>${prettyDate(a.statementDate)}</b></div><div><small>SON ÖDEME TARİHİ</small><b>${prettyDate(a.dueDate)}</b></div></div><div class="cardActions"><button class="btn" data-action="flexSpend" data-id="${a.id}">＋ HARCAMA EKLE</button><button class="btn gold" data-action="flexPay" data-id="${a.id}">₺ ÖDEME YAPTIM</button><button class="iconEdit" data-action="editFlex" data-id="${a.id}">✎</button></div></div>`}).join('')||'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}</div>`}
function periodRange(){
  const today=new Date();
  if(reportPeriod==='day'){const d=iso(today);return{start:d,end:d,label:'BUGÜN'}}
  if(reportPeriod==='week'){const d=new Date(today),n=(d.getDay()+6)%7,start=new Date(d);start.setDate(d.getDate()-n);const end=new Date(start);end.setDate(start.getDate()+6);return{start:iso(start),end:iso(end),label:'BU HAFTA'}}
  if(reportPeriod==='year'){const y=state.selectedMonth.slice(0,4);return{start:y+'-01-01',end:y+'-12-31',label:y}}
  if(reportPeriod==='custom'){const start=reportCustomStart||state.selectedMonth+'-01',end=reportCustomEnd||iso(today);return{start:start<=end?start:end,end:start<=end?end:start,label:(start<=end?start:end)+' → '+(start<=end?end:start)}}
  const [y,m]=state.selectedMonth.split('-').map(Number),last=new Date(y,m,0).getDate();return{start:state.selectedMonth+'-01',end:state.selectedMonth+'-'+String(last).padStart(2,'0'),label:state.selectedMonth}
}
function periodTotals(){const r=periodRange(),inside=x=>x.date>=r.start&&x.date<=r.end,i=state.incomes.filter(inside).reduce((a,x)=>a+(+x.amount||0),0),e=actualExpenseEntriesInRange(r.start,r.end).reduce((a,x)=>a+(+x.amount||0),0);return{i,e,r:i-e,range:r}}
function prettyDate(v){if(!v)return '-';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}
function calendarItems(date){
 const inc=state.incomes.filter(x=>x.date===date).map(x=>({...x,_kind:'income'}));
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
 for(let d=1;d<=last;d++){const ds=calendarMonth+'-'+String(d).padStart(2,'0'),items=calendarItems(ds),future=upcomingPayments().filter(x=>x.date===ds&&!x.paid),kinds=[...new Set([...items.map(x=>x._kind),...future.map(x=>'future'+x.kind)])];cells.push(`<button class="calDay ${ds===calendarDay?'active':''}" data-action="calendarDay" data-date="${ds}"><b>${d}</b><span class="calDots">${kinds.map(k=>`<i class="calDot ${k}"></i>`).join('')}</span></button>`)}
 const futureDue=upcomingPayments().filter(x=>x.date===calendarDay&&!x.paid);
 const items=calendarItems(calendarDay),income=items.filter(x=>x._kind==='income').reduce((a,x)=>a+(+x.amount||0),0),expense=items.filter(x=>['expense','flexSpend'].includes(x._kind)).reduce((a,x)=>a+(+x.amount||0),0),paid=items.filter(x=>['fixedPayment','cardPayment','flexPayment'].includes(x._kind)).reduce((a,x)=>a+(+x.amount||0),0),net=income-expense;
 const row=x=>{const map={income:['GELİR','var(--green)','editIncome','delIncome'],expense:['GİDER','var(--red)','editExpense','delExpense'],fixedPayment:['SABİT GİDER ÖDEMESİ','var(--gold2)','editStatementFixedPayment','delFixedPaymentExact'],cardPayment:['KART ÖDEMESİ','#35a7ff','editCardPayment','delCardPayment'],flexSpend:['ESNEK HESAP HARCAMASI','#b66cff','editExpense','delExpense'],flexPayment:['ESNEK HESAP ÖDEMESİ','#29d3c2','editFlexPayment','delFlexPayment']},refund=x._kind==='expense'&&isCardRefund(x),z=refund?['İADE','var(--green)','editExpense','delExpense']:map[x._kind],idv=x._kind==='fixedPayment'?x.id:x._kind==='flexSpend'?x.expenseId:x.id,c=x.cardId?state.cards.find(q=>q.id===x.cardId):null,member=x.memberId?memberName(x.memberId):'',pay=x._kind==='expense'||x._kind==='fixedPayment'?(x.source==='card'?'KREDİ KARTI'+(c?' • '+c.bank+' '+c.name:''):'NAKİT'):'';return `<div class="calendarMove ${refund?'refund':x._kind}"><i></i><div><b>${esc(x.title||z[0])}</b><small>${z[0]}${x.category?' · '+esc(x.category):''}${pay?' · '+esc(pay):''}${member?' · '+esc(member):''}</small></div><strong style="color:${z[1]}">${x._kind==='income'||refund?'+':x._kind==='expense'||x._kind==='flexSpend'?'-':''}${money(Math.abs(x.amount))}</strong><div class="calActions"><button data-action="${z[2]}" data-id="${idv}" data-direct-edit="1">DÜZENLE</button><button class="danger" data-action="${z[3]}" data-id="${idv}">SİL</button></div></div>`};
 return `<div class="calendarPage"><div class="calendarHead"><button data-action="calendarPrev">‹</button><b>${new Date(y,m-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR')}</b><button data-action="calendarNext">›</button></div><div class="calWeek">${['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calGrid">${cells.join('')}</div><div class="calLegend"><span><i class="calDot income"></i>Gelir</span><span><i class="calDot expense"></i>Gider</span><span><i class="calDot fixedPayment"></i>Sabit Ödeme</span><span><i class="calDot cardPayment"></i>Kart</span><span><i class="calDot flexSpend"></i>Esnek</span></div><div class="section"><b>${prettyDate(calendarDay)} DETAYI</b><span>${items.length} HAREKET</span></div><div class="calendarSummary"><div><small>GELEN</small><b>${money(income)}</b></div><div><small>GİDEN</small><b>${money(expense)}</b></div><div><small>ÖDENEN</small><b>${money(paid)}</b></div><div><small>NET</small><b>${money(net)}</b></div></div><div class="calendarMoves">${futureDue.length?`<div class="section"><b>PLANLANAN ÖDEMELER</b><span>${futureDue.length}</span></div>${futureDue.map(x=>`<div class="calendarMove future${x.kind}"><i></i><div><b>${esc(x.title)}</b><small>GELECEK ÖDEME · ${x.kind==='fixed'?'SABİT':x.kind==='card'?'KART':'ESNEK'}</small></div><strong>${money(x.amount)}</strong></div>`).join('')}`:''}${items.length?items.map(row).join(''):'<div class="notice">BU GÜN GEÇMİŞ HAREKET YOK.</div>'}</div></div>`}
function reports(){
 const T=periodTotals(),inside=x=>String(x.date||'')>=T.range.start&&String(x.date||'')<=T.range.end,B=(k,l)=>`<button data-action="reportPeriod" data-period="${k}" class="${reportPeriod===k?'active':''}">${l}</button>`;
 const incomes=state.incomes.filter(inside).map(x=>({...x,_kind:'income'}));
 const expenses=state.expenses.filter(x=>!x.recurring&&inside(x)).map(x=>({...x,_kind:'expense'}));
 const fixedPays=(state.fixedPayments||[]).filter(inside).map(p=>{const e=state.expenses.find(x=>x.id===p.expenseId);return {...p,title:p.title||e?.title||'SABİT GİDER',category:e?.category||'Sabit',_kind:'fixedPayment',expenseId:p.expenseId}});
 const cardPays=(state.cardPayments||[]).filter(inside).map(x=>({...x,title:x.title||'KREDİ KARTI ÖDEMESİ',_kind:'cardPayment'}));
 const flexTx=(state.flexTransactions||[]).filter(inside).map(x=>({...x,_kind:x.kind==='pay'?'flexPayment':'flexSpend'}));
 // Esnek hesap harcaması zaten expenses içinde tek ana gider kaydı olarak bulunur; raporda ikinci kez sayılmaz.
 const flexPayments=flexTx.filter(x=>x._kind==='flexPayment');
 const items=[...incomes,...expenses,...fixedPays,...cardPays,...flexPayments].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const paid=[...fixedPays,...cardPays,...flexPayments].reduce((a,x)=>a+(+x.amount||0),0);
 const cats={};expenses.forEach(x=>{const k=x.category||'Diğer';cats[k]=(cats[k]||0)+(+x.amount||0)});fixedPays.forEach(x=>{const k=x.category||'Sabit';cats[k]=(cats[k]||0)+(+x.amount||0)});
 const catRows=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
 const custom=reportPeriod==='custom'?`<form class="reportCustom" id="reportCustomForm"><div class="field"><label>Başlangıç</label><input type="date" name="start" value="${esc(reportCustomStart||T.range.start)}"></div><div class="field"><label>Bitiş</label><input type="date" name="end" value="${esc(reportCustomEnd||T.range.end)}"></div><button class="btn gold" type="submit">UYGULA</button></form>`:'';
 const row=x=>{let label='',edit='',idv=x.id,color='var(--red)',sign='-',refund=x._kind==='expense'&&isCardRefund(x);if(x._kind==='income'){label='GELİR';edit='editIncome';color='var(--green)';sign='+'}else if(refund){label='KART İADESİ · '+(x.category||'Diğer');edit='editExpense';color='var(--green)';sign='+'}else if(x._kind==='expense'){label=(x.source==='card'?'KART HARCAMASI'+(x.installmentCount>1?' · '+x.installmentNo+'/'+x.installmentCount+' TAKSİT':''):x.source==='flex'?'ESNEK HESAP HARCAMASI':'GİDER')+' · '+(x.category||'Diğer');edit='editExpense'}else if(x._kind==='fixedPayment'){label='SABİT GİDER · ÖDENDİ';edit='editStatementFixedPayment';idv=x.id;color='var(--gold2)';sign=''}else if(x._kind==='cardPayment'){label='KART ÖDEMESİ';edit='editCardPayment';color='#35a7ff';sign=''}else{label='ESNEK HESAP ÖDEMESİ';edit='editFlexPayment';color='#29d3c2';sign=''}return `<div class="item reportTapItem ${refund?'refundItem':''}" role="button" tabindex="0" data-action="${edit}" data-id="${idv}"><div class="ico premiumIco">${x._kind==='income'?premiumIcon('income',22):x._kind==='expense'?catPremiumIcon(x.category):premiumIcon('cards',22)}</div><div><b>${esc(x.title||label)}</b><small>${x.date} · ${label}</small></div><div class="reportMoveRight"><b style="color:${color}">${sign}${money(Math.abs(x.amount))}</b><small>AYRINTI ›</small></div></div>`};
 return `${monthNavigator()}<div class="seg reportSeg">${B('day','Günlük')}${B('week','Haftalık')}${B('month','Aylık')}${B('year','Yıllık')}${B('custom','Özel')}</div>${custom}${reportPeriod==='month'?(()=>{const m=state.selectedMonth,[yy,mm]=m.split('-').map(Number),pm=ym(new Date(yy,mm-2,1)),cur=totals(m),prev=totals(pm),monthExp=actualExpenseEntriesForMonth(m),cats={};monthExp.forEach(x=>cats[x.category||'Diğer']=(cats[x.category||'Diğer']||0)+(+x.amount||0));const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0],big=[...monthExp].sort((a,b)=>(+b.amount||0)-(+a.amount||0))[0],due=upcomingPayments().filter(x=>!x.paid&&x.days>=0&&x.days<=31).length,chg=prev.e?((cur.e-prev.e)/prev.e*100):0;return `<div class="monthlyFinancePro reportMonthlyFinance"><div class="section"><b>AYLIK FİNANS ÖZETİ</b><span>${m}</span></div><div class="monthlyProGrid"><button data-action="summaryDetail" data-kind="income"><small>BU AY GELİR</small><b>${money(cur.i)}</b></button><button data-action="summaryDetail" data-kind="expense"><small>BU AY GİDER</small><b>${money(cur.e)}</b></button><button data-action="summaryDetail" data-kind="remain"><small>NET KALAN</small><b>${money(cur.r)}</b></button><button data-tab="monthPaid"><small>TOPLAM ÖDENEN</small><b>${money(paid)}</b></button><button><small>GEÇEN AYA GÖRE</small><b>${chg>=0?'+':''}${chg.toFixed(1)}%</b></button><button><small>EN ÇOK KATEGORİ</small><b>${esc(top?.[0]||'-')}</b></button><button data-tab="transactions"><small>EN BÜYÜK HARCAMA</small><b>${big?money(big.amount):'-'}</b></button><button data-tab="alerts"><small>YAKLAŞAN ÖDEME</small><b>${due} adet</b></button></div></div>`})():''}<div class="section"><b>${T.range.label}</b><span></span></div><div class="reportSummary4"><button class="sum" data-action="summaryDetail" data-kind="income"><label>TOPLAM GELİR</label><strong style="color:var(--green)">${money(T.i)}</strong></button><button class="sum" data-action="summaryDetail" data-kind="expense"><label>TOPLAM GİDER</label><strong style="color:var(--red)">${money(T.e)}</strong></button><button class="sum" data-tab="monthPaid"><label>TOPLAM ÖDENEN</label><strong style="color:var(--gold2)">${money(paid)}</strong></button><button class="sum" data-action="summaryDetail" data-kind="remain"><label>NET KALAN</label><strong>${money(T.r)}</strong></button></div><div class="card" style="padding:14px;margin-top:10px"><canvas id="chart" style="width:100%;height:220px"></canvas><div class="chartLegend"><span><i style="background:var(--gi)"></i>GELİR</span><span><i style="background:var(--ge)"></i>GİDER</span><span><i style="background:var(--gr)"></i>KALAN</span></div></div><div class="section"><b>KATEGORİ DAĞILIMI</b><span>${catRows.length} KATEGORİ</span></div><div class="categoryReport">${catRows.length?catRows.map(([k,v])=>`<button type="button" data-action="fixedCategoryDetail" data-cat="${esc(k)}"><span>${catPremiumIcon(k)} <b>${esc(k)}</b></span><strong>${money(v)}</strong></button>`).join(''):'<div class="notice">BU ARALIKTA GİDER YOK.</div>'}</div><div class="section"><b>AYRINTILI HAREKET LİSTESİ</b><span>${items.length} KAYIT</span></div><div class="list reportMoves">${items.length?items.map(row).join(''):'<div class="notice">BU TARİH ARALIĞINDA HAREKET YOK.</div>'}</div>`
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
function settings(){return`<div class="card"><div class="setting" data-action="togglePrivacy"><span class="settingIco">👁</span><span>GİZLİLİK MODU</span><b>${state.settings.privacy?'Açık':'Kapalı'}</b></div><div class="setting" data-tab="homeEdit"><span class="settingIco">⌂</span><span>ANA SAYFAYI DÜZENLE</span><b>›</b></div><div class="setting" data-tab="members"><span class="settingIco">👥</span><span>HANE ÜYELERİ</span><b>›</b></div><div class="setting" data-tab="categories"><span class="settingIco">🎨</span><span>KATEGORİLERİ DÜZENLE / EKLE</span><b>›</b></div><div class="setting" data-action="toggleDarkMode"><span class="settingIco">${premiumIcon("palette",30)}</span><span>KARANLIK MOD</span><b>${state.settings.darkMode!==false?'Açık':'Kapalı'}</b></div><div class="setting" data-tab="about"><span class="settingIco">${premiumIcon("info",30)}</span><span>HAKKINDA</span><b>›</b></div><div class="setting" data-action="clearAll"><span class="settingIco dangerIco">${premiumIcon("trash",30)}</span><span style="color:var(--red)">TÜM VERİLERİ SIFIRLA</span><b></b></div></div>`}
function categories(){const shown=visibleCategoryList();return `<div class="section"><b>KATEGORİLER</b><button class="miniAddBtn" data-action="addCategory">+ EKLE</button></div><div class="notice categoryVisibilityNote">${shown.length?`${shown.length} kullanılan kategori gösteriliyor.`:'Henüz kullanılan kategori yok.'} Kullanılmayan hazır kategoriler ekranı kalabalıklaştırmamak için gizlenir; gider eklerken yine seçilebilir.</div><div class="categoryManage">${shown.length?shown.map(c=>`<button data-action="editCategory" data-cat="${esc(c)}"><span>${catPremiumIcon(c)}</span><b>${esc(c)}</b><em>✎</em></button>`).join(''):'<div class="notice">İlk gider kaydından sonra kullanılan kategoriler burada görünecek.</div>'}</div>`}
function categoryForm(old=''){const icon=old?catIcon(old):'✨',color=old?catColor(old):'#d8ad4f';return `<form class="form" id="categoryForm">${input('name','Kategori Adı',old)}${input('icon','İkon / Emoji',icon)}<div class="field"><label>İkon Rengi</label><input type="color" name="color" value="${color}"></div><button class="btn gold" type="submit">KAYDET</button>${old&&state.customCategories.includes(old)?`<button class="btn" type="button" data-action="delCategory" data-cat="${esc(old)}">KATEGORİYİ SİL</button>`:''}</form>`}
function theme(){
  if(!themeDraft) themeDraft={...(state.theme||{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'})};
  const t=themeDraft;
  return`<div class="section"><b>Tema Stüdyosu</b><span>Kaydetmeden uygulanmaz</span></div><div class="preview" style="background:${t.bg};border-color:${t.accent}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:${t.accent}">Canlı Önizleme</b><small style="color:#aaa">Sadece önizleme</small></div><div class="summary"><div class="sum" style="border-color:${t.accent}55"><label>Gelir</label><strong style="color:${t.income}">₺25.000</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Gider</label><strong style="color:${t.expense}">₺12.550</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Kalan</label><strong style="color:${t.remain}">₺12.450</strong></div></div><div style="height:10px;border-radius:99px;background:linear-gradient(90deg,${t.income} 0 33%,${t.expense} 33% 66%,${t.remain} 66% 100%);margin-top:10px"></div></div><div class="card" style="margin-top:12px"><div class="setting" data-action="pickBg"><span>◼</span><span>Arka Plan Rengi</span><b style="color:${t.bg};text-shadow:0 0 0 #777">■</b></div><div class="setting" data-action="pickAccent"><span>✦</span><span>Detay Rengi</span><b style="color:${t.accent}">■</b></div><div class="setting" data-action="pickIncome"><span>●</span><span>Grafik · Gelir</span><b style="color:${t.income}">■</b></div><div class="setting" data-action="pickExpense"><span>●</span><span>Grafik · Gider</span><b style="color:${t.expense}">■</b></div><div class="setting" data-action="pickRemain"><span>●</span><span>Grafik · Kalan</span><b style="color:${t.remain}">■</b></div></div><div class="section"><b>Hazır Temalar</b><span></span></div><div class="themeGrid">${[['Klasik Siyah','#000000','#d8ad4f'],['Lacivert','#06111f','#4da3ff'],['Koyu Yeşil','#05130d','#41d98c'],['Bordo','#1a080b','#e4a0aa']].map(a=>`<div class="themeCard" data-action="preset" data-bg="${a[1]}" data-accent="${a[2]}"><div class="swatch" style="background:${a[1]};border:1px solid ${a[2]}"></div><b>${a[0]}</b></div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><button class="btn" data-action="resetTheme">Varsayılana Dön</button><button class="btn gold" data-action="saveTheme">Kaydet</button></div><button class="btn" style="width:100%;margin-top:8px" data-action="cancelTheme">İptal</button>`
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

function about(){return`<div class="profile"><div class="aboutV5Logo">${haneFullLogo("aboutV5")}</div><p>SÜRÜM 19.4.8 · BRAND SIGNATURE</p><p>PREMİUM EV BÜTÇEN.<br>VERİLERİN CİHAZINDA ŞİFRELİ SAKLANIR.</p></div>`}
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
function view(){return({home,transactions,fixed,cards,calendar,reports,profile,backup,settings,categories,theme,alerts,about,monthSpent,monthPaid,members,homeEdit}[current]||home)()}
function input(n,l,v='',type='text',extra=''){const attrs=type==='text'?'autocapitalize="characters" autocorrect="on" autocomplete="on" spellcheck="true"':'';return`<div class="field"><label>${l}</label><input name="${n}" type="${type}" value="${esc(v)}" ${attrs} ${extra}></div>`}
function select(n,l,opts,v=''){return`<div class="field"><label>${l}</label><select name="${n}">${opts.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}
function memberSelect(v=''){return `<div class="field"><label>Hane Üyesi <small style="opacity:.65">(isteğe bağlı)</small></label><select name="memberId"><option value="" ${!v?'selected':''}>HANE GENELİ / ATANMAMIŞ</option>${state.members.map(m=>`<option value="${m.id}" ${v===m.id?'selected':''}>${esc(m.icon)} ${esc(m.name)}</option>`).join('')}</select></div>`}
function incomeForm(x={}){return`<form class="form" id="incomeForm">${input('title','Gelir Adı',x.title||'')}${input('amount','Tutar',x.amount||0,'number')}${input('date','Tarih',x.date||iso(),'date')}${memberSelect(x.memberId||'me')}<div class="field"><label>Sabit Gelir</label><select name="recurring"><option value="false" ${!x.recurring?'selected':''}>Hayır</option><option value="true" ${x.recurring?'selected':''}>Evet</option></select></div><button class="btn gold" type="submit">Kaydet</button>${x.id?`<button type="button" class="btn" data-action="delIncome" data-id="${x.id}">Sil</button>`:''}</form>`}
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
    <div class="row2">${input('limit','Limit',c.limit||0,'number')}${input('balance','Güncel Borç',c.balance||0,'number')}</div>
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
async function act(a,el){if(a&&a.startsWith('edit')){const c=document.querySelector('.content');if(c)returnScrollTop=c.scrollTop;}if(a==='toggleExpenseSection'){if(el.dataset.section==='normal')normalExpensesOpen=!normalExpensesOpen;else fixedExpensesOpen=!fixedExpensesOpen;render();return;}if(a==='editStatementFixedPayment'){const p=(state.fixedPayments||[]).find(z=>z.id===el.dataset.id),x=p?state.expenses.find(z=>z.id===p.expenseId):null;if(x&&p){open('ÖDEMEYİ DÜZENLE',`<form class="form" id="fixedPaymentForm"><div class="notice"><b>FATURA TUTARI: ${money(fixedBillAmount(x))}</b><br>GERÇEK ÖDENEN TUTAR gider hesabında esas alınır.</div>${input('amount','Gerçek Ödenen Tutar',p.amount||fixedBillAmount(x),'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',p.date||iso(),'date')}${select('category','Kategori',C,p.category||x.category||'Diğer')}<div class="field"><label>Ödeme Şekli</label><select name="source"><option value="cash" ${(p.source||'cash')==='cash'?'selected':''}>NAKİT</option><option value="card" ${p.source==='card'?'selected':''}>KART</option></select></div><div class="field"><label>Kullanılan Kart</label><select name="cardId"><option value="">Kart seç</option>${state.cards.map(c=>`<option value="${c.id}" ${p.cardId===c.id?'selected':''}>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</option>`).join('')}</select></div><button class="btn gold" type="submit">KAYDET</button><button class="btn" type="button" data-action="toggleFixedPaid" data-id="${x.id}">ÖDEMEYİ GERİ AL</button></form>`,{id:x.id,paymentId:p.id});return}}else if(a==='paymentSourceDetail'){open(el.dataset.source==='card'?'KREDİ KARTI HARCAMALARI':'NAKİT HARCAMALAR',paymentSourceDetailBody(el.dataset.source));return}else if(a==='cardStatement'){cardStatementMonth=state.selectedMonth;open('KART EKSTRESİ',cardStatementBody(el.dataset.id,cardStatementMonth),{cardId:el.dataset.id});return}else if(a==='cardStatementShift'){const [y,m]=(cardStatementMonth||state.selectedMonth).split('-').map(Number),d=new Date(y,m-1+(+(el.dataset.dir||0)),1);cardStatementMonth=ym(d);open('KART EKSTRESİ',cardStatementBody(el.dataset.id,cardStatementMonth),{cardId:el.dataset.id});return}else if(a==='statementImport'){const c=state.cards.find(x=>x.id===el.dataset.id);if(!c)return;statementImportCardId=c.id;statementImportRows=[];statementImportMeta={};const input=document.getElementById('statementImportInput');if(!input)return alert('Ekstre dosya seçici bulunamadı.');open('GÜVENLİ OKUMA HAZIRLANIYOR',`<div class="notice"><b>OCR / PDF MOTORLARI HAZIRLANIYOR...</b><br>Kişisel ekstre henüz seçilmedi. Motorlar hazırlandıktan sonra dosya seçici açılacak.</div>`,{cardId:c.id});try{await prepareStatementPrivacyRuntime();modal=null;render();input.value='';input.click()}catch(err){open('GÜVENLİ OKUMA HAZIRLANAMADI',`<div class="notice">${esc(err.message||'Okuma motoru hazırlanamadı.')}</div>`,{cardId:c.id})}return}else if(a==='statementImportConfirm'){await confirmStatementImport();return}if(a&&a.startsWith('edit')&&el?.dataset?.directEdit!=='1'){const d=haneRecordDetailSpec(a,el.dataset.id);if(d){open(d.title,d.body,{recordDetail:true});return}}if(a==='roadFeeGroup'){open((el.dataset.date||'')+' · YOL ÜCRETLERİ',roadFeeGroupBody(el.dataset.date),{roadFeeDate:el.dataset.date})}else if(a==='clearTxSearch'){txSearch='';render()}else if(a==='runTxSearch'){txSearch=$('#txSearch')?.value||'';render()}else if(a==='togglePrivacy'){state.settings.privacy=!state.settings.privacy;await save();render()}else if(a==='clearTxFilters'){txSearch=txDate=txCategory=txPay=txMin=txMax=txMember='';render()}else if(a==='memberDetail'){open(memberName(el.dataset.id)+' · '+monthLabel(state.selectedMonth),memberDetailBody(el.dataset.id),{memberId:el.dataset.id})}else if(a==='addMember'){open('ÜYE EKLE',memberForm())}else if(a==='editMember'){const m=state.members.find(x=>x.id===el.dataset.id);if(m)open('ÜYEYİ DÜZENLE',memberForm(m),{id:m.id})}else if(a==='delMember'){state.members=state.members.filter(x=>x.id!==el.dataset.id);state.incomes.forEach(x=>{if(x.memberId===el.dataset.id)x.memberId=''});state.expenses.forEach(x=>{if(x.memberId===el.dataset.id)x.memberId=''});await save();modal=null;render()}else if(a==='homeMove'){const k=el.dataset.key,d=+el.dataset.dir,i=state.homeLayout.indexOf(k),j=Math.max(0,Math.min(state.homeLayout.length-1,i+d));if(i>=0&&i!==j){[state.homeLayout[i],state.homeLayout[j]]=[state.homeLayout[j],state.homeLayout[i]];await save();render()}}else if(a==='homeToggle'){const k=el.dataset.key;state.homeHidden=state.homeHidden.includes(k)?state.homeHidden.filter(x=>x!==k):[...state.homeHidden,k];await save();render()}else if(a==='receiptView'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x?.attachment)open('FİŞ / FATURA',`<div class="receiptViewer"><img src="${x.attachment}" alt="Fiş"><button class="btn" data-action="receiptReplace" data-id="${x.id}">DEĞİŞTİR</button><button class="btn" data-action="receiptDelete" data-id="${x.id}">SİL</button></div>`,{id:x.id})}else if(a==='receiptReplace'){modal={...modal,id:el.dataset.id};$('#receiptInput').click()}else if(a==='receiptDelete'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x){x.attachment='';await save();modal=null;render()}}else if(a==='openMenu')open('MENÜ',menuBody());else if(a==='menuGo'){goTo(el.dataset.go)}else if(a==='summaryDetail'){open(el.dataset.kind==='income'?'GELİR DETAYI':el.dataset.kind==='expense'?'GİDER DETAYI':'KALAN DETAYI',summaryDetailBody(el.dataset.kind))}else if(a==='financeTab'){financeTab=el.dataset.finance;render()}else if(a==='scrollCard'){document.querySelectorAll('.financeCarousel .luxuryCard')[+el.dataset.index]?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})}else if(a==='fixedCategoryDetail'){const cat=el.dataset.cat||'Diğer';open(cat+' · DETAY',fixedCategoryDetail(cat),{category:cat})}else if(a==='addCategory')open('KATEGORİ EKLE',categoryForm(),{oldCat:''});else if(a==='editCategory'){open('KATEGORİYİ DÜZENLE',categoryForm(el.dataset.cat),{oldCat:el.dataset.cat})}else if(a==='delCategory'){const c=el.dataset.cat;if(confirm(c+' kategorisi silinsin mi?')){state.customCategories=state.customCategories.filter(x=>x!==c);delete state.categoryMeta[c];state.expenses.forEach(x=>{if(x.category===c)x.category='Diğer'});normalizeV19(state);await save();modal=null;render()}}else if(a==='addAccount')open('HESAP EKLE',accountForm());else if(a==='editAccount'){const x=state.accounts.find(z=>z.id===el.dataset.id);open('HESABI DÜZENLE',accountForm(x),{id:x.id})}else if(a==='delAccount'){state.accounts=state.accounts.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='accountSpend'||a==='accountIncome'){const x=state.accounts.find(z=>z.id===el.dataset.id);open(a==='accountSpend'?'HARCAMA EKLE':'GELİR EKLE',simpleAmountForm(a,x))}else if(a==='addFlex')open('ESNEK HESAP EKLE',flexForm());else if(a==='editFlex'){const x=state.flexAccounts.find(z=>z.id===el.dataset.id);open('ESNEK HESABI DÜZENLE',flexForm(x),{id:x.id})}else if(a==='delFlex'){state.flexAccounts=state.flexAccounts.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='flexSpend'||a==='flexPay'){const x=state.flexAccounts.find(z=>z.id===el.dataset.id);open(a==='flexSpend'?'HARCAMA EKLE':'ÖDEME YAPTIM',simpleAmountForm(a,x))}else if(a==='editFlexPayment'){const x=(state.flexTransactions||[]).find(z=>z.id===el.dataset.id);if(x)open('ESNEK HESAP ÖDEMESİNİ DÜZENLE',`<form class="form" id="flexPaymentEditForm">${input('amount','Tutar',x.amount,'number','step="0.01" min="0"')}${input('date','Tarih',x.date,'date')}${input('title','Açıklama',x.title||'')}<button class="btn gold">KAYDET</button><button type="button" class="btn" data-action="delFlexPayment" data-id="${x.id}">SİL</button></form>`,{id:x.id})}else if(a==='delFlexPayment'){const x=(state.flexTransactions||[]).find(z=>z.id===el.dataset.id);if(x){const f=state.flexAccounts.find(a=>a.id===x.flexId);if(f)f.balance=(+f.balance||0)+(+x.amount||0);state.flexTransactions=state.flexTransactions.filter(z=>z.id!==x.id);await save();modal=null;render();showToast('SİLİNDİ')}}else if(a==='delFixedPaymentExact'){const p=(state.fixedPayments||[]).find(z=>z.id===el.dataset.id);if(p){state.fixedPayments=state.fixedPayments.filter(z=>z.id!==p.id);const ex=state.expenses.find(z=>z.id===p.expenseId);if(ex){ex.paidMonths=(ex.paidMonths||[]).filter(m=>m!==p.month);if(String(ex.date||'').slice(0,7)===p.month)ex.paid=false}await save();modal=null;render();showToast('SİLİNDİ')}}else if(a==='editCardPayment'){const x=state.cardPayments.find(z=>z.id===el.dataset.id);if(x)open('ÖDEMEYİ DÜZENLE',cardPaymentEditForm(x),{id:x.id})}else if(a==='delCardPayment'){state.cardPayments=state.cardPayments.filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('SİLİNDİ')}else if(a==='back'){goBack()}else if(a==='txFilter'){txFilter=el.dataset.filter||'all';render()}else if(a==='goCards'){goTo('cards')}else if(a==='monthPrev'){state.selectedMonth=monthShiftValue(state.selectedMonth,-1);calendarMonth=state.selectedMonth;calendarDay='';await save();render()}else if(a==='monthNext'){state.selectedMonth=monthShiftValue(state.selectedMonth,1);calendarMonth=state.selectedMonth;calendarDay='';await save();render()}else if(a==='monthToday'){state.selectedMonth=ym(new Date());calendarMonth=state.selectedMonth;calendarDay='';await save();render()}else if(a==='calendarDay'){calendarDay=el.dataset.date;calendarMonth=calendarDay.slice(0,7);state.selectedMonth=calendarMonth;render()}else if(a==='calendarPrev'){let [y,m]=calendarMonth.split('-').map(Number);m--;if(m<1){m=12;y--}calendarMonth=y+'-'+String(m).padStart(2,'0');state.selectedMonth=calendarMonth;calendarDay='';save().then(()=>render())}else if(a==='calendarNext'){let [y,m]=calendarMonth.split('-').map(Number);m++;if(m>12){m=1;y++}calendarMonth=y+'-'+String(m).padStart(2,'0');state.selectedMonth=calendarMonth;calendarDay='';save().then(()=>render())}else if(a==='reportPeriod'){reportPeriod=el.dataset.period||'month';render()}else if(a==='cardPayType'){const v=el.dataset.value||'Tek Çekim',inp=document.getElementById('cardPaymentType'),field=document.getElementById('installmentField');if(inp)inp.value=v;document.querySelectorAll('.cardPayTypeSeg button').forEach(b=>b.classList.toggle('active',b.dataset.value===v));if(field)field.classList.toggle('show',v==='Taksitli')}else if(a==='openTheme'){themeDraft={...(state.theme||{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'})};current='theme';modal=null;render()}else if(a==='addIncome')open('Gelir Ekle',incomeForm());else if(a==='editIncome'){const x=state.incomes.find(z=>z.id===el.dataset.id);open('Geliri Düzenle',incomeForm(x),{id:x.id})}else if(a==='delIncome'){state.incomes=state.incomes.filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('SİLİNDİ')}else if(a==='addExpense')open('Gider Ekle',expenseForm());else if(a==='addFixedExpense')open('Gider Ekle',expenseForm({recurring:true,category:'Kira',dueDate:iso()}));else if(a==='editFixedExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='editExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='delExpense'){const ex=state.expenses.find(x=>x.id===el.dataset.id);if(ex?.cardTxId)state.cardTransactions=state.cardTransactions.filter(t=>t.id!==ex.cardTxId);state.fixedPayments=(state.fixedPayments||[]).filter(p=>p.expenseId!==el.dataset.id);state.flexTransactions=(state.flexTransactions||[]).filter(t=>t.expenseId!==el.dataset.id);state.expenses=state.expenses.filter(x=>x.id!==el.dataset.id);await save();modal=null;render();showToast('SİLİNDİ')}else if(a==='toggleFixedPaid'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x){x.paidMonths=Array.isArray(x.paidMonths)?x.paidMonths:[];state.fixedPayments=Array.isArray(state.fixedPayments)?state.fixedPayments:[];const m=state.selectedMonth,was=x.paidMonths.includes(m);if(was){x.paidMonths=x.paidMonths.filter(v=>v!==m);state.fixedPayments=state.fixedPayments.filter(p=>!(p.expenseId===x.id&&p.month===m))}else{x.paidMonths=[...new Set([...x.paidMonths,m])];if(!fixedPaymentFor(x,m))state.fixedPayments.push({id:id(),expenseId:x.id,month:m,amount:fixedBillAmount(x),actualAmount:fixedBillAmount(x),date:dateForSelectedMonth(x.dueDate||x.date,m),title:x.title,category:x.category||'Diğer',source:x.source||'cash',cardId:x.source==='card'?x.cardId:null})}await save();render()}}else if(a==='editFixedPayment'){const x=state.expenses.find(z=>z.id===el.dataset.id),p=fixedPaymentFor(x);if(x&&p)open('ÖDEMEYİ DÜZENLE',`<form class="form" id="fixedPaymentForm"><div class="notice"><b>FATURA TUTARI: ${money(fixedBillAmount(x))}</b><br>GERÇEK ÖDENEN TUTAR gider hesabında esas alınır.</div>${input('amount','Gerçek Ödenen Tutar',p.amount||fixedBillAmount(x),'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',p.date||iso(),'date')}${select('category','Kategori',C,p.category||x.category||'Diğer')}<div class="field"><label>Ödeme Şekli</label><select name="source" id="fixedPaySource"><option value="cash" ${(p.source||'cash')==='cash'?'selected':''}>NAKİT</option><option value="card" ${p.source==='card'?'selected':''}>KART</option></select></div><div class="field"><label>Kullanılan Kart</label><select name="cardId"><option value="">Kart seç</option>${state.cards.map(c=>`<option value="${c.id}" ${p.cardId===c.id?'selected':''}>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</option>`).join('')}</select></div><button class="btn gold" type="submit">KAYDET</button><button class="btn" type="button" data-action="toggleFixedPaid" data-id="${x.id}">ÖDEMEYİ GERİ AL</button></form>`,{id:x.id,paymentId:p.id})}else if(a==='addCard')open('Kart Ekle',cardForm());else if(a==='editCard'){const c=state.cards.find(z=>z.id===el.dataset.id);open('Kartı Düzenle',cardForm(c),{id:c.id})}else if(a==='delCard'){const cid=el.dataset.id,linkedExpense=(state.expenses||[]).some(x=>x.cardId===cid),linkedFixed=(state.fixedPayments||[]).some(x=>x.cardId===cid),linkedPay=(state.cardPayments||[]).some(x=>x.cardId===cid);if(linkedExpense||linkedFixed||linkedPay){alert('Bu karta bağlı geçmiş harcama veya ödeme kayıtları var. Ekstre ve finans geçmişinin bozulmaması için kart silinemez.');return}state.cards=state.cards.filter(x=>x.id!==cid);await save();modal=null;render();showToast('KART SİLİNDİ')}else if(a==='cardSpend'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Kart Harcaması Ekle',cardSpendForm(c),{cardId:c.id})}else if(a==='cardPay'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Ödeme Yaptım',cardPayForm(c),{cardId:c.id})}else if(a==='cashDetails'){const F=cashFlow();open('Bu Ay · Harcanan / Ödenen',`<div class="cashDetail"><div class="notice"><b>Bu Ay Harcanan: ${money(F.spent)}</b><br>Bu ay yaptığın gerçek ev harcamalarıdır.</div><div class="notice" style="margin-top:8px"><b>Bu Ay Ödenen: ${money(F.paid)}</b><br>Kart ödemeleri ${money(F.cardPaid)} + nakit/ödenmiş giderler ${money(F.directPaid)}.</div><div class="notice" style="margin-top:8px">Kart ödemeleri yeniden gider sayılmaz. Önceki aylardan gelen kart borcu ödesen bile sadece “Bu Ay Ödenen” bölümünde görünür.</div></div>`)}else if(a==='editProfile')open('Profili Düzenle',profileForm());else if(a==='pickProfile')$('#profileInput').click();else if(a==='attachReceipt'){rememberModalForm();$('#receiptInput').click()}else if(a==='receipt'){rememberModalForm();$('#receiptInput').click()}else if(a==='close'){modal=null;render()}else if(a==='pickBg')open('Arka Plan Rengi',colorForm('bg','Arka Plan Rengi'));else if(a==='pickAccent')open('Detay Rengi',colorForm('accent','Detay Rengi'));else if(a==='pickIncome')open('Grafik Gelir',colorForm('income','Gelir Rengi'));else if(a==='pickExpense')open('Grafik Gider',colorForm('expense','Gider Rengi'));else if(a==='pickRemain')open('Grafik Kalan',colorForm('remain','Kalan Rengi'));else if(a==='saveColor'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft[el.dataset.kind]=$('#nativeColor').value;modal=null;render()}else if(a==='preset'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft.bg=el.dataset.bg;themeDraft.accent=el.dataset.accent;render()}else if(a==='resetTheme'){themeDraft={bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'};render()}else if(a==='saveTheme'){state.theme={...themeDraft};await save();themeDraft=null;applyTheme();current='profile';render();alert('Tema kaydedildi.')}else if(a==='cancelTheme'){themeDraft=null;current='profile';render()}else if(a==='backupNow')backupNow();else if(a==='restoreNow')$('#restoreInput').click();else if(a==='changePin')changePin();else if(a==='toggleDarkMode'){state.settings.darkMode=!(state.settings.darkMode!==false);await save();applyTheme();render();showToast(state.settings.darkMode?'KARANLIK MOD AÇILDI':'KARANLIK MOD KAPATILDI')}else if(a==='clearAll'){if(confirm('Tüm HANE verileri silinsin mi?')){localStorage.removeItem(META);localStorage.removeItem(DATA);location.reload()}}}

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
  $$('[data-tab]').forEach(x=>x.onclick=()=>{const next=x.dataset.tab;if(next==='theme')themeDraft={...(state.theme||{})};else if(current==='theme')themeDraft=null;goTo(next)});
  $$('[data-action]').forEach(x=>x.onclick=e=>{if(x.closest('form')&&x.type==='submit')return;e.stopPropagation();act(x.dataset.action,x)});
  const liveTxSearch=$('#txSearch');
  if(liveTxSearch) liveTxSearch.oninput=e=>{txSearch=e.currentTarget.value;render();const n=$('#txSearch');if(n){n.focus();const L=n.value.length;try{n.setSelectionRange(L,L)}catch(_){}}};

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
  const categoryFormEl=$('#categoryForm');if(categoryFormEl)categoryFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),old=modal?.oldCat||'',name=upper((d.name||'').trim());if(!name)return alert('Kategori adı gerekli');if(old&&old!==name){state.customCategories=state.customCategories.filter(x=>x!==old);if(!C.includes(name))state.customCategories.push(name);state.expenses.forEach(x=>{if(x.category===old)x.category=name});delete state.categoryMeta[old]}else if(!C.includes(name))state.customCategories.push(name);state.categoryMeta[name]={icon:d.icon||'✨',color:d.color||'#d8ad4f'};normalizeV19(state);await save();modal=null;render();showToast('KATEGORİ KAYDEDİLDİ')};
  const memberFormEl=$('#memberForm');if(memberFormEl)memberFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),name=upper((d.name||'').trim());if(!name)return alert('Üye adı gerekli');const x={id:modal?.id||id(),name,icon:(d.icon||'👤').trim()||'👤'};const n=state.members.findIndex(m=>m.id===x.id);n>=0?state.members[n]={...state.members[n],...x}:state.members.push(x);await save();modal=null;render();showToast(n>=0?'ÜYE GÜNCELLENDİ':'ÜYE EKLENDİ')};
  const accountFormEl=$('#accountForm');if(accountFormEl)accountFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x={id:modal?.id||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'HESAP'),last4:(d.last4||'0000').replace(/\D/g,'').slice(-4),balance:+d.balance||0};const n=state.accounts.findIndex(a=>a.id===x.id);n>=0?state.accounts[n]=x:state.accounts.push(x);await save();modal=null;render()};
  const flexFormEl=$('#flexForm');if(flexFormEl)flexFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x={id:modal?.id||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'ESNEK HESAP'),limit:+d.limit||0,balance:+d.balance||0,statementDate:d.statementDate,dueDate:d.dueDate,style:d.style||'blackgold'};const n=state.flexAccounts.findIndex(a=>a.id===x.id);n>=0?state.flexAccounts[n]=x:state.flexAccounts.push(x);await save();modal=null;render()};
  const reportCustomForm=$('#reportCustomForm');if(reportCustomForm)reportCustomForm.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(!d.start||!d.end){alert('Başlangıç ve bitiş tarihini seçin.');return}reportCustomStart=d.start;reportCustomEnd=d.end;reportPeriod='custom';render()};
  const simpleAmountFormEl=$('#simpleAmountForm');if(simpleAmountFormEl)simpleAmountFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),kind=e.currentTarget.dataset.kind,objId=e.currentTarget.dataset.id,amt=+d.amount||0;if(amt<=0)return alert('Tutar girin');if(kind.startsWith('account')){const a=state.accounts.find(x=>x.id===objId);if(kind==='accountSpend'){a.balance-=amt;state.expenses.push({id:id(),title:upper(d.title||a.bank+' HARCAMA'),amount:amt,category:'Diğer',date:d.date,recurring:false,paid:true,source:'cash'})}else{a.balance+=amt;state.incomes.push({id:id(),title:upper(d.title||a.bank+' GELİR'),amount:amt,date:d.date,recurring:false})}}else{const a=state.flexAccounts.find(x=>x.id===objId);state.flexTransactions=Array.isArray(state.flexTransactions)?state.flexTransactions:[];if(kind==='flexSpend'){a.balance+=amt;const eid=id(),txid=id(),title=upper(d.title||a.bank+' ESNEK HESAP HARCAMASI');state.expenses.push({id:eid,flexTxId:txid,flexId:a.id,title,amount:amt,category:'Diğer',date:d.date,recurring:false,paid:true,source:'flex'});state.flexTransactions.push({id:txid,expenseId:eid,flexId:a.id,kind:'spend',title,amount:amt,date:d.date})}else{a.balance=Math.max(0,a.balance-amt);state.flexTransactions.push({id:id(),flexId:a.id,kind:'pay',title:upper(d.title||a.bank+' ESNEK HESAP ÖDEMESİ'),amount:amt,date:d.date})}}await save();modal=null;render()};
  const flexPaymentEditFormEl=$('#flexPaymentEditForm');if(flexPaymentEditFormEl)flexPaymentEditFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=(state.flexTransactions||[]).find(z=>z.id===modal?.id);if(!x)return;const f=state.flexAccounts.find(a=>a.id===x.flexId),old=+x.amount||0,next=+d.amount||0;if(f)f.balance=Math.max(0,(+f.balance||0)+old-next);x.amount=next;x.date=d.date||x.date;x.title=upper(d.title||x.title);await save();modal=null;render();showToast('ESNEK HESAP ÖDEMESİ GÜNCELLENDİ')};
  const fixedPaymentFormEl=$('#fixedPaymentForm');if(fixedPaymentFormEl)fixedPaymentFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),p=(state.fixedPayments||[]).find(p=>p.id===modal?.paymentId),ex=state.expenses.find(x=>x.id===modal?.id);if(!p)return;const nextAmount=Number(String(d.amount||'0').replace(',','.')),nextSource=d.source==='card'?'card':'cash',nextDate=d.date||p.date||iso(),nextMonth=String(nextDate).slice(0,7),oldMonth=p.month||String(p.date||'').slice(0,7);if(!Number.isFinite(nextAmount)||nextAmount<0)return alert('Geçerli tutar girin.');if(nextSource==='card'&&!d.cardId)return alert('Kart seçin.');if((state.fixedPayments||[]).some(fp=>fp.id!==p.id&&fp.expenseId===p.expenseId&&fp.month===nextMonth))return alert('Bu sabit gider için '+nextMonth+' ayında zaten bir ödeme kaydı var.');p.amount=nextAmount;p.actualAmount=nextAmount;p.date=nextDate;p.month=nextMonth;p.category=d.category||ex?.category||'Diğer';p.source=nextSource;p.cardId=nextSource==='card'?d.cardId:null;if(ex){ex.category=p.category;ex.paidMonths=[...new Set([...(ex.paidMonths||[]).filter(m=>m!==oldMonth),nextMonth])];(state.fixedPayments||[]).filter(fp=>fp.expenseId===ex.id).forEach(fp=>fp.category=ex.category||'Diğer')}await save();modal=null;render();showToast('ÖDEME GÜNCELLENDİ')};
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
  const add=(re)=>{for(const m of src.matchAll(re)){const di=stmtDateInfo(m[0],anchor);if(di)hits.push({index:m.index,raw:m[0],date:di.date})}};
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
  const re=/(₺\s*)?([+-]?(?:(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{2})?|(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?)[+-]?)\s*(TL|TRY|₺|USD|EUR|GBP)?/gi;
  for(const m of s.matchAll(re)){
    const token=m[2],currency=(m[3]||((m[1]||'').includes('₺')?'₺':'')).toUpperCase(),value=stmtMoney((m[1]||'')+token+(m[3]||''));
    if(!Number.isFinite(value)||value===0)continue;
    const digits=token.replace(/\D/g,'');if(digits.length>10&&!currency)continue;
    const hasCents=/[.,]\d{2}(?:[-+])?$/.test(token),hasGrouping=/\d[.,\s]\d{3}/.test(token);
    if(!currency&&!hasCents&&!hasGrouping)continue;
    if(Math.abs(value)>999999999)continue;
    let score=(currency==='TL'||currency==='TRY'||currency==='₺'?20:currency?9:0)+(hasCents?7:0)+(hasGrouping?2:0)+(m.index>s.length*.65?2:0);
    out.push({raw:m[0],token,currency,value,index:m.index,score})
  }
  return out
}
function stmtMerchantKey(t){return String(t||'').toLocaleUpperCase('tr-TR').replace(/\b(?:POS|PROVİZYON|PROVIZYON|İŞLEM|ISLEM|ŞUBE|SUBE|NO|REF)\b/g,' ').replace(/\d{2,}/g,' ').replace(/[^A-ZÇĞİÖŞÜ\s]/g,' ').replace(/\s+/g,' ').trim().slice(0,72)}
function stmtCategoryBase(t){
  t=String(t||'').toLocaleUpperCase('tr-TR');
  if(/GETİR\s*YEMEK|GETIR\s*YEMEK|YEMEKSEPET[İI]|TRENDYOL\s*YEMEK|RESTAUR|RESTORAN|BURGER|MCDONALD|KFC|DOMINOS|PIZZA|PİZZA/.test(t))return'Yemek';
  if(/MİGROS|MIGROS|BİM|BIM|A101|ŞOK|SOK|CARREFOUR|METRO\s*MARKET|MACROCENTER|F[İI]LE\s*MARKET|GROSS|ONUR\s*MARKET|HAPPY\s*CENTER|HAKMAR|MOPAŞ|MOPAS|BİZİM\s*TOPTAN|BIZIM\s*TOPTAN|TARIM\s*KRED[İI]|SEÇ\s*MARKET|SEC\s*MARKET|KİM\s*MARKET|KIM\s*MARKET|ÇAĞRI\s*MARKET|CAGRI\s*MARKET|ÖZDİLEK\s*(?:MARKET)?|OZDILEK\s*(?:MARKET)?|\bMARKET\b|SÜPERMARKET|SUPERMARKET|HİPERMARKET|HIPERMARKET|GIDA\s*MARKET/.test(t))return'Market';
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
  if(/LCW|LC\s*WAIKIKI|DEFACTO|KOTON|ZARA|H&M|MAVİ|MAVI|BOYNER|\bFLO\b/.test(t))return'Giyim';
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
function stmtLogicalBlocks(text,anchor){
  const src=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' ').replace(/[\u200B-\u200D\uFEFF]/g,' ');
  const hits=[];
  const headerBefore=/(?:HESAP\s*KES[İI]M(?:\s*TAR[İI]H[İI]?)?|SON\s*ÖDEME(?:\s*TAR[İI]H[İI]?)?|EKSTRE\s*TAR[İI]H[İI]?|DÖNEM\s*TAR[İI]H[İI]?|ASGAR[İI].{0,12})\s*[:\-]?\s*$/i;
  const addHits=re=>{for(const m of src.matchAll(re)){const di=stmtDateInfo(m[0],anchor);if(!di)continue;const pre=src.slice(Math.max(0,m.index-70),m.index).replace(/\s+/g,' ');if(headerBefore.test(pre))continue;hits.push({index:m.index,end:m.index+m[0].length,raw:m[0],date:di.date})}};
  addHits(/\b20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}\b/g);
  addHits(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b/gi);
  addHits(/\b\d{1,2}\s+(?:OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)(?:\s+(?:20\d{2}|\d{2}))?\b/gi);
  hits.sort((a,b)=>a.index-b.index||b.end-a.end);
  const uniq=[];for(const h of hits){const last=uniq.at(-1);if(last&&h.index<last.end)continue;uniq.push(h)}
  const blocks=[];let cur=null;
  const flush=()=>{if(cur){const body=cur.parts.join(' ').replace(/\s+/g,' ').trim();if(body)blocks.push({date:cur.date,lines:[body],dateCount:cur.dateCount});cur=null}};
  for(let i=0;i<uniq.length;i++){
    const h=uniq[i],next=uniq[i+1],tail=src.slice(h.end,next?next.index:src.length).replace(/\s+/g,' ').trim();
    if(!cur)cur={date:h.date,parts:[h.raw],dateCount:1};else{cur.parts.push(h.raw);cur.dateCount++}
    if(tail)cur.parts.push(tail);
    // A transaction ends as soon as the text between this date and the next date contains money.
    // If not, the next date is treated as a posting/value date of the same transaction.
    if(stmtAmountCandidates(stmtStripDates(tail)).length)flush();
    else if(cur.dateCount>=3)flush();
  }
  flush();return blocks
}
function parseStatementText(text,cardId){
  const anchor=stmtAnchorInfo(text),datePref=stmtDatePreference(text),bad=/(?:KREDİ\s*KARTI\s*)?BOR[ÇC]U\s*ÖDEME|KART\s*ÖDEMES[İI]|ÖDEME\s*[-–—]?\s*TEŞEKK|DÖNEM\s*BORCU|TOPLAM\s*BORÇ|TOPLAM\s*HARCAMA|ASGARİ\s*(?:ÖDEME|TUTAR)|KULLANILABİLİR\s*LİMİT|KART\s*LİMİTİ|DEVİR\s*BAKİYE|SON\s*ÖDEME\s*TARİH|HESAP\s*KESİM\s*TARİH/i;
  const out=[],seen={};
  for(const block of stmtLogicalBlocks(text,anchor)){
    const blockText=block.lines.join(' ').replace(/\s+/g,' ').trim();if(!blockText||bad.test(blockText))continue;
    const di=stmtPickTransactionDate(blockText,anchor,datePref);if(!di)continue;
    const noDates=stmtStripDates(blockText),amounts=stmtAmountCandidates(noDates);if(!amounts.length)continue;
    const tl=amounts.filter(a=>['TL','TRY','₺'].includes(a.currency)),pool=tl.length?tl:amounts;
    pool.sort((a,b)=>a.score-b.score||a.index-b.index);const pick=pool.at(-1),rawAmount=pick.value;if(!Number.isFinite(rawAmount)||rawAmount===0)continue;
    const refund=/\bİADE\b|\bIADE\b|\bİPTAL\b|\bIPTAL\b|\bREFUND\b|\bALACAK\b/i.test(blockText)||rawAmount<0,amount=refund?-Math.abs(rawAmount):Math.abs(rawAmount);
    let title=noDates;
    // Remove every credible monetary column, not just the selected amount. This handles FX + TL columns cleanly.
    [...amounts].sort((a,b)=>b.index-a.index).forEach(a=>{title=title.replace(a.raw,' ')});
    title=title.replace(/\b(?:İŞLEM|ISLEM|PROVİZYON|PROVIZYON|VALÖR|VALOR)\s*TARİHİ\b/gi,' ')
      .replace(/\b(?:AÇIKLAMA|ACIKLAMA|İŞYERİ|ISYERI|TUTAR|BORÇ|BORC|ALACAK|PARA\s*BİRİMİ|PARA\s*BIRIMI)\b/gi,' ')
      .replace(/\b(?:TL|TRY|USD|EUR|GBP|₺)\b/gi,' ')
      .replace(/^[\s\-–—|:;,]+|[\s\-–—|:;,]+$/g,' ');
    title=stmtCleanTitle(title);if(!title)title=refund?'KART İADESİ':'KART HARCAMASI';
    const baseFp=stmtFingerprint(cardId,di.date,title,amount),occ=(seen[baseFp]=(seen[baseFp]||0)+1);
    out.push({date:di.date,title,amount,category:stmtCategory(title),baseFp,occurrence:occ,fp:`${baseFp}|#${occ}`,checked:true,refund})
  }
  return out
}

function stmtParseLooseMoney(v){
  const t=String(v||'').replace(/\s/g,'').replace(/₺|TL|TRY/gi,'').replace(/[^0-9,.-]/g,'');
  if(!t)return null;let x=t;
  if(x.includes(',')&&x.includes('.'))x=x.replace(/\./g,'').replace(',','.');
  else if(x.includes(','))x=x.replace(',','.');
  else if(/^\d{1,3}(?:\.\d{3})+$/.test(x))x=x.replace(/\./g,'');
  const n=Number(x);return Number.isFinite(n)?n:null
}
function parseStatementSummary(text){
  const src=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' '),lines=src.split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const moneyRe=/(-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2}))\s*(?:TL|TRY|₺)?/gi;
  const find=(rx)=>{for(const line of lines){if(!rx.test(line))continue;rx.lastIndex=0;const vals=[...line.matchAll(moneyRe)].map(m=>stmtParseLooseMoney(m[1])).filter(v=>Number.isFinite(v));moneyRe.lastIndex=0;if(vals.length)return vals.at(-1)}return null};
  return{
    spendingTotal:find(/(?:TOPLAM\s+HARCAMA|HARCAMALAR\s+TOPLAMI|D[ÖO]NEM\s+[İI]Ç[İI]\s+HARCAMA|D[ÖO]NEM\s+HARCAMALARI)/i),
    periodDebt:find(/(?:D[ÖO]NEM\s+BORCU|HESAP\s+[ÖO]ZET[İI]\s+BORCU|EKSTRE\s+BORCU|TOPLAM\s+BOR[ÇC])/i)
  }
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
  const c=state.cards.find(x=>x.id===cardId),month=statementImportMonthForRows(c,rows),monthBreakdown=statementRowsMonthBreakdown(rows),existingImported=(state.expenses||[]).filter(x=>x.importedFromStatement&&x.cardId===cardId&&((x.statementImportMonth&&x.statementImportMonth===month)||statementMonthFor(c,x.date)===month)).length;
  const usable=existingImported?rows:rows.filter(r=>r.occurrence>stmtExistingCount(cardId,r.date,r.title,r.amount));statementImportRows=usable;
  const skipped=existingImported?0:rows.length-usable.length;
  const autoSpend=Number.isFinite(statementImportMeta.spendingTotal)?statementImportMeta.spendingTotal:rows.filter(r=>r.amount>0).reduce((a,r)=>a+r.amount,0);
  const debt=Number.isFinite(statementImportMeta.periodDebt)?statementImportMeta.periodDebt:'';
  return `<div class="notice"><b>${esc(c?.bank||'KART')} · •••• ${esc(c?.last4||'')}</b><br>${rows.length} satır okundu · ${usable.length} yeni işlem bulundu${skipped?` · ${skipped} mükerrer atlandı`:''}.<br><small>Aynı ekstre dönemini yeniden okutursan önceki içe aktarma kayıtlarını değiştirerek çoğalmayı önleyebilirsin.</small></div>
  <div class="statementReconcileBox">
    <div class="field"><label>Ekstre Harcamaları Toplamı</label><input id="stmtSummarySpend" type="number" step="0.01" value="${autoSpend?Number(autoSpend).toFixed(2):''}" placeholder="Ekstredeki toplam harcama"></div>
    <div class="field"><label>Dönem Borcu</label><input id="stmtSummaryDebt" type="number" step="0.01" value="${debt!==''?Number(debt).toFixed(2):''}" placeholder="Ekstredeki dönem borcu"></div>
    <label class="stmtCheckLine"><input id="stmtReplacePeriod" type="checkbox" checked> Bu dönemin önceki ekstre içe aktarma kayıtlarını değiştir${existingImported?` (${existingImported} eski kayıt)`:''}</label>
    <label class="stmtCheckLine"><input id="stmtSyncDebt" type="checkbox" ${debt!==''?'checked':''}> Dönem borcunu kart borcu olarak güncelle</label>
    <small>Dönem borcu boşsa kartın mevcut borcu korunur. Geçmiş ekstre satırları kart borcunu ikinci kez şişirmez.</small>
  </div>
  ${monthBreakdown?`<div class="notice statementMonthCheck"><b>OKUNAN İŞLEM AYLARI</b><br>${esc(monthBreakdown)}<br><small>Bu dağılım ekstredeki işlem tarihlerini gösterir. Yanlış tarih varsa aşağıdan düzeltebilirsin.</small></div>`:''}<div class="statementImportList">${usable.length?usable.map((r,i)=>`<div class="statementImportRow"><input type="checkbox" data-stmt-check="${i}" checked><div class="stmtEditGrid"><input type="date" data-stmt-date="${i}" value="${esc(r.date)}"><input type="text" data-stmt-title="${i}" value="${esc(r.title)}" maxlength="100"><input type="number" step="0.01" data-stmt-amount="${i}" value="${Number(r.amount).toFixed(2)}"><select data-stmt-category="${i}">${C.map(cat=>`<option value="${esc(cat)}" ${cat===r.category?'selected':''}>${esc(cat)}</option>`).join('')}</select></div></div>`).join(''):'<div class="notice">EKLENECEK YENİ HARCAMA BULUNMADI.</div>'}</div>${usable.length?'<button class="btn gold" style="width:100%;margin-top:12px" data-action="statementImportConfirm">SEÇİLENLERİ EKLE</button>':''}`
}
const HANE_OCR_SCRIPT='./__hane_engine__/tesseract/tesseract.min.js';
const HANE_OCR_WORKER='./__hane_engine__/tesseract/worker.min.js';
const HANE_OCR_CORE='./__hane_engine__/tesseract/core';
const HANE_PDF_MODULE='./__hane_engine__/pdf/pdf.min.mjs';
const HANE_PDF_WORKER='./__hane_engine__/pdf/pdf.worker.min.mjs';
let statementOcrWorker=null,statementOcrLabel='OCR',statementPdfjs=null,statementPdfWorker=null,statementPrivacyPrepared=false;
async function loadTesseract(){if(window.Tesseract)return window.Tesseract;await new Promise((res,rej)=>{const old=document.querySelector('script[data-hane-ocr="1"]');if(old){old.addEventListener('load',res,{once:true});old.addEventListener('error',()=>rej(new Error('OCR motoru hazır değil. HANE güncellemesini internet açıkken tamamlayıp uygulamayı yeniden açın.')),{once:true});return}const sc=document.createElement('script');sc.dataset.haneOcr='1';sc.src=HANE_OCR_SCRIPT;sc.crossOrigin='anonymous';sc.referrerPolicy='no-referrer';sc.onload=res;sc.onerror=()=>rej(new Error('OCR motoru hazır değil. HANE güncellemesini internet açıkken tamamlayıp uygulamayı yeniden açın.'));document.head.appendChild(sc)});return window.Tesseract}
async function getStatementOcrWorker(label='OCR'){statementOcrLabel=label;if(statementOcrWorker)return statementOcrWorker;const T=await loadTesseract(),langPath=new URL('./vendor/tesseract/lang',location.href).href.replace(/\/$/,'');statementOcrWorker=await T.createWorker(['tur','eng'],1,{workerPath:HANE_OCR_WORKER,langPath,corePath:HANE_OCR_CORE,logger:m=>{const e=document.getElementById('statementImportProgress');if(e&&m.progress)e.textContent=`${statementOcrLabel} · %${Math.round(m.progress*100)}`}});return statementOcrWorker}
async function releaseStatementOcrWorker(){if(statementOcrWorker){try{await statementOcrWorker.terminate()}catch{}statementOcrWorker=null}}

async function getStatementPdfRuntime(){
  if(statementPdfjs)return statementPdfjs;
  try{
    const pdfjs=await import(HANE_PDF_MODULE);
    pdfjs.GlobalWorkerOptions.workerSrc=HANE_PDF_WORKER;
    // Worker is deliberately initialized before the user selects any bank document.
    try{statementPdfWorker=new pdfjs.PDFWorker({name:'hane-private-pdf'});await statementPdfWorker.promise}catch{}
    statementPdfjs=pdfjs;return pdfjs;
  }catch{throw new Error('PDF motoru güvenli yerel önbellekte hazır değil. HANE güncellemesini internet açıkken tamamlayıp uygulamayı yeniden açın.')}
}
async function prepareStatementPrivacyRuntime(){
  if(statementPrivacyPrepared)return true;
  if(!('serviceWorker' in navigator))throw new Error('Güvenli ekstre okuma bu tarayıcıda desteklenmiyor.');
  if(!navigator.serviceWorker.controller){
    await Promise.race([
      navigator.serviceWorker.ready.catch(()=>null),
      new Promise((_,rej)=>setTimeout(()=>rej(new Error('Güvenli okuma motoru hazırlanamadı. HANE’yi internet açıkken kapatıp yeniden açın.')),8000))
    ]);
  }
  if(!navigator.serviceWorker.controller)throw new Error('Güvenli okuma motoru henüz etkin değil. HANE’yi bir kez kapatıp yeniden açın.');
  // Engine code + OCR worker + PDF worker are loaded BEFORE any personal statement file is selected.
  await Promise.all([getStatementPdfRuntime(),getStatementOcrWorker('GÜVENLİ OCR HAZIRLANIYOR')]);
  statementPrivacyPrepared=true;
  return true;
}

const MAX_STATEMENT_FILE_BYTES=20*1024*1024;
async function statementImageForOcr(file,maxSide=2400){
  if(typeof createImageBitmap!=='function')return file;
  const bmp=await createImageBitmap(file);try{const scale=Math.min(1,maxSide/Math.max(bmp.width,bmp.height));if(scale===1)return file;const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));c.getContext('2d',{alpha:false}).drawImage(bmp,0,0,c.width,c.height);return c}finally{bmp.close?.()}
}
async function readStatementFile(file){
  if(!file)throw new Error('Ekstre dosyası seçilmedi.');
  if(file.size>MAX_STATEMENT_FILE_BYTES)throw new Error('Ekstre dosyası 20 MB sınırını aşıyor.');
  const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name||'');
  if(!isPdf&&!String(file.type||'').startsWith('image/'))throw new Error('Yalnızca PDF veya fotoğraf ekstre desteklenir.');
  if(isPdf){
    const pdfjs=await getStatementPdfRuntime();
    const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;let text='',pages=[];
    for(let n=1;n<=Math.min(pdf.numPages,12);n++){const pg=await pdf.getPage(n),ct=await pg.getTextContent();const pt=ct.items.map(i=>i.str+(i.hasEOL?'\n':' ')).join('');pages.push(pg);text+='\n'+pt}
    const textChars=text.replace(/\s/g,'').length,textRows=textChars>40?parseStatementText(text,statementImportCardId).length:0,dateTokens=(text.match(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b/g)||[]).length;
    const suspicious=textChars<=80||(dateTokens>=6&&textRows<Math.max(3,Math.floor(dateTokens*.35)));
    if(!suspicious)return text;
    // If the PDF text layer is fragmented (many dates but very few transactions), OCR the pages and keep whichever interpretation finds more real rows.
    let ocr='';const w=await getStatementOcrWorker('PDF OCR');for(let n=1;n<=pages.length;n++){statementOcrLabel=`PDF SAYFA ${n}/${pages.length}`;const pg=pages[n-1],vp=pg.getViewport({scale:1.8}),canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await pg.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;const r=await w.recognize(canvas);ocr+='\n'+(r.data.text||'')}
    const ocrRows=ocr.replace(/\s/g,'').length>40?parseStatementText(ocr,statementImportCardId).length:0;
    if(ocrRows>textRows)return ocr;if(textRows)return text;if(ocrRows)return ocr;throw new Error('PDF içindeki işlem satırları okunamadı.');
  }
  const w=await getStatementOcrWorker('FOTOĞRAF OKUNUYOR'),source=await statementImageForOcr(file);const r=await w.recognize(source);return r.data.text||''
}
async function confirmStatementImport(){
  const c=state.cards.find(x=>x.id===statementImportCardId);if(!c)throw new Error('Seçilen kart artık bulunamadı.');
  const checks=[...document.querySelectorAll('[data-stmt-check]')],selected=[];let skipped=0;
  for(const el of checks){if(!el.checked)continue;const i=+el.dataset.stmtCheck,r=statementImportRows[i];if(!r)continue;const date=document.querySelector(`[data-stmt-date="${i}"]`)?.value||r.date,title=stmtCleanTitle(document.querySelector(`[data-stmt-title="${i}"]`)?.value||r.title),amount=Number(document.querySelector(`[data-stmt-amount="${i}"]`)?.value),categoryRaw=document.querySelector(`[data-stmt-category="${i}"]`)?.value||r.category,category=C.includes(categoryRaw)?categoryRaw:'Diğer';if(!stmtValidIsoDate(date)||!title||!Number.isFinite(amount)||amount===0){skipped++;continue}selected.push({date,title,amount,category})}
  if(!selected.length)throw new Error('Eklenecek geçerli işlem seçilmedi.');
  state.statementCategoryRules=state.statementCategoryRules&&typeof state.statementCategoryRules==='object'?state.statementCategoryRules:{};for(const r of selected){const k=stmtMerchantKey(r.title),auto=stmtCategoryBase(r.title);if(k&&r.category&&r.category!==auto)state.statementCategoryRules[k]=r.category}
  const month=statementImportMonthForRows(c,selected),period=statementPeriodRange(c,month),preserveBalance=+c.balance||0;
  const replace=document.getElementById('stmtReplacePeriod')?.checked!==false;
  if(replace)state.expenses=(state.expenses||[]).filter(x=>!(x.importedFromStatement&&x.cardId===c.id&&((x.statementImportMonth&&x.statementImportMonth===month)||statementMonthFor(c,x.date)===month)));
  const seen={};let added=0;
  for(const r of selected){const base=stmtFingerprint(c.id,r.date,r.title,r.amount),manualDup=(state.expenses||[]).some(x=>!x.importedFromStatement&&x.source==='card'&&x.cardId===c.id&&x.date===r.date&&stmtCleanTitle(x.title).toLocaleUpperCase('tr-TR')===stmtCleanTitle(r.title).toLocaleUpperCase('tr-TR')&&Math.abs((+(x.actualAmount??x.amount)||0)-r.amount)<.005);if(manualDup){skipped++;continue}const ord=(seen[base]=(seen[base]||0)+1),ex={id:id(),title:upper(r.title),amount:r.amount,actualAmount:r.amount,date:r.date,category:r.category,source:'card',cardId:c.id,recurring:false,memberId:'',attachment:'',importBaseFingerprint:base,importFingerprint:`${base}|#${ord}`,importedFromStatement:true,importedRefund:r.amount<0,statementImportMonth:month};state.expenses.push(ex);added++}
  const spendingRaw=String(document.getElementById('stmtSummarySpend')?.value||'').trim(),debtRaw=String(document.getElementById('stmtSummaryDebt')?.value||'').trim(),spendingInput=spendingRaw===''?null:Number(spendingRaw),debtInput=debtRaw===''?null:Number(debtRaw),spendingTotal=Number.isFinite(spendingInput)&&spendingInput>0?spendingInput:selected.filter(x=>x.amount>0).reduce((a,x)=>a+x.amount,0),periodDebt=Number.isFinite(debtInput)&&debtInput>=0?debtInput:null;
  state.statementImports=Array.isArray(state.statementImports)?state.statementImports:[];state.statementImports=state.statementImports.filter(x=>!(x.cardId===c.id&&x.month===month));state.statementImports.push({id:id(),cardId:c.id,month,start:period.start,end:period.end,spendingTotal,periodDebt,rowCount:added,importedAt:iso()});
  recalculateFinanceCore();const syncDebt=document.getElementById('stmtSyncDebt')?.checked&&periodDebt!=null;
  if(syncDebt){c.balanceAnchorDate=period.end;c.balanceAnchorAmount=periodDebt;c.balance=Math.max(0,periodDebt+cardDerivedNet(c.id))}else{const derivedNow=cardDerivedNet(c.id);if(c.balanceAnchorDate&&Number.isFinite(+c.balanceAnchorAmount))c.balanceAnchorAmount=preserveBalance-derivedNow;else c.openingBalance=preserveBalance-derivedNow;c.balance=preserveBalance;}
  await save();modal=null;render();showToast(`${added} İŞLEM EKLENDİ${skipped?` · ${skipped} ATLANDI`:''}`)
}
async function saveCard(d,i){
  const sd=d.statementDate||iso(),dd=d.dueDate||iso();
  const sdate=new Date(sd+'T12:00:00'),ddate=new Date(dd+'T12:00:00');
  if(Number.isNaN(sdate.getTime())||Number.isNaN(ddate.getTime()))throw new Error('KART TARİHLERİ GEÇERSİZ');
  if(ddate<=sdate)throw new Error('SON ÖDEME TARİHİ HESAP KESİM TARİHİNDEN SONRA OLMALI');
  const existing=i?state.cards.find(z=>z.id===i):null,requestedBalance=Number(String(d.balance||'0').replace(',','.'))||0,derived=existing?cardDerivedNet(existing.id):0;
  const x={id:i||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'KART'),last4:(d.last4||'0000').replace(/\D/g,'').slice(-4).padStart(4,'0'),limit:+d.limit||0,balance:requestedBalance,openingBalance:requestedBalance-derived,statementDate:sd,dueDate:dd,statementDay:sdate.getDate(),dueDay:ddate.getDate(),style:d.style||'blackgold',network:'VISA'};
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
  const c=$('#chart');if(!c)return;const ctx=c.getContext('2d'),box=c.getBoundingClientRect(),dpr=devicePixelRatio||1;c.width=box.width*dpr;c.height=220*dpr;ctx.scale(dpr,dpr);const w=box.width,h=220,range=periodRange(),inside=x=>x.date>=range.start&&x.date<=range.end;let labels=[],inc=[],exp=[];
  if(reportPeriod==='day'){labels=['GÜN'];inc=[state.incomes.filter(inside).reduce((a,x)=>a+(+x.amount||0),0)];exp=[actualExpenseEntriesInRange(range.start,range.end).reduce((a,x)=>a+(+x.amount||0),0)]}
  else if(reportPeriod==='week'){labels=['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'];inc=Array(7).fill(0);exp=Array(7).fill(0);const st=new Date(range.start+'T12:00:00');state.incomes.filter(inside).forEach(x=>{const n=Math.floor((new Date(x.date+'T12:00:00')-st)/86400000);if(n>=0&&n<7)inc[n]+=+x.amount||0});actualExpenseEntriesInRange(range.start,range.end).forEach(x=>{const n=Math.floor((new Date(x.date+'T12:00:00')-st)/86400000);if(n>=0&&n<7)exp[n]+=+x.amount||0})}
  else if(reportPeriod==='year'){labels=['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];inc=Array(12).fill(0);exp=Array(12).fill(0);state.incomes.filter(inside).forEach(x=>inc[+x.date.slice(5,7)-1]+=+x.amount||0);actualExpenseEntriesInRange(range.start,range.end).forEach(x=>exp[+x.date.slice(5,7)-1]+=+x.amount||0)}
  else{labels=['1','6','11','16','21','26'];inc=Array(6).fill(0);exp=Array(6).fill(0);state.incomes.filter(inside).forEach(x=>inc[Math.min(5,Math.floor((+x.date.slice(8)-1)/5))]+=+x.amount||0);actualExpenseEntriesInRange(range.start,range.end).forEach(x=>exp[Math.min(5,Math.floor((+x.date.slice(8)-1)/5))]+=+x.amount||0)}
  ctx.clearRect(0,0,w,h);ctx.strokeStyle='#222';for(let y=20;y<h-28;y+=40){ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(w-8,y);ctx.stroke()}const mx=Math.max(1,...inc,...exp),n=labels.length,bw=(w-35)/Math.max(1,n),cs=getComputedStyle(document.documentElement);for(let i=0;i<n;i++){const x=26+i*bw,hi=inc[i]/mx*(h-60),he=exp[i]/mx*(h-60);ctx.fillStyle=cs.getPropertyValue('--gi');ctx.fillRect(x,h-30-hi,Math.max(4,bw*.28),hi);ctx.fillStyle=cs.getPropertyValue('--ge');ctx.fillRect(x+bw*.33,h-30-he,Math.max(4,bw*.28),he);ctx.fillStyle='#999';ctx.font='9px sans-serif';ctx.fillText(labels[i],x,h-10)}}

let cropState=null;
function openProfileCrop(file,forSetup=false){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{cropState={img,zoom:1,x:0,y:0,setup:forSetup,drag:false,sx:0,sy:0,bx:0,by:0};const el=document.createElement('div');el.id='cropOverlay';el.className='cropOverlay';el.innerHTML=`<div class="cropSheet"><div class="cropHead"><b>PROFİL FOTOĞRAFINI AYARLA</b><button id="cropClose">×</button></div><div class="cropStage"><canvas id="cropCanvas" width="320" height="320"></canvas><div class="cropGuide"></div></div><label class="cropZoomLabel">YAKINLAŞTIR / UZAKLAŞTIR</label><input id="cropZoom" type="range" min="1" max="4" step="0.01" value="1"><div class="cropActions"><button class="btn" id="cropCancel">İPTAL</button><button class="btn gold" id="cropUse">KADRAJI KULLAN</button></div></div>`;document.body.appendChild(el);bindCrop()};img.src=r.result};r.readAsDataURL(file)}
function cropGeom(){const c=320,img=cropState?.img;if(!img)return null;const base=Math.max(c/img.width,c/img.height),scale=base*cropState.zoom,w=img.width*scale,h=img.height*scale;return{c,w,h}}
function clampCrop(){const g=cropGeom();if(!g)return;const mx=Math.max(0,(g.w-g.c)/2),my=Math.max(0,(g.h-g.c)/2);cropState.x=Math.max(-mx,Math.min(mx,cropState.x));cropState.y=Math.max(-my,Math.min(my,cropState.y))}
function drawCrop(){const cv=$('#cropCanvas'),g=cropGeom();if(!cv||!g)return;const ctx=cv.getContext('2d');ctx.clearRect(0,0,320,320);ctx.fillStyle='#000';ctx.fillRect(0,0,320,320);ctx.drawImage(cropState.img,(320-g.w)/2+cropState.x,(320-g.h)/2+cropState.y,g.w,g.h);ctx.save();ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.rect(0,0,320,320);ctx.arc(160,160,128,0,Math.PI*2,true);ctx.fill('evenodd');ctx.restore();ctx.beginPath();ctx.arc(160,160,128,0,Math.PI*2);ctx.strokeStyle='#f1cf7a';ctx.lineWidth=3;ctx.stroke()}
function closeCrop(){document.getElementById('cropOverlay')?.remove();cropState=null;const p=$('#profileInput');if(p)p.value=''}
function bindCrop(){const cv=$('#cropCanvas'),z=$('#cropZoom');drawCrop();z.oninput=e=>{cropState.zoom=+e.target.value;clampCrop();drawCrop()};const pos=e=>{const r=cv.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*320/r.width,y:(p.clientY-r.top)*320/r.height}};const down=e=>{e.preventDefault();const p=pos(e);cropState.drag=true;cropState.sx=p.x;cropState.sy=p.y;cropState.bx=cropState.x;cropState.by=cropState.y};const move=e=>{if(!cropState.drag)return;e.preventDefault();const p=pos(e);cropState.x=cropState.bx+p.x-cropState.sx;cropState.y=cropState.by+p.y-cropState.sy;clampCrop();drawCrop()};const up=()=>cropState.drag=false;cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('touchstart',down,{passive:false});cv.addEventListener('touchmove',move,{passive:false});cv.addEventListener('touchend',up,{passive:true});$('#cropClose').onclick=closeCrop;$('#cropCancel').onclick=closeCrop;$('#cropUse').onclick=async()=>{const g=cropGeom(),tmp=document.createElement('canvas');tmp.width=320;tmp.height=320;tmp.getContext('2d').drawImage(cropState.img,(320-g.w)/2+cropState.x,(320-g.h)/2+cropState.y,g.w,g.h);const out=document.createElement('canvas');out.width=512;out.height=512;out.getContext('2d').drawImage(tmp,32,32,256,256,0,0,512,512);const data=out.toDataURL('image/jpeg',.88),setup=cropState.setup;closeCrop();if(setup){setupPhoto=data;return}state.profile.photo=data;await save();render();showToast('PROFİL FOTOĞRAFI KAYDEDİLDİ')}}
function readImg(f,cb,max=420){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',.78))};img.src=r.result};r.readAsDataURL(f)}

async function backupNow(){const m=meta()||{},p={format:'HANE-LOCKED-BACKUP',meta:{salt:m.salt},data:JSON.parse(localStorage.getItem(DATA)),date:new Date().toISOString()},b=new Blob([JSON.stringify(p)],{type:'application/octet-stream'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='HANE-'+iso()+'.hane';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}

async function changePin(){const o=prompt('Mevcut PIN');if(!o||!(await unlock(o))){alert('PIN yanlış');return}const n=prompt('Yeni 4 haneli PIN');if(!/^\d{4}$/.test(n||'')){alert('PIN 4 haneli olmalı');return}const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(n,salt),box=await encrypt(state,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt)}));key=k;alert('PIN değiştirildi')}
function schedule(){clearTimeout(timer);if(state)timer=setTimeout(lock,Math.max(1,+state.settings.lockMinutes||15)*60000)}function lock(){state=null;key=null;pin='';renderLock()}
function renderSetup(){$('#app').innerHTML=`<div class="setup premiumSetup"><div class="setupOfficialLogo">${haneFullLogo("setupBrandLogo")}</div><p class="setupBrandLine">DAHA DÜZENLİ BİR YAŞAM</p><form class="form" id="setupForm" style="width:100%"><button type="button" class="btn" id="photoBtn">PROFİL RESMİNİ DEĞİŞTİR</button>${input('name','İsim','')}${input('pin','4 Haneli PIN','','password','inputmode="numeric" maxlength="4"')}${input('pin2','PIN Tekrar','','password','inputmode="numeric" maxlength="4"')}<button class="btn gold">HANE’yi Kur</button></form><div class="notice" style="margin-top:12px;width:100%">İlk kurulumda tüm tutarlar ₺0 başlar.</div></div>`;$('#photoBtn').onclick=()=>$('#profileInput').click();$('#setupForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries());if(!/^\d{4}$/.test(d.pin)||d.pin!==d.pin2){alert('PIN 4 haneli ve aynı olmalı');return}const st=def();st.profile.name=upper(d.name||'HANE');st.profile.photo=setupPhoto;await setup(d.pin,st);render();schedule()}}
function renderLock(){if(!meta()){renderSetup();return}pin='';$('#app').innerHTML=`<div class="lock haneSignatureLock"><div class="signatureLeft"><div class="signatureLogo">${haneFullLogo("signatureMainLogo")}</div><div class="signaturePortrait"><div class="portraitFallback">H</div></div><div class="pinPrompt">PIN’ini gir</div><div class="pinDots signatureDots">${[0,1,2,3].map(i=>`<i data-dot="${i}"></i>`).join('')}</div><div class="keypad signatureKeypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-key="${n}">${n}</button>`).join('')}<button type="button" class="blankKey signatureBlank" disabled></button><button type="button" data-key="0">0</button><button type="button" class="del" data-key="del">⌫</button></div><div class="signatureFooter"><span></span><b>DAHA DÜZENLİ BİR YAŞAM</b><span></span></div></div><aside class="signatureQuote"><div class="quoteBlock"><strong>Düzen<br>evde<br>başlar</strong><i></i><b>Huzur<br>planla büyür</b><i></i><b>Bugününü<br>yönet</b><i></i><b>Yarınına<br>güven kat</b></div><div class="quoteBrandMini">${haneLogo(54,'quoteMiniLogo')}</div></aside></div>`;$$('[data-key]').forEach(b=>b.onclick=()=>pinKey(b.dataset.key));installPinKeyboard()}
async function pinKey(k){if(k==='del')pin=pin.slice(0,-1);else if(/^\d$/.test(String(k))&&pin.length<4)pin+=String(k);$$('[data-dot]').forEach((d,i)=>d.classList.toggle('on',i<pin.length));if(pin.length===4)setTimeout(()=>confirmPin(),140)}
function installPinKeyboard(){if(window.__hanePinKeyboardInstalled)return;window.__hanePinKeyboardInstalled=true;document.addEventListener('keydown',e=>{if(state||!document.querySelector('.haneSignatureLock'))return;const k=e.key;if(/^\d$/.test(k)){e.preventDefault();pinKey(k);return}if(k==='Backspace'||k==='Delete'){e.preventDefault();pinKey('del');return}if(k==='Enter'||k==='NumpadEnter'){e.preventDefault();if(pin.length===4)confirmPin()}})}
async function confirmPin(){if(pin.length!==4){alert('4 HANELİ PIN GİR');return}if(await unlock(pin)){pin='';render();schedule();return}pin='';$$('[data-dot]').forEach(d=>d.classList.remove('on'));alert('PIN YANLIŞ')}
function modalWrap(){return modal?`<div class="modal"><div class="sheet"><div class="sheetHead"><b>${esc(modal.title)}</b><button class="close" data-action="close">×</button></div>${modal.body}</div></div>`:''}
function render(){captureModalFormDraft();if(state)initBrowserNav();applyTheme();$('#app').innerHTML=`<main class="phone">${buildTopBar()}<div class="content">${view()}</div>${nav()}</main>${modalWrap()}`;bind();restoreModalFormDraft();if(returnScrollTop!=null){const y=returnScrollTop;returnScrollTop=null;requestAnimationFrame(()=>{const c=document.querySelector('.content');if(c)c.scrollTop=y})}if(current==='reports')requestAnimationFrame(drawChart)}



function bootHane(){
  try{
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
        open('EKSTRE OKUNUYOR',`<div class="notice"><b id="statementImportProgress">DOSYA HAZIRLANIYOR...</b><br>Ekstre dosyası cihazdan dışarı gönderilmez. OCR/PDF motorları dosya seçilmeden önce hazırlanmıştır; okuma cihazında yapılır. Yalnızca tarih, açıklama, tutar ve kategori HANE’ye kaydedilir.</div>`,{cardId:statementImportCardId});
        try{const text=await readStatementFile(f);statementImportMeta=parseStatementSummary(text);const rows=parseStatementText(text,statementImportCardId);open('EKSTRE ÖNİZLEME',statementPreview(statementImportCardId,rows),{cardId:statementImportCardId})}catch(err){console.error(err);open('EKSTRE OKUNAMADI',`<div class="notice">${esc(err.message||'Dosya okunamadı.')}</div>`,{cardId:statementImportCardId})}finally{input.value=''}
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
          // Existing phone data is untouched until the encrypted backup is successfully authenticated and decrypted.
          localStorage.setItem(META,JSON.stringify({salt:p.meta.salt}));
          localStorage.setItem(DATA,JSON.stringify(p.data));
          input.value='';
          alert('YEDEK DOĞRULANDI VE GERİ YÜKLENDİ. HANE YENİDEN AÇILACAK.');
          location.reload();
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
