const META_KEY='butcem-secure-meta-v1';
const DATA_KEY='butcem-secure-data-v1';
const LEGACY_KEY='butcem-data';
const PBKDF2_ITERATIONS=310000;

const DEFAULT={
  profile:{name:'Mehmet',lockMinutes:15},
  incomes:[{id:1,name:'Emekli Maaşı',amount:25000,day:20,fixed:true},{id:2,name:'Ek Gelir',amount:10000,day:5,fixed:true},{id:3,name:'Kira Geliri',amount:8000,day:11,fixed:true},{id:4,name:'Diğer Gelir',amount:2000,date:'2026-09-12',fixed:false}],
  expenses:[
    {id:11,name:'Kira',amount:15000,day:1,fixed:true,paid:false,icon:'🏠'},
    {id:12,name:'Aidat',amount:1200,day:5,fixed:true,paid:false,icon:'🏢'},
    {id:13,name:'İnternet',amount:450,day:10,fixed:true,paid:false,icon:'📶'},
    {id:14,name:'Elektrik',amount:1240,day:12,fixed:true,paid:false,icon:'⚡'},
    {id:15,name:'Su',amount:350,day:15,fixed:true,paid:false,icon:'💧'},
    {id:16,name:'Doğalgaz',amount:980,day:18,fixed:true,paid:false,icon:'🔥'},
    {id:17,name:'Cep Telefonu',amount:600,day:20,fixed:true,paid:false,icon:'📱'}
  ],
  cards:[
    {id:21,bank:'Ziraat Bankası',name:'Bankkart',last4:'1234',limit:60000,used:24500,cut:10,due:20,color:'red'},
    {id:22,bank:'İş Bankası',name:'Maximum',last4:'4582',limit:50000,used:18200,cut:15,due:25,color:'purple'},
    {id:23,bank:'Garanti BBVA',name:'Bonus',last4:'7789',limit:40000,used:10000,cut:8,due:18,color:'green'}
  ],
  transactions:[],
  settings:{notifications:true,theme:'dark'}
};

let state=null, sessionKey=null, screen='login', modal=null, history=[];
let lastActivity=Date.now(), secureMeta=readJSON(META_KEY), legacyState=readJSON(LEGACY_KEY);
const enc=new TextEncoder(), dec=new TextDecoder();

function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function cloneDefault(){return JSON.parse(JSON.stringify(DEFAULT))}
function b64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
function unb64(s){const raw=atob(s), out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
function randomBytes(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return a}

async function deriveKey(pin,salt,iterations=PBKDF2_ITERATIONS){
  const material=await crypto.subtle.importKey('raw',enc.encode(String(pin)),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptState(data,key){
  const iv=randomBytes(12);
  const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(data)));
  return {v:1,iv:b64(iv),ciphertext:b64(new Uint8Array(cipher))};
}
async function decryptState(blob,key){
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(blob.iv)},key,unb64(blob.ciphertext));
  return JSON.parse(dec.decode(plain));
}
async function save(){
  if(!state||!sessionKey) return;
  const blob=await encryptState(state,sessionKey);
  localStorage.setItem(DATA_KEY,JSON.stringify(blob));
  if(secureMeta){secureMeta.displayName=state.profile?.name||'Kullanıcı';localStorage.setItem(META_KEY,JSON.stringify(secureMeta));}
}
async function createSecureStore(data,pin,{forcePinChange=false}={}){
  const salt=randomBytes(16);
  const key=await deriveKey(pin,salt);
  const clean=JSON.parse(JSON.stringify(data));
  if(clean.profile){delete clean.profile.pin;delete clean.profile.pinHash;}
  secureMeta={v:1,kdf:'PBKDF2-SHA256',iterations:PBKDF2_ITERATIONS,salt:b64(salt),displayName:clean.profile?.name||'Kullanıcı',forcePinChange};
  localStorage.setItem(META_KEY,JSON.stringify(secureMeta));
  localStorage.setItem(DATA_KEY,JSON.stringify(await encryptState(clean,key)));
  sessionKey=key;state=clean;localStorage.removeItem(LEGACY_KEY);legacyState=null;
}
async function ensureFreshStore(){
  // İlk açılışta ağır şifreleme yapma; giriş ekranını hemen göster.
  // Varsayılan mağaza, kullanıcı 1234 ile ilk kez giriş yaptığında oluşturulur.
  return;
}
async function legacyVerify(pin){
  if(!legacyState) return false;
  if(legacyState.profile?.pinHash){
    const digest=await crypto.subtle.digest('SHA-256',enc.encode(String(pin)));
    const hex=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    return hex===legacyState.profile.pinHash;
  }
  return String(pin)===String(legacyState.profile?.pin||'');
}
async function unlock(pin){
  try{
    // İlk kurulum: henüz güvenli mağaza yoksa yalnızca varsayılan 1234 kabul edilir.
    if(!secureMeta && !legacyState){
      if(String(pin)!=='1234') return false;
      await createSecureStore(cloneDefault(),'1234',{forcePinChange:true});
      secureMeta=readJSON(META_KEY);
      return true;
    }
    if(secureMeta){
      const key=await deriveKey(pin,unb64(secureMeta.salt),secureMeta.iterations||PBKDF2_ITERATIONS);
      const blob=readJSON(DATA_KEY); if(!blob) return false;
      state=await decryptState(blob,key);sessionKey=key;
      return true;
    }
    if(await legacyVerify(pin)){
      const migrated={...cloneDefault(),...legacyState,profile:{...cloneDefault().profile,...legacyState.profile}};
      await createSecureStore(migrated,pin,{forcePinChange:String(pin)==='1234'});
      return true;
    }
  }catch{}
  state=null;sessionKey=null;return false;
}
function lockNow(renderLogin=true){
  state=null;sessionKey=null;screen='login';modal=null;history=[];lastActivity=Date.now();
  if(renderLogin) render();
}
function touch(){lastActivity=Date.now()}
function setupSecurityGuards(){
  ['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,touch,{passive:true}));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){document.body.classList.add('privacy');}
    else{document.body.classList.remove('privacy');checkAutoLock();}
  });
  window.addEventListener('pagehide',()=>document.body.classList.add('privacy'));
  setInterval(checkAutoLock,10000);
}
function checkAutoLock(){
  if(!state) return;
  const mins=Math.max(1,Number(state.profile?.lockMinutes||15));
  if(Date.now()-lastActivity>=mins*60000) lockNow(true);
}

const tl=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Number(n)||0);
function sum(a){return a.reduce((s,x)=>s+Number(x.amount||0),0)}
function totals(){const income=sum(state.incomes),expense=sum(state.expenses)+state.cards.reduce((s,c)=>s+Number(c.used||0),0);return {income,expense,remaining:income-expense}}
const quotes=['Küçük adımlar, büyük değişimler yaratır.','Paranı yönetmek, geleceğini yönetmektir.','Bugünün küçük kararları yarının büyük rahatlığını getirir.','Disiplin, hayaller ile sonuç arasındaki köprüdür.'];
function quote(){return quotes[new Date().getDate()%quotes.length]}
function el(tag,cls='',html=''){const x=document.createElement(tag);x.className=cls;x.innerHTML=html;return x}
function app(html){const a=document.querySelector('#app');a.innerHTML='';a.append(html);if(modal)renderModal()}
function notice(msg){const n=el('div','notice',msg);document.body.append(n);setTimeout(()=>n.remove(),2600)}
function nav(active){const n=el('div','nav');[['home','⌂','Ana Sayfa'],['money','◉','Gelir/Gider'],['cards','▣','Kartlar'],['analysis','▥','Analiz'],['profile','●','Profil']].forEach(([s,i,t])=>{const b=el('button',active===s?'active':'',`<i>${i}</i>${t}`);b.onclick=()=>go(s);n.append(b)});return n}
function frame(content,active,opts={}){const p=el('main','phone');p.append(content);if(active)p.append(nav(active));if(opts.fab){const f=el('button','plus-fab','+');f.onclick=opts.fab;p.append(f)}return p}
function go(s){if(!state&&s!=='login')s='login';if(screen!==s)history.push(screen);screen=s;modal=null;render()}
function back(){screen=history.pop()||'home';render()}
function makeTop(title,plus){const t=el('div','topbar');const b=el('button','back','‹');b.onclick=back;t.append(b);t.append(el('div','title',title));const r=el('button','icon-btn',plus?'＋':'');if(plus)r.onclick=plus;t.append(r);return t}
function render(){if(screen!=='login'&&!state)screen='login';({login,home,money,cards,analysis,profile,incomes,expenses,backup}[screen]||login)()}
function previewName(){return secureMeta?.displayName||legacyState?.profile?.name||'Mehmet'}

function login(){
  const name=previewName();const c=el('div','login');
  c.innerHTML=`<div class="lock">♙</div><div class="brand">Bütçem</div><div class="subtitle">Verileriniz cihazınızda şifreli saklanır.</div><div class="avatar">${escapeHtml(name[0]||'M')}</div><h2>${escapeHtml(name)}</h2><div class="field"><input id="pin" class="pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="64" placeholder="••••••••"></div><button class="primary" id="enter">Giriş Yap</button><div class="security-note">🔐 AES‑256 şifreleme • Çevrimdışı veri • Şifreli yedek</div><div class="mountain"></div><small>“${quote()}”</small>`;
  c.querySelector('#enter').onclick=async()=>{
    const pin=c.querySelector('#pin').value;
    if(!pin){notice('Parolanızı girin.');return}
    const ok=await unlock(pin);
    if(ok){screen='home';lastActivity=Date.now();render();if(secureMeta?.forcePinChange)setTimeout(()=>{notice('Güvenlik için varsayılan 1234 parolasını değiştirin.');openSecurity(true)},350)}
    else notice('Parola yanlış veya şifreli veri açılamadı.');
  };
  c.querySelector('#pin').addEventListener('keydown',e=>{if(e.key==='Enter')c.querySelector('#enter').click()});
  app(frame(c));
}
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

function home(){const T=totals(),pct=Math.max(0,Math.min(100,T.income?T.expense/T.income*100:0));const c=el('div');c.innerHTML=`<div class="topbar"><div class="profile-mini"><div class="avatar">${escapeHtml(state.profile.name[0])}</div><div><div class="hello">İyi akşamlar, ${escapeHtml(state.profile.name)}</div><div class="date">${new Date().toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'})}</div></div></div><button class="icon-btn" id="lockBtn">🔒</button></div><div class="quote"><div class="sun">☀️</div><div><strong>Bugünün Sözü</strong><p>“${quote()}”</p></div></div>`;c.querySelector('#lockBtn').onclick=()=>lockNow(true);
  const hw=el('div','hero-chart');const cw=el('div','chart-wrap');cw.innerHTML=`<div class="donut" style="--income:${Math.max(20,100-pct)};--expense:${Math.min(70,pct)}"></div><div class="donut-label"><span>Kalan</span><b>${tl(T.remaining)}</b><span>Bu Ay</span></div>`;cw.onclick=()=>go('analysis');hw.append(cw);c.append(hw);
  c.insertAdjacentHTML('beforeend',`<div class="stats"><div class="stat blue"><div class="label">🔵 Gelir</div><b>${tl(T.income)}</b></div><div class="stat red"><div class="label">🔴 Gider</div><b>${tl(T.expense)}</b></div><div class="stat green"><div class="label">🟢 Kalan</div><b>${tl(T.remaining)}</b></div></div>`);
  const rec=recommendCard();if(rec){const rc=el('div','card recommended',`<div class="bank">Önerilen Kart</div><div class="cardname">${escapeHtml(rec.name)} •••• ${escapeHtml(rec.last4)}</div><div class="chip"></div><div class="small">Hesap kesimine göre bugün kullanmak için avantajlı kart.</div>`);rc.onclick=()=>go('cards');c.append(rc)}
  c.insertAdjacentHTML('beforeend','<div class="section-head"><h3>Yaklaşan Ödemeler</h3><span class="small">Tümünü Gör</span></div>');state.expenses.slice(0,3).forEach(x=>c.append(paymentRow(x)));app(frame(c,'home',{fab:()=>openAddMenu()}))}
function paymentRow(x){const r=el('div','card row');r.innerHTML=`<div class="left"><div class="badge gold">${escapeHtml(x.icon||'₺')}</div><div><div>${escapeHtml(x.name)}</div><div class="amount">${tl(x.amount)}</div></div></div><span class="danger-pill">${x.paid?'Ödendi':Math.max(0,x.day-new Date().getDate())+' gün kaldı'}</span>`;return r}
function recommendCard(){const d=new Date().getDate();return [...state.cards].sort((a,b)=>daysAfterCut(b.cut,d)-daysAfterCut(a.cut,d))[0]||null}
function daysAfterCut(c,d){return d>=c?31-d+c:c-d}
function money(){const c=el('div');c.append(makeTop('Gelir / Gider'));const tabs=el('div','tabs');tabs.innerHTML='<button class="active">Özet</button><button id="inc">Gelir</button><button id="exp">Gider</button>';tabs.querySelector('#inc').onclick=()=>go('incomes');tabs.querySelector('#exp').onclick=()=>go('expenses');c.append(tabs);const T=totals();c.insertAdjacentHTML('beforeend',`<div class="card"><h3>Bu Ay</h3><div class="row"><span>Gelir</span><b class="gold">${tl(T.income)}</b></div><div class="row"><span>Gider</span><b>${tl(T.expense)}</b></div><div class="row"><span>Kalan</span><b>${tl(T.remaining)}</b></div></div>`);app(frame(c,'money',{fab:()=>openAddMenu()}))}
function incomes(){const c=el('div');c.append(makeTop('Gelirler',()=>openIncome()));c.append(el('div','tabs','<button class="active">Tümü</button><button>Sabit Gelir</button><button>Tek Seferlik</button>'));state.incomes.forEach(x=>{const r=el('div','card row',`<div class="left"><div class="badge gold">₺</div><div><b>${escapeHtml(x.name)}</b><div class="amount">${tl(x.amount)}</div><div class="small">${x.fixed?'Her ayın '+x.day+'’i':'Tek Seferlik'}</div></div></div><span class="ok-pill">${x.fixed?'Aktif':'Kayıt'}</span>`);r.onclick=()=>openIncome(x);c.append(r)});const b=el('button','primary','＋ Gelir Ekle');b.style.marginTop='16px';b.onclick=()=>openIncome();c.append(b);app(frame(c,'money'))}
function expenses(){const c=el('div');c.append(makeTop('Giderler',()=>openExpense()));c.append(el('div','tabs','<button class="active">Tümü</button><button>Sabit Gider</button><button>Tek Seferlik</button>'));state.expenses.forEach(x=>{const r=el('div','card row',`<div class="left"><div class="badge blue">${escapeHtml(x.icon||'₺')}</div><div><b>${escapeHtml(x.name)}</b><div class="amount">${tl(x.amount)}</div><div class="small">Her ayın ${x.day}’i</div></div></div><div class="switch"></div>`);r.onclick=()=>openExpense(x);c.append(r)});app(frame(c,'money',{fab:()=>openExpense()}))}
function cards(){const c=el('div');c.append(makeTop('Kredi Kartlarım',()=>openCard()));c.append(el('div','security-note','⚠️ Güvenlik için yalnızca kartın son 4 hanesini kaydedin. CVV ve tam kart numarası girmeyin.'));c.append(el('div','tabs','<button class="active">Tümü</button><button>Aktif</button><button>Pasif</button>'));state.cards.forEach(x=>{const d=el('div',`credit ${x.color}`,`<div class="logo">CARD</div><div class="small">${escapeHtml(x.bank)}</div><div class="big">${escapeHtml(x.name)}</div><div class="number">•••• &nbsp;•••• &nbsp;•••• &nbsp;${escapeHtml(x.last4)}</div><div class="small" style="margin-top:14px">Kullanılabilir Limit</div><b>${tl(x.limit-x.used)} / ${tl(x.limit)}</b><div class="meta"><div>Hesap Kesim<b>${x.cut}. gün</b></div><div>Son Ödeme<b>${x.due}. gün</b></div></div>`);d.onclick=()=>openCard(x);c.append(d)});app(frame(c,'cards',{fab:()=>openCard()}))}
function analysis(){const T=totals();const c=el('div');c.append(makeTop('Gelir - Gider Analizi'));c.append(el('div','tabs','<button>Gün</button><button>Hafta</button><button class="active">Ay</button><button>Yıl</button>'));const hw=el('div','hero-chart');hw.innerHTML=`<div class="chart-wrap"><div class="donut"></div><div class="donut-label"><span>Kalan</span><b>${tl(T.remaining)}</b><span>${Math.round(T.remaining/Math.max(1,T.income)*100)}%</span></div></div>`;c.append(hw);c.insertAdjacentHTML('beforeend',`<div class="stats"><div class="stat blue"><div class="label">Gelir</div><b>${tl(T.income)}</b></div><div class="stat red"><div class="label">Gider</div><b>${tl(T.expense)}</b></div><div class="stat green"><div class="label">Kalan</div><b>${tl(T.remaining)}</b></div></div><div class="section-head"><h3>Kategori Dağılımı</h3></div>`);state.expenses.slice().sort((a,b)=>b.amount-a.amount).slice(0,6).forEach(x=>{const pct=Math.min(100,x.amount/Math.max(1,sum(state.expenses))*100);c.append(el('div','bar',`<div class="bar-name">${escapeHtml(x.name)}</div><div class="track"><div class="fill" style="width:${pct}%"></div></div><b>${tl(x.amount)}</b>`))});app(frame(c,'analysis'))}
function profile(){const c=el('div');c.append(makeTop('Profilim'));c.insertAdjacentHTML('beforeend',`<div class="card row"><div class="left"><div class="avatar">${escapeHtml(state.profile.name[0])}</div><div><b>${escapeHtml(state.profile.name)}</b><div class="small">Kişisel Bütçe</div></div></div><span class="premium-tag">♛ PREMIUM</span></div><div class="security-badge">🔐 Veriler AES‑256 ile şifreleniyor</div><div class="card settings" id="settings"></div>`);const s=c.querySelector('#settings');[['👤','Profil Bilgileri','',()=>openProfile()],['🔐','Güvenlik',`${state.profile.lockMinutes||15} dk sonra kilit`,()=>openSecurity(false)],['🔔','Bildirim Ayarları',state.settings.notifications?'Açık':'Kapalı',()=>toggleNotifications()],['₺','Para Birimi','Türk Lirası (₺)',null],['◐','Tema','Siyah (Premium)',null],['☁','Şifreli Yedekleme','',()=>go('backup')],['⏻','Şimdi Kilitle','',()=>lockNow(true)]].forEach(([i,n,v,fn])=>{const r=el('div','row',`<div class="left"><div>${i}</div><div>${n}</div></div><div class="small">${v||'›'}</div>`);if(fn)r.onclick=fn;s.append(r)});app(frame(c,'profile'))}
function backup(){const c=el('div');c.append(makeTop('Şifreli Yedekleme'));const box=el('div','card backup-box',`<div style="font-size:42px">🔐</div><h3>Şifreli Yedek</h3><p class="muted">Yedek dosyanız okunabilir finansal veri içermez. Geri yüklemek için uygulama parolanız gerekir.</p>`);[['Şifreli Yedek Oluştur',backupDownload,'primary'],['Yedekten Geri Yükle',restore,'secondary']].forEach(([t,fn,cls])=>{const b=el('button',cls,t);b.style.marginTop='10px';b.onclick=fn;box.append(b)});c.append(box);app(frame(c,'profile'))}
function backupDownload(){
  const meta=readJSON(META_KEY),blob=readJSON(DATA_KEY);if(!meta||!blob){notice('Şifreli veri bulunamadı.');return}
  const envelope={type:'butcem-encrypted-backup',version:1,createdAt:new Date().toISOString(),meta,blob};
  const file=new Blob([JSON.stringify(envelope)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=`butcem-sifreli-yedek-${new Date().toISOString().slice(0,10)}.butcem`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);notice('Şifreli yedek oluşturuldu.')
}
function restore(){const input=document.querySelector('#fileRestore');input.value='';input.onchange=async()=>{try{const env=JSON.parse(await input.files[0].text());if(env.type!=='butcem-encrypted-backup'||!env.meta?.salt||!env.blob?.ciphertext)throw new Error();localStorage.setItem(META_KEY,JSON.stringify(env.meta));localStorage.setItem(DATA_KEY,JSON.stringify(env.blob));localStorage.removeItem(LEGACY_KEY);secureMeta=env.meta;legacyState=null;notice('Şifreli yedek yüklendi. Parolanızla tekrar giriş yapın.');setTimeout(()=>lockNow(true),500)}catch{notice('Geçerli bir Bütçem şifreli yedeği değil.')}};input.click()}
function openAddMenu(){modal={type:'menu'};renderModal()}function openIncome(x){modal={type:'income',item:x};renderModal()}function openExpense(x){modal={type:'expense',item:x};renderModal()}function openCard(x){modal={type:'card',item:x};renderModal()}function openProfile(){modal={type:'profile'};renderModal()}function openSecurity(force=false){modal={type:'security',force};renderModal()}
async function toggleNotifications(){state.settings.notifications=!state.settings.notifications;await save();notice('Bildirim ayarı güncellendi.');render()}
function renderModal(){document.querySelector('.modal')?.remove();if(!modal)return;const m=el('div','modal');const sh=el('div','sheet');m.onclick=e=>{if(e.target===m&&!modal.force){modal=null;m.remove()}};const titles={menu:'Yeni Kayıt',income:modal.item?'Geliri Düzenle':'Gelir Ekle',expense:modal.item?'Gideri Düzenle':'Gider Ekle',card:modal.item?'Kartı Düzenle':'Kart Ekle',profile:'Profil Bilgileri',security:'Güvenlik'};const h=el('div','sheet-head',`<h3>${titles[modal.type]}</h3><button class="x">×</button>`);const x=h.querySelector('.x');if(modal.force)x.style.visibility='hidden';else x.onclick=()=>{modal=null;m.remove()};sh.append(h);if(modal.type==='menu'){[['Gelir Ekle',()=>{modal=null;openIncome()}],['Gider Ekle',()=>{modal=null;openExpense()}],['Kredi Kartı Ekle',()=>{modal=null;openCard()}]].forEach(([t,fn])=>{const b=el('button','secondary',t);b.style.marginTop='12px';b.onclick=fn;sh.append(b)})}if(modal.type==='income')formIncome(sh,modal.item);if(modal.type==='expense')formExpense(sh,modal.item);if(modal.type==='card')formCard(sh,modal.item);if(modal.type==='profile')formProfile(sh);if(modal.type==='security')formSecurity(sh,modal.force);m.append(sh);document.body.append(m)}
function field(label,name,val='',type='text',attrs=''){return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${escapeHtml(val??'')}" ${attrs}></div>`}
function formIncome(sh,x={}){const f=el('form');f.innerHTML=field('Gelir Adı','name',x?.name,'text','maxlength="50" required')+field('Tutar','amount',x?.amount||'','number','min="0" step="0.01" required')+field('Her Ayın Kaçı?','day',x?.day||1,'number','min="1" max="31" required')+`<div class="field"><label>Tür</label><select name="fixed"><option value="true" ${x?.fixed!==false?'selected':''}>Sabit Gelir</option><option value="false" ${x?.fixed===false?'selected':''}>Tek Seferlik</option></select></div><button class="primary">Kaydet</button>`;f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));await upsert('incomes',{id:x?.id||Date.now(),name:d.name.trim(),amount:+d.amount,day:+d.day,fixed:d.fixed==='true'});closeAndRender()};sh.append(f)}
function formExpense(sh,x={}){const f=el('form');f.innerHTML=field('Gider Adı','name',x?.name,'text','maxlength="50" required')+field('Tutar','amount',x?.amount||'','number','min="0" step="0.01" required')+field('Son Ödeme Günü','day',x?.day||1,'number','min="1" max="31" required')+field('Simge','icon',x?.icon||'💳','text','maxlength="4"')+`<button class="primary">Kaydet</button>${x?.id?'<button type="button" id="del" class="secondary" style="margin-top:10px">Sil</button>':''}`;f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));await upsert('expenses',{...x,id:x?.id||Date.now(),name:d.name.trim(),amount:+d.amount,day:+d.day,icon:d.icon,fixed:true,paid:x?.paid||false});closeAndRender()};f.querySelector('#del')?.addEventListener('click',()=>del('expenses',x.id));sh.append(f)}
function formCard(sh,x={}){const f=el('form');f.innerHTML=el('div','security-note','Yalnızca son 4 haneyi girin. Tam kart numarası, CVV veya banka şifresi kaydetmeyin.').outerHTML+field('Banka','bank',x?.bank,'text','maxlength="50" required')+field('Kart Adı','name',x?.name,'text','maxlength="50" required')+field('Son 4 Hane','last4',x?.last4,'text','inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required')+`<div class="grid2">${field('Limit','limit',x?.limit||'','number','min="0" step="0.01" required')}${field('Kullanılan','used',x?.used||0,'number','min="0" step="0.01" required')}</div><div class="grid2">${field('Hesap Kesim','cut',x?.cut||1,'number','min="1" max="31" required')}${field('Son Ödeme','due',x?.due||10,'number','min="1" max="31" required')}</div><div class="field"><label>Renk</label><select name="color"><option value="red">Kırmızı</option><option value="purple">Mor</option><option value="green">Yeşil</option></select></div><button class="primary">Kaydet</button>`;f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));const last4=String(d.last4).replace(/\D/g,'').slice(-4);if(last4.length!==4){notice('Kart için yalnızca 4 rakam girin.');return}await upsert('cards',{id:x?.id||Date.now(),bank:d.bank.trim(),name:d.name.trim(),last4,limit:+d.limit,used:+d.used,cut:+d.cut,due:+d.due,color:d.color});closeAndRender()};sh.append(f)}
function formProfile(sh){const f=el('form');f.innerHTML=field('İsim','name',state.profile.name,'text','maxlength="40" required')+`<button class="primary">Kaydet</button>`;f.onsubmit=async e=>{e.preventDefault();state.profile.name=String(new FormData(f).get('name')).trim();await save();secureMeta=readJSON(META_KEY);closeAndRender()};sh.append(f)}
function formSecurity(sh,force=false){const f=el('form');const currentField=force?'':field('Mevcut Parola','oldPin','','password','autocomplete="current-password" required');f.innerHTML=`${force?'<div class="security-note">İlk giriş tamamlandı. Şimdi en az 8 karakterli kendi parolanızı belirleyin.</div>':''}${currentField}${field('Yeni Parola','pin','','password','autocomplete="new-password" minlength="8" maxlength="64" required')}${field('Yeni Parola Tekrar','pin2','','password','autocomplete="new-password" minlength="8" maxlength="64" required')}${field('Kilitleme Süresi (dakika)','lockMinutes',state.profile.lockMinutes||15,'number','min="1" max="120" required')}<button class="primary">Güvenliği Güncelle</button>`;f.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));if(String(d.pin).length<8){notice('Yeni parola en az 8 karakterli olmalı.');return}if(d.pin!==d.pin2){notice('Yeni parolalar aynı değil.');return}if(!force){try{const oldKey=await deriveKey(d.oldPin,unb64(secureMeta.salt),secureMeta.iterations||PBKDF2_ITERATIONS);await decryptState(readJSON(DATA_KEY),oldKey)}catch{notice('Mevcut parola yanlış.');return}}state.profile.lockMinutes=Math.min(120,Math.max(1,+d.lockMinutes||15));await createSecureStore(state,d.pin,{forcePinChange:false});modal=null;render();notice(force?'Yeni parolanız oluşturuldu.':'Parola değiştirildi ve veriler yeni anahtarla tekrar şifrelendi.')};sh.append(f)}
async function upsert(k,obj){const i=state[k].findIndex(x=>x.id===obj.id);if(i>=0)state[k][i]=obj;else state[k].push(obj);await save()}
async function del(k,id){state[k]=state[k].filter(x=>x.id!==id);await save();closeAndRender()}
function closeAndRender(){modal=null;render();notice('Kaydedildi.')}

async function boot(){
  try{
    // UI'yi bekletmeden hemen giriş ekranını göster.
    secureMeta=readJSON(META_KEY);legacyState=readJSON(LEGACY_KEY);
    setupSecurityGuards();
    render();
    if(!window.crypto?.subtle){
      document.querySelector('#app').innerHTML='<main class="phone"><div class="card"><h3>Güvenli bağlantı gerekli</h3><p>Bu sürüm Web Crypto gerektirir. Uygulamayı GitHub Pages üzerindeki HTTPS adresinden açın.</p></div></main>';
      return;
    }
    await ensureFreshStore();
    if('serviceWorker' in navigator){ try{ const regs=await navigator.serviceWorker.getRegistrations(); for(const r of regs) await r.unregister(); }catch{} }
  }catch(err){
    console.error('Bütçem başlatma hatası',err);
    document.querySelector('#app').innerHTML='<main class="phone"><div class="card"><h3>Uygulama başlatılamadı</h3><p>Sayfayı yenileyin. Sorun devam ederse tarayıcı site verilerini temizleyip tekrar deneyin.</p><p class="small">Hata kodu: STARTUP</p></div></main>';
  }
}
boot();
