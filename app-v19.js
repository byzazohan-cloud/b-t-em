
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
const enc=new TextEncoder(),dec=new TextDecoder();let state=null,key=null,current='home',modal=null,pin='',timer=null,setupPhoto='',themeDraft=null,reportPeriod='month',reportCustomStart='',reportCustomEnd='',txFilter='all',financeTab='cards',navHistory=[],calendarMonth='',calendarDay='';
let browserNavReady=false;
const Q=['Bugün küçük adımlar, yarın büyük rahatlık getirir.','Disiplin, özgürlüğün kapısını açar.','Küçük birikimler büyük huzur getirir.','Planlı para, güçlü yarınlar demektir.'];
let C=['Kira','Aidat','Market','Manav','Fırın','Harçlık','Yemek','Restoran','Giyim','Akaryakıt','Ulaşım','Sağlık','Eğitim','Ev','Temizlik','Eğlence','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Diğer'];
let NORMAL_C=['Market','Manav','Fırın','Harçlık','Yemek','Restoran','Giyim','Akaryakıt','Ulaşım','Sağlık','Eğitim','Ev','Temizlik','Eğlence','Diğer'];
let FIXED_C=['Kira','Aidat','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu'];
const I={Kira:'🏠',Aidat:'🏢',Market:'🛒',Manav:'🍎',Fırın:'🥖',Harçlık:'💵',Yemek:'🍽️',Restoran:'🍴',Giyim:'👕',Akaryakıt:'⛽',Faturalar:'🧾',İnternet:'📡',Elektrik:'⚡',Su:'💧',Doğalgaz:'🔥','Cep Telefonu':'📱',Ulaşım:'◆',Sağlık:'✚',Eğitim:'✎',Ev:'⌂',Temizlik:'✦',Çocuk:'★','Evcil Hayvan':'♣','Kişisel Bakım':'✧',Abonelik:'◎',Eğlence:'♪',Tatil:'☀',Hediye:'🎁',Sigorta:'◇',Vergi:'▤',Diğer:'●'};
const CAT_COLORS={Kira:'#d8ad4f',Aidat:'#a86ef7',Market:'#19d77d',Manav:'#7ed957',Fırın:'#e5a85b',Harçlık:'#d9b44a',Yemek:'#ff8b5c',Restoran:'#ff6f61',Giyim:'#c084fc',Akaryakıt:'#f59e0b',Faturalar:'#ff8c42','İnternet':'#6ed4ff',Elektrik:'#ffd84d',Su:'#3fa9ff','Doğalgaz':'#ff6b45','Cep Telefonu':'#b879ff','Ulaşım':'#4dd6c7','Sağlık':'#ff5f78',Eğitim:'#60a5fa',Ev:'#d8ad4f',Temizlik:'#22d3ee',Çocuk:'#fb7185','Evcil Hayvan':'#34d399','Kişisel Bakım':'#f472b6',Abonelik:'#818cf8',Eğlence:'#f06dad',Tatil:'#fbbf24',Hediye:'#e879f9',Sigorta:'#38bdf8',Vergi:'#94a3b8',Diğer:'#9ca3af'};
function catIcon(cat){return state?.categoryMeta?.[cat]?.icon||I[cat]||'🔹'}
function catColor(cat){return state?.categoryMeta?.[cat]?.color||CAT_COLORS[cat]||'#d8ad4f'}
function catPremiumIcon(cat){return `<span class="catGem" style="--cat:${catColor(cat)}"><span>${catIcon(cat)}</span></span>`}
function paymentLabel(x){if(x.source==='card'){const c=state.cards.find(c=>c.id===x.cardId);return c?`KART · ${esc(c.bank)} ${esc(c.name)}`:'KART'}return 'NAKİT'}
const id=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),iso=(d=new Date())=>d.toISOString().slice(0,10),ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(+n||0),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const upper=v=>String(v??'').toLocaleUpperCase('tr-TR');
function haneLogo(size=54,cls=''){
  const n=Math.max(28,Number(size)||54);
  return `<img class="haneLogoImg ${cls}" src="icons/hane-app-icon.png?v=1947" width="${n}" alt="HANE">`;
}
function haneFullLogo(cls=''){
  return `<img class="haneFullLogo ${cls}" src="icons/hane-app-icon.png?v=1947" alt="HANE">`;
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
  st.cardTransactions=Array.isArray(st.cardTransactions)?st.cardTransactions:[];
  st.expenses=Array.isArray(st.expenses)?st.expenses:[];
  st.incomes=Array.isArray(st.incomes)?st.incomes:[];
  st.cards=Array.isArray(st.cards)?st.cards:[];
  st.accounts=Array.isArray(st.accounts)?st.accounts:[];st.flexAccounts=Array.isArray(st.flexAccounts)?st.flexAccounts:[];st.categoryMeta=st.categoryMeta||{};st.customCategories=Array.isArray(st.customCategories)?st.customCategories:[];
  C=[...new Set(['Kira','Aidat','Market','Manav','Fırın','Harçlık','Yemek','Restoran','Giyim','Akaryakıt','Ulaşım','Sağlık','Eğitim','Ev','Temizlik','Eğlence','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Diğer',...st.customCategories])];NORMAL_C=[...new Set(['Market','Manav','Fırın','Harçlık','Yemek','Restoran','Giyim','Akaryakıt','Ulaşım','Sağlık','Eğitim','Ev','Temizlik','Eğlence','Diğer',...st.customCategories])];FIXED_C=[...new Set(['Kira','Aidat','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu',...st.customCategories])];
  st.profile=st.profile||{name:'',photo:'',motto:''};
  st.settings=st.settings||{};if(typeof st.settings.darkMode!=='boolean')st.settings.darkMode=true;
  st.expenses.forEach((x,i)=>{if(typeof x.sortOrder!=='number')x.sortOrder=i;if(!Array.isArray(x.paidMonths))x.paidMonths=[];if(!x.source)x.source='cash'});
  return st;
}
function fixedPaidForMonth(x,m=state?.selectedMonth){return !!(x?.paidMonths||[]).includes(m) || (!!x?.paid && String(x?.date||'').startsWith(m))}
function fixedPaymentFor(x,m=state?.selectedMonth){return (state?.fixedPayments||[]).find(p=>p.expenseId===x.id&&p.month===m)||null}
function fixedPaymentDate(x,m=state?.selectedMonth){return fixedPaymentFor(x,m)?.date||x.dueDate||x.date||iso()}
function goTo(next,{replace=false,fromPop=false}={}){if(!next||next===current)return;if(!fromPop)navHistory.push(current);current=next;modal=null;if(browserNavReady&&!fromPop){const st={haneView:next};replace?history.replaceState(st,''):history.pushState(st,'')}render()}
function goBack(){if(current==='theme')themeDraft=null;const prev=navHistory.pop()||'home';current=prev;modal=null;if(browserNavReady)history.replaceState({haneView:current},'');render()}
function initBrowserNav(){if(browserNavReady)return;browserNavReady=true;history.replaceState({haneView:current},'');window.addEventListener('popstate',e=>{if(!state)return;const next=e.state?.haneView||navHistory.pop()||'home';if(next!==current){current=next;modal=null;render()}})}
function summaryDetailBody(kind){const m=state.selectedMonth;const inc=state.incomes.filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,_kind:'income'}));const exp=state.expenses.filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,_kind:'expense'}));const items=(kind==='income'?inc:kind==='expense'?exp:[...inc,...exp]).sort((a,b)=>String(b.date).localeCompare(String(a.date)));const T=totals(m);const title=kind==='income'?'GELİR DETAYI':kind==='expense'?'GİDER DETAYI':'KALAN DETAYI';return `<div class="summaryDetailBox"><div class="summaryDetailHead"><small>${m}</small><h2>${kind==='income'?money(T.i):kind==='expense'?money(T.e):money(T.r)}</h2><b>${title}</b></div>${kind==='remain'?`<div class="summaryBreakdown"><span>Gelir <b style="color:var(--green)">${money(T.i)}</b></span><span>Gider <b style="color:var(--red)">${money(T.e)}</b></span><span>Kalan <b style="color:var(--gold2)">${money(T.r)}</b></span></div>`:''}<div class="list">${items.length?items.map(x=>`<div class="item"><div class="ico premiumIco">${x._kind==='income'?premiumIcon('income',22):x._kind==='flexPayment'?premiumIcon('cards',22):catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · ${x._kind==='income'?'GELİR':esc(x.category||'DİĞER')}${x._kind==='expense'&&x.recurring?' · '+(fixedPaidForMonth(x,m)?'ÖDENDİ':'ÖDENMEDİ'):''}</small></div><div class="reportMoveRight"><b style="color:${x._kind==='income'||x._kind==='flexPayment'?'var(--green)':'var(--red)'}">${x._kind==='income'||x._kind==='flexPayment'?'+':'-'}${money(x.amount)}</b><div><button data-action="${x._kind==='income'?'editIncome':x._kind==='flexPayment'?'editFlexPayment':'editExpense'}" data-id="${x.id}">DÜZENLE</button><button class="danger" data-action="${x._kind==='income'?'delIncome':x._kind==='flexPayment'?'delFlexPayment':'delExpense'}" data-id="${x.id}">SİL</button></div></div></div>`).join(''):'<div class="notice">KAYIT YOK.</div>'}</div></div>`}


const b64=a=>{let s='';for(const b of new Uint8Array(a))s+=String.fromCharCode(b);return btoa(s)},ub64=s=>{const r=atob(s),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
async function derive(p,salt){const m=await crypto.subtle.importKey('raw',enc.encode('HANE|LOCKED|'+p),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encrypt(st,k){const iv=crypto.getRandomValues(new Uint8Array(12)),data=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,enc.encode(JSON.stringify(st)));return{iv:b64(iv),data:b64(data)}}
async function decrypt(box,k){const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(box.iv)},k,ub64(box.data));return JSON.parse(dec.decode(p))}
function meta(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch{return null}}
async function save(){
  if(!state)throw new Error('Uygulama verisi hazır değil');
  if(!key)throw new Error('Şifreleme anahtarı hazır değil. Uygulamayı kilitleyip PIN ile tekrar girin.');
  const box=await encrypt(state,key);
  try{localStorage.setItem(DATA,JSON.stringify(box))}catch(e){throw new Error('Cihaz depolamasına kayıt yapılamadı')}
}
async function setup(p,st){const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(p,salt),box=await encrypt(st,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt),name:st.profile.name,photo:st.profile.photo||''}));key=k;state=normalizeV19(st)}
async function unlock(p){const m=meta();if(!m)return false;try{
  const k=await derive(p,ub64(m.salt)),st=await decrypt(JSON.parse(localStorage.getItem(DATA)),k);
  st.cardPayments=Array.isArray(st.cardPayments)?st.cardPayments:[];
  st.fixedPayments=Array.isArray(st.fixedPayments)?st.fixedPayments:[];
  st.flexTransactions=Array.isArray(st.flexTransactions)?st.flexTransactions:[];
  st.cardTransactions=Array.isArray(st.cardTransactions)?st.cardTransactions:[];
  key=k;state=normalizeV19(st);applyTheme();return true
}catch{return false}}
function def(){return{version:19,selectedMonth:ym(new Date()),profile:{name:'',photo:'',motto:'Disiplin, özgürlüğün kapısını açar.'},settings:{lockMinutes:15,leadDays:3,notifications:false,darkMode:true},theme:{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'},incomes:[],expenses:[],cards:[],accounts:[],flexAccounts:[],customCategories:[],categoryMeta:{},cardTransactions:[],cardPayments:[],fixedPayments:[],flexTransactions:[]}}
function applyTheme(){if(!state)return;const t=state.theme||{},dark=state.settings?.darkMode!==false;document.documentElement.classList.toggle('lightMode',!dark);document.documentElement.classList.toggle('darkMode',dark);document.documentElement.style.setProperty('--bg',dark?(t.bg||'#000'):'#f3f1eb');document.documentElement.style.setProperty('--gold',t.accent||'#d8ad4f');document.documentElement.style.setProperty('--gold2',t.accent||'#f0cd77');document.documentElement.style.setProperty('--gi',t.income||'#248ef5');document.documentElement.style.setProperty('--ge',t.expense||'#ff4658');document.documentElement.style.setProperty('--gr',t.remain||'#16d77d')}
function totals(m=state.selectedMonth){const i=state.incomes.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0),e=state.expenses.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0);return{i,e,r:i-e}}
function cashFlow(m=state.selectedMonth){
  const spent=state.expenses.filter(x=>String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0);
  const directPaid=state.expenses.filter(x=>x.source!=='card'&&((x.recurring&&fixedPaidForMonth(x,m))||(!x.recurring&&String(x.date||'').startsWith(m)&&x.paid===true))).reduce((a,x)=>a+(+x.amount||0),0);
  const cardPaid=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0);
  return{spent,paid:directPaid+cardPaid,directPaid,cardPaid}
}
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
  if(current==='home')return`<div class="top homeTop"><button class="ib premiumTopIcon menuBtn" data-action="openMenu">☰</button><div class="brand brandLogo">${haneLogo(34,'brandMark')}<span>HANE</span></div><div class="topRight"><button class="ib premiumTopIcon" data-tab="alerts">${premiumIcon('bell',30)}</button><button class="ib premiumTopIcon" data-tab="settings">${premiumIcon('settings',30)}</button></div></div>`;
  const t={transactions:'HAREKETLER',fixed:'GİDERLER',cards:'FİNANS',calendar:'TAKVİM',reports:'RAPORLAR',profile:'PROFİL',backup:'YEDEKLEME',settings:'AYARLAR',categories:'KATEGORİLER',theme:'TEMA STÜDYOSU',alerts:'HATIRLATMALAR',about:'HAKKINDA',monthSpent:'BU AY HARCANAN',monthPaid:'BU AY ÖDENEN'};
  return`<div class="top"><button class="back" data-action="back">‹</button><div class="brand">${t[current]||'HANE'}</div><div class="topRight"><button class="ib premiumTopIcon" data-tab="alerts">${premiumIcon('bell',28)}</button><button class="ib premiumTopIcon" data-tab="settings">${premiumIcon('settings',28)}</button></div></div>`
}
function nav(){const items=[['home','home','ANA EKRAN'],['transactions','transactions','HAREKETLER'],['fixed','fixed','GİDERLER'],['cards','cards','FİNANS'],['profile','profile','PROFİL']];return`<nav class="nav premiumNav v1947CleanNav">${items.map(x=>`<button data-tab="${x[0]}" class="${current===x[0]?'active':''}"><span class="navIcon">${premiumIcon(x[1],30)}</span><span>${x[2]}</span></button>`).join('')}</nav>`}
function menuBody(){const a=[['home','🏠','ANA EKRAN'],['transactions','📋','HAREKETLER'],['fixed','🧾','GİDERLER'],['cards','💳','KARTLAR / ESNEK HESAP'],['calendar','🗓️','TAKVİM'],['reports','📊','RAPORLAR'],['alerts','🔔','HATIRLATMALAR'],['settings','⚙️','AYARLAR'],['profile','👤','PROFİL']];return `<div class="menuList">${a.map(x=>`<button data-action="menuGo" data-go="${x[0]}"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div>`}

function monthLabel(m=state.selectedMonth){const [y,mo]=m.split('-').map(Number);return new Date(y,mo-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR')}
function categoryStats(items){const map={};items.forEach(x=>{const k=x.category||'Diğer';map[k]=(map[k]||0)+(+x.amount||0)});return Object.entries(map).sort((a,b)=>b[1]-a[1])}
function monthSpent(){
  const m=state.selectedMonth,items=state.expenses.filter(x=>String(x.date||'').startsWith(m)).sort((a,b)=>String(b.date).localeCompare(String(a.date))),total=items.reduce((a,x)=>a+(+x.amount||0),0),cats=categoryStats(items),palette=['#ff4658','#d8ad4f','#278ff5','#19d77d','#a86ef7','#ff8c42','#6ed4ff','#f06dad'];
  let acc=0;const segs=cats.map((x,i)=>{const p=total?x[1]/total*100:0,st=acc;acc+=p;return`${palette[i%palette.length]} ${st}% ${acc}%`}).join(','),avg=total/Math.max(1,new Date(+m.slice(0,4),+m.slice(5,7),0).getDate());
  return`<div class="monthDetailPage"><div class="detailHero card"><div><small>${monthLabel(m)}</small><h2>${money(total)}</h2><span>TOPLAM HARCAMA</span></div><div class="detailDonut" style="background:${total?`conic-gradient(${segs})`:'#151515'}"><div><b>${items.length}</b><small>İŞLEM</small></div></div></div><div class="detailMiniGrid"><div class="detailMini"><i>◷</i><span>GÜNLÜK ORTALAMA</span><b>${money(avg)}</b></div><div class="detailMini"><i>▦</i><span>KATEGORİ SAYISI</span><b>${cats.length}</b></div></div><div class="section"><b>KATEGORİLER</b><span></span></div><div class="detailCategoryList">${cats.length?cats.map((x,i)=>{const p=total?Math.round(x[1]/total*100):0;return`<div class="detailCat"><div class="detailCatIcon">${I[x[0]]||'●'}</div><div class="detailCatMid"><div><b>${esc(x[0])}</b><span>%${p}</span></div><div class="detailBar"><i style="width:${p}%;background:${palette[i%palette.length]}"></i></div></div><strong>${money(x[1])}</strong></div>`}).join(''):'<div class="notice">BU AY HARCAMA YOK.</div>'}</div><div class="section"><b>HARCAMALAR</b><span>${items.length} İŞLEM</span></div><div class="list detailTxList">${items.length?items.map(x=>`<div class="item" data-action="editExpense" data-id="${x.id}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · ${esc(x.category||'DİĞER')}</small></div><div class="right"><b style="color:var(--red)">-${money(x.amount)}</b></div></div>`).join(''):'<div class="notice">BU AY HARCAMA YOK.</div>'}</div></div>`
}
function monthPaid(){
  const m=state.selectedMonth,card=(state.cardPayments||[]).filter(x=>String(x.date||'').startsWith(m)).map(x=>({...x,kind:'card'})),direct=state.expenses.filter(x=>x.source!=='card'&&((x.recurring&&fixedPaidForMonth(x,m))||(!x.recurring&&String(x.date||'').startsWith(m)&&x.paid===true))).map(x=>({...x,kind:'direct'})),items=[...card,...direct].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),total=items.reduce((a,x)=>a+(+x.amount||0),0),cardTotal=card.reduce((a,x)=>a+(+x.amount||0),0),directTotal=direct.reduce((a,x)=>a+(+x.amount||0),0),p1=total?cardTotal/total*100:0;
  return`<div class="monthDetailPage"><div class="detailHero card"><div><small>${monthLabel(m)}</small><h2>${money(total)}</h2><span>TOPLAM ÖDENEN</span></div><div class="detailDonut" style="background:${total?`conic-gradient(var(--gold2) 0 ${p1}%,var(--green) ${p1}% 100%)`:'#151515'}"><div><b>${items.length}</b><small>ÖDEME</small></div></div></div><div class="detailMiniGrid"><div class="detailMini"><i>▭</i><span>KART ÖDEMELERİ</span><b>${money(cardTotal)}</b></div><div class="detailMini"><i>✓</i><span>NAKİT / GİDER</span><b>${money(directTotal)}</b></div></div><div class="section"><b>ÖDEME DAĞILIMI</b><span></span></div><div class="detailCategoryList"><div class="detailCat"><div class="detailCatIcon">▭</div><div class="detailCatMid"><div><b>KART ÖDEMELERİ</b><span>${total?Math.round(cardTotal/total*100):0}%</span></div><div class="detailBar"><i style="width:${total?cardTotal/total*100:0}%;background:var(--gold2)"></i></div></div><strong>${money(cardTotal)}</strong></div><div class="detailCat"><div class="detailCatIcon">✓</div><div class="detailCatMid"><div><b>NAKİT / ÖDENEN GİDERLER</b><span>${total?Math.round(directTotal/total*100):0}%</span></div><div class="detailBar"><i style="width:${total?directTotal/total*100:0}%;background:var(--green)"></i></div></div><strong>${money(directTotal)}</strong></div></div><div class="section"><b>ÖDEMELER</b><span>${items.length} İŞLEM</span></div><div class="list detailTxList">${items.length?items.map(x=>`<div class="item" data-action="${x.kind==='card'?'editCardPayment':'editExpense'}" data-id="${x.id}"><div class="ico premiumIco">${x.kind==='card'?'💳':catPremiumIcon(x.category)}</div><div><b>${esc(x.kind==='card'?(x.title||'KREDİ KARTI ÖDEMESİ'):x.title)}</b><small>${x.date||''} · ${x.kind==='card'?'KART ÖDEMESİ':'ÖDENDİ'}</small></div><div class="right"><b style="color:var(--green)">${money(x.amount)}</b></div></div>`).join(''):'<div class="notice">BU AY ÖDEME YOK.</div>'}</div></div>`
}
function home(){const T=totals(),F=cashFlow(),s=Math.max(1,Math.abs(T.i)+Math.abs(T.e)+Math.max(0,T.r)),p1=T.i/s*100,p2=p1+T.e/s*100,r=rec(),q=Q[Math.floor(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()).getTime()/86400000)%Q.length];return`<div class="homeHero">
  <div class="homeHeroAvatar ava">${state.profile.photo?`<img src="${state.profile.photo}">`:esc((state.profile.name||'H')[0])}</div>
  <div class="homeHeroText">
    <small>MERHABA</small>
    <h2>${esc(state.profile.name||'HANE')}</h2>
    <div class="date">${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'})}</div>
  </div>
</div><div class="quote"><b>Bugünün Sözü</b><span>“${q}”</span></div><div class="summary"><div class="sum" data-action="summaryDetail" data-kind="income"><label>Gelir</label><strong style="color:var(--green)">${money(T.i)}</strong></div><div class="sum" data-action="summaryDetail" data-kind="expense"><label>Gider</label><strong style="color:var(--red)">${money(T.e)}</strong></div><div class="sum" data-action="summaryDetail" data-kind="remain"><label>Kalan</label><strong style="color:var(--gold2)">${money(T.r)}</strong></div></div><div class="card donutBox" data-tab="reports"><div class="donut" style="--p1:${p1}%;--p2:${p2}%"><div class="donutC"><small>Kalan</small><b>${money(T.r)}</b></div></div><div class="legend"><div><i class="dot" style="background:var(--gi)"></i><span>Gelir</span><b>${money(T.i)}</b></div><div><i class="dot" style="background:var(--ge)"></i><span>Gider</span><b>${money(T.e)}</b></div><div><i class="dot" style="background:var(--gr)"></i><span>Kalan</span><b>${money(T.r)}</b></div></div></div><div class="section"><b>Hızlı İşlemler</b><span></span></div><div class="card quick premiumQuick v1947Quick"><button data-action="addIncome"><i class="qIncome">💰</i>GELİR EKLE</button><button data-action="addExpense"><i class="qExpense">🧾</i>GİDER EKLE</button><button data-action="addCard"><i class="qCard">💳</i>KART EKLE</button><button data-tab="calendar"><i class="qCalendar">🗓️</i>TAKVİM</button><button data-tab="reports"><i class="qReport">📊</i>RAPORLAR</button></div><div class="section"><b>BU AY</b><span></span></div><div class="monthActionGrid"><button class="monthAction spentAction" data-tab="monthSpent"><i>${premiumIcon("expense",27)}</i><span>BU AY HARCANAN</span><b>${money(F.spent)}</b><em>›</em></button><button class="monthAction paidAction" data-tab="monthPaid"><i>${premiumIcon("cards",27)}</i><span>BU AY ÖDENEN</span><b>${money(F.paid)}</b><em>›</em></button></div><div class="section"><b>Sana Özel Önerilen Kart</b><span data-action="goCards">Tümünü Gör ›</span></div>${r?`<div class="reco"><div class="recoHead"><span>Önerilen Kart</span><span>ⓘ</span></div><div class="recoGrid v1947RecoGrid"><div class="miniCard haneRecoCard ${r.style||'blackgold'}" data-action="editCard" data-id="${r.id}"><div class="haneRecoBrand">${haneLogo(30,'recoLogo')}<div><strong>HANE</strong><small>DAHA DÜZENLİ BİR YAŞAM</small></div></div><div class="bank">${esc(r.bank)}</div><div class="sub">${esc(r.name)} · ${esc(r.network||'KREDİ KARTI')}</div><div class="recoChip"></div><div class="num">•••• •••• •••• ${esc(r.last4)}</div><div class="recoLimits"><span>Limit <b>${money(r.limit)}</b></span><span>Kullanılabilir <b>${money(Math.max(0,(+r.limit||0)-(+r.balance||0)))}</b></span></div></div><div class="recoInfo"><div>Hesap Kesim<br><b>Ayın ${r.statementDay}'si</b></div><div>Ödeme Tarihi<br><b>${r.dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div><div>Kesim → Ödeme<br><b>${r.paymentWindowDays} Gün</b></div><button class="btn gold">Bu Kartı Kullan</button></div></div></div>`:`<div class="notice">Henüz kredi kartı eklenmedi.</div>`}`}
function row(x){
  if(x.type==='cardPayment')return`<div class="item" data-action="editCardPayment" data-id="${x.id}"><div class="ico">▭</div><div><b>Kredi Kartı Ödemesi</b><small>${x.date} · Borç kapatma · Gidere dahil değil</small></div><div class="right"><b style="color:var(--gold2)">${money(x.amount)}</b></div></div>`;
  return`<div class="item" data-action="${x.type==='income'?'editIncome':'editExpense'}" data-id="${x.id}"><div class="ico">${x.type==='income'?'₺':I[x.category]||'●'}</div><div><b>${esc(x.title)}</b><small>${x.date}${x.recurring?' · Sabit':''}${x.source==='card'?' · Kart harcaması':''}</small></div><div class="right"><b style="color:${x.type==='income'?'var(--green)':'var(--red)'}">${x.type==='income'?'+':'-'}${money(x.amount)}</b></div></div>`
}
function transactions(){
  const m=state.selectedMonth;
  let a=[...state.incomes.map(x=>({...x,type:'income'})),...state.expenses.filter(x=>!x.recurring).map(x=>({...x,type:'expense'})),...(state.expenses.filter(x=>x.recurring).map(x=>({...x,type:'fixedExpense',date:fixedPaymentDate(x,m),_paid:fixedPaidForMonth(x,m)}))),...(state.cardPayments||[]).map(x=>({...x,type:'cardPayment'})),...(state.flexTransactions||[]).map(x=>({...x,type:x.kind==='pay'?'flexPayment':'flexSpend'}))].filter(x=>String(x.date||'').startsWith(m));
  if(txFilter==='income')a=a.filter(x=>x.type==='income');
  else if(txFilter==='expense')a=a.filter(x=>['expense','fixedExpense','flexSpend'].includes(x.type)&&x.source!=='card');
  else if(txFilter==='card')a=a.filter(x=>x.type==='cardPayment'||(x.type==='expense'&&x.source==='card'));
  a.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const B=(k,l)=>`<button data-action="txFilter" data-filter="${k}" class="${txFilter===k?'active':''}">${l}</button>`;
  const rr=x=>{if(x.type==='fixedExpense')return `<div class="item ${x._paid?'isPaid':''}"><div class="ico premiumIco">${catPremiumIcon(x.category)}</div><div><b>${esc(x.title)}</b><small>${x.date} · SABİT GİDER · ${x._paid?'ÖDENDİ':'ÖDENMEDİ'}</small></div><div class="right"><b style="color:${x._paid?'var(--green)':'var(--red)'}">-${money(x.amount)}</b><button class="tinyEdit" data-action="editFixedExpense" data-id="${x.id}">DÜZENLE</button></div></div>`;if(x.type==='flexPayment'||x.type==='flexSpend')return `<div class="item"><div class="ico premiumIco">${premiumIcon('cards',22)}</div><div><b>${esc(x.title||'ESNEK HESAP')}</b><small>${x.date} · ${x.type==='flexPayment'?'ESNEK HESAP ÖDEMESİ':'ESNEK HESAP HARCAMASI'}</small></div><div class="right"><b style="color:${x.type==='flexPayment'?'var(--green)':'var(--red)'}">${x.type==='flexPayment'?'+':'-'}${money(x.amount)}</b></div></div>`;return row(x)};
  return`<div class="seg">${B('all','Tümü')}${B('income','Gelir')}${B('expense','Gider')}${B('card','Kart')}</div><div class="section"><b>${state.selectedMonth}</b><span></span></div><div class="list">${a.length?a.map(rr).join(''):'<div class="notice">Bu filtrede hareket yok.</div>'}</div>`
}
function fixed(){
  const a=state.expenses.filter(x=>x.recurring).sort((x,y)=>(x.sortOrder??0)-(y.sortOrder??0));
  return`<div class="section"><b>SABİT GİDERLER</b><button class="miniAddBtn" data-action="addFixedExpense">+ GİDER EKLE</button></div><div class="notice sortHint">⋮⋮ TUTUP SÜRÜKLEYEREK SIRALAYABİLİRSİN.</div><div class="list fixedList">${a.length?a.map(x=>{const paid=fixedPaidForMonth(x),pay=fixedPaymentFor(x);return`<div class="item fixedItem ${paid?'isPaid':''}" draggable="true" data-fixed-id="${x.id}"><button class="dragHandle" type="button">⋮⋮</button><div class="ico premiumIco" data-action="editFixedExpense" data-id="${x.id}">${I[x.category]||'●'}</div><div data-action="editFixedExpense" data-id="${x.id}"><b>${esc(x.title)}</b><small>${x.dueDate||x.date} · SABİT${paid?` · ÖDENDİ ${pay?.date||''}`:''}</small></div><div class="fixedRight"><b style="color:${paid?'var(--green)':'var(--red)'}">${paid?'✓ ':'-'}${money(x.amount)}</b><button type="button" class="paidToggle ${paid?'on':''}" data-action="toggleFixedPaid" data-id="${x.id}">${paid?'↶ GERİ AL':'ÖDEDİM'}</button>${paid?`<button type="button" class="tinyEdit" data-action="editFixedPayment" data-id="${x.id}">ÖDEMEYİ DÜZENLE</button>`:''}</div></div>`}).join(''):'<div class="notice">SABİT GİDER YOK.</div>'}</div>`
}
function cards(){const B=(k,l)=>`<button data-action="financeTab" data-finance="${k}" class="${financeTab===k?'active':''}">${l}</button>`;if(financeTab==='accounts')financeTab='cards';return `<div class="financeTabs">${B('cards','KARTLAR')}${B('flex','ESNEK HESAP')}</div>${financeTab==='cards'?cardsPanel():flexPanel()}`}
function cardsPanel(){return `<div class="section"><b>KREDİ KARTLARIM</b><button class="miniAddBtn" data-action="addCard">+ KART EKLE</button></div><div class="financeCarousel">${state.cards.map(credit).join('')||'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}</div><div class="financeDots">${state.cards.map((c,i)=>`<button data-action="scrollCard" data-index="${i}">${esc(c.bank)} · •${esc(c.last4)}</button>`).join('')}</div>`}
function credit(c){const pi=cardPaymentInfo(c);return `<div class="credit card luxuryCard ${c.style||'blackgold'}" data-card-id="${c.id}"><div class="haneCardBrand"><img src="icons/hane-app-icon.png" alt="HANE"><div><strong>HANE</strong><small>DAHA DÜZENLİ BİR YAŞAM</small></div></div><div class="cardTop"><b>${esc(c.bank)}</b><span>${esc(c.network||'KREDİ KARTI')}</span></div><small class="cardName">${esc(c.name)}</small><div class="chip"></div><div class="digits">•••• •••• •••• ${esc(c.last4)}</div><div class="grid"><div><small>TOPLAM LİMİT</small><b>${money(c.limit)}</b></div><div><small>KULLANILABİLİR LİMİT</small><b>${money(Math.max(0,(+c.limit||0)-(+c.balance||0)))}</b></div><div><small>HESAP KESİM TARİHİ</small><b>${pi.statementDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div><div><small>SON ÖDEME TARİHİ</small><b>${pi.dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div></div><div class="cardActions"><button class="btn" data-action="cardSpend" data-id="${c.id}">＋ HARCAMA EKLE</button><button class="btn gold" data-action="cardPay" data-id="${c.id}">₺ ÖDEME YAPTIM</button><button class="iconEdit" data-action="editCard" data-id="${c.id}">✎</button></div></div>`}
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
function periodTotals(){const r=periodRange(),inside=x=>x.date>=r.start&&x.date<=r.end,i=state.incomes.filter(inside).reduce((a,x)=>a+(+x.amount||0),0),e=state.expenses.filter(inside).reduce((a,x)=>a+(+x.amount||0),0);return{i,e,r:i-e,range:r}}
function prettyDate(v){if(!v)return '-';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}
function calendarItems(date){
 const inc=state.incomes.filter(x=>x.date===date).map(x=>({...x,_kind:'income'}));
 const exp=state.expenses.filter(x=>!x.recurring&&x.source!=='flex'&&x.date===date).map(x=>({...x,_kind:'expense'}));
 const fixed=(state.fixedPayments||[]).filter(x=>x.date===date).map(x=>{const e=state.expenses.find(z=>z.id===x.expenseId);return {...x,title:x.title||e?.title||'SABİT GİDER',category:e?.category||'Sabit',_kind:'fixedPayment',expenseId:x.expenseId}});
 const cp=(state.cardPayments||[]).filter(x=>x.date===date).map(x=>({...x,_kind:'cardPayment'}));
 const ft=(state.flexTransactions||[]).filter(x=>x.date===date).map(x=>({...x,_kind:x.kind==='pay'?'flexPayment':'flexSpend'}));
 return [...inc,...exp,...fixed,...cp,...ft];
}
function calendar(){
 if(!calendarMonth)calendarMonth=state.selectedMonth||ym(new Date());
 const [y,m]=calendarMonth.split('-').map(Number),first=new Date(y,m-1,1),last=new Date(y,m,0).getDate(),offset=(first.getDay()+6)%7;
 if(!calendarDay||!calendarDay.startsWith(calendarMonth))calendarDay=calendarMonth+'-'+String(Math.min(new Date().getDate(),last)).padStart(2,'0');
 const cells=[];for(let i=0;i<offset;i++)cells.push('<div class="calBlank"></div>');
 for(let d=1;d<=last;d++){const ds=calendarMonth+'-'+String(d).padStart(2,'0'),items=calendarItems(ds),kinds=[...new Set(items.map(x=>x._kind))];cells.push(`<button class="calDay ${ds===calendarDay?'active':''}" data-action="calendarDay" data-date="${ds}"><b>${d}</b><span class="calDots">${kinds.map(k=>`<i class="calDot ${k}"></i>`).join('')}</span></button>`)}
 const items=calendarItems(calendarDay),income=items.filter(x=>x._kind==='income').reduce((a,x)=>a+(+x.amount||0),0),expense=items.filter(x=>['expense','flexSpend'].includes(x._kind)).reduce((a,x)=>a+(+x.amount||0),0),paid=items.filter(x=>['fixedPayment','cardPayment','flexPayment'].includes(x._kind)).reduce((a,x)=>a+(+x.amount||0),0),net=income-expense;
 const row=x=>{const map={income:['GELİR','var(--green)','editIncome','delIncome'],expense:['GİDER','var(--red)','editExpense','delExpense'],fixedPayment:['SABİT GİDER ÖDEMESİ','var(--gold2)','editFixedPayment','toggleFixedPaid'],cardPayment:['KART ÖDEMESİ','#35a7ff','editCardPayment','delCardPayment'],flexSpend:['ESNEK HESAP HARCAMASI','#b66cff','editExpense','delExpense'],flexPayment:['ESNEK HESAP ÖDEMESİ','#29d3c2','editFlexPayment','delFlexPayment']},z=map[x._kind],idv=x._kind==='fixedPayment'?x.expenseId:x._kind==='flexSpend'?x.expenseId:x.id;return `<div class="calendarMove ${x._kind}"><i></i><div><b>${esc(x.title||z[0])}</b><small>${z[0]}</small></div><strong style="color:${z[1]}">${x._kind==='income'?'+':x._kind==='expense'||x._kind==='flexSpend'?'-':''}${money(x.amount)}</strong><div class="calActions"><button data-action="${z[2]}" data-id="${idv}">DÜZENLE</button><button class="danger" data-action="${z[3]}" data-id="${idv}">${x._kind==='fixedPayment'?'GERİ AL':'SİL'}</button></div></div>`};
 return `<div class="calendarPage"><div class="calendarHead"><button data-action="calendarPrev">‹</button><b>${new Date(y,m-1,1).toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toLocaleUpperCase('tr-TR')}</b><button data-action="calendarNext">›</button></div><div class="calWeek">${['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calGrid">${cells.join('')}</div><div class="calLegend"><span><i class="calDot income"></i>Gelir</span><span><i class="calDot expense"></i>Gider</span><span><i class="calDot fixedPayment"></i>Sabit Ödeme</span><span><i class="calDot cardPayment"></i>Kart</span><span><i class="calDot flexSpend"></i>Esnek</span></div><div class="section"><b>${prettyDate(calendarDay)} DETAYI</b><span>${items.length} HAREKET</span></div><div class="calendarSummary"><div><small>GELEN</small><b>${money(income)}</b></div><div><small>GİDEN</small><b>${money(expense)}</b></div><div><small>ÖDENEN</small><b>${money(paid)}</b></div><div><small>NET</small><b>${money(net)}</b></div></div><div class="calendarMoves">${items.length?items.map(row).join(''):'<div class="notice">BU GÜN HAREKET YOK.</div>'}</div></div>`}
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
 const row=x=>{let label='',edit='',del='',idv=x.id,color='var(--red)',sign='-';if(x._kind==='income'){label='GELİR';edit='editIncome';del='delIncome';color='var(--green)';sign='+'}else if(x._kind==='expense'){label=(x.source==='card'?'KART HARCAMASI':x.source==='flex'?'ESNEK HESAP HARCAMASI':'GİDER')+' · '+(x.category||'Diğer');edit='editExpense';del='delExpense'}else if(x._kind==='fixedPayment'){label='SABİT GİDER · ÖDENDİ';edit='editFixedPayment';del='toggleFixedPaid';idv=x.expenseId;color='var(--gold2)';sign=''}else if(x._kind==='cardPayment'){label='KART ÖDEMESİ';edit='editCardPayment';del='delCardPayment';color='#35a7ff';sign=''}else{label='ESNEK HESAP ÖDEMESİ';edit='editFlexPayment';del='delFlexPayment';color='#29d3c2';sign=''}return `<div class="item"><div class="ico premiumIco">${x._kind==='income'?premiumIcon('income',22):x._kind==='expense'?catPremiumIcon(x.category):premiumIcon('cards',22)}</div><div><b>${esc(x.title||label)}</b><small>${x.date} · ${label}</small></div><div class="reportMoveRight"><b style="color:${color}">${sign}${money(x.amount)}</b><div><button type="button" data-action="${edit}" data-id="${idv}">DÜZENLE</button><button type="button" class="danger" data-action="${del}" data-id="${idv}">${x._kind==='fixedPayment'?'GERİ AL':'SİL'}</button></div></div></div>`};
 return `<div class="seg reportSeg">${B('day','Günlük')}${B('week','Haftalık')}${B('month','Aylık')}${B('year','Yıllık')}${B('custom','Özel')}</div>${custom}<div class="section"><b>${T.range.label}</b><span></span></div><div class="reportSummary4"><div class="sum"><label>TOPLAM GELİR</label><strong style="color:var(--green)">${money(T.i)}</strong></div><div class="sum"><label>TOPLAM GİDER</label><strong style="color:var(--red)">${money(T.e)}</strong></div><div class="sum"><label>TOPLAM ÖDENEN</label><strong style="color:var(--gold2)">${money(paid)}</strong></div><div class="sum"><label>NET KALAN</label><strong>${money(T.r)}</strong></div></div><div class="card" style="padding:14px;margin-top:10px"><canvas id="chart" style="width:100%;height:220px"></canvas><div class="chartLegend"><span><i style="background:var(--gi)"></i>GELİR</span><span><i style="background:var(--ge)"></i>GİDER</span><span><i style="background:var(--gr)"></i>KALAN</span></div></div><div class="section"><b>KATEGORİ DAĞILIMI</b><span>${catRows.length} KATEGORİ</span></div><div class="categoryReport">${catRows.length?catRows.map(([k,v])=>`<div><span>${catPremiumIcon(k)} <b>${esc(k)}</b></span><strong>${money(v)}</strong></div>`).join(''):'<div class="notice">BU ARALIKTA GİDER YOK.</div>'}</div><div class="section"><b>AYRINTILI HAREKET LİSTESİ</b><span>${items.length} KAYIT</span></div><div class="list reportMoves">${items.length?items.map(row).join(''):'<div class="notice">BU TARİH ARALIĞINDA HAREKET YOK.</div>'}</div>`
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
function settings(){return`<div class="card"><div class="setting" data-tab="categories"><span class="settingIco">🎨</span><span>KATEGORİLERİ DÜZENLE / EKLE</span><b>›</b></div><div class="setting" data-action="toggleDarkMode"><span class="settingIco">${premiumIcon("palette",30)}</span><span>KARANLIK MOD</span><b>${state.settings.darkMode!==false?'Açık':'Kapalı'}</b></div><div class="setting"><span class="settingIco">${premiumIcon("bell",30)}</span><span>BİLDİRİMLER</span><b>${state.settings.notifications?'Açık':'Kapalı'}</b></div><div class="setting" data-tab="about"><span class="settingIco">${premiumIcon("info",30)}</span><span>HAKKINDA</span><b>›</b></div><div class="setting" data-action="clearAll"><span class="settingIco dangerIco">${premiumIcon("trash",30)}</span><span style="color:var(--red)">TÜM VERİLERİ SIFIRLA</span><b></b></div></div>`}
function categories(){return `<div class="section"><b>KATEGORİLER</b><button class="miniAddBtn" data-action="addCategory">+ EKLE</button></div><div class="categoryManage">${C.map(c=>`<button data-action="editCategory" data-cat="${esc(c)}"><span>${catPremiumIcon(c)}</span><b>${esc(c)}</b><em>✎</em></button>`).join('')}</div>`}
function categoryForm(old=''){const icon=old?catIcon(old):'✨',color=old?catColor(old):'#d8ad4f';return `<form class="form" id="categoryForm">${input('name','Kategori Adı',old)}${input('icon','İkon / Emoji',icon)}<div class="field"><label>İkon Rengi</label><input type="color" name="color" value="${color}"></div><button class="btn gold" type="submit">KAYDET</button>${old&&state.customCategories.includes(old)?`<button class="btn" type="button" data-action="delCategory" data-cat="${esc(old)}">KATEGORİYİ SİL</button>`:''}</form>`}
function theme(){
  if(!themeDraft) themeDraft={...(state.theme||{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'})};
  const t=themeDraft;
  return`<div class="section"><b>Tema Stüdyosu</b><span>Kaydetmeden uygulanmaz</span></div><div class="preview" style="background:${t.bg};border-color:${t.accent}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:${t.accent}">Canlı Önizleme</b><small style="color:#aaa">Sadece önizleme</small></div><div class="summary"><div class="sum" style="border-color:${t.accent}55"><label>Gelir</label><strong style="color:${t.income}">₺25.000</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Gider</label><strong style="color:${t.expense}">₺12.550</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Kalan</label><strong style="color:${t.remain}">₺12.450</strong></div></div><div style="height:10px;border-radius:99px;background:linear-gradient(90deg,${t.income} 0 33%,${t.expense} 33% 66%,${t.remain} 66% 100%);margin-top:10px"></div></div><div class="card" style="margin-top:12px"><div class="setting" data-action="pickBg"><span>◼</span><span>Arka Plan Rengi</span><b style="color:${t.bg};text-shadow:0 0 0 #777">■</b></div><div class="setting" data-action="pickAccent"><span>✦</span><span>Detay Rengi</span><b style="color:${t.accent}">■</b></div><div class="setting" data-action="pickIncome"><span>●</span><span>Grafik · Gelir</span><b style="color:${t.income}">■</b></div><div class="setting" data-action="pickExpense"><span>●</span><span>Grafik · Gider</span><b style="color:${t.expense}">■</b></div><div class="setting" data-action="pickRemain"><span>●</span><span>Grafik · Kalan</span><b style="color:${t.remain}">■</b></div></div><div class="section"><b>Hazır Temalar</b><span></span></div><div class="themeGrid">${[['Klasik Siyah','#000000','#d8ad4f'],['Lacivert','#06111f','#4da3ff'],['Koyu Yeşil','#05130d','#41d98c'],['Bordo','#1a080b','#e4a0aa']].map(a=>`<div class="themeCard" data-action="preset" data-bg="${a[1]}" data-accent="${a[2]}"><div class="swatch" style="background:${a[1]};border:1px solid ${a[2]}"></div><b>${a[0]}</b></div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><button class="btn" data-action="resetTheme">Varsayılana Dön</button><button class="btn gold" data-action="saveTheme">Kaydet</button></div><button class="btn" style="width:100%;margin-top:8px" data-action="cancelTheme">İptal</button>`
}
function alerts(){return`<div class="notice">Ödenmemiş giderler ve kart borçları burada görünecek. Ödeme yapıldığında kaydı düzenleyip “Ödendi” olarak işaretleyebilirsin.</div>`}
function about(){return`<div class="profile"><div class="aboutV5Logo">${haneFullLogo("aboutV5")}</div><p>SÜRÜM 19.4.8</p><p>PREMİUM EV BÜTÇEN.<br>VERİLERİN CİHAZINDA ŞİFRELİ SAKLANIR.</p></div>`}
function view(){return({home,transactions,fixed,cards,calendar,reports,profile,backup,settings,categories,theme,alerts,about,monthSpent,monthPaid}[current]||home)()}
function input(n,l,v='',type='text',extra=''){const attrs=type==='text'?'autocapitalize="characters" autocorrect="on" autocomplete="on" spellcheck="true"':'';return`<div class="field"><label>${l}</label><input name="${n}" type="${type}" value="${esc(v)}" ${attrs} ${extra}></div>`}
function select(n,l,opts,v=''){return`<div class="field"><label>${l}</label><select name="${n}">${opts.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}
function incomeForm(x={}){return`<form class="form" id="incomeForm">${input('title','Gelir Adı',x.title||'')}${input('amount','Tutar',x.amount||0,'number')}${input('date','Tarih',x.date||iso(),'date')}<div class="field"><label>Sabit Gelir</label><select name="recurring"><option value="false" ${!x.recurring?'selected':''}>Hayır</option><option value="true" ${x.recurring?'selected':''}>Evet</option></select></div><button class="btn gold" type="submit">Kaydet</button>${x.id?`<button type="button" class="btn" data-action="delIncome" data-id="${x.id}">Sil</button>`:''}</form>`}
function expenseForm(x={}){
  const isFixed=!!x.recurring,isCustomNormal=!isFixed&&x.category&&!NORMAL_C.includes(x.category),currentCat=isCustomNormal?'Diğer':(x.category||(isFixed?'Kira':'Market')),normalCats=NORMAL_C;
  const source=x.source==='card'?'card':'cash',cards=state.cards||[];
  const catTiles=(cats,name)=>`<div class="premiumCatGrid" data-select-name="${name}">${cats.map(c=>`<button type="button" class="premiumCatBtn ${c===currentCat?'active':''}" data-cat="${esc(c)}">${catPremiumIcon(c)}<b>${esc(c)}</b></button>`).join('')}</div><select class="hiddenCatSelect" name="${name}">${cats.map(c=>`<option ${c===currentCat?'selected':''}>${esc(c)}</option>`).join('')}</select>`;
  return`<form class="form" id="expenseForm"><div class="field"><label>Gider Türü</label><select name="expenseType" id="expenseType"><option value="normal" ${!isFixed?'selected':''}>Normal Gider</option><option value="fixed" ${isFixed?'selected':''}>Sabit Gider</option></select></div>${input('title','Açıklama',x.title||'')}${input('amount','Tutar',x.amount||0,'number','step="0.01" min="0"')}<div class="field" id="normalCategoryWrap" style="${isFixed?'display:none':''}"><label>Kategori</label>${catTiles(normalCats,'normalCategory')}<div id="customCategoryWrap" style="${currentCat==='Diğer'?'':'display:none'};margin-top:10px">${input('customCategory','Diğer Kategori Adı',isCustomNormal?x.category:'')}</div></div><div class="field" id="fixedCategoryWrap" style="${isFixed?'':'display:none'}"><label>Sabit Gider Kategorisi</label>${catTiles(FIXED_C,'fixedCategory')}</div><div class="field"><label>Ödeme Kaynağı</label><div class="paySourceSeg"><button type="button" data-pay-source="cash" class="${source==='cash'?'active':''}">NAKİT</button><button type="button" data-pay-source="card" class="${source==='card'?'active':''}">KART</button></div><input type="hidden" name="source" id="expenseSource" value="${source}"></div><div class="field" id="expenseCardWrap" style="${source==='card'?'':'display:none'}"><label>Hangi Kart?</label><select name="cardId" id="expenseCardId"><option value="">Kart seç</option>${cards.map(c=>`<option value="${c.id}" ${c.id===x.cardId?'selected':''}>${esc(c.bank)} · ${esc(c.name)} · •••• ${esc(c.last4)}</option>`).join('')}</select>${!cards.length?'<small class="fieldHint">Önce KARTLAR bölümünden bir kart eklemelisin.</small>':''}</div><div id="normalDateWrap" style="${isFixed?'display:none':''}">${input('date','Harcama Tarihi',x.date||iso(),'date')}</div><div id="fixedDueWrap" style="${isFixed?'':'display:none'}">${input('dueDate','Son Ödeme Tarihi',x.dueDate||x.date||iso(),'date')}</div><div class="notice" id="expenseHelp">${isFixed?'AYNI KATEGORİDEN BİRDEN FAZLA SABİT GİDER EKLEYEBİLİRSİN.':'NORMAL GİDERDE HARCAMA TARİHİ VE ÖDEME KAYNAĞI KAYDEDİLİR.'}</div><button type="button" class="btn" data-action="attachReceipt">📷 FİŞ / FOTOĞRAF</button><button class="btn gold" type="submit">KAYDET</button>${x.id?`<button type="button" class="btn" data-action="delExpense" data-id="${x.id}">SİL</button>`:''}</form>`
}
function fixedExpenseForm(x={}){
  return`<form class="form" id="fixedExpenseForm">
    ${input('title','Sabit Gider Adı',x.title||'')}
    ${input('amount','Tutar',x.amount||0,'number','step="0.01" min="0"')}
    ${select('category','Kategori',FIXED_C,x.category||'Kira')}
    ${input('date','Başlangıç Tarihi',x.date||iso(),'date')}
    ${input('dueDate','Ödeme Tarihi',x.dueDate||x.date||iso(),'date')}
    <div class="notice">BU ÖDEME TARİHİ AYLIK TAKİP İÇİN KULLANILIR.</div>
    <button class="btn gold" type="submit">KAYDET</button>
    ${x.id?`<button type="button" class="btn" data-action="delExpense" data-id="${x.id}">SİL</button>`:''}
  </form>`
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
function cardSpendForm(c){return`<form class="form" id="cardSpendForm">${input('amount','Tutar',0,'number','step="0.01" min="0"')}${input('title','Açıklama','')}${select('category','Kategori',C,'Market')}${input('date','Tarih',iso(),'date')}<div class="notice">Bu harcama, yapıldığı ayın giderine eklenir. HANE hangi ekstreye düşeceğini hesap kesim tarihine göre arka planda hesaplar.</div><button type="button" class="btn" data-action="receipt">📷 Fiş / Kamera</button><button class="btn gold" type="submit">Harcamayı Kaydet</button></form>`}
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
function modalHTML(){return`<div class="modal"><div class="sheet"><div class="sheetHead"><b>${modal.title}</b><button class="close" data-action="close">×</button></div>${modal.body}</div></div>`}
function showToast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}

async function reorderFixed(sourceId,targetId){if(!sourceId||!targetId||sourceId===targetId)return;const fixed=state.expenses.filter(x=>x.recurring).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)),from=fixed.findIndex(x=>x.id===sourceId),to=fixed.findIndex(x=>x.id===targetId);if(from<0||to<0)return;const [moved]=fixed.splice(from,1);fixed.splice(to,0,moved);fixed.forEach((x,i)=>x.sortOrder=i);await save();render();showToast('SIRALAMA KAYDEDİLDİ')}
function bindFixedSorting(){let dragId=null,touchId=null,touchTarget=null;$$('.fixedItem').forEach(item=>{item.addEventListener('dragstart',e=>{dragId=item.dataset.fixedId;e.dataTransfer?.setData('text/plain',dragId);item.classList.add('dragging')});item.addEventListener('dragend',()=>item.classList.remove('dragging'));item.addEventListener('dragover',e=>e.preventDefault());item.addEventListener('drop',e=>{e.preventDefault();reorderFixed(dragId||e.dataTransfer?.getData('text/plain'),item.dataset.fixedId)});const h=item.querySelector('.dragHandle');if(!h)return;h.addEventListener('touchstart',e=>{touchId=item.dataset.fixedId;touchTarget=item;e.stopPropagation()},{passive:true});h.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(!t)return;const over=document.elementFromPoint(t.clientX,t.clientY)?.closest?.('.fixedItem');$$('.fixedItem').forEach(x=>x.classList.remove('dragOver'));if(over){over.classList.add('dragOver');touchTarget=over}},{passive:true});h.addEventListener('touchend',()=>{const targetId=touchTarget?.dataset?.fixedId;$$('.fixedItem').forEach(x=>x.classList.remove('dragOver'));if(targetId)reorderFixed(touchId,targetId);touchId=null;touchTarget=null},{passive:true})})}
function bind(){
  bindFixedSorting();
  $$('[data-tab]').forEach(x=>x.onclick=()=>{const next=x.dataset.tab;if(next==='theme')themeDraft={...(state.theme||{})};else if(current==='theme')themeDraft=null;goTo(next)});
  $$('[data-action]').forEach(x=>x.onclick=e=>{if(x.closest('form')&&x.type==='submit')return;e.stopPropagation();act(x.dataset.action,x)});

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
  if(expenseFormEl) expenseFormEl.onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const btn=form.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='Kaydediliyor…'}
    try{
      await saveExpense(Object.fromEntries(new FormData(form).entries()),modal?.id);
      showToast('Gider kaydedildi');
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
  const fixedExpenseFormEl=$('#fixedExpenseForm');
  if(fixedExpenseFormEl) fixedExpenseFormEl.onsubmit=async e=>{
    e.preventDefault();const form=e.currentTarget;
    try{await saveFixedExpense(Object.fromEntries(new FormData(form).entries()),modal?.id);showToast('SABİT GİDER KAYDEDİLDİ')}
    catch(err){console.error(err);alert('SABİT GİDER KAYDEDİLEMEDİ: '+(err?.message||err))}
  };
  const categoryFormEl=$('#categoryForm');if(categoryFormEl)categoryFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),old=modal?.oldCat||'',name=upper((d.name||'').trim());if(!name)return alert('Kategori adı gerekli');if(old&&old!==name){state.customCategories=state.customCategories.filter(x=>x!==old);if(!C.includes(name))state.customCategories.push(name);state.expenses.forEach(x=>{if(x.category===old)x.category=name});delete state.categoryMeta[old]}else if(!C.includes(name))state.customCategories.push(name);state.categoryMeta[name]={icon:d.icon||'✨',color:d.color||'#d8ad4f'};normalizeV19(state);await save();modal=null;render();showToast('KATEGORİ KAYDEDİLDİ')};
  const accountFormEl=$('#accountForm');if(accountFormEl)accountFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x={id:modal?.id||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'HESAP'),last4:(d.last4||'0000').replace(/\D/g,'').slice(-4),balance:+d.balance||0};const n=state.accounts.findIndex(a=>a.id===x.id);n>=0?state.accounts[n]=x:state.accounts.push(x);await save();modal=null;render()};
  const flexFormEl=$('#flexForm');if(flexFormEl)flexFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x={id:modal?.id||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'ESNEK HESAP'),limit:+d.limit||0,balance:+d.balance||0,statementDate:d.statementDate,dueDate:d.dueDate,style:d.style||'blackgold'};const n=state.flexAccounts.findIndex(a=>a.id===x.id);n>=0?state.flexAccounts[n]=x:state.flexAccounts.push(x);await save();modal=null;render()};
  const reportCustomForm=$('#reportCustomForm');if(reportCustomForm)reportCustomForm.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());reportCustomStart=d.start||'';reportCustomEnd=d.end||'';reportPeriod='custom';render()};
  const simpleAmountFormEl=$('#simpleAmountForm');if(simpleAmountFormEl)simpleAmountFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),kind=e.currentTarget.dataset.kind,objId=e.currentTarget.dataset.id,amt=+d.amount||0;if(amt<=0)return alert('Tutar girin');if(kind.startsWith('account')){const a=state.accounts.find(x=>x.id===objId);if(kind==='accountSpend'){a.balance-=amt;state.expenses.push({id:id(),title:upper(d.title||a.bank+' HARCAMA'),amount:amt,category:'Diğer',date:d.date,recurring:false,paid:true,source:'cash'})}else{a.balance+=amt;state.incomes.push({id:id(),title:upper(d.title||a.bank+' GELİR'),amount:amt,date:d.date,recurring:false})}}else{const a=state.flexAccounts.find(x=>x.id===objId);state.flexTransactions=Array.isArray(state.flexTransactions)?state.flexTransactions:[];if(kind==='flexSpend'){a.balance+=amt;const eid=id(),txid=id(),title=upper(d.title||a.bank+' ESNEK HESAP HARCAMASI');state.expenses.push({id:eid,flexTxId:txid,flexId:a.id,title,amount:amt,category:'Diğer',date:d.date,recurring:false,paid:true,source:'flex'});state.flexTransactions.push({id:txid,expenseId:eid,flexId:a.id,kind:'spend',title,amount:amt,date:d.date})}else{a.balance=Math.max(0,a.balance-amt);state.flexTransactions.push({id:id(),flexId:a.id,kind:'pay',title:upper(d.title||a.bank+' ESNEK HESAP ÖDEMESİ'),amount:amt,date:d.date})}}await save();modal=null;render()};
  const flexPaymentEditFormEl=$('#flexPaymentEditForm');if(flexPaymentEditFormEl)flexPaymentEditFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=(state.flexTransactions||[]).find(z=>z.id===modal?.id);if(!x)return;const f=state.flexAccounts.find(a=>a.id===x.flexId),old=+x.amount||0,next=+d.amount||0;if(f)f.balance=Math.max(0,(+f.balance||0)+old-next);x.amount=next;x.date=d.date||x.date;x.title=upper(d.title||x.title);await save();modal=null;render();showToast('ESNEK HESAP ÖDEMESİ GÜNCELLENDİ')};
  const fixedPaymentFormEl=$('#fixedPaymentForm');if(fixedPaymentFormEl)fixedPaymentFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),p=(state.fixedPayments||[]).find(p=>p.id===modal?.paymentId);if(!p)return;p.amount=+d.amount||0;p.date=d.date||iso();await save();modal=null;render();showToast('ÖDEME GÜNCELLENDİ')};
  const cardPaymentEditFormEl=$('#cardPaymentEditForm');if(cardPaymentEditFormEl)cardPaymentEditFormEl.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.cardPayments.find(x=>x.id===modal?.id);if(!x)return;x.amount=+d.amount||0;x.date=d.date;await save();modal=null;render()};
  const cardSpendFormEl=$('#cardSpendForm');
  if(cardSpendFormEl) cardSpendFormEl.onsubmit=async e=>{
    e.preventDefault();const form=e.currentTarget;
    try{await saveCardSpend(Object.fromEntries(new FormData(form).entries()),modal?.cardId);showToast('Kart harcaması kaydedildi')}
    catch(err){console.error(err);alert('Harcama kaydedilemedi: '+(err?.message||err))}
  };
  const cardPayFormEl=$('#cardPayForm');
  if(cardPayFormEl) cardPayFormEl.onsubmit=async e=>{
    e.preventDefault();const form=e.currentTarget;
    try{await saveCardPayment(Object.fromEntries(new FormData(form).entries()),modal?.cardId);showToast('Kart ödemesi kaydedildi')}
    catch(err){console.error(err);alert('Ödeme kaydedilemedi: '+(err?.message||err))}
  };
}
function open(t,b,d={}){modal={title:t,body:b,...d};render()}
async function act(a,el){if(a==='openMenu')open('MENÜ',menuBody());else if(a==='menuGo'){goTo(el.dataset.go)}else if(a==='summaryDetail'){open(el.dataset.kind==='income'?'GELİR DETAYI':el.dataset.kind==='expense'?'GİDER DETAYI':'KALAN DETAYI',summaryDetailBody(el.dataset.kind))}else if(a==='financeTab'){financeTab=el.dataset.finance;render()}else if(a==='scrollCard'){document.querySelectorAll('.financeCarousel .luxuryCard')[+el.dataset.index]?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})}else if(a==='addCategory')open('KATEGORİ EKLE',categoryForm(),{oldCat:''});else if(a==='editCategory'){open('KATEGORİYİ DÜZENLE',categoryForm(el.dataset.cat),{oldCat:el.dataset.cat})}else if(a==='delCategory'){const c=el.dataset.cat;if(confirm(c+' kategorisi silinsin mi?')){state.customCategories=state.customCategories.filter(x=>x!==c);delete state.categoryMeta[c];state.expenses.forEach(x=>{if(x.category===c)x.category='Diğer'});normalizeV19(state);await save();modal=null;render()}}else if(a==='addAccount')open('HESAP EKLE',accountForm());else if(a==='editAccount'){const x=state.accounts.find(z=>z.id===el.dataset.id);open('HESABI DÜZENLE',accountForm(x),{id:x.id})}else if(a==='delAccount'){state.accounts=state.accounts.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='accountSpend'||a==='accountIncome'){const x=state.accounts.find(z=>z.id===el.dataset.id);open(a==='accountSpend'?'HARCAMA EKLE':'GELİR EKLE',simpleAmountForm(a,x))}else if(a==='addFlex')open('ESNEK HESAP EKLE',flexForm());else if(a==='editFlex'){const x=state.flexAccounts.find(z=>z.id===el.dataset.id);open('ESNEK HESABI DÜZENLE',flexForm(x),{id:x.id})}else if(a==='delFlex'){state.flexAccounts=state.flexAccounts.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='flexSpend'||a==='flexPay'){const x=state.flexAccounts.find(z=>z.id===el.dataset.id);open(a==='flexSpend'?'HARCAMA EKLE':'ÖDEME YAPTIM',simpleAmountForm(a,x))}else if(a==='editFlexPayment'){const x=(state.flexTransactions||[]).find(z=>z.id===el.dataset.id);if(x)open('ESNEK HESAP ÖDEMESİNİ DÜZENLE',`<form class="form" id="flexPaymentEditForm">${input('amount','Tutar',x.amount,'number','step="0.01" min="0"')}${input('date','Tarih',x.date,'date')}${input('title','Açıklama',x.title||'')}<button class="btn gold">KAYDET</button><button type="button" class="btn" data-action="delFlexPayment" data-id="${x.id}">SİL</button></form>`,{id:x.id})}else if(a==='delFlexPayment'){const x=(state.flexTransactions||[]).find(z=>z.id===el.dataset.id);if(x){const f=state.flexAccounts.find(a=>a.id===x.flexId);if(f)f.balance=(+f.balance||0)+(+x.amount||0);state.flexTransactions=state.flexTransactions.filter(z=>z.id!==x.id);await save();modal=null;render()}}else if(a==='editCardPayment'){const x=state.cardPayments.find(z=>z.id===el.dataset.id);if(x)open('ÖDEMEYİ DÜZENLE',cardPaymentEditForm(x),{id:x.id})}else if(a==='delCardPayment'){state.cardPayments=state.cardPayments.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='back'){goBack()}else if(a==='txFilter'){txFilter=el.dataset.filter||'all';render()}else if(a==='goCards'){goTo('cards')}else if(a==='calendarDay'){calendarDay=el.dataset.date;calendarMonth=calendarDay.slice(0,7);state.selectedMonth=calendarMonth;render()}else if(a==='calendarPrev'){let [y,m]=calendarMonth.split('-').map(Number);m--;if(m<1){m=12;y--}calendarMonth=y+'-'+String(m).padStart(2,'0');calendarDay='';render()}else if(a==='calendarNext'){let [y,m]=calendarMonth.split('-').map(Number);m++;if(m>12){m=1;y++}calendarMonth=y+'-'+String(m).padStart(2,'0');calendarDay='';render()}else if(a==='reportPeriod'){reportPeriod=el.dataset.period||'month';render()}else if(a==='openTheme'){themeDraft={...(state.theme||{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'})};current='theme';modal=null;render()}else if(a==='addIncome')open('Gelir Ekle',incomeForm());else if(a==='editIncome'){const x=state.incomes.find(z=>z.id===el.dataset.id);open('Geliri Düzenle',incomeForm(x),{id:x.id})}else if(a==='delIncome'){state.incomes=state.incomes.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='addExpense')open('Gider Ekle',expenseForm());else if(a==='addFixedExpense')open('Gider Ekle',expenseForm({recurring:true,category:'Kira',dueDate:iso()}));else if(a==='editFixedExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='editExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='delExpense'){const ex=state.expenses.find(x=>x.id===el.dataset.id);if(ex?.cardTxId){state.cardTransactions=state.cardTransactions.filter(t=>t.id!==ex.cardTxId);const c=state.cards.find(c=>c.id===ex.cardId);if(c)c.balance=Math.max(0,(+c.balance||0)-(+ex.amount||0))}state.fixedPayments=(state.fixedPayments||[]).filter(p=>p.expenseId!==el.dataset.id);state.flexTransactions=(state.flexTransactions||[]).filter(t=>t.expenseId!==el.dataset.id);state.expenses=state.expenses.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='toggleFixedPaid'){const x=state.expenses.find(z=>z.id===el.dataset.id);if(x){x.paidMonths=Array.isArray(x.paidMonths)?x.paidMonths:[];state.fixedPayments=Array.isArray(state.fixedPayments)?state.fixedPayments:[];const m=state.selectedMonth,was=x.paidMonths.includes(m);if(was){x.paidMonths=x.paidMonths.filter(v=>v!==m);state.fixedPayments=state.fixedPayments.filter(p=>!(p.expenseId===x.id&&p.month===m))}else{x.paidMonths=[...new Set([...x.paidMonths,m])];if(!fixedPaymentFor(x,m))state.fixedPayments.push({id:id(),expenseId:x.id,month:m,amount:+x.amount||0,date:iso(),title:x.title})}await save();render()}}else if(a==='editFixedPayment'){const x=state.expenses.find(z=>z.id===el.dataset.id),p=fixedPaymentFor(x);if(x&&p)open('ÖDEMEYİ DÜZENLE',`<form class="form" id="fixedPaymentForm">${input('amount','Ödenen Tutar',p.amount||x.amount,'number','step="0.01" min="0"')}${input('date','Ödeme Tarihi',p.date||iso(),'date')}<button class="btn gold" type="submit">KAYDET</button><button class="btn" type="button" data-action="toggleFixedPaid" data-id="${x.id}">ÖDEMEYİ GERİ AL</button></form>`,{id:x.id,paymentId:p.id})}else if(a==='addCard')open('Kart Ekle',cardForm());else if(a==='editCard'){const c=state.cards.find(z=>z.id===el.dataset.id);open('Kartı Düzenle',cardForm(c),{id:c.id})}else if(a==='delCard'){state.cards=state.cards.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='cardSpend'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Kart Harcaması Ekle',cardSpendForm(c),{cardId:c.id})}else if(a==='cardPay'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Ödeme Yaptım',cardPayForm(c),{cardId:c.id})}else if(a==='cashDetails'){const F=cashFlow();open('Bu Ay · Harcanan / Ödenen',`<div class="cashDetail"><div class="notice"><b>Bu Ay Harcanan: ${money(F.spent)}</b><br>Bu ay yaptığın gerçek ev harcamalarıdır.</div><div class="notice" style="margin-top:8px"><b>Bu Ay Ödenen: ${money(F.paid)}</b><br>Kart ödemeleri ${money(F.cardPaid)} + nakit/ödenmiş giderler ${money(F.directPaid)}.</div><div class="notice" style="margin-top:8px">Kart ödemeleri yeniden gider sayılmaz. Önceki aylardan gelen kart borcu ödesen bile sadece “Bu Ay Ödenen” bölümünde görünür.</div></div>`)}else if(a==='editProfile')open('Profili Düzenle',profileForm());else if(a==='pickProfile')$('#profileInput').click();else if(a==='receipt')$('#receiptInput').click();else if(a==='close'){modal=null;render()}else if(a==='pickBg')open('Arka Plan Rengi',colorForm('bg','Arka Plan Rengi'));else if(a==='pickAccent')open('Detay Rengi',colorForm('accent','Detay Rengi'));else if(a==='pickIncome')open('Grafik Gelir',colorForm('income','Gelir Rengi'));else if(a==='pickExpense')open('Grafik Gider',colorForm('expense','Gider Rengi'));else if(a==='pickRemain')open('Grafik Kalan',colorForm('remain','Kalan Rengi'));else if(a==='saveColor'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft[el.dataset.kind]=$('#nativeColor').value;modal=null;render()}else if(a==='preset'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft.bg=el.dataset.bg;themeDraft.accent=el.dataset.accent;render()}else if(a==='resetTheme'){themeDraft={bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'};render()}else if(a==='saveTheme'){state.theme={...themeDraft};await save();themeDraft=null;applyTheme();current='profile';render();alert('Tema kaydedildi.')}else if(a==='cancelTheme'){themeDraft=null;current='profile';render()}else if(a==='backupNow')backupNow();else if(a==='restoreNow')$('#restoreInput').click();else if(a==='changePin')changePin();else if(a==='toggleDarkMode'){state.settings.darkMode=!(state.settings.darkMode!==false);await save();applyTheme();render();showToast(state.settings.darkMode?'KARANLIK MOD AÇILDI':'KARANLIK MOD KAPATILDI')}else if(a==='clearAll'){if(confirm('Tüm HANE verileri silinsin mi?')){localStorage.removeItem(META);localStorage.removeItem(DATA);location.reload()}}}
async function saveIncome(d,i){const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<0)throw new Error('Tutar geçersiz');const x={id:i||id(),title:upper((d.title||'GELİR').trim()||'GELİR'),amount,date:d.date||iso(),recurring:d.recurring==='true'};if(i){const n=state.incomes.findIndex(z=>z.id===i);state.incomes[n]={...state.incomes[n],...x}}else state.incomes.push(x);await save();modal=null;render()}
async function saveExpense(d,i){
  const amount=+d.amount||0;if(amount<0)throw new Error('Tutar geçersiz');
  const old=i?state.expenses.find(z=>z.id===i):null,fixed=d.expenseType==='fixed',source=d.source==='card'?'card':'cash';
  if(source==='card'&&!d.cardId)throw new Error('Lütfen hangi kartla ödendiğini seçin.');
  const x={id:i||id(),title:upper((d.title||(fixed?'SABİT GİDER':'GİDER')).trim()||(fixed?'SABİT GİDER':'GİDER')),amount,category:fixed?(d.fixedCategory||'Kira'):((d.normalCategory==='Diğer'&&(d.customCategory||'').trim())?upper(d.customCategory.trim()):(d.normalCategory||'Diğer')),date:fixed?(d.dueDate||iso()):(d.date||iso()),dueDate:fixed?(d.dueDate||iso()):null,recurring:fixed,paid:fixed?(old?.paid||false):true,sortOrder:old?.sortOrder??state.expenses.length,paidMonths:[...(old?.paidMonths||[])],source,cardId:source==='card'?d.cardId:null,attachment:modal?.attachment||old?.attachment||''};
  if(old?.cardTxId){const oi=state.cardTransactions.findIndex(t=>t.id===old.cardTxId);if(oi>=0)state.cardTransactions.splice(oi,1);const oc=state.cards.find(c=>c.id===old.cardId);if(oc)oc.balance=Math.max(0,(+oc.balance||0)-(+old.amount||0));x.cardTxId=null}
  if(source==='card'){const c=state.cards.find(c=>c.id===d.cardId);if(!c)throw new Error('Kart bulunamadı');const txId=id();x.cardTxId=txId;state.cardTransactions.push({id:txId,cardId:c.id,amount,title:x.title,category:x.category,date:x.date,statementMonth:statementMonthFor(c,x.date),attachment:x.attachment||''});c.balance=(+c.balance||0)+amount}
  if(i){const n=state.expenses.findIndex(z=>z.id===i);state.expenses[n]={...state.expenses[n],...x};(state.fixedPayments||[]).filter(p=>p.expenseId===i).forEach(p=>{p.amount=amount;p.title=x.title})}else state.expenses.push(x);await save();modal=null;render()
}
async function saveFixedExpense(d,i){
  const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<0)throw new Error('TUTAR GEÇERSİZ');
  const x={id:i||id(),title:upper((d.title||'SABİT GİDER').trim()||'SABİT GİDER'),amount,category:d.category,date:d.date||iso(),dueDate:d.dueDate||d.date||iso(),recurring:true,paid:false};
  if(i){const n=state.expenses.findIndex(z=>z.id===i);state.expenses[n]={...state.expenses[n],...x}}else state.expenses.push(x);
  await save();modal=null;render()
}
async function saveCard(d,i){
  const sd=d.statementDate||iso(),dd=d.dueDate||iso();
  const sdate=new Date(sd+'T12:00:00'),ddate=new Date(dd+'T12:00:00');
  if(Number.isNaN(sdate.getTime())||Number.isNaN(ddate.getTime()))throw new Error('KART TARİHLERİ GEÇERSİZ');
  if(ddate<=sdate)throw new Error('SON ÖDEME TARİHİ HESAP KESİM TARİHİNDEN SONRA OLMALI');
  const x={id:i||id(),bank:upper(d.bank||'BANKA'),name:upper(d.name||'KART'),last4:(d.last4||'0000').replace(/\D/g,'').slice(-4).padStart(4,'0'),limit:+d.limit||0,balance:+d.balance||0,statementDate:sd,dueDate:dd,statementDay:sdate.getDate(),dueDay:ddate.getDate(),style:d.style||'blackgold',network:'VISA'};
  if(i){const n=state.cards.findIndex(z=>z.id===i);state.cards[n]={...state.cards[n],...x}}else state.cards.push(x);
  await save();modal=null;render()
}
async function saveCardSpend(d,cardId){
  const c=state.cards.find(x=>x.id===cardId);if(!c)throw new Error('Kart bulunamadı');
  const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<=0)throw new Error('Tutar geçersiz');
  const txId=id(),date=d.date||iso(),stmt=statementMonthFor(c,date);
  const tx={id:txId,cardId,amount,title:upper((d.title||d.category||'KART HARCAMASI').trim()),category:d.category||'Diğer',date,statementMonth:stmt,attachment:modal?.attachment||''};
  state.cardTransactions=state.cardTransactions||[];state.cardTransactions.push(tx);
  state.expenses.push({id:id(),cardTxId:txId,source:'card',cardId,title:tx.title,amount,category:tx.category,date,dueDate:date,recurring:false,paid:true});
  c.balance=(+c.balance||0)+amount;
  await save();modal=null;render();
}
async function saveCardPayment(d,cardId){
  const c=state.cards.find(x=>x.id===cardId);if(!c)throw new Error('Kart bulunamadı');
  const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<=0)throw new Error('Tutar geçersiz');
  state.cardPayments=state.cardPayments||[];
  state.cardPayments.push({id:id(),cardId,amount,date:d.date||iso(),title:c.bank+' '+c.name+' ödeme'});
  c.balance=Math.max(0,(+c.balance||0)-amount);
  await save();modal=null;render();
}
function drawChart(){
  const c=$('#chart');if(!c)return;const ctx=c.getContext('2d'),box=c.getBoundingClientRect(),dpr=devicePixelRatio||1;c.width=box.width*dpr;c.height=220*dpr;ctx.scale(dpr,dpr);const w=box.width,h=220,range=periodRange(),inside=x=>x.date>=range.start&&x.date<=range.end;let labels=[],inc=[],exp=[];
  if(reportPeriod==='day'){labels=['GÜN'];inc=[state.incomes.filter(inside).reduce((a,x)=>a+(+x.amount||0),0)];exp=[state.expenses.filter(inside).reduce((a,x)=>a+(+x.amount||0),0)]}
  else if(reportPeriod==='week'){labels=['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'];inc=Array(7).fill(0);exp=Array(7).fill(0);const st=new Date(range.start+'T12:00:00');state.incomes.filter(inside).forEach(x=>{const n=Math.floor((new Date(x.date+'T12:00:00')-st)/86400000);if(n>=0&&n<7)inc[n]+=+x.amount||0});state.expenses.filter(inside).forEach(x=>{const n=Math.floor((new Date(x.date+'T12:00:00')-st)/86400000);if(n>=0&&n<7)exp[n]+=+x.amount||0})}
  else if(reportPeriod==='year'){labels=['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];inc=Array(12).fill(0);exp=Array(12).fill(0);state.incomes.filter(inside).forEach(x=>inc[+x.date.slice(5,7)-1]+=+x.amount||0);state.expenses.filter(inside).forEach(x=>exp[+x.date.slice(5,7)-1]+=+x.amount||0)}
  else{labels=['1','6','11','16','21','26'];inc=Array(6).fill(0);exp=Array(6).fill(0);state.incomes.filter(inside).forEach(x=>inc[Math.min(5,Math.floor((+x.date.slice(8)-1)/5))]+=+x.amount||0);state.expenses.filter(inside).forEach(x=>exp[Math.min(5,Math.floor((+x.date.slice(8)-1)/5))]+=+x.amount||0)}
  ctx.clearRect(0,0,w,h);ctx.strokeStyle='#222';for(let y=20;y<h-28;y+=40){ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(w-8,y);ctx.stroke()}const mx=Math.max(1,...inc,...exp),n=labels.length,bw=(w-35)/Math.max(1,n),cs=getComputedStyle(document.documentElement);for(let i=0;i<n;i++){const x=26+i*bw,hi=inc[i]/mx*(h-60),he=exp[i]/mx*(h-60);ctx.fillStyle=cs.getPropertyValue('--gi');ctx.fillRect(x,h-30-hi,Math.max(4,bw*.28),hi);ctx.fillStyle=cs.getPropertyValue('--ge');ctx.fillRect(x+bw*.33,h-30-he,Math.max(4,bw*.28),he);ctx.fillStyle='#999';ctx.font='9px sans-serif';ctx.fillText(labels[i],x,h-10)}}

let cropState=null;
function openProfileCrop(file,forSetup=false){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{cropState={img,zoom:1,x:0,y:0,setup:forSetup,drag:false,sx:0,sy:0,bx:0,by:0};const el=document.createElement('div');el.id='cropOverlay';el.className='cropOverlay';el.innerHTML=`<div class="cropSheet"><div class="cropHead"><b>PROFİL FOTOĞRAFINI AYARLA</b><button id="cropClose">×</button></div><div class="cropStage"><canvas id="cropCanvas" width="320" height="320"></canvas><div class="cropGuide"></div></div><label class="cropZoomLabel">YAKINLAŞTIR / UZAKLAŞTIR</label><input id="cropZoom" type="range" min="1" max="4" step="0.01" value="1"><div class="cropActions"><button class="btn" id="cropCancel">İPTAL</button><button class="btn gold" id="cropUse">KADRAJI KULLAN</button></div></div>`;document.body.appendChild(el);bindCrop()};img.src=r.result};r.readAsDataURL(file)}
function cropGeom(){const c=320,img=cropState?.img;if(!img)return null;const base=Math.max(c/img.width,c/img.height),scale=base*cropState.zoom,w=img.width*scale,h=img.height*scale;return{c,w,h}}
function clampCrop(){const g=cropGeom();if(!g)return;const mx=Math.max(0,(g.w-g.c)/2),my=Math.max(0,(g.h-g.c)/2);cropState.x=Math.max(-mx,Math.min(mx,cropState.x));cropState.y=Math.max(-my,Math.min(my,cropState.y))}
function drawCrop(){const cv=$('#cropCanvas'),g=cropGeom();if(!cv||!g)return;const ctx=cv.getContext('2d');ctx.clearRect(0,0,320,320);ctx.fillStyle='#000';ctx.fillRect(0,0,320,320);ctx.drawImage(cropState.img,(320-g.w)/2+cropState.x,(320-g.h)/2+cropState.y,g.w,g.h);ctx.save();ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.rect(0,0,320,320);ctx.arc(160,160,128,0,Math.PI*2,true);ctx.fill('evenodd');ctx.restore();ctx.beginPath();ctx.arc(160,160,128,0,Math.PI*2);ctx.strokeStyle='#f1cf7a';ctx.lineWidth=3;ctx.stroke()}
function closeCrop(){document.getElementById('cropOverlay')?.remove();cropState=null;const p=$('#profileInput');if(p)p.value=''}
function bindCrop(){const cv=$('#cropCanvas'),z=$('#cropZoom');drawCrop();z.oninput=e=>{cropState.zoom=+e.target.value;clampCrop();drawCrop()};const pos=e=>{const r=cv.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*320/r.width,y:(p.clientY-r.top)*320/r.height}};const down=e=>{e.preventDefault();const p=pos(e);cropState.drag=true;cropState.sx=p.x;cropState.sy=p.y;cropState.bx=cropState.x;cropState.by=cropState.y};const move=e=>{if(!cropState.drag)return;e.preventDefault();const p=pos(e);cropState.x=cropState.bx+p.x-cropState.sx;cropState.y=cropState.by+p.y-cropState.sy;clampCrop();drawCrop()};const up=()=>cropState.drag=false;cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('touchstart',down,{passive:false});cv.addEventListener('touchmove',move,{passive:false});cv.addEventListener('touchend',up,{passive:true});$('#cropClose').onclick=closeCrop;$('#cropCancel').onclick=closeCrop;$('#cropUse').onclick=async()=>{const g=cropGeom(),tmp=document.createElement('canvas');tmp.width=320;tmp.height=320;tmp.getContext('2d').drawImage(cropState.img,(320-g.w)/2+cropState.x,(320-g.h)/2+cropState.y,g.w,g.h);const out=document.createElement('canvas');out.width=512;out.height=512;out.getContext('2d').drawImage(tmp,32,32,256,256,0,0,512,512);const data=out.toDataURL('image/jpeg',.88),setup=cropState.setup;closeCrop();if(setup){setupPhoto=data;return}state.profile.photo=data;const m=meta()||{};m.photo=data;localStorage.setItem(META,JSON.stringify(m));await save();render();showToast('PROFİL FOTOĞRAFI KAYDEDİLDİ')}}
function readImg(f,cb,max=420){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',.78))};img.src=r.result};r.readAsDataURL(f)}

async function backupNow(){const p={format:'HANE-LOCKED-BACKUP',meta:meta(),data:JSON.parse(localStorage.getItem(DATA)),date:new Date().toISOString()},b=new Blob([JSON.stringify(p)],{type:'application/octet-stream'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='HANE-'+iso()+'.hane';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}

async function changePin(){const o=prompt('Mevcut PIN');if(!o||!(await unlock(o))){alert('PIN yanlış');return}const n=prompt('Yeni 4 haneli PIN');if(!/^\d{4}$/.test(n||'')){alert('PIN 4 haneli olmalı');return}const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(n,salt),box=await encrypt(state,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt),name:state.profile.name,photo:state.profile.photo||''}));key=k;alert('PIN değiştirildi')}
function schedule(){clearTimeout(timer);if(state)timer=setTimeout(lock,Math.max(1,+state.settings.lockMinutes||15)*60000)}function lock(){state=null;key=null;pin='';renderLock()}
function renderSetup(){$('#app').innerHTML=`<div class="setup premiumSetup"><div class="lockLogoWrap">${haneLogo(72)}</div><h1>HANE</h1><p>PREMİUM EV BÜTÇEN</p><form class="form" id="setupForm" style="width:100%"><button type="button" class="btn" id="photoBtn">PROFİL RESMİNİ DEĞİŞTİR</button>${input('name','İsim','')}${input('pin','4 Haneli PIN','','password','inputmode="numeric" maxlength="4"')}${input('pin2','PIN Tekrar','','password','inputmode="numeric" maxlength="4"')}<button class="btn gold">HANE’yi Kur</button></form><div class="notice" style="margin-top:12px;width:100%">İlk kurulumda tüm tutarlar ₺0 başlar.</div></div>`;$('#photoBtn').onclick=()=>$('#profileInput').click();$('#setupForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries());if(!/^\d{4}$/.test(d.pin)||d.pin!==d.pin2){alert('PIN 4 haneli ve aynı olmalı');return}const st=def();st.profile.name=upper(d.name||'HANE');st.profile.photo=setupPhoto;await setup(d.pin,st);render();schedule()}}
function renderLock(){if(!meta()){renderSetup();return}pin='';const m=meta()||{};$('#app').innerHTML=`<div class="lock premiumHaneLock"><div class="exactV5Lock">${haneFullLogo("lockV5Logo")}</div><div class="lockWelcome">HANE'YE HOŞ GELDİN</div><div class="lockAvatar ava">${m.photo?`<img src="${m.photo}">`:esc((m.name||'H')[0])}</div><h2>${esc(m.name||'HANE')}</h2><div class="pinDots">${[0,1,2,3].map(i=>`<i data-dot="${i}"></i>`).join('')}</div><div class="keypad premiumKeypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-key="${n}">${n}</button>`).join('')}<button type="button" class="blankKey" disabled>◎</button><button type="button" data-key="0">0</button><button type="button" class="del" data-key="del">⌫</button></div><button type="button" class="lockOk" id="lockOk">✓ TAMAM</button></div>`;$$('[data-key]').forEach(b=>b.onclick=()=>pinKey(b.dataset.key));$('#lockOk').onclick=confirmPin}
async function pinKey(k){if(k==='del')pin=pin.slice(0,-1);else if(/^\d$/.test(String(k))&&pin.length<4)pin+=String(k);$$('[data-dot]').forEach((d,i)=>d.classList.toggle('on',i<pin.length))}
async function confirmPin(){if(pin.length!==4){alert('4 HANELİ PIN GİR');return}if(await unlock(pin)){pin='';render();schedule();return}pin='';$$('[data-dot]').forEach(d=>d.classList.remove('on'));alert('PIN YANLIŞ')}
function modalWrap(){return modal?`<div class="modal"><div class="sheet"><div class="sheetHead"><b>${modal.title}</b><button class="close" data-action="close">×</button></div>${modal.body}</div></div>`:''}
function render(){if(state)initBrowserNav();applyTheme();$('#app').innerHTML=`<main class="phone">${buildTopBar()}<div class="content">${view()}</div>${nav()}</main>${modalWrap()}`;bind();if(current==='reports')requestAnimationFrame(drawChart)}



function bootHane(){
  try{
    const profileInput=document.getElementById('profileInput');
    const receiptInput=document.getElementById('receiptInput');
    const restoreInput=document.getElementById('restoreInput');
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
        readImg(f,x=>{modal.attachment=x;render()},1280);
      });
    }
    if(restoreInput){
      restoreInput.addEventListener('change',async e=>{
        const input=e.currentTarget;
        const f=input.files&&input.files[0];
        if(!f)return;
        try{
          // iPhone, .hane dosyasını farklı MIME türleriyle gösterebilir.
          // Bu yüzden uzantı/MIME yerine dosyanın içeriğini doğruluyoruz.
          const raw=await f.text();
          let p;
          try{p=JSON.parse(raw)}
          catch{throw new Error('DOSYA OKUNAMADI')}

          if(!p||typeof p!=='object')throw new Error('YEDEK İÇERİĞİ GEÇERSİZ');
          if(p.format!=='HANE-LOCKED-BACKUP')throw new Error('BU DOSYA HANE YEDEĞİ DEĞİL');
          if(!p.meta||!p.data)throw new Error('YEDEK EKSİK VEYA BOZUK');
          if(!p.meta.salt||!p.data.iv||!p.data.data)throw new Error('ŞİFRELİ YEDEK VERİSİ EKSİK');

          localStorage.setItem(META,JSON.stringify(p.meta));
          localStorage.setItem(DATA,JSON.stringify(p.data));
          input.value='';

          alert('YEDEK GERİ YÜKLENDİ. HANE YENİDEN AÇILACAK.');
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
    if(app) app.innerHTML='<div style="min-height:100vh;background:#000;color:#fff;padding:32px;font-family:sans-serif"><h2 style="color:#d8ad4f">HANE başlatılamadı</h2><p>'+String(err.message||err)+'</p><button onclick="location.reload()" style="padding:12px 16px">Tekrar Dene</button></div>';
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootHane,{once:true});
else bootHane();
