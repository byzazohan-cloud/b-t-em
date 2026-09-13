'use strict';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const META='HANE_LOCKED_META_V1',DATA='HANE_LOCKED_DATA_V1';
const enc=new TextEncoder(),dec=new TextDecoder();let state=null,key=null,current='home',modal=null,pin='',timer=null,setupPhoto='',themeDraft=null,reportPeriod='month',txFilter='all';
const Q=['Bugün küçük adımlar, yarın büyük rahatlık getirir.','Disiplin, özgürlüğün kapısını açar.','Küçük birikimler büyük huzur getirir.','Planlı para, güçlü yarınlar demektir.'];
const C=['Kira','Aidat','Market','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu','Ulaşım','Sağlık','Eğlence','Diğer'];
const FIXED_C=['Kira','Aidat','Faturalar','İnternet','Elektrik','Su','Doğalgaz','Cep Telefonu'];
const I={Kira:'⌂',Aidat:'▦',Market:'🛒',Faturalar:'▣',İnternet:'◉',Elektrik:'⚡',Su:'💧',Doğalgaz:'🔥','Cep Telefonu':'▯',Ulaşım:'◆',Sağlık:'✚',Eğlence:'♪',Diğer:'●'};
const id=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),iso=(d=new Date())=>d.toISOString().slice(0,10),ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(+n||0),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const upper=v=>String(v??'').toLocaleUpperCase('tr-TR');
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
async function setup(p,st){const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(p,salt),box=await encrypt(st,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt),name:st.profile.name,photo:st.profile.photo||''}));key=k;state=st}
async function unlock(p){const m=meta();if(!m)return false;try{
  const k=await derive(p,ub64(m.salt)),st=await decrypt(JSON.parse(localStorage.getItem(DATA)),k);
  st.cardPayments=Array.isArray(st.cardPayments)?st.cardPayments:[];
  st.cardTransactions=Array.isArray(st.cardTransactions)?st.cardTransactions:[];
  key=k;state=st;applyTheme();return true
}catch{return false}}
function def(){return{version:1,selectedMonth:ym(new Date()),profile:{name:'',photo:'',motto:'Disiplin, özgürlüğün kapısını açar.'},settings:{lockMinutes:15,leadDays:3,notifications:false},theme:{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'},incomes:[],expenses:[],cards:[],cardTransactions:[],cardPayments:[]}}
function applyTheme(){if(!state)return;const t=state.theme||{};document.documentElement.style.setProperty('--bg',t.bg||'#000');document.documentElement.style.setProperty('--gold',t.accent||'#d8ad4f');document.documentElement.style.setProperty('--gold2',t.accent||'#f0cd77');document.documentElement.style.setProperty('--gi',t.income||'#248ef5');document.documentElement.style.setProperty('--ge',t.expense||'#ff4658');document.documentElement.style.setProperty('--gr',t.remain||'#16d77d')}
function totals(m=state.selectedMonth){const i=state.incomes.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0),e=state.expenses.filter(x=>x.date.startsWith(m)).reduce((s,x)=>s+(+x.amount||0),0);return{i,e,r:i-e}}
function cashFlow(m=state.selectedMonth){
  const spent=state.expenses.filter(x=>x.date.startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0);
  const directPaid=state.expenses.filter(x=>x.date.startsWith(m)&&x.source!=='card'&&x.paid===true).reduce((a,x)=>a+(+x.amount||0),0);
  const cardPaid=(state.cardPayments||[]).filter(x=>x.date.startsWith(m)).reduce((a,x)=>a+(+x.amount||0),0);
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
function buildTopBar(){if(current==='home')return`<div class="top homeTop"><div class="topSpacer"></div><div class="brand">HANE</div><button class="ib" data-tab="profile">⚙</button></div>`;const t={transactions:'Hareketler',fixed:'Sabit Giderler',cards:'Kredi Kartlarım',reports:'Raporlar',profile:'Profil Ayarları',backup:'Yedekleme',settings:'Uygulama Ayarları',theme:'Tema Stüdyosu',alerts:'Bildirimler',about:'Hakkında'};return`<div class="top"><button class="back" data-action="back">‹</button><div class="brand">${t[current]||'HANE'}</div><div style="width:38px"></div></div>`}
function nav(){return`<nav class="nav">${[['home','⌂','Ana Ekran'],['transactions','▤','Hareketler'],['fixed','▥','Giderler'],['cards','▭','Kartlar'],['profile','⚙','Ayarlar']].map(x=>`<button data-tab="${x[0]}" class="${current===x[0]?'active':''}"><span>${x[1]}</span><span>${x[2]}</span></button>`).join('')}</nav>`}
function home(){const T=totals(),F=cashFlow(),s=Math.max(1,Math.abs(T.i)+Math.abs(T.e)+Math.max(0,T.r)),p1=T.i/s*100,p2=p1+T.e/s*100,r=rec(),q=Q[Math.floor(new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()).getTime()/86400000)%Q.length];return`<div class="homeHero">
  <div class="homeHeroAvatar ava">${state.profile.photo?`<img src="${state.profile.photo}">`:esc((state.profile.name||'H')[0])}</div>
  <div class="homeHeroText">
    <small>MERHABA</small>
    <h2>${esc(state.profile.name||'HANE')}</h2>
    <div class="date">${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'})}</div>
  </div>
  <button class="ib homeHeroBell" data-tab="alerts">🔔</button>
</div><div class="quote"><b>Bugünün Sözü</b><span>“${q}”</span></div><div class="summary"><div class="sum"><label>Gelir</label><strong style="color:var(--green)">${money(T.i)}</strong></div><div class="sum"><label>Gider</label><strong style="color:var(--red)">${money(T.e)}</strong></div><div class="sum"><label>Kalan</label><strong style="color:var(--gold2)">${money(T.r)}</strong></div></div><div class="card donutBox" data-tab="reports"><div class="donut" style="--p1:${p1}%;--p2:${p2}%"><div class="donutC"><small>Kalan</small><b>${money(T.r)}</b></div></div><div class="legend"><div><i class="dot" style="background:var(--gi)"></i><span>Gelir</span><b>${money(T.i)}</b></div><div><i class="dot" style="background:var(--ge)"></i><span>Gider</span><b>${money(T.e)}</b></div><div><i class="dot" style="background:var(--gr)"></i><span>Kalan</span><b>${money(T.r)}</b></div></div></div><div class="section"><b>Bu Ay</b><span data-action="cashDetails">Ayrıntılar ›</span></div><div class="card cashCard"><div class="cashRow"><div><small>🏠 BU AY HARCANAN</small><b>${money(F.spent)}</b><span>Evin gerçek ${state.selectedMonth} harcamaları</span></div></div><div class="cashDivider"></div><div class="cashRow"><div><small>💳 BU AY ÖDENEN</small><b>${money(F.paid)}</b><span>Bu ay hesabından çıkan para</span></div><div class="cashSplit"><span>Kart ödemeleri <b>${money(F.cardPaid)}</b></span><span>Nakit / ödenen giderler <b>${money(F.directPaid)}</b></span></div></div></div><div class="section"><b>Sana Özel Önerilen Kart</b><span data-action="goCards">Tümünü Gör ›</span></div>${r?`<div class="reco"><div class="recoHead"><span>Önerilen Kart</span><span>ⓘ</span></div><div class="recoGrid"><div class="miniCard ${r.style||'blackgold'}" data-action="editCard" data-id="${r.id}"><div class="bank">${esc(r.bank)}</div><div class="sub">${esc(r.name)} · ${esc(r.network||'VISA')}</div><div class="num">•••• •••• •••• ${esc(r.last4)}</div></div><div class="recoInfo"><div>Hesap Kesim<br><b>Ayın ${r.statementDay}'si</b></div><div>Ödeme Tarihi<br><b>${r.dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div><div>Kesim → Ödeme<br><b>${r.paymentWindowDays} Gün</b></div><button class="btn gold">Bu Kartı Kullan</button></div></div></div>`:`<div class="notice">Henüz kredi kartı eklenmedi.</div>`}<div class="section"><b>Hızlı İşlemler</b><span></span></div><div class="card quick"><button data-action="addIncome"><i>＋</i>Gelir Ekle</button><button data-action="addExpense"><i>−</i>Gider Ekle</button><button data-action="addCard"><i>▭</i>Kart Ekle</button><button data-tab="reports"><i>▥</i>Raporlar</button></div>`}
function row(x){
  if(x.type==='cardPayment')return`<div class="item" data-action="editCardPayment" data-id="${x.id}"><div class="ico">▭</div><div><b>Kredi Kartı Ödemesi</b><small>${x.date} · Borç kapatma · Gidere dahil değil</small></div><div class="right"><b style="color:var(--gold2)">${money(x.amount)}</b></div></div>`;
  return`<div class="item" data-action="${x.type==='income'?'editIncome':'editExpense'}" data-id="${x.id}"><div class="ico">${x.type==='income'?'₺':I[x.category]||'●'}</div><div><b>${esc(x.title)}</b><small>${x.date}${x.recurring?' · Sabit':''}${x.source==='card'?' · Kart harcaması':''}</small></div><div class="right"><b style="color:${x.type==='income'?'var(--green)':'var(--red)'}">${x.type==='income'?'+':'-'}${money(x.amount)}</b></div></div>`
}
function transactions(){
  let a=[...state.incomes.map(x=>({...x,type:'income'})),...state.expenses.map(x=>({...x,type:'expense'})),...(state.cardPayments||[]).map(x=>({...x,type:'cardPayment'}))].filter(x=>x.date.startsWith(state.selectedMonth));
  if(txFilter==='income')a=a.filter(x=>x.type==='income');
  else if(txFilter==='expense')a=a.filter(x=>x.type==='expense'&&x.source!=='card');
  else if(txFilter==='card')a=a.filter(x=>x.type==='cardPayment'||(x.type==='expense'&&x.source==='card'));
  a.sort((a,b)=>b.date.localeCompare(a.date));
  const B=(k,l)=>`<button data-action="txFilter" data-filter="${k}" class="${txFilter===k?'active':''}">${l}</button>`;
  return`<div class="seg">${B('all','Tümü')}${B('income','Gelir')}${B('expense','Gider')}${B('card','Kart')}</div><div class="section"><b>${state.selectedMonth}</b><span></span></div><div class="list">${a.length?a.map(row).join(''):'<div class="notice">Bu filtrede hareket yok.</div>'}</div>`
}
function fixed(){const a=state.expenses.filter(x=>x.recurring);return`<div class="section"><b>Sabit Giderler</b><button class="miniAddBtn" data-action="addFixedExpense">+ Gider Ekle</button></div><div class="list">${a.length?a.map(x=>`<div class="item" data-action="editFixedExpense" data-id="${x.id}"><div class="ico">${I[x.category]||'●'}</div><div><b>${esc(x.title)}</b><small>${x.dueDate||x.date} · Sabit</small></div><div class="right"><b style="color:var(--red)">-${money(x.amount)}</b></div></div>`).join(''):'<div class="notice">Kira, aidat, internet, elektrik, su, doğalgaz ve cep telefonu giderlerini buradan ekleyebilirsin.</div>'}</div>`}
function cards(){return`<div class="section"><b>Kredi Kartlarım</b><button class="miniAddBtn" data-action="addCard">+ Kart Ekle</button></div>${state.cards.map(credit).join('')||'<div class="notice">Henüz kredi kartı eklenmedi.</div>'}`}
function credit(c){
  const tx=(state.cardTransactions||[]).filter(x=>x.cardId===c.id).sort((a,b)=>b.date.localeCompare(a.date));
  const openStmt=tx.filter(x=>x.statementMonth===ym(new Date())).reduce((a,x)=>a+(+x.amount||0),0);
  return`<div class="credit card ${c.style||'blackgold'}" data-action="editCard" data-id="${c.id}"><div class="network">${esc(c.network||'VISA')}</div><b>${esc(c.bank)}</b><small>${esc(c.name)}</small><div class="digits">•••• •••• •••• ${esc(c.last4)}</div><div class="grid"><div><small>Limit</small><b>${money(c.limit)}</b></div><div><small>Güncel Borç</small><b style="color:var(--red)">${money(c.balance)}</b></div><div><small>Hesap Kesim</small><b>${cardPaymentInfo(c).statementDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div><div><small>Son Ödeme</small><b>${cardPaymentInfo(c).dueDate.toLocaleDateString('tr-TR',{day:'numeric',month:'short'})}</b></div></div><div class="cardActions"><button class="btn" data-action="cardSpend" data-id="${c.id}">＋ Harcama Ekle</button><button class="btn gold" data-action="cardPay" data-id="${c.id}">₺ Ödeme Yaptım</button></div></div>`
}
function periodRange(){
  const today=new Date();
  if(reportPeriod==='day'){const d=iso(today);return{start:d,end:d,label:'BUGÜN'}}
  if(reportPeriod==='week'){const d=new Date(today),n=(d.getDay()+6)%7,start=new Date(d);start.setDate(d.getDate()-n);const end=new Date(start);end.setDate(start.getDate()+6);return{start:iso(start),end:iso(end),label:'BU HAFTA'}}
  if(reportPeriod==='year'){const y=state.selectedMonth.slice(0,4);return{start:y+'-01-01',end:y+'-12-31',label:y}}
  const [y,m]=state.selectedMonth.split('-').map(Number),last=new Date(y,m,0).getDate();return{start:state.selectedMonth+'-01',end:state.selectedMonth+'-'+String(last).padStart(2,'0'),label:state.selectedMonth}
}
function periodTotals(){const r=periodRange(),inside=x=>x.date>=r.start&&x.date<=r.end,i=state.incomes.filter(inside).reduce((a,x)=>a+(+x.amount||0),0),e=state.expenses.filter(inside).reduce((a,x)=>a+(+x.amount||0),0);return{i,e,r:i-e,range:r}}
function reports(){const T=periodTotals(),B=(k,l)=>`<button data-action="reportPeriod" data-period="${k}" class="${reportPeriod===k?'active':''}">${l}</button>`;return`<div class="seg">${B('day','Gün')}${B('week','Hafta')}${B('month','Ay')}${B('year','Yıl')}</div><div class="section"><b>${T.range.label}</b><span></span></div><div class="summary"><div class="sum"><label>Toplam Gelir</label><strong style="color:var(--green)">${money(T.i)}</strong></div><div class="sum"><label>Toplam Gider</label><strong style="color:var(--red)">${money(T.e)}</strong></div><div class="sum"><label>Kalan</label><strong>${money(T.r)}</strong></div></div><div class="card" style="padding:14px;margin-top:10px">
  <canvas id="chart" style="width:100%;height:220px"></canvas>
  <div class="chartLegend">
    <span><i style="background:var(--gi)"></i>GELİR</span>
    <span><i style="background:var(--ge)"></i>GİDER</span>
    <span><i style="background:var(--gr)"></i>KALAN</span>
  </div>
</div>`}
function profile(){return`<div class="profile card">
  <div class="ava profileAvatarLarge">${state.profile.photo?`<img src="${state.profile.photo}">`:esc((state.profile.name||'H')[0])}</div>
  <h2>${esc(state.profile.name||'HANE')}</h2>
  <small>${esc(state.profile.motto||'')}</small>
  <button class="btn profileEditBtn" data-action="editProfile">PROFİLİ DÜZENLE</button>
</div>
<div class="card" style="margin-top:12px">
  <div class="setting" data-action="editProfile"><span>●</span><span>Profil Resmi ve İsim</span><b>›</b></div>
  <div class="setting" data-action="changePin"><span>🔒</span><span>PIN Değiştir</span><b>›</b></div>
  <div class="setting"><span>⏱</span><span>Otomatik Kilit</span><b>${state.settings.lockMinutes} Dakika</b></div>
  <div class="setting" data-action="openTheme"><span>🎨</span><span>Tema Stüdyosu</span><b>›</b></div>
  <div class="setting" data-tab="backup"><span>☁</span><span>Yedekleme</span><b>›</b></div>
  <div class="setting" data-tab="settings"><span>⚙</span><span>Uygulama Ayarları</span><b>›</b></div>
</div>`}
function backup(){return`<div class="card" style="padding:15px"><div class="section"><b>Yedek Oluştur</b><span></span></div><div class="notice">Tüm verilerini şifreli .hane dosyası olarak dışa aktar.</div><button class="btn gold" style="width:100%;margin-top:12px" data-action="backupNow">Yedek Oluştur</button></div><div class="card" style="padding:15px;margin-top:12px"><div class="section"><b>Yedekten Geri Yükle</b><span></span></div><button class="btn" style="width:100%" data-action="restoreNow">Yedekten Geri Yükle</button></div>`}
function settings(){return`<div class="card"><div class="setting"><span>🔔</span><span>Bildirimler</span><b>${state.settings.notifications?'Açık':'Kapalı'}</b></div><div class="setting"><span>🌐</span><span>Dil</span><b>Türkçe</b></div><div class="setting" data-tab="about"><span>ⓘ</span><span>Hakkında</span><b>›</b></div><div class="setting" data-action="clearAll"><span>🗑</span><span style="color:var(--red)">Tüm Verileri Sıfırla</span><b></b></div></div>`}
function theme(){
  if(!themeDraft) themeDraft={...(state.theme||{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'})};
  const t=themeDraft;
  return`<div class="section"><b>Tema Stüdyosu</b><span>Kaydetmeden uygulanmaz</span></div><div class="preview" style="background:${t.bg};border-color:${t.accent}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:${t.accent}">Canlı Önizleme</b><small style="color:#aaa">Sadece önizleme</small></div><div class="summary"><div class="sum" style="border-color:${t.accent}55"><label>Gelir</label><strong style="color:${t.income}">₺25.000</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Gider</label><strong style="color:${t.expense}">₺12.550</strong></div><div class="sum" style="border-color:${t.accent}55"><label>Kalan</label><strong style="color:${t.remain}">₺12.450</strong></div></div><div style="height:10px;border-radius:99px;background:linear-gradient(90deg,${t.income} 0 33%,${t.expense} 33% 66%,${t.remain} 66% 100%);margin-top:10px"></div></div><div class="card" style="margin-top:12px"><div class="setting" data-action="pickBg"><span>◼</span><span>Arka Plan Rengi</span><b style="color:${t.bg};text-shadow:0 0 0 #777">■</b></div><div class="setting" data-action="pickAccent"><span>✦</span><span>Detay Rengi</span><b style="color:${t.accent}">■</b></div><div class="setting" data-action="pickIncome"><span>●</span><span>Grafik · Gelir</span><b style="color:${t.income}">■</b></div><div class="setting" data-action="pickExpense"><span>●</span><span>Grafik · Gider</span><b style="color:${t.expense}">■</b></div><div class="setting" data-action="pickRemain"><span>●</span><span>Grafik · Kalan</span><b style="color:${t.remain}">■</b></div></div><div class="section"><b>Hazır Temalar</b><span></span></div><div class="themeGrid">${[['Klasik Siyah','#000000','#d8ad4f'],['Lacivert','#06111f','#4da3ff'],['Koyu Yeşil','#05130d','#41d98c'],['Bordo','#1a080b','#e4a0aa']].map(a=>`<div class="themeCard" data-action="preset" data-bg="${a[1]}" data-accent="${a[2]}"><div class="swatch" style="background:${a[1]};border:1px solid ${a[2]}"></div><b>${a[0]}</b></div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><button class="btn" data-action="resetTheme">Varsayılana Dön</button><button class="btn gold" data-action="saveTheme">Kaydet</button></div><button class="btn" style="width:100%;margin-top:8px" data-action="cancelTheme">İptal</button>`
}
function alerts(){return`<div class="notice">Ödenmemiş giderler ve kart borçları burada görünecek. Ödeme yapıldığında kaydı düzenleyip “Ödendi” olarak işaretleyebilirsin.</div>`}
function about(){return`<div class="profile"><div class="logo">⌂</div><h1 style="color:var(--gold2)">HANE</h1><p>Sürüm 1.0.0</p><p>Premium ev bütçen.<br>Verilerin cihazında şifreli saklanır.</p></div>`}
function view(){return({home,transactions,fixed,cards,reports,profile,backup,settings,theme,alerts,about}[current]||home)()}
function input(n,l,v='',type='text',extra=''){const attrs=type==='text'?'autocapitalize="characters" autocorrect="on" autocomplete="on" spellcheck="true"':'';return`<div class="field"><label>${l}</label><input name="${n}" type="${type}" value="${esc(v)}" ${attrs} ${extra}></div>`}
function select(n,l,opts,v=''){return`<div class="field"><label>${l}</label><select name="${n}">${opts.map(o=>`<option ${o===v?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}
function incomeForm(x={}){return`<form class="form" id="incomeForm">${input('title','Gelir Adı',x.title||'')}${input('amount','Tutar',x.amount||0,'number')}${input('date','Tarih',x.date||iso(),'date')}<div class="field"><label>Sabit Gelir</label><select name="recurring"><option value="false" ${!x.recurring?'selected':''}>Hayır</option><option value="true" ${x.recurring?'selected':''}>Evet</option></select></div><button class="btn gold" type="submit">Kaydet</button>${x.id?`<button type="button" class="btn" data-action="delIncome" data-id="${x.id}">Sil</button>`:''}</form>`}
function expenseForm(x={}){
  const isFixed=!!x.recurring;
  const currentCat=x.category||(isFixed?'Kira':'Market');
  const normalCats=C.filter(c=>!FIXED_C.includes(c)||c==='Faturalar');
  return`<form class="form" id="expenseForm">
    <div class="field">
      <label>Gider Türü</label>
      <select name="expenseType" id="expenseType">
        <option value="normal" ${!isFixed?'selected':''}>Normal Gider</option>
        <option value="fixed" ${isFixed?'selected':''}>Sabit Gider</option>
      </select>
    </div>

    ${input('title','Açıklama',x.title||'')}
    ${input('amount','Tutar',x.amount||0,'number','step="0.01" min="0"')}

    <div class="field" id="normalCategoryWrap" style="${isFixed?'display:none':''}">
      <label>Kategori</label>
      <select name="normalCategory">
        ${normalCats.map(o=>`<option ${o===currentCat?'selected':''}>${esc(o)}</option>`).join('')}
      </select>
    </div>

    <div class="field" id="fixedCategoryWrap" style="${isFixed?'':'display:none'}">
      <label>Sabit Gider Kategorisi</label>
      <select name="fixedCategory">
        ${FIXED_C.map(o=>`<option ${o===currentCat?'selected':''}>${esc(o)}</option>`).join('')}
      </select>
    </div>

    <div id="normalDateWrap" style="${isFixed?'display:none':''}">
      ${input('date','Harcama Tarihi',x.date||iso(),'date')}
    </div>

    <div id="fixedDueWrap" style="${isFixed?'':'display:none'}">
      ${input('dueDate','Son Ödeme Tarihi',x.dueDate||x.date||iso(),'date')}
    </div>

    <div class="notice" id="expenseHelp">
      ${isFixed?'AYNI KATEGORİDEN BİRDEN FAZLA SABİT GİDER EKLEYEBİLİRSİN. ÖRN: CEP TELEFONU · HAT 1 / HAT 2 / HAT 3 / HAT 4.':'NORMAL GİDERDE SADECE HARCAMA TARİHİ KULLANILIR.'}
    </div>

    <button type="button" class="btn" data-action="attachReceipt">📷 FİŞ / FOTOĞRAF</button>
    <button class="btn gold" type="submit">KAYDET</button>
    ${x.id?`<button type="button" class="btn" data-action="delExpense" data-id="${x.id}">SİL</button>`:''}
  </form>`
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
function profileForm(){return`<form class="form" id="profileForm"><button type="button" class="btn" data-action="pickProfile">Profil Resmi Seç</button>${input('name','İsim',state.profile.name)}<div class="field"><label>Motto</label><textarea name="motto" autocapitalize="characters" autocorrect="on" autocomplete="on" spellcheck="true">${esc(state.profile.motto||'')}</textarea></div>${input('lockMinutes','Otomatik Kilit (dakika)',state.settings.lockMinutes,'number')}<button class="btn gold" type="submit">Kaydet</button></form>`}
function colorForm(k,label){
  if(!themeDraft) themeDraft={...(state.theme||{})};
  return`<div class="field"><label>${label}</label><input id="nativeColor" type="color" value="${themeDraft[k]}" style="height:54px"></div><div class="notice">Bu seçim yalnızca önizlemeyi değiştirir. Tema, Tema Stüdyosu ekranındaki Kaydet düğmesine basınca uygulanır.</div><button class="btn gold" style="width:100%;margin-top:12px" data-action="saveColor" data-kind="${k}">Önizlemeye Uygula</button>`
}
function modalHTML(){return`<div class="modal"><div class="sheet"><div class="sheetHead"><b>${modal.title}</b><button class="close" data-action="close">×</button></div>${modal.body}</div></div>`}
function showToast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
function bind(){
  $$('[data-tab]').forEach(x=>x.onclick=()=>{const next=x.dataset.tab;if(next==='theme')themeDraft={...(state.theme||{})};else if(current==='theme')themeDraft=null;current=next;modal=null;render()});
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
async function act(a,el){if(a==='back'){if(current==='theme')themeDraft=null;current='home';render()}else if(a==='txFilter'){txFilter=el.dataset.filter||'all';render()}else if(a==='goCards'){current='cards';modal=null;render()}else if(a==='reportPeriod'){reportPeriod=el.dataset.period||'month';render()}else if(a==='openTheme'){themeDraft={...(state.theme||{bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'})};current='theme';modal=null;render()}else if(a==='addIncome')open('Gelir Ekle',incomeForm());else if(a==='editIncome'){const x=state.incomes.find(z=>z.id===el.dataset.id);open('Geliri Düzenle',incomeForm(x),{id:x.id})}else if(a==='delIncome'){state.incomes=state.incomes.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='addExpense')open('Gider Ekle',expenseForm());else if(a==='addFixedExpense')open('Gider Ekle',expenseForm({recurring:true,category:'Kira',dueDate:iso()}));else if(a==='editFixedExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='editExpense'){const x=state.expenses.find(z=>z.id===el.dataset.id);open('Gideri Düzenle',expenseForm(x),{id:x.id})}else if(a==='delExpense'){state.expenses=state.expenses.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='addCard')open('Kart Ekle',cardForm());else if(a==='editCard'){const c=state.cards.find(z=>z.id===el.dataset.id);open('Kartı Düzenle',cardForm(c),{id:c.id})}else if(a==='delCard'){state.cards=state.cards.filter(x=>x.id!==el.dataset.id);await save();modal=null;render()}else if(a==='cardSpend'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Kart Harcaması Ekle',cardSpendForm(c),{cardId:c.id})}else if(a==='cardPay'){const c=state.cards.find(x=>x.id===el.dataset.id);open('Ödeme Yaptım',cardPayForm(c),{cardId:c.id})}else if(a==='cashDetails'){const F=cashFlow();open('Bu Ay · Harcanan / Ödenen',`<div class="cashDetail"><div class="notice"><b>Bu Ay Harcanan: ${money(F.spent)}</b><br>Bu ay yaptığın gerçek ev harcamalarıdır.</div><div class="notice" style="margin-top:8px"><b>Bu Ay Ödenen: ${money(F.paid)}</b><br>Kart ödemeleri ${money(F.cardPaid)} + nakit/ödenmiş giderler ${money(F.directPaid)}.</div><div class="notice" style="margin-top:8px">Kart ödemeleri yeniden gider sayılmaz. Önceki aylardan gelen kart borcu ödesen bile sadece “Bu Ay Ödenen” bölümünde görünür.</div></div>`)}else if(a==='editProfile')open('Profili Düzenle',profileForm());else if(a==='pickProfile')$('#profileInput').click();else if(a==='receipt')$('#receiptInput').click();else if(a==='close'){modal=null;render()}else if(a==='pickBg')open('Arka Plan Rengi',colorForm('bg','Arka Plan Rengi'));else if(a==='pickAccent')open('Detay Rengi',colorForm('accent','Detay Rengi'));else if(a==='pickIncome')open('Grafik Gelir',colorForm('income','Gelir Rengi'));else if(a==='pickExpense')open('Grafik Gider',colorForm('expense','Gider Rengi'));else if(a==='pickRemain')open('Grafik Kalan',colorForm('remain','Kalan Rengi'));else if(a==='saveColor'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft[el.dataset.kind]=$('#nativeColor').value;modal=null;render()}else if(a==='preset'){if(!themeDraft)themeDraft={...(state.theme||{})};themeDraft.bg=el.dataset.bg;themeDraft.accent=el.dataset.accent;render()}else if(a==='resetTheme'){themeDraft={bg:'#000000',accent:'#d8ad4f',income:'#248ef5',expense:'#ff4658',remain:'#16d77d'};render()}else if(a==='saveTheme'){state.theme={...themeDraft};await save();themeDraft=null;applyTheme();current='profile';render();alert('Tema kaydedildi.')}else if(a==='cancelTheme'){themeDraft=null;current='profile';render()}else if(a==='backupNow')backupNow();else if(a==='restoreNow')$('#restoreInput').click();else if(a==='changePin')changePin();else if(a==='clearAll'){if(confirm('Tüm HANE verileri silinsin mi?')){localStorage.removeItem(META);localStorage.removeItem(DATA);location.reload()}}}
async function saveIncome(d,i){const amount=Number(String(d.amount||'0').replace(',','.'));if(!Number.isFinite(amount)||amount<0)throw new Error('Tutar geçersiz');const x={id:i||id(),title:upper((d.title||'GELİR').trim()||'GELİR'),amount,date:d.date||iso(),recurring:d.recurring==='true'};if(i){const n=state.incomes.findIndex(z=>z.id===i);state.incomes[n]={...state.incomes[n],...x}}else state.incomes.push(x);await save();modal=null;render()}
async function saveExpense(d,i){
  const amount=Number(String(d.amount||'0').replace(',','.'));
  if(!Number.isFinite(amount)||amount<0)throw new Error('TUTAR GEÇERSİZ');

  const fixed=d.expenseType==='fixed';
  const x={
    id:i||id(),
    title:upper((d.title||(fixed?'SABİT GİDER':'GİDER')).trim()||(fixed?'SABİT GİDER':'GİDER')),
    amount,
    category:fixed?(d.fixedCategory||'Kira'):(d.normalCategory||'Diğer'),
    date:fixed?(d.dueDate||iso()):(d.date||iso()),
    dueDate:fixed?(d.dueDate||iso()):null,
    recurring:fixed,
    paid:fixed?false:true
  };

  if(i){
    const n=state.expenses.findIndex(z=>z.id===i);
    state.expenses[n]={...state.expenses[n],...x}
  }else state.expenses.push(x);

  await save();modal=null;render()
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
function readImg(f,cb,max=420){const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height,s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);cb(c.toDataURL('image/jpeg',.78))};img.src=r.result};r.readAsDataURL(f)}

async function backupNow(){const p={format:'HANE-LOCKED-BACKUP',meta:meta(),data:JSON.parse(localStorage.getItem(DATA)),date:new Date().toISOString()},b=new Blob([JSON.stringify(p)],{type:'application/octet-stream'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='HANE-'+iso()+'.hane';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}

async function changePin(){const o=prompt('Mevcut PIN');if(!o||!(await unlock(o))){alert('PIN yanlış');return}const n=prompt('Yeni 4 haneli PIN');if(!/^\d{4}$/.test(n||'')){alert('PIN 4 haneli olmalı');return}const salt=crypto.getRandomValues(new Uint8Array(16)),k=await derive(n,salt),box=await encrypt(state,k);localStorage.setItem(DATA,JSON.stringify(box));localStorage.setItem(META,JSON.stringify({salt:b64(salt),name:state.profile.name,photo:state.profile.photo||''}));key=k;alert('PIN değiştirildi')}
function schedule(){clearTimeout(timer);if(state)timer=setTimeout(lock,Math.max(1,+state.settings.lockMinutes||15)*60000)}function lock(){state=null;key=null;pin='';renderLock()}
function renderSetup(){$('#app').innerHTML=`<div class="setup"><div class="logo">⌂</div><h1>HANE</h1><p>Premium ev bütçen</p><form class="form" id="setupForm" style="width:100%"><button type="button" class="btn" id="photoBtn">Profil Resmi Seç</button>${input('name','İsim','')}${input('pin','4 Haneli PIN','','password','inputmode="numeric" maxlength="4"')}${input('pin2','PIN Tekrar','','password','inputmode="numeric" maxlength="4"')}<button class="btn gold">HANE’yi Kur</button></form><div class="notice" style="margin-top:12px;width:100%">İlk kurulumda tüm tutarlar ₺0 başlar.</div></div>`;$('#photoBtn').onclick=()=>$('#profileInput').click();$('#setupForm').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target).entries());if(!/^\d{4}$/.test(d.pin)||d.pin!==d.pin2){alert('PIN 4 haneli ve aynı olmalı');return}const st=def();st.profile.name=upper(d.name||'HANE');st.profile.photo=setupPhoto;await setup(d.pin,st);render();schedule()}}
function renderLock(){if(!meta()){renderSetup();return}$('#app').innerHTML=`<div class="lock"><div class="logo">⌂</div><h1>HANE</h1><p>Hoş Geldin</p><div class="pinDots">${[0,1,2,3].map(i=>`<i data-dot="${i}"></i>`).join('')}</div><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-key="${n}">${n}</button>`).join('')}<button class="zero" data-key="0">0</button><button class="del" data-key="del">⌫</button></div></div>`;$$('[data-key]').forEach(b=>b.onclick=()=>pinKey(b.dataset.key))}
async function pinKey(k){if(k==='del')pin=pin.slice(0,-1);else if(pin.length<4)pin+=k;$$('[data-dot]').forEach((d,i)=>d.classList.toggle('on',i<pin.length));if(pin.length===4){if(await unlock(pin)){render();schedule();return}pin='';$$('[data-dot]').forEach(d=>d.classList.remove('on'));alert('PIN yanlış')}}
function modalWrap(){return modal?`<div class="modal"><div class="sheet"><div class="sheetHead"><b>${modal.title}</b><button class="close" data-action="close">×</button></div>${modal.body}</div></div>`:''}
function render(){applyTheme();$('#app').innerHTML=`<main class="phone">${buildTopBar()}<div class="content">${view()}</div>${nav()}</main>${modalWrap()}`;bind();if(current==='reports')requestAnimationFrame(drawChart)}



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
        if(state) readImg(f,async x=>{
          state.profile.photo=x;
          const m=meta()||{};m.photo=x;localStorage.setItem(META,JSON.stringify(m));
          try{await save();render()}catch(err){alert('Profil resmi kaydedilemedi: '+(err.message||err))}
        },420);
        else readImg(f,x=>setupPhoto=x,420);
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
        const f=e.target.files&&e.target.files[0];if(!f)return;
        try{
          const p=JSON.parse(await f.text());
          if(p.format!=='HANE-LOCKED-BACKUP')throw new Error('Format geçersiz');
          localStorage.setItem(META,JSON.stringify(p.meta));
          localStorage.setItem(DATA,JSON.stringify(p.data));
          location.reload();
        }catch(err){alert('Yedek geçersiz: '+(err.message||err))}
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
