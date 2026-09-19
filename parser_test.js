const fs=require('fs');
const src=fs.readFileSync('/mnt/data/hane_v9/app-v19.js','utf8');
const a=src.indexOf('function stmtCleanTitle');
const b=src.indexOf('const HANE_OCR_SCRIPT',a);
const code=src.slice(a,b);
let state={selectedMonth:'2026-09',statementCategoryRules:{}}, cardStatementMonth='';
let C=['Market','Toplu Taşıma','Kuyumculuk','Diğer','Yemek','Ulaşım'];
function ym(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function statementMonthFor(card,dateStr){const d=new Date(dateStr+'T12:00:00');const cutDay=Number(card.statementDay||1);const x=new Date(d.getFullYear(),d.getMonth()+(d.getDate()>cutDay?1:0),1);return ym(x)}
eval(code);
const txt=`HESAP KESİM TARİHİ 28.09.2026\n31.08.2026 BURULAŞ BURSARAY 55,00 TL\n02.09.2026 MİGROS 740,00 TL\n2026-09-05 ATASAY KUYUMCULUK 1.200,00 TL\n07.09.2026 İSTANBULKART 100,00 TL\n25.08.2026 ONUR MARKET 350,00 TL\n`;
const rows=parseStatementText(txt,'card1');
console.log(rows.map(r=>({date:r.date,title:r.title,amount:r.amount,category:r.category})));
console.log(statementRowsMonthBreakdown(rows));
if(rows.filter(r=>r.date.startsWith('2026-09')).length!==3) process.exit(2);
if(!rows.some(r=>r.category==='Toplu Taşıma')) process.exit(3);
if(!rows.some(r=>r.category==='Market')) process.exit(4);
if(!rows.some(r=>r.category==='Kuyumculuk')) process.exit(5);
