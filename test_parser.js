const state={statementCategoryRules:{},selectedMonth:'2026-09'}; const C=['Diğer','Market','Ulaşım','Kuyumculuk','Giyim','Faturalar','Yemek','Kart Ödemesi']; let cardStatementMonth='2026-09'; const STMT_MONTHS={OCAK:1,OCA:1,ŞUBAT:2,ŞUB:2,MART:3,MAR:3,NİSAN:4,NİS:4,MAYIS:5,MAY:5,HAZİRAN:6,HAZ:6,TEMMUZ:7,TEM:7,AĞUSTOS:8,AĞU:8,EYLÜL:9,EYL:9,EKİM:10,EKİ:10,KASIM:11,KAS:11,ARALIK:12,ARA:12}; const STMT_DATE_NUM_RE=/(?:\b\d{4}[.\/-]\d{1,2}[.\/-]\d{1,2}\b|\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-](?:20\d{2}|\d{2}))?\b)/gi; const STMT_DATE_TXT_RE=/\b\d{1,2}\s+(?:OCAK|OCA|ŞUBAT|ŞUB|MART|MAR|NİSAN|NİS|MAYIS|MAY|HAZİRAN|HAZ|TEMMUZ|TEM|AĞUSTOS|AĞU|EYLÜL|EYL|EKİM|EKİ|KASIM|KAS|ARALIK|ARA)(?:\s+(?:20\d{2}|\d{2}))?\b/gi; function ym(){return '2026-09'};
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
function stmtCleanTitle(v){return String(v||'').replace(/\s+/g,' ').replace(/[|]/g,' ').trim().slice(0,100)}
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
function stmtInstallmentInfo(blockText,selectedAmount){
  const u=String(blockText||'').toLocaleUpperCase('tr-TR');
  let no=null,count=null,total=null;
  const frac=u.match(/(?:İŞLEMİN|ISLEMIN)\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)?/i)||u.match(/(\d{1,2})\s*\/\s*(\d{1,2})\s*(?:TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)/i);
  if(frac){no=+frac[1];count=+frac[2];if(!(no>=1&&count>=2&&no<=count)){no=null;count=null}}
  const totalMatch=String(blockText||'').match(/([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})|[0-9]+(?:,[0-9]{2}))\s*(?:TL|TRY|₺)?\s*(?:İŞLEMİN|ISLEMIN)/i);
  if(totalMatch){const n=stmtParseLooseMoney(totalMatch[1]);if(Number.isFinite(n)&&n>Math.abs(selectedAmount||0))total=n}
  return{installmentNo:no,installmentCount:count,installmentTotal:total}
}
function stmtPaymentLike(blockText){
  const u=String(blockText||'').toLocaleUpperCase('tr-TR');
  return /(?:ŞUBE|SUBE)?\s*-?\s*OTOMATİK\s*ÖDEME|OTOMATIK\s*ODEME|ÖDEME\s*-?\s*TEŞEKK|ODEME\s*-?\s*TESEKK|KART\s*ÖDEMESİ|KART\s*ODEMESI|BORÇ\s*ÖDEME|BORC\s*ODEME/.test(u)
}
function parseStatementText(text,cardId){
  const anchor=stmtAnchorInfo(text),datePref=stmtDatePreference(text);
  const bad=/(?:D[ÖO]NEM\s+BORCU|TOPLAM\s+BOR[ÇC]|TOPLAM\s+HARCAMA|ASGAR[İI]\s*(?:[ÖO]DEME|TUTAR)|KULLANILAB[İI]L[İI]R\s+L[İI]M[İI]T|KART\s+L[İI]M[İI]T[İI]|SON\s+[ÖO]DEME\s+TAR[İI]H|HESAP\s+KES[İI]M\s+TAR[İI]H|[ÖO]NCEK[İI]\s+AYDAN\s+DEV[İI]R|DEVREDEN\s+BAK[İI]YE)/i;
  const out=[],seen={};
  for(const block of stmtLogicalBlocks(text,anchor)){
    const blockText=block.lines.join(' ').replace(/\s+/g,' ').trim();if(!blockText||bad.test(blockText))continue;
    const di=stmtPickTransactionDate(blockText,anchor,datePref);if(!di)continue;
    const noDates=stmtStripDates(blockText),amounts=stmtAmountCandidates(noDates);if(!amounts.length)continue;
    const tl=amounts.filter(a=>['TL','TRY','₺'].includes(a.currency)),pool=tl.length?tl:amounts;
    pool.sort((a,b)=>a.score-b.score||a.index-b.index);const pick=pool.at(-1),rawAmount=pick.value;if(!Number.isFinite(rawAmount)||rawAmount===0)continue;
    const payment=stmtPaymentLike(blockText);
    const refund=!payment&&(/\bİADE\b|\bIADE\b|\bİPTAL\b|\bIPTAL\b|\bREFUND\b|\bALACAK\b/i.test(blockText)||rawAmount<0);
    const amount=payment?Math.abs(rawAmount):(refund?-Math.abs(rawAmount):Math.abs(rawAmount));
    let title=noDates;
    [...amounts].sort((a,b)=>b.index-a.index).forEach(a=>{title=title.replace(a.raw,' ')});
    title=title.replace(/\b(?:İŞLEM|ISLEM|PROVİZYON|PROVIZYON|VALÖR|VALOR)\s*TARİHİ\b/gi,' ')
      .replace(/\b(?:AÇIKLAMA|ACIKLAMA|İŞYERİ|ISYERI|TUTAR|BORÇ|BORC|ALACAK|PARA\s*BİRİMİ|PARA\s*BIRIMI)\b/gi,' ')
      .replace(/\b(?:TL|TRY|USD|EUR|GBP|₺)\b/gi,' ')
      .replace(/^[\s\-–—|:;,]+|[\s\-–—|:;,]+$/g,' ');
    title=title.replace(/\b(?:İŞLEMİN|ISLEMIN)?\s*\d{1,2}\s*\/\s*\d{1,2}\s*(?:TAKSİDİ|TAKSIDI|TAKSİT|TAKSIT)?\b/gi,' ').replace(/\s+/g,' ');title=stmtCleanTitle(title);if(!title)title=payment?'KART ÖDEMESİ':refund?'KART İADESİ':'KART HARCAMASI';
    const inst=payment||refund?{installmentNo:null,installmentCount:null,installmentTotal:null}:stmtInstallmentInfo(blockText,amount);
    const kind=payment?'payment':refund?'refund':'spend';
    const baseFp=stmtFingerprint(cardId,di.date,title,payment?-amount:amount),occ=(seen[baseFp]=(seen[baseFp]||0)+1);
    out.push({date:di.date,title,amount,category:payment?'Kart Ödemesi':stmtCategory(title),baseFp,occurrence:occ,fp:`${baseFp}|#${occ}`,checked:true,refund,payment,kind,...inst})
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
  const src=String(text||'').replace(/\r/g,'\n').replace(/\u00a0/g,' '),flat=src.replace(/\s+/g,' '),lines=src.split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const moneyRe=/(-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})|-?\d+(?:[.,]\d{2}))\s*(?:TL|TRY|₺)?/gi;
  const values=line=>[...String(line||'').matchAll(moneyRe)].map(m=>stmtParseLooseMoney(m[1])).filter(v=>Number.isFinite(v));
  const find=(rx)=>{for(const line of lines){rx.lastIndex=0;if(!rx.test(line))continue;rx.lastIndex=0;const vals=values(line);if(vals.length)return vals.at(-1)}return null};
  // Many bank PDFs flatten the five summary boxes into one line. Detect the equation labels and read the nearest TL value after each label.
  const near=(labelRx)=>{const m=flat.match(labelRx);if(!m)return null;const tail=flat.slice((m.index||0)+m[0].length,(m.index||0)+m[0].length+90),vals=values(tail);return vals.length?vals[0]:null};
  const previousBalance=near(/(?:DEVREDEN\s+BAK[İI]YE|[ÖO]NCEK[İI]\s+AYDAN\s+DEV[İI]R)/i)??find(/(?:DEVREDEN\s+BAK[İI]YE|[ÖO]NCEK[İI]\s+AYDAN\s+DEV[İI]R)/i);
  const spendingTotal=near(/(?:HARCAMALAR(?:INIZ)?|TOPLAM\s+HARCAMA|HARCAMALAR\s+TOPLAMI|D[ÖO]NEM\s+[İI]Ç[İI]\s+HARCAMA|D[ÖO]NEM\s+HARCAMALARI)/i)??find(/(?:HARCAMALAR(?:INIZ)?|TOPLAM\s+HARCAMA|HARCAMALAR\s+TOPLAMI|D[ÖO]NEM\s+[İI]Ç[İI]\s+HARCAMA|D[ÖO]NEM\s+HARCAMALARI)/i);
  const feesTotal=near(/(?:FA[İI]Z\s*[ÜU]CRETLER\s*VE\s*KES[İI]NT[İI]LER|FA[İI]Z\s*VE\s*[ÜU]CRETLER|[ÜU]CRET\s*VE\s*KES[İI]NT[İI]LER)/i)??find(/(?:FA[İI]Z\s*[ÜU]CRETLER\s*VE\s*KES[İI]NT[İI]LER|FA[İI]Z\s*VE\s*[ÜU]CRETLER|[ÜU]CRET\s*VE\s*KES[İI]NT[İI]LER)/i);
  const paymentsTotal=near(/(?:[ÖO]DEMELER[İI]N[İI]Z|[ÖO]DEMELER\s+TOPLAMI)/i)??find(/(?:[ÖO]DEMELER[İI]N[İI]Z|[ÖO]DEMELER\s+TOPLAMI)/i);
  const periodDebt=near(/(?:D[ÖO]NEM\s+BORCU|HESAP\s+[ÖO]ZET[İI]\s+BORCU|EKSTRE\s+BORCU|TOPLAM\s+BOR[ÇC])/i)??find(/(?:D[ÖO]NEM\s+BORCU|HESAP\s+[ÖO]ZET[İI]\s+BORCU|EKSTRE\s+BORCU|TOPLAM\s+BOR[ÇC])/i);
  return{previousBalance,spendingTotal,feesTotal,paymentsTotal,periodDebt}
}
const summaryText=`Devreden Bakiye 15.890,61 TL + Harcamalarınız 22.004,59 TL + Faiz Ücretler ve Kesintiler 0,00 TL - Ödemeleriniz 15.933,65 TL = Dönem Borcu 21.961,55 TL`;console.log('SUMMARY',parseStatementSummary(summaryText));const tx=`10/08/2026 KUTLU GİYİM 01.Tak BURSA 3.750,00 TL İşlemin 1/2 Taksidi 1.875,00 TL\n12/08/2026 2536 şube-otomatik ödeme-teşekkür ederiz 2.002,84+ TL\n01/09/2026 BİM MİLLETMH. BURSA 212,00 TL\n02/09/2026 ONUR MRKT-MILLET MER BURSA 123,46 TL`;console.log('ROWS',parseStatementText(tx,'c1'));