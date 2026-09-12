import React,{useEffect,useMemo,useRef,useState}from'react';
import{
  Alert,Image,Modal,Platform,Pressable,SafeAreaView,ScrollView,StatusBar,
  StyleSheet,Text,TextInput,View
}from'react-native';
import Svg,{Circle,Rect,Line,Path,Polyline,Polygon}from'react-native-svg';
import*as ImagePicker from'expo-image-picker';
import{C}from'./src/theme';
import{Attachment,Bill,CreditCard,FixedExpense,HaneState,PaymentMethod,Reminder,Transaction,TxType,emptyState}from'./src/types';
import{clearActiveEncryptionKey,clearLocalState,disableStateEncryption,loadState,persistState,rekeyState,unlockState}from'./src/storage';
import{decryptBackup,exportAllBackup,exportMonthBackup,exportMonthCsv,pickBackupText}from'./src/export';
import{getPinMode,hasPin,removePin,savePin,verifyPin}from'./src/security';

type Screen='home'|'income'|'expense'|'cards'|'payments'|'bills'|'fixed'|'reminders'|'analysis'|'settings';
type Range='day'|'week'|'month'|'year';

const U=(x:any)=>String(x??'').toLocaleUpperCase('tr-TR');
const money=(n:number)=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n);
const uid=()=>`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const todayISO=()=>new Date().toISOString().slice(0,10);
const pad=(n:number)=>String(n).padStart(2,'0');
const parse=(d:string)=>new Date(d+'T00:00:00');
const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const monthLabel=(m:string)=>{const[y,mo]=m.split('-').map(Number);return U(new Intl.DateTimeFormat('tr-TR',{month:'long',year:'numeric'}).format(new Date(y,mo-1,1)))};
const shiftMonth=(m:string,d:number)=>{const[y,mo]=m.split('-').map(Number),x=new Date(y,mo-1+d,1);return`${x.getFullYear()}-${pad(x.getMonth()+1)}`};
const dim=(y:number,m:number)=>new Date(y,m,0).getDate();
const dateForDay=(m:string,day:number)=>{const[y,mo]=m.split('-').map(Number);return`${y}-${pad(mo)}-${pad(Math.min(day,dim(y,mo)))}`};
const diffDays=(d:string)=>Math.ceil((parse(d).getTime()-parse(todayISO()).getTime())/86400000);
const between=(d:string,a:string,b:string)=>d>=a&&d<=b;

function statementKeyFor(date:string,c:CreditCard){
  const[y,m,d]=date.split('-').map(Number),cut=Math.min(c.statementDay,dim(y,m));
  if(d<=cut)return`${y}-${pad(m)}-${pad(cut)}`;
  const n=new Date(y,m,1),ny=n.getFullYear(),nm=n.getMonth()+1,nc=Math.min(c.statementDay,dim(ny,nm));
  return`${ny}-${pad(nm)}-${pad(nc)}`;
}
function dueFromStatement(key:string,c:CreditCard){
  const[y,m]=key.split('-').map(Number),n=new Date(y,m,1),ny=n.getFullYear(),nm=n.getMonth()+1,d=Math.min(c.dueDay,dim(ny,nm));
  return`${ny}-${pad(nm)}-${pad(d)}`;
}
function bestCard(cards:CreditCard[]){
  const a=cards.filter(c=>c.active);if(!a.length)return null;
  return a.map(c=>{const sk=statementKeyFor(todayISO(),c),due=dueFromStatement(sk,c);return{c,due,days:diffDays(due)}}).sort((x,y)=>y.days-x.days)[0];
}
function activeFixedForMonth(s:HaneState,m:string){
  return s.fixedExpenses.filter(f=>f.active&&f.startMonth<=m&&(f.mode==='from_now'||f.startMonth===m));
}
function monthTotals(s:HaneState,m:string){
  const t=s.transactions.filter(x=>x.date.startsWith(m));
  const income=t.filter(x=>x.type==='income').reduce((a,x)=>a+x.amount,0);
  let expense=t.filter(x=>x.type!=='income').reduce((a,x)=>a+x.amount,0);
  expense+=s.bills.filter(b=>b.paid&&b.dueDate.startsWith(m)).reduce((a,b)=>a+b.amount,0);
  expense+=activeFixedForMonth(s,m).filter(f=>(f.paidMonths||[]).includes(m)).reduce((a,f)=>a+f.amount,0);
  return{income,expense,remain:income-expense};
}
function periodTotals(s:HaneState,a:string,b:string){
  const t=s.transactions.filter(x=>between(x.date,a,b));
  const income=t.filter(x=>x.type==='income').reduce((q,x)=>q+x.amount,0);
  let expense=t.filter(x=>x.type!=='income').reduce((q,x)=>q+x.amount,0);
  expense+=s.bills.filter(x=>x.paid&&between(x.dueDate,a,b)).reduce((q,x)=>q+x.amount,0);
  const cursor=new Date(a+'T00:00:00'),end=new Date(b+'T00:00:00');
  while(cursor<=end){
    const m=`${cursor.getFullYear()}-${pad(cursor.getMonth()+1)}`;
    expense+=activeFixedForMonth(s,m).filter(f=>(f.paidMonths||[]).includes(m)&&between(dateForDay(m,f.dayOfMonth),a,b)).reduce((q,f)=>q+f.amount,0);
    cursor.setMonth(cursor.getMonth()+1,1);
  }
  return{income,expense,remain:income-expense};
}

async function pickAttachment(source:'camera'|'gallery'):Promise<Attachment|null>{
  try{
    let r:ImagePicker.ImagePickerResult;
    if(source==='camera'){
      const p=await ImagePicker.requestCameraPermissionsAsync();
      if(!p.granted){Alert.alert('HANE','KAMERA İZNİ GEREKLİ');return null}
      r=await ImagePicker.launchCameraAsync({quality:.35,base64:true,allowsEditing:false});
    }else{
      r=await ImagePicker.launchImageLibraryAsync({quality:.35,base64:true,allowsEditing:false});
    }
    if(r.canceled||!r.assets?.[0])return null;
    const a=r.assets[0];
    return{uri:a.base64?`data:${a.mimeType||'image/jpeg'};base64,${a.base64}`:a.uri,name:a.fileName||'BELGE',source};
  }catch{Alert.alert('HANE','FOTOĞRAF AÇILAMADI');return null}
}
function confirmDelete(label:string,run:()=>void){
  if(Platform.OS==='web'){if(confirm(`${U(label)} SİLİNSİN Mİ?`))run();}
  else Alert.alert('SİL',`${U(label)} SİLİNSİN Mİ?`,[{text:'VAZGEÇ',style:'cancel'},{text:'SİL',style:'destructive',onPress:run}]);
}
function alarms(s:HaneState){
  const out:{id:string;title:string;date:string;status:string;late:boolean}[]=[];
  if(!s.remindersEnabled)return out;
  const threshold=s.alarmDaysBefore,cm=todayISO().slice(0,7);
  s.bills.filter(b=>!b.paid).forEach(b=>{const d=diffDays(b.dueDate);if(d<=threshold)out.push({id:'b'+b.id,title:`FATURA · ${U(b.title)}`,date:b.dueDate,status:d<0?`${Math.abs(d)} GÜN GECİKTİ`:d===0?'BUGÜN SON GÜN':`${d} GÜN KALDI`,late:d<=0})});
  activeFixedForMonth(s,cm).filter(f=>!(f.paidMonths||[]).includes(cm)).forEach(f=>{const date=dateForDay(cm,f.dayOfMonth),d=diffDays(date);if(d<=threshold)out.push({id:'f'+f.id,title:`SABİT GİDER · ${U(f.title)}`,date,status:d<0?`${Math.abs(d)} GÜN GECİKTİ`:d===0?'BUGÜN ÖDE':`${d} GÜN KALDI`,late:d<=0})});
  s.cards.filter(c=>c.active&&!(c.paidMonths||[]).includes(cm)).forEach(c=>{const date=dateForDay(cm,c.dueDay),d=diffDays(date);if(d<=threshold)out.push({id:'c'+c.id,title:`KART · ${U(c.bank)} ${U(c.name)}`,date,status:d<0?`${Math.abs(d)} GÜN GECİKTİ`:d===0?'BUGÜN SON GÜN':`${d} GÜN KALDI`,late:d<=0})});
  s.reminders.filter(r=>!r.done).forEach(r=>{const d=diffDays(r.date);if(d<=threshold)out.push({id:'r'+r.id,title:U(r.title),date:r.date,status:d<0?`${Math.abs(d)} GÜN GECİKTİ`:d===0?'BUGÜN':`${d} GÜN KALDI`,late:d<=0})});
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

function I({name,size=18,color=C.text}:{name:any;size?:number;color?:string}){
  const n=String(name||'');
  const common={stroke:color,strokeWidth:1.8,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,fill:'none'};
  const svg=(children:React.ReactNode)=><Svg width={size}height={size}viewBox="0 0 24 24">{children}</Svg>;

  if(n==='chevron-back')return svg(<Polyline points="15,5 8,12 15,19"{...common}/>);
  if(n==='chevron-forward')return svg(<Polyline points="9,5 16,12 9,19"{...common}/>);
  if(n==='close'||n==='close-outline')return svg(<><Line x1="6"y1="6"x2="18"y2="18"{...common}/><Line x1="18"y1="6"x2="6"y2="18"{...common}/></>);
  if(n==='home-outline'||n==='home')return svg(<><Path d="M3 11.5L12 4l9 7.5"{...common}/><Path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"{...common}/></>);
  if(n==='card-outline'||n==='card')return svg(<><Rect x="3"y="5"width="18"height="14"rx="2.5"{...common}/><Line x1="3"y1="9"x2="21"y2="9"{...common}/><Line x1="7"y1="15"x2="11"y2="15"{...common}/></>);
  if(n==='receipt-outline'||n==='document-text-outline'||n==='list-outline')return svg(<><Path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z"{...common}/><Line x1="9"y1="8"x2="15"y2="8"{...common}/><Line x1="9"y1="12"x2="15"y2="12"{...common}/><Line x1="9"y1="16"x2="13"y2="16"{...common}/></>);
  if(n==='bar-chart-outline')return svg(<><Line x1="4"y1="20"x2="20"y2="20"{...common}/><Rect x="5"y="12"width="3"height="6"rx="1"{...common}/><Rect x="10.5"y="8"width="3"height="10"rx="1"{...common}/><Rect x="16"y="4"width="3"height="14"rx="1"{...common}/></>);
  if(n==='pie-chart-outline')return svg(<><Path d="M12 3a9 9 0 1 0 9 9h-9V3Z"{...common}/><Path d="M14 3.2A9 9 0 0 1 20.8 10H14V3.2Z"{...common}/></>);
  if(n==='settings-outline'||n==='settings')return svg(<><Circle cx="12"cy="12"r="3"{...common}/><Circle cx="12"cy="12"r="8"{...common}/><Line x1="12"y1="1.5"x2="12"y2="4"{...common}/><Line x1="12"y1="20"x2="12"y2="22.5"{...common}/><Line x1="1.5"y1="12"x2="4"y2="12"{...common}/><Line x1="20"y1="12"x2="22.5"y2="12"{...common}/></>);
  if(n==='notifications-outline'||n==='alarm-outline')return svg(<><Path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 5 2 5.5 2 7H4.5c0-1.5 2-2 2-7Z"{...common}/><Path d="M9.5 19a2.8 2.8 0 0 0 5 0"{...common}/></>);
  if(n==='calendar-outline')return svg(<><Rect x="3.5"y="5"width="17"height="15"rx="2"{...common}/><Line x1="7"y1="3"x2="7"y2="7"{...common}/><Line x1="17"y1="3"x2="17"y2="7"{...common}/><Line x1="3.5"y1="9"x2="20.5"y2="9"{...common}/></>);
  if(n==='cash-outline'||n==='wallet-outline')return svg(<><Rect x="3"y="6"width="18"height="13"rx="2.5"{...common}/><Path d="M15 10h6v5h-6a2.5 2.5 0 0 1 0-5Z"{...common}/><Circle cx="16.5"cy="12.5"r=".6"fill={color}/></>);
  if(n==='trash-outline')return svg(<><Path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"{...common}/><Line x1="10"y1="10"x2="10.5"y2="17"{...common}/><Line x1="14"y1="10"x2="13.5"y2="17"{...common}/></>);
  if(n==='create-outline')return svg(<><Rect x="4"y="5"width="13"height="15"rx="2"{...common}/><Path d="M13 5l3-3 4 4-9 9-4 1 1-4 5-5"{...common}/></>);
  if(n==='checkmark-circle-outline')return svg(<><Circle cx="12"cy="12"r="9"{...common}/><Polyline points="8,12.5 11,15.5 16.5,9"{...common}/></>);
  if(n==='checkmark-outline')return svg(<Polyline points="5,12.5 10,17 19,7"{...common}/>);
  if(n==='add-circle-outline')return svg(<><Circle cx="12"cy="12"r="9"{...common}/><Line x1="12"y1="8"x2="12"y2="16"{...common}/><Line x1="8"y1="12"x2="16"y2="12"{...common}/></>);
  if(n==='add-outline')return svg(<><Line x1="12"y1="5"x2="12"y2="19"{...common}/><Line x1="5"y1="12"x2="19"y2="12"{...common}/></>);
  if(n==='alert-circle-outline')return svg(<><Circle cx="12"cy="12"r="9"{...common}/><Line x1="12"y1="7"x2="12"y2="13"{...common}/><Circle cx="12"cy="17"r=".7"fill={color}/></>);
  if(n==='lock-closed-outline'||n==='lock-open-outline')return svg(<><Rect x="5"y="10"width="14"height="10"rx="2"{...common}/><Path d={n==='lock-open-outline'?'M9 10V7a4 4 0 0 1 7-2.5':'M8 10V7a4 4 0 0 1 8 0v3'}{...common}/><Circle cx="12"cy="15"r="1"fill={color}/></>);
  if(n==='key-outline')return svg(<><Circle cx="8"cy="12"r="4"{...common}/><Line x1="12"y1="12"x2="21"y2="12"{...common}/><Line x1="17"y1="12"x2="17"y2="15"{...common}/><Line x1="20"y1="12"x2="20"y2="14"{...common}/></>);
  if(n==='shield-checkmark-outline')return svg(<><Path d="M12 3l7 3v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6l7-3Z"{...common}/><Polyline points="8.5,12 11,14.5 15.5,9.5"{...common}/></>);
  if(n==='camera-outline'||n==='camera')return svg(<><Rect x="3"y="7"width="18"height="13"rx="2.5"{...common}/><Path d="M8 7l1.5-3h5L16 7"{...common}/><Circle cx="12"cy="13"r="3.3"{...common}/></>);
  if(n==='image-outline')return svg(<><Rect x="3"y="4"width="18"height="16"rx="2.5"{...common}/><Circle cx="9"cy="9"r="1.5"{...common}/><Polyline points="5,18 10,13 13,16 16,12 21,17"{...common}/></>);
  if(n==='attach-outline')return svg(<Path d="M8.5 12.5l6.2-6.2a3 3 0 0 1 4.2 4.2l-8.2 8.2a4.5 4.5 0 0 1-6.4-6.4l8-8"{...common}/>);
  if(n==='download-outline')return svg(<><Line x1="12"y1="4"x2="12"y2="15"{...common}/><Polyline points="8,11 12,15 16,11"{...common}/><Path d="M5 18v2h14v-2"{...common}/></>);
  if(n==='cloud-upload-outline')return svg(<><Path d="M7 18H5a4 4 0 0 1 .4-8 6.5 6.5 0 0 1 12.2-2A4.5 4.5 0 0 1 19 17.8"{...common}/><Line x1="12"y1="18"x2="12"y2="10"{...common}/><Polyline points="9,13 12,10 15,13"{...common}/></>);
  if(n==='archive-outline')return svg(<><Rect x="4"y="6"width="16"height="14"rx="2"{...common}/><Rect x="3"y="3"width="18"height="4"rx="1"{...common}/><Line x1="9"y1="11"x2="15"y2="11"{...common}/></>);
  if(n==='backspace-outline')return svg(<><Path d="M4 12l5-6h11v12H9l-5-6Z"{...common}/><Line x1="12"y1="9"x2="17"y2="15"{...common}/><Line x1="17"y1="9"x2="12"y2="15"{...common}/></>);
  if(n==='arrow-up-outline')return svg(<><Line x1="12"y1="19"x2="12"y2="5"{...common}/><Polyline points="7,10 12,5 17,10"{...common}/></>);
  if(n==='arrow-down-outline')return svg(<><Line x1="12"y1="5"x2="12"y2="19"{...common}/><Polyline points="7,14 12,19 17,14"{...common}/></>);
  if(n==='arrow-undo-outline')return svg(<><Polyline points="9,8 4,12 9,16"{...common}/><Path d="M5 12h8c4 0 6 2 6 6"{...common}/></>);
  if(n==='person-outline')return svg(<><Circle cx="12"cy="8"r="3.5"{...common}/><Path d="M5.5 20a6.5 6.5 0 0 1 13 0"{...common}/></>);
  if(n==='call-outline')return svg(<Path d="M7 4l3 4-2 2c1.5 3 3.5 5 6.5 6.5l2-2 3.5 3c-1 2-2.7 3-4.5 3C10 19.5 4.5 14 3.5 8.5 3.5 6.7 5 5 7 4Z"{...common}/>);
  if(n==='wifi-outline')return svg(<><Path d="M4 9a12 12 0 0 1 16 0"{...common}/><Path d="M7 12.5a8 8 0 0 1 10 0"{...common}/><Path d="M10 16a3.5 3.5 0 0 1 4 0"{...common}/><Circle cx="12"cy="19"r=".8"fill={color}/></>);
  if(n==='water-outline')return svg(<Path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"{...common}/>);
  if(n==='flame-outline')return svg(<Path d="M13 3c1 4-2 5-1 8 1-1 2-2 3-3 3 3 4 6 2.5 9a6 6 0 0 1-11 0C5 14 7 10 10 7c0 3 1 4 2 5 1-3 0-5 1-9Z"{...common}/>);
  if(n==='flash-outline')return svg(<Polygon points="13,2 5,13 11,13 10,22 19,10 13,10" {...common}/>);
  if(n==='sparkles-outline')return svg(<><Path d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z"{...common}/><Path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"{...common}/></>);
  if(n==='time-outline')return svg(<><Circle cx="12"cy="12"r="9"{...common}/><Line x1="12"y1="7"x2="12"y2="12"{...common}/><Line x1="12"y1="12"x2="16"y2="14"{...common}/></>);

  return svg(<><Circle cx="12"cy="12"r="8"{...common}/><Circle cx="12"cy="12"r="1"fill={color}/></>);
}
function SectionIcon({name,color,size=16}:{name:any;color:string;size?:number}){return<View style={[styles.sectionIcon,{backgroundColor:color+'20'}]}><I name={name}size={size}color={color}/></View>}
function Btn({label,onPress,kind='secondary',icon}:{label:string;onPress:()=>void;kind?:'primary'|'secondary'|'danger';icon?:any}){
  return<Pressable onPress={onPress}style={[styles.btn,kind==='primary'?styles.btnPrimary:kind==='danger'?styles.btnDanger:styles.btnSecondary]}>
    {icon?<I name={icon}size={14}color={kind==='primary'?'#1D1608':kind==='danger'?'#FF8799':C.text}/>:null}
    <Text style={[styles.btnText,kind==='primary'&&{color:'#1D1608'},kind==='danger'&&{color:'#FF8799'}]}>{U(label)}</Text>
  </Pressable>
}
function RowActions({edit,del}:{edit:()=>void;del:()=>void}){return<View style={styles.rowActions}><Pressable style={styles.actionMini}onPress={edit}><I name="create-outline"size={13}color={C.blue}/><Text style={[styles.actionText,{color:C.blue}]}>DÜZENLE</Text></Pressable><Pressable style={styles.actionMini}onPress={del}><I name="trash-outline"size={13}color={C.red}/><Text style={[styles.actionText,{color:C.red}]}>SİL</Text></Pressable></View>}
function PageHead({title,back,actions}:{title:string;back?:()=>void;actions?:React.ReactNode}){return<View style={styles.pageHead}><View style={styles.pageLeft}>{back?<Pressable onPress={back}style={styles.backBtn}><I name="chevron-back"size={22}/></Pressable>:null}<Text style={styles.pageTitle}>{U(title)}</Text></View>{actions}</View>}
function HomeCard({title,value,sub,color,icon,onPress,badge}:{title:string;value:string;sub:string;color:string;icon:any;onPress:()=>void;badge?:number}){return<Pressable style={styles.homeCard}onPress={onPress}><View style={styles.homeTop}><SectionIcon name={icon}color={color}size={17}/><Text style={styles.homeTitle}>{U(title)}</Text>{!!badge&&<View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}<I name="chevron-forward"size={15}color={C.muted}/></View><Text style={styles.homeValue}>{U(value)}</Text><Text style={styles.homeSub}>{U(sub)}</Text></Pressable>}
function AttachmentBox({a,onCamera,onGallery,onRemove}:{a?:Attachment;onCamera:()=>void;onGallery:()=>void;onRemove:()=>void}){return<View style={styles.attachBox}><Text style={styles.fieldLabel}>BELGE / FOTOĞRAF</Text>{a?<><Image source={{uri:a.uri}}style={styles.preview}/><View style={styles.attachedLine}><I name="checkmark-circle-outline"size={14}color={C.green}/><Text style={styles.attachOk}>{a.source==='camera'?'KAMERA FOTOĞRAFI EKLENDİ':'GALERİ FOTOĞRAFI EKLENDİ'}</Text></View><Btn label="FOTOĞRAFI SİL"icon="trash-outline"onPress={onRemove}kind="danger"/></>:<View style={styles.attachActions}><Btn label="KAMERA İLE ÇEK"icon="camera-outline"onPress={onCamera}/><Btn label="FOTOĞRAF SEÇ"icon="image-outline"onPress={onGallery}/></View>}</View>}
function Field({label,value,set,placeholder='',keyboardType}:{label:string;value:string;set:(x:string)=>void;placeholder?:string;keyboardType?:any}){return<><Text style={styles.fieldLabel}>{U(label)}</Text><TextInput value={value}onChangeText={x=>set(U(x))}placeholder={U(placeholder)}placeholderTextColor="#60778B"keyboardType={keyboardType}style={styles.input}/></>}
function Choice({label,on,press}:{label:string;on:boolean;press:()=>void}){return<Pressable onPress={press}style={[styles.choice,on&&styles.choiceOn]}><Text style={[styles.choiceText,on&&styles.choiceTextOn]}>{U(label)}</Text></Pressable>}
function ModalShell({show,title,close,children}:{show:boolean;title:string;close:()=>void;children:React.ReactNode}){return<Modal visible={show}transparent animationType="slide"onRequestClose={close}><View style={styles.modalBack}><ScrollView contentContainerStyle={styles.sheet}><View style={styles.sheetHead}><Text style={styles.sheetTitle}>{U(title)}</Text><Pressable onPress={close}style={styles.closeBtn}><I name="close"size={19}/></Pressable></View>{children}</ScrollView></View></Modal>}

function Ring({income,expense}:{income:number;expense:number}){
  const rem=Math.max(income-expense,0),total=Math.max(income+expense+rem,1),r=58,c=2*Math.PI*r,a=income/total*c,b=expense/total*c,z=rem/total*c;
  return<View style={styles.ring}><Svg width={154}height={154}><Circle cx="77"cy="77"r={r}stroke="#142534"strokeWidth="18"fill="none"/><Circle cx="77"cy="77"r={r}stroke={C.yellow}strokeWidth="18"fill="none"strokeDasharray={`${a} ${c-a}`}strokeLinecap="round"rotation="-90"origin="77,77"/><Circle cx="77"cy="77"r={r}stroke={C.red}strokeWidth="18"fill="none"strokeDasharray={`${b} ${c-b}`}strokeDashoffset={-a}rotation="-90"origin="77,77"/><Circle cx="77"cy="77"r={r}stroke={C.green}strokeWidth="18"fill="none"strokeDasharray={`${z} ${c-z}`}strokeDashoffset={-(a+b)}rotation="-90"origin="77,77"/></Svg><View style={styles.ringCenter}><Text style={styles.ringSmall}>AY ÖZETİ</Text><Text style={[styles.ringMoney,{color:C.green}]}>{money(income-expense)}</Text><Text style={styles.ringSmall}>KALAN</Text></View></View>
}
function Compare({now,prev,kind}:{now:number;prev:number;kind:'income'|'expense'|'remain'}){
  if(prev===0)return<Text style={styles.compareNeutral}>ÖNCEKİ AY VERİ YOK</Text>;
  const d=now-prev,pct=Math.round(Math.abs(d)/Math.abs(prev)*100),good=kind==='expense'?d<=0:d>=0;
  return<View style={styles.compareRow}><I name={d>=0?'arrow-up-outline':'arrow-down-outline'}size={10}color={good?C.green:C.red}/><Text style={[styles.compareText,{color:good?C.green:C.red}]}>%{pct} · {money(Math.abs(d))}</Text></View>
}

function Home({s,setS,go}:{s:HaneState;setS:(x:HaneState)=>void;go:(x:Screen)=>void}){
  const m=s.selectedMonth,p=shiftMonth(m,-1),n=monthTotals(s,m),prev=monthTotals(s,p);
  const unpaid=s.bills.filter(b=>!b.paid),fixed=activeFixedForMonth(s,m),cardSpend=s.transactions.filter(t=>t.type==='card_expense'&&t.date.startsWith(m)).reduce((a,x)=>a+x.amount,0);
  const recent=[...s.transactions.filter(t=>t.date.startsWith(m))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  return<ScrollView contentContainerStyle={styles.scroll}>
    <View style={styles.hero}>
      <View style={styles.monthNav}><Pressable onPress={()=>setS({...s,selectedMonth:shiftMonth(m,-1)})}style={styles.monthBtn}><I name="chevron-back"size={15}/></Pressable><Text style={styles.monthText}>{monthLabel(m)}</Text><Pressable onPress={()=>setS({...s,selectedMonth:shiftMonth(m,1)})}style={styles.monthBtn}><I name="chevron-forward"size={15}/></Pressable></View>
      <View style={styles.heroMain}><Ring income={n.income}expense={n.expense}/><View style={styles.heroNums}>
        <View style={styles.heroNum}><View style={styles.numTitle}><View style={[styles.tinyDot,{backgroundColor:C.yellow}]}/><Text style={styles.numLabel}>GELİR</Text></View><Text style={styles.numMoney}>{money(n.income)}</Text><Compare now={n.income}prev={prev.income}kind="income"/></View>
        <View style={styles.heroNum}><View style={styles.numTitle}><View style={[styles.tinyDot,{backgroundColor:C.red}]}/><Text style={styles.numLabel}>GİDER</Text></View><Text style={styles.numMoney}>{money(n.expense)}</Text><Compare now={n.expense}prev={prev.expense}kind="expense"/></View>
        <View style={styles.heroNum}><View style={styles.numTitle}><View style={[styles.tinyDot,{backgroundColor:C.green}]}/><Text style={styles.numLabel}>KALAN</Text></View><Text style={[styles.numMoney,{color:C.green}]}>{money(n.remain)}</Text><Compare now={n.remain}prev={prev.remain}kind="remain"/></View>
      </View></View>
      <Text style={styles.heroNote}>DOĞRU YÖNETİLEN HER TL, DAHA ÖZGÜR BİR SEN DEMEK.</Text>
    </View>

    <View style={styles.grid}>
      <HomeCard title="Gelir"value={money(n.income)}sub="KAYNAKLARI VE KAYITLARI GÖR"color={C.yellow}icon="cash-outline"onPress={()=>go('income')}/>
      <HomeCard title="Gider"value={money(n.expense)}sub="GİDER VE HARÇLIKLARI GÖR"color={C.red}icon="wallet-outline"onPress={()=>go('expense')}/>
      <HomeCard title="Kartlar"value={money(cardSpend)}sub={`${s.cards.filter(c=>c.active).length} AKTİF KART`}color={C.blue}icon="card-outline"onPress={()=>go('cards')}badge={s.cards.filter(c=>c.active).length}/>
      <HomeCard title="Faturalar"value={money(unpaid.reduce((a,b)=>a+b.amount,0))}sub={`${unpaid.length} FATURA BEKLİYOR`}color={C.purple}icon="receipt-outline"onPress={()=>go('bills')}badge={unpaid.length}/>
      <HomeCard title="Sabit Giderler"value={money(fixed.reduce((a,f)=>a+f.amount,0))}sub={`${fixed.length} DÜZENLİ ÖDEME`}color={C.green}icon="calendar-outline"onPress={()=>go('fixed')}/>
      <HomeCard title="Hatırlatmalar"value={`${alarms(s).length}`}sub="ÖDEME VE TARİH UYARILARI"color={C.orange}icon="notifications-outline"onPress={()=>go('reminders')}badge={alarms(s).length}/>
    </View>


    <View style={styles.panel}><View style={styles.panelTitleRow}><View style={styles.bestTitle}><SectionIcon name="list-outline"color={C.muted}size={14}/><Text style={styles.panelTitle}>SON İŞLEMLER</Text></View></View>
      {recent.length===0?<Text style={styles.empty}>HENÜZ İŞLEM YOK</Text>:recent.map(t=><View key={t.id}style={styles.txRow}><SectionIcon name={t.type==='income'?'arrow-down-outline':'arrow-up-outline'}color={t.type==='income'?C.green:C.red}size={14}/><View style={{flex:1}}><Text style={styles.rowTitle}>{U(t.note||t.category)}</Text><Text style={styles.rowSub}>{t.date} · {U(t.sourceOrPerson||t.category)}</Text></View><Text style={[styles.amount,{color:t.type==='income'?C.green:C.red}]}>{t.type==='income'?'+':'-'}{money(t.amount)}</Text></View>)}
    </View>
  </ScrollView>
}

function IncomeScreen({s,setS,back,add,edit}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;add:()=>void;edit:(t:Transaction)=>void}){
  const list=[...s.transactions.filter(t=>t.type==='income'&&t.date.startsWith(s.selectedMonth))].sort((a,b)=>b.date.localeCompare(a.date));
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="GELİR"back={back}actions={<Btn label="GELİR EKLE"icon="add-circle-outline"kind="primary"onPress={add}/>}/>{list.length===0?<View style={styles.panel}><Text style={styles.empty}>BU AY GELİR KAYDI YOK</Text></View>:list.map(t=><View key={t.id}style={styles.record}><Pressable style={styles.recordTap}onPress={()=>edit(t)}><View style={styles.recordRow}><SectionIcon name="cash-outline"color={C.yellow}size={15}/><View style={styles.recordMain}><Text style={styles.rowTitle}>{U(t.note||t.category)}</Text><Text style={styles.rowSub}>{t.date} · {U(t.sourceOrPerson||'KAYNAK BELİRTİLMEDİ')}</Text></View><Text style={[styles.amount,{color:C.green}]}>+{money(t.amount)}</Text><I name="chevron-forward"size={14}color={C.muted}/></View></Pressable><RowActions edit={()=>edit(t)}del={()=>confirmDelete(t.note||t.category,()=>setS({...s,transactions:s.transactions.filter(x=>x.id!==t.id)}))}/></View>)}</ScrollView>
}

function ExpenseScreen({s,setS,back,addExpense,addAllowance,edit}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;addExpense:()=>void;addAllowance:()=>void;edit:(t:Transaction)=>void}){
  const[mode,setMode]=useState<'expense'|'allowance'>('expense');
  const list=[...s.transactions.filter(t=>t.date.startsWith(s.selectedMonth)&&(mode==='allowance'?t.type==='allowance':t.type==='expense'||t.type==='card_expense'))].sort((a,b)=>b.date.localeCompare(a.date));
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="GİDER"back={back}/><View style={styles.segment}><Choice label="GİDERLER"on={mode==='expense'}press={()=>setMode('expense')}/><Choice label="HARÇLIKLAR"on={mode==='allowance'}press={()=>setMode('allowance')}/></View><View style={styles.topAction}>{mode==='expense'?<Btn label="GİDER EKLE"icon="add-circle-outline"kind="primary"onPress={addExpense}/>:<Btn label="HARÇLIK EKLE"icon="add-circle-outline"kind="primary"onPress={addAllowance}/>}</View>
  {list.length===0?<View style={styles.panel}><Text style={styles.empty}>{mode==='expense'?'BU AY GİDER KAYDI YOK':'BU AY HARÇLIK KAYDI YOK'}</Text></View>:list.map(t=><View key={t.id}style={styles.record}><Pressable style={styles.recordTap}onPress={()=>edit(t)}><View style={styles.recordRow}><SectionIcon name={t.type==='card_expense'?'card-outline':t.type==='allowance'?'person-outline':'wallet-outline'}color={C.red}size={15}/><View style={styles.recordMain}><Text style={styles.rowTitle}>{U(t.note||t.category)}</Text><Text style={styles.rowSub}>{t.date} · {U(t.sourceOrPerson||t.category)}{t.paymentMethod?` · ${U(t.paymentMethod==='cash'?'NAKİT':t.paymentMethod==='bank'?'BANKA':'KART')}`:''}</Text>{t.attachment?<View style={styles.attachedLine}><I name="attach-outline"size={12}color={C.green}/><Text style={styles.attachOk}>BELGE EKLİ</Text></View>:null}</View><Text style={[styles.amount,{color:C.red}]}>-{money(t.amount)}</Text><I name="chevron-forward"size={14}color={C.muted}/></View></Pressable><RowActions edit={()=>edit(t)}del={()=>confirmDelete(t.note||t.category,()=>setS({...s,transactions:s.transactions.filter(x=>x.id!==t.id)}))}/></View>)}</ScrollView>
}

function Cards({s,setS,back,addCard,editCard,addSpend,editSpend}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;addCard:()=>void;editCard:(c:CreditCard)=>void;addSpend:(c?:CreditCard)=>void;editSpend:(t:Transaction)=>void}){
  const cm=s.selectedMonth,best=bestCard(s.cards);
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="KREDİ KARTLARI"back={back}/><View style={styles.dualTop}><Btn label="KART EKLE"icon="add-circle-outline"kind="primary"onPress={addCard}/><Btn label="HARCAMA EKLE"icon="receipt-outline"onPress={()=>addSpend()}/></View>
  {best&&<View style={styles.bestCardBox}><View style={styles.bestTitle}><SectionIcon name="sparkles-outline"color={C.yellow}size={14}/><Text style={styles.panelTitle}>BUGÜN İÇİN ÖNERİLEN KART</Text></View><Text style={styles.best}>{U(best.c.bank)} · {U(best.c.name)}</Text><Text style={styles.rowSub}>TAHMİNİ SON ÖDEME {best.due} · YAKLAŞIK {best.days} GÜN ÖDEME SÜRESİ</Text></View>}
  {s.cards.length===0?<View style={styles.panel}><Text style={styles.empty}>KART EKLENMEDİ</Text></View>:s.cards.map(c=>{const spends=s.transactions.filter(t=>t.type==='card_expense'&&t.cardId===c.id&&t.date.startsWith(cm)),spend=spends.reduce((a,t)=>a+t.amount,0),paid=(c.paidMonths||[]).includes(cm);return<View key={c.id}style={styles.creditCard}><Pressable style={styles.cardTap}onPress={()=>editCard(c)}><View style={styles.cardHeader}><View style={styles.cardNameLine}><SectionIcon name="card-outline"color={C.blue}size={17}/><View><Text style={styles.cardBank}>{U(c.bank)}</Text><Text style={styles.cardName}>{U(c.name)}</Text></View></View><Text style={[styles.cardActive,{color:c.active?C.green:C.muted}]}>{c.active?'AKTİF':'PASİF'}</Text></View><Text style={styles.cardDigits}>{c.last4?`•••• ${c.last4}`:'SON 4 HANE YOK'}{c.holder?` · ${U(c.holder)}`:''}</Text><View style={styles.cardStats}><View><Text style={styles.statLabel}>BU AY HARCAMA</Text><Text style={styles.statValue}>{money(spend)}</Text></View><View><Text style={styles.statLabel}>EKSTRE KESİM</Text><Text style={styles.statValue}>{c.statementDay}. GÜN</Text></View><View><Text style={styles.statLabel}>SON ÖDEME</Text><Text style={styles.statValue}>{c.dueDay}. GÜN</Text></View></View><View style={styles.tapHint}><Text style={styles.tapHintText}>KART DETAYI / DÜZENLE</Text><I name="chevron-forward"size={13}color={C.muted}/></View></Pressable><View style={styles.cardButtons}><Btn label="HARCAMA EKLE"icon="add-outline"kind="primary"onPress={()=>addSpend(c)}/><Btn label={paid?'ÖDEMEYİ GERİ AL':'BU AY ÖDENDİ'}icon={paid?'arrow-undo-outline':'checkmark-circle-outline'}onPress={()=>setS({...s,cards:s.cards.map(x=>x.id===c.id?{...x,paidMonths:paid?(x.paidMonths||[]).filter(m=>m!==cm):[...(x.paidMonths||[]),cm]}:x)})}/></View>
  {spends.length>0&&<View style={styles.cardSpendList}>{spends.slice(-3).reverse().map(t=><Pressable key={t.id}style={styles.smallSpend}onPress={()=>editSpend(t)}><View style={{flex:1}}><Text style={styles.smallSpendTitle}>{U(t.note||t.category)}</Text><Text style={styles.smallSpendSub}>{t.date}{t.statementKey?` · EKSTRE ${t.statementKey}`:''}</Text></View><Text style={styles.smallSpendAmt}>{money(t.amount)}</Text><I name="chevron-forward"size={13}color={C.muted}/></Pressable>)}</View>}
  <RowActions edit={()=>editCard(c)}del={()=>confirmDelete(`${c.bank} ${c.name}`,()=>setS({...s,cards:s.cards.filter(x=>x.id!==c.id),transactions:s.transactions.filter(t=>t.cardId!==c.id)}))}/></View>})}</ScrollView>
}

function billIcon(title:string){
  const x=U(title);
  if(x.includes('ELEKTR'))return['flash-outline','#F6C84B'] as const;
  if(x.includes('SU'))return['water-outline','#4BB4FF'] as const;
  if(x.includes('DOĞAL')||x.includes('GAZ'))return['flame-outline','#FF8A4B'] as const;
  if(x.includes('İNTERNET')||x.includes('WIFI'))return['wifi-outline','#57D9B0'] as const;
  if(x.includes('TELEFON'))return['call-outline','#6AB2FF'] as const;
  return['receipt-outline',C.purple] as const;
}
function Bills({s,setS,back,add,edit}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;add:()=>void;edit:(b:Bill)=>void}){
  const list=[...s.bills].sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="FATURALAR"back={back}actions={<Btn label="FATURA EKLE"icon="add-circle-outline"kind="primary"onPress={add}/>}/>{list.length===0?<View style={styles.panel}><Text style={styles.empty}>FATURA EKLENMEDİ</Text></View>:list.map(b=>{const[ic,col]=billIcon(b.title);return<View key={b.id}style={[styles.record,b.paid&&{opacity:.58}]}><Pressable style={styles.recordTap}onPress={()=>edit(b)}><View style={styles.recordRow}><SectionIcon name={ic}color={col}size={14}/><View style={styles.recordMain}><Text style={styles.rowTitle}>{U(b.title)}{b.owner?` · ${U(b.owner)}`:''}</Text><Text style={styles.rowSub}>SON ÖDEME {b.dueDate} · {b.paid?'ÖDENDİ':'BEKLİYOR'}</Text><Text style={styles.rowSub}>{U(b.paymentMethod==='cash'?'NAKİT':b.paymentMethod==='card'?'KART':'BANKA')}</Text>{b.attachment?<View style={styles.attachedLine}><I name="attach-outline"size={11}color={C.green}/><Text style={styles.attachOk}>FATURA FOTOĞRAFI EKLİ</Text></View>:null}</View><Text style={[styles.amount,{color:b.paid?C.muted:C.red}]}>{money(b.amount)}</Text><I name="chevron-forward"size={14}color={C.muted}/></View></Pressable><View style={styles.payLine}><Btn label={b.paid?'ÖDEMEYİ GERİ AL':'ÖDENDİ'}icon={b.paid?'arrow-undo-outline':'checkmark-circle-outline'}onPress={()=>setS({...s,bills:s.bills.map(x=>x.id===b.id?{...x,paid:!x.paid}:x)})}/></View><RowActions edit={()=>edit(b)}del={()=>confirmDelete(b.title,()=>setS({...s,bills:s.bills.filter(x=>x.id!==b.id)}))}/></View>})}</ScrollView>
}
function Fixed({s,setS,back,add,edit}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;add:()=>void;edit:(f:FixedExpense)=>void}){
  const m=s.selectedMonth,list=s.fixedExpenses.filter(f=>f.startMonth<=m&&(f.mode==='from_now'||f.startMonth===m));
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="SABİT GİDERLER"back={back}actions={<Btn label="SABİT GİDER EKLE"icon="add-circle-outline"kind="primary"onPress={add}/>}/>{list.length===0?<View style={styles.panel}><Text style={styles.empty}>SABİT GİDER EKLENMEDİ</Text></View>:list.map(f=>{const paid=(f.paidMonths||[]).includes(m);return<View key={f.id}style={[styles.record,paid&&{opacity:.6}]}><Pressable style={styles.recordTap}onPress={()=>edit(f)}><View style={styles.recordRow}><SectionIcon name="calendar-outline"color={C.green}size={14}/><View style={styles.recordMain}><Text style={styles.rowTitle}>{U(f.title)}</Text><Text style={styles.rowSub}>{f.dayOfMonth}. GÜN · {f.mode==='from_now'?'BU AYDAN İTİBAREN':'SADECE BU AY'} · {paid?'ÖDENDİ':'BEKLİYOR'}</Text></View><Text style={styles.amount}>{money(f.amount)}</Text><I name="chevron-forward"size={14}color={C.muted}/></View></Pressable><View style={styles.payLine}><Btn label={paid?'GERİ AL':'ÖDENDİ'}icon={paid?'arrow-undo-outline':'checkmark-circle-outline'}onPress={()=>setS({...s,fixedExpenses:s.fixedExpenses.map(x=>x.id===f.id?{...x,paidMonths:paid?(x.paidMonths||[]).filter(mm=>mm!==m):[...(x.paidMonths||[]),m]}:x)})}/></View><RowActions edit={()=>edit(f)}del={()=>confirmDelete(f.title,()=>setS({...s,fixedExpenses:s.fixedExpenses.filter(x=>x.id!==f.id)}))}/></View>})}</ScrollView>
}
function Reminders({s,setS,back,add,edit}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;add:()=>void;edit:(r:Reminder)=>void}){
  const al=alarms(s);
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="HATIRLATMALAR"back={back}actions={<Btn label="HATIRLATMA EKLE"icon="add-circle-outline"kind="primary"onPress={add}/>}/><View style={styles.panel}><View style={styles.panelTitleRow}><View style={styles.bestTitle}><SectionIcon name="notifications-outline"color={C.orange}size={14}/><Text style={styles.panelTitle}>ÖDEME ALARMLARI</Text></View></View><Text style={styles.rowSub}>SON TARİHTEN {s.alarmDaysBefore} GÜN ÖNCE BAŞLAR. TARİH GEÇERSE ÖDENENE KADAR GECİKMİŞ OLARAK KALIR.</Text>{al.length===0?<Text style={styles.empty}>AKTİF ALARM YOK</Text>:al.map(x=><View key={x.id}style={styles.alarmRow}><SectionIcon name={x.late?'alert-circle-outline':'time-outline'}color={x.late?C.red:C.orange}size={13}/><View style={{flex:1}}><Text style={styles.rowTitle}>{x.title}</Text><Text style={styles.rowSub}>{x.date}</Text></View><Text style={[styles.alarmStatus,{color:x.late?C.red:C.orange}]}>{x.status}</Text></View>)}</View><Text style={styles.sectionLabel}>ÖZEL HATIRLATMALAR</Text>{s.reminders.length===0?<View style={styles.panel}><Text style={styles.empty}>ÖZEL HATIRLATMA YOK</Text></View>:s.reminders.map(r=><View key={r.id}style={[styles.record,r.done&&{opacity:.55}]}><Pressable style={styles.recordTap}onPress={()=>edit(r)}><View style={styles.recordRow}><SectionIcon name="alarm-outline"color={C.orange}size={14}/><View style={styles.recordMain}><Text style={styles.rowTitle}>{U(r.title)}</Text><Text style={styles.rowSub}>{r.date} · {r.done?'TAMAMLANDI':'AKTİF'}</Text></View><I name="chevron-forward"size={14}color={C.muted}/></View></Pressable><View style={styles.payLine}><Btn label={r.done?'GERİ AL':'TAMAM'}icon={r.done?'arrow-undo-outline':'checkmark-outline'}onPress={()=>setS({...s,reminders:s.reminders.map(x=>x.id===r.id?{...x,done:!x.done}:x)})}/></View><RowActions edit={()=>edit(r)}del={()=>confirmDelete(r.title,()=>setS({...s,reminders:s.reminders.filter(x=>x.id!==r.id)}))}/></View>)}</ScrollView>
}
function PaymentsHub({s,go,back}:{s:HaneState;go:(x:Screen)=>void;back:()=>void}){
  const unpaid=s.bills.filter(b=>!b.paid),fixed=activeFixedForMonth(s,s.selectedMonth),al=alarms(s);
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="ÖDEMELER"back={back}/><View style={styles.payHub}>
    <Pressable style={styles.payHubCard}onPress={()=>go('bills')}><SectionIcon name="receipt-outline"color={C.purple}size={18}/><View style={{flex:1}}><Text style={styles.payHubTitle}>FATURALAR</Text><Text style={styles.payHubSub}>{unpaid.length} BEKLEYEN · {money(unpaid.reduce((a,b)=>a+b.amount,0))}</Text></View><I name="chevron-forward"size={16}color={C.muted}/></Pressable>
    <Pressable style={styles.payHubCard}onPress={()=>go('fixed')}><SectionIcon name="calendar-outline"color={C.green}size={18}/><View style={{flex:1}}><Text style={styles.payHubTitle}>SABİT GİDERLER</Text><Text style={styles.payHubSub}>{fixed.length} DÜZENLİ ÖDEME</Text></View><I name="chevron-forward"size={16}color={C.muted}/></Pressable>
    <Pressable style={styles.payHubCard}onPress={()=>go('reminders')}><SectionIcon name="notifications-outline"color={C.orange}size={18}/><View style={{flex:1}}><Text style={styles.payHubTitle}>HATIRLATMALAR</Text><Text style={styles.payHubSub}>{al.length} AKTİF UYARI</Text></View><I name="chevron-forward"size={16}color={C.muted}/></Pressable>
  </View></ScrollView>
}

type Point={label:string;start:string;end:string;income:number;expense:number};
function analysisSeries(s:HaneState,range:Range):Point[]{
  const selected=s.selectedMonth;
  const[y,m]=selected.split('-').map(Number);
  const monthEnd=new Date(y,m,0);
  const currentMonth=todayISO().slice(0,7)===selected;
  const anchor=currentMonth?parse(todayISO()):monthEnd;
  const pts:Point[]=[];
  if(range==='day'){
    for(let i=6;i>=0;i--){const d=new Date(anchor);d.setDate(d.getDate()-i);const k=iso(d),t=periodTotals(s,k,k);pts.push({label:String(d.getDate()),start:k,end:k,income:t.income,expense:t.expense});}
  }else if(range==='week'){
    for(let i=5;i>=0;i--){const end=new Date(anchor);end.setDate(end.getDate()-i*7);const start=new Date(end);start.setDate(start.getDate()-6);const a=iso(start),b=iso(end),t=periodTotals(s,a,b);pts.push({label:`H${6-i}`,start:a,end:b,income:t.income,expense:t.expense});}
  }else if(range==='month'){
    for(let i=5;i>=0;i--){const mm=shiftMonth(selected,-i),[yy,mo]=mm.split('-').map(Number),a=`${mm}-01`,b=`${mm}-${pad(dim(yy,mo))}`,t=periodTotals(s,a,b);pts.push({label:monthLabel(mm).split(' ')[0].slice(0,3),start:a,end:b,income:t.income,expense:t.expense});}
  }else{
    const sy=y;
    for(let i=4;i>=0;i--){const yy=sy-i,a=`${yy}-01-01`,b=`${yy}-12-31`,t=periodTotals(s,a,b);pts.push({label:String(yy),start:a,end:b,income:t.income,expense:t.expense});}
  }
  return pts;
}
function GroupChart({points}:{points:Point[]}){
  const max=Math.max(...points.flatMap(p=>[p.income,p.expense]),1),W=340,H=185,base=135,slot=W/points.length,bw=Math.min(16,slot*.24);
  return<View style={styles.chartWrap}><View style={styles.chartLegend}><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:C.yellow}]}/><Text style={styles.chartLegendText}>GELİR</Text></View><View style={styles.legendItem}><View style={[styles.legendDot,{backgroundColor:C.red}]}/><Text style={styles.chartLegendText}>GİDER</Text></View></View><Svg width="100%"height={H}viewBox={`0 0 ${W} ${H}`}>{points.map((p,i)=>{const cx=slot*i+slot/2,ih=p.income/max*112,eh=p.expense/max*112;return<React.Fragment key={i}><Rect x={cx-bw-2}y={base-ih}width={bw}height={ih}rx="4"fill={C.yellow}/><Rect x={cx+2}y={base-eh}width={bw}height={eh}rx="4"fill={C.red}/></React.Fragment>})}</Svg><View style={styles.chartLabels}>{points.map((p,i)=><Text key={i}style={styles.chartLabel}>{U(p.label)}</Text>)}</View></View>
}
function Analysis({s,back}:{s:HaneState;back:()=>void}){
  const[range,setRange]=useState<Range>('month'),points=useMemo(()=>analysisSeries(s,range),[s,range]);
  const total=points.reduce((a,p)=>({income:a.income+p.income,expense:a.expense+p.expense}),{income:0,expense:0});
  const a=points[0]?.start??`${s.selectedMonth}-01`,b=points[points.length-1]?.end??todayISO();
  const cats=useMemo(()=>{const z:Record<string,number>={};s.transactions.filter(t=>t.type!=='income'&&between(t.date,a,b)).forEach(t=>z[t.category]=(z[t.category]||0)+t.amount);s.bills.filter(x=>x.paid&&between(x.dueDate,a,b)).forEach(x=>z['FATURALAR']=(z['FATURALAR']||0)+x.amount);return Object.entries(z).sort((x,y)=>y[1]-x[1]).slice(0,7)},[s,a,b]);
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="ANALİZ"back={back}/><View style={styles.rangeRow}>{(['day','week','month','year']as Range[]).map(r=><Pressable key={r}onPress={()=>setRange(r)}style={[styles.rangeBtn,range===r&&styles.rangeBtnOn]}><Text style={[styles.rangeText,range===r&&styles.rangeTextOn]}>{r==='day'?'GÜN':r==='week'?'HAFTA':r==='month'?'AY':'YIL'}</Text></Pressable>)}</View><View style={styles.kpis}><View style={styles.kpi}><Text style={styles.kpiLabel}>GELİR</Text><Text style={[styles.kpiValue,{color:C.yellow}]}>{money(total.income)}</Text></View><View style={styles.kpi}><Text style={styles.kpiLabel}>GİDER</Text><Text style={[styles.kpiValue,{color:C.red}]}>{money(total.expense)}</Text></View><View style={styles.kpi}><Text style={styles.kpiLabel}>KALAN</Text><Text style={[styles.kpiValue,{color:total.income-total.expense>=0?C.green:C.red}]}>{money(total.income-total.expense)}</Text></View></View><View style={styles.panel}><View style={styles.bestTitle}><SectionIcon name="bar-chart-outline"color={C.blue}size={15}/><Text style={styles.panelTitle}>{range==='day'?'SON 7 GÜN':range==='week'?'SON 6 HAFTA':range==='month'?'SON 6 AY':'SON 5 YIL'} GELİR / GİDER</Text></View><GroupChart points={points}/></View><View style={styles.panel}><View style={styles.bestTitle}><SectionIcon name="pie-chart-outline"color={C.purple}size={15}/><Text style={styles.panelTitle}>GİDER DAĞILIMI</Text></View>{cats.length===0?<Text style={styles.empty}>SEÇİLEN DÖNEMDE GİDER YOK</Text>:cats.map(([k,v])=><View key={k}style={styles.analysisRow}><Text style={styles.rowTitle}>{U(k)}</Text><View style={styles.catRight}><View style={styles.catTrack}><View style={[styles.catFill,{width:`${Math.max(5,Math.min(100,v/Math.max(...cats.map(x=>x[1]))*100))}%`}]}/></View><Text style={styles.amount}>{money(v)}</Text></View></View>)}</View></ScrollView>
}
function PinLock({setup,onUnlock}:{setup:boolean;onUnlock:(pin:string)=>void}){
  const[pin,setPin]=useState(''),[first,setFirst]=useState(''),[step,setStep]=useState(setup?'create':'unlock'),[error,setError]=useState('');
  useEffect(()=>{setPin('');setFirst('');setError('');setStep(setup?'create':'unlock')},[setup]);
  const tap=async(n:string)=>{
    if(pin.length>=4)return;
    const next=pin+n;setPin(next);setError('');
    if(next.length!==4)return;
    if(step==='unlock'){
      if(await verifyPin(next)){setPin('');onUnlock(next)}else{setTimeout(()=>setPin(''),180);setError('PIN HATALI')}
    }else if(step==='create'){
      setFirst(next);setPin('');setStep('confirm');
    }else{
      if(next===first){await savePin(next);setPin('');onUnlock(next)}else{setPin('');setFirst('');setStep('create');setError('PINLER EŞLEŞMEDİ · TEKRAR DENE')}
    }
  };
  const title=step==='unlock'?'HANE KİLİTLİ':step==='create'?'4 HANELİ PIN OLUŞTUR':'PINİ TEKRAR GİR';
  const sub=step==='unlock'?'DEVAM ETMEK İÇİN PINİNİ GİR':step==='create'?'FİNANS VERİLERİNİ KORUMAK İÇİN':'AYNI 4 HANELİ PINİ DOĞRULA';
  return<SafeAreaView style={styles.pinSafe}><StatusBar barStyle="light-content"backgroundColor={C.bg}/><View style={styles.pinWrap}><View style={styles.pinShield}><I name="lock-closed-outline"size={26}color={C.yellow}/></View><Text style={styles.pinLogo}>H A N E</Text><Text style={styles.pinTitle}>{title}</Text><Text style={styles.pinSub}>{sub}</Text><View style={styles.pinDots}>{[0,1,2,3].map(i=><View key={i}style={[styles.pinDot,pin.length>i&&styles.pinDotOn]}/>)}</View>{!!error&&<Text style={styles.pinError}>{error}</Text>}<View style={styles.pinPad}>{['1','2','3','4','5','6','7','8','9','','0','back'].map((n,i)=>n===''?<View key={i}style={styles.pinKey}/>:<Pressable key={i}style={styles.pinKey}onPress={()=>n==='back'?setPin(x=>x.slice(0,-1)):tap(n)}>{n==='back'?<I name="backspace-outline"size={22}color={C.muted}/>:<Text style={styles.pinKeyText}>{n}</Text>}</Pressable>)}</View><Text style={styles.pinFoot}>PIN YALNIZCA BU CİHAZDA SAKLANIR.</Text></View></SafeAreaView>
}

function Settings({s,setS,back,onLock,sessionPin,onSessionPin}:{s:HaneState;setS:(x:HaneState)=>void;back:()=>void;onLock:()=>void;sessionPin:string;onSessionPin:(pin:string)=>void}){
  const[pinEnabled,setPinEnabled]=useState(false),[pinAction,setPinAction]=useState<'none'|'change-old'|'change-new'|'change-confirm'|'disable'>('none'),[pinValue,setPinValue]=useState(''),[newPin,setNewPin]=useState(''),[oldPin,setOldPin]=useState(''),[pinMsg,setPinMsg]=useState('');
  useEffect(()=>{hasPin().then(setPinEnabled)},[]);
  const safe=async(fn:()=>Promise<void>,ok:string)=>{try{await fn();Alert.alert('HANE',ok)}catch(e:any){Alert.alert('HATA',U(e?.message||'İŞLEM BAŞARISIZ'))}};
  const restore=async()=>{try{if(!sessionPin)throw new Error('PIN OTURUMU BULUNAMADI · UYGULAMAYI KİLİTLEYİP TEKRAR AÇ');const raw=await pickBackupText();if(!raw)return;const d=await decryptBackup(raw,sessionPin);if(![4,5].includes(d.version))throw new Error('YEDEK SÜRÜMÜ UYUMLU DEĞİL');if(d.scope==='month'){const m=d.month;setS({...s,selectedMonth:m,transactions:[...s.transactions.filter(t=>!t.date.startsWith(m)),...(d.transactions||[])],bills:[...s.bills.filter(x=>!x.dueDate.startsWith(m)),...(d.bills||[])],cards:d.cards||s.cards,fixedExpenses:d.fixedExpenses||s.fixedExpenses,reminders:[...s.reminders.filter(r=>!r.date.startsWith(m)),...(d.reminders||[])]});}else setS({...d,version:5});Alert.alert('HANE','ŞİFRELİ YEDEK GERİ YÜKLENDİ')}catch(e:any){Alert.alert('HATA',U(e?.message||'YEDEK OKUNAMADI'))}};
  const resetPinFlow=()=>{setPinAction('none');setPinValue('');setNewPin('');setOldPin('');setPinMsg('')};
  const pinSubmit=async()=>{
    if(!/^\d{4}$/.test(pinValue)){setPinMsg('4 HANELİ PIN GİR');return}
    if(pinAction==='change-old'){
      if(!await verifyPin(pinValue)){setPinValue('');setPinMsg('MEVCUT PIN HATALI');return}
      setOldPin(pinValue);setPinAction('change-new');setPinValue('');setPinMsg('YENİ PINİ GİR');return;
    }
    if(pinAction==='change-new'){setNewPin(pinValue);setPinValue('');setPinAction('change-confirm');setPinMsg('YENİ PINİ TEKRAR GİR');return}
    if(pinAction==='change-confirm'){
      if(pinValue!==newPin){setPinValue('');setNewPin('');setPinAction('change-new');setPinMsg('PINLER EŞLEŞMEDİ · YENİDEN GİR');return}
      await rekeyState(s,pinValue);await savePin(pinValue);onSessionPin(pinValue);setPinEnabled(true);resetPinFlow();Alert.alert('HANE','PIN GÜNCELLENDİ · VERİLER YENİ PINLE ŞİFRELENDİ');return;
    }
    if(pinAction==='disable'){
      if(!await verifyPin(pinValue)){setPinValue('');setPinMsg('PIN HATALI');return}
      await disableStateEncryption(s);await removePin();setPinEnabled(false);resetPinFlow();Alert.alert('HANE','PIN KİLİDİ KAPATILDI · YEREL ŞİFRELEME DE KAPATILDI');
    }
  };
  const startPin=()=>{resetPinFlow();setPinAction(pinEnabled?'change-old':'change-new');setPinMsg(pinEnabled?'MEVCUT PINİ GİR':'YENİ 4 HANELİ PINİ GİR')};
  return<ScrollView contentContainerStyle={styles.scroll}><PageHead title="AYARLAR"back={back}/>
    <View style={styles.privacy}><View style={styles.bestTitle}><SectionIcon name="shield-checkmark-outline"color={C.green}size={15}/><Text style={styles.privacyTitle}>VERİLERİN SENDE</Text></View><Text style={styles.rowSub}>HANE FİNANS VERİLERİNİ KENDİ SUNUCUSUNA GÖNDERMEZ. YEDEKLEMEYİ SEN BAŞLATIRSIN.</Text></View>
    <View style={styles.panel}><View style={styles.bestTitle}><SectionIcon name="lock-closed-outline"color={C.yellow}size={15}/><Text style={styles.panelTitle}>GÜVENLİK</Text></View><Text style={styles.rowSub}>4 HANELİ PIN KİLİDİ · {pinEnabled?'AÇIK':'KAPALI'}</Text>{pinAction==='none'?<><Btn label={pinEnabled?'PINİ DEĞİŞTİR':'PIN OLUŞTUR'}icon="key-outline"kind="primary"onPress={startPin}/>{pinEnabled&&<><Btn label="HANE'Yİ ŞİMDİ KİLİTLE"icon="lock-closed-outline"onPress={onLock}/><Btn label="PIN KİLİDİNİ KAPAT"icon="lock-open-outline"kind="danger"onPress={()=>{resetPinFlow();setPinAction('disable');setPinMsg('KAPATMAK İÇİN MEVCUT PINİ GİR')}}/></>}</>:<View style={styles.pinInline}><Text style={styles.note}>{pinMsg}</Text><TextInput value={pinValue}onChangeText={x=>setPinValue(x.replace(/\D/g,'').slice(0,4))}keyboardType="number-pad"secureTextEntry maxLength={4}placeholder="••••"placeholderTextColor="#64686E"style={styles.pinInput}/><View style={styles.dualTop}><Btn label="VAZGEÇ"icon="close-outline"onPress={resetPinFlow}/><Btn label="DEVAM"icon="checkmark-outline"kind="primary"onPress={pinSubmit}/></View></View>}<Text style={styles.note}>PWA'DA FİNANS VERİLERİ PIN'DEN TÜRETİLEN ANAHTARLA AES-256-GCM ŞİFRELİ SAKLANIR. PIN SHA-256 ÖZETİ OLARAK TUTULUR. PIN KİLİDİNİ KAPATMAK YEREL VERİ ŞİFRELEMESİNİ DE KAPATIR.</Text></View>
    <View style={styles.panel}><View style={styles.bestTitle}><SectionIcon name="notifications-outline"color={C.orange}size={15}/><Text style={styles.panelTitle}>ÖDEME ALARMI</Text></View><Text style={styles.rowSub}>UYGULAMA İÇİ UYARILAR {s.remindersEnabled?'AÇIK':'KAPALI'}</Text><Btn label={s.remindersEnabled?'ALARMLARI KAPAT':'ALARMLARI AÇ'}icon="notifications-outline"onPress={()=>setS({...s,remindersEnabled:!s.remindersEnabled})}/><Text style={styles.fieldLabel}>KAÇ GÜN ÖNCE UYARSIN?</Text><View style={styles.choiceRow}>{[1,3,7].map(n=><Choice key={n}label={`${n} GÜN`}on={s.alarmDaysBefore===n}press={()=>setS({...s,alarmDaysBefore:n})}/>)}</View><Text style={styles.note}>ÜCRETSİZ WEB/PWA TESTİNDE UYARILAR HANE AÇILDIĞINDA GÖRÜNÜR. NATIVE IOS SÜRÜMÜNDE CİHAZ İÇİ YEREL BİLDİRİM OLARAK ÇALIŞACAK.</Text></View>
    <View style={styles.panel}><View style={styles.bestTitle}><SectionIcon name="archive-outline"color={C.yellow}size={15}/><Text style={styles.panelTitle}>YEDEKLEME</Text></View><Btn label="BU AYI ŞİFRELİ YEDEKLE"icon="download-outline"kind="primary"onPress={()=>safe(()=>exportMonthBackup(s,sessionPin),'ŞİFRELİ AYLIK YEDEK HAZIR')}/><Btn label="TÜM VERİLERİ ŞİFRELİ YEDEKLE"icon="archive-outline"onPress={()=>safe(()=>exportAllBackup(s,sessionPin),'ŞİFRELİ TÜM YEDEK HAZIR')}/><Btn label="BU AYI CSV AKTAR"icon="document-text-outline"onPress={()=>safe(()=>exportMonthCsv(s),'CSV HAZIR')}/><Btn label="ŞİFRELİ YEDEKTEN GERİ YÜKLE"icon="cloud-upload-outline"onPress={restore}/></View>
    <View style={styles.panel}><Btn label="TÜM YEREL VERİLERİ SİL"icon="trash-outline"kind="danger"onPress={()=>confirmDelete('TÜM HANE VERİLERİ',async()=>{await clearLocalState();setS(emptyState())})}/></View><Text style={styles.version}>HANE V0.5.5 · AES-256-GCM · DOKUN-DÜZENLE · OFFLINE PWA</Text></ScrollView>
}

function TxModal({show,type,s,initial,preCard,close,save}:{show:boolean;type:TxType;s:HaneState;initial?:Transaction|null;preCard?:CreditCard|null;close:()=>void;save:(x:Transaction)=>void}){
  const[amount,setAmount]=useState(''),[cat,setCat]=useState(''),[note,setNote]=useState(''),[date,setDate]=useState(todayISO()),[person,setPerson]=useState(''),[method,setMethod]=useState<PaymentMethod>('cash'),[card,setCard]=useState(''),[att,setAtt]=useState<Attachment|undefined>();
  useEffect(()=>{if(show){setAmount(initial?String(initial.amount):'');setCat(initial?.category||(type==='income'?'MAAŞ':type==='allowance'?'HARÇLIK':'MARKET'));setNote(initial?.note||'');setDate(initial?.date||todayISO());setPerson(initial?.sourceOrPerson||'');setMethod(initial?.paymentMethod||(type==='card_expense'?'card':'cash'));setCard(initial?.cardId||preCard?.id||'');setAtt(initial?.attachment)}},[show,initial,type,preCard]);
  const commit=()=>{const n=Number(amount.replace(',','.'));if(!n)return Alert.alert('HANE','TUTAR GİR');let cid=(type==='card_expense'||method==='card')?card:undefined;if((type==='card_expense'||method==='card')&&!cid)return Alert.alert('HANE','KART SEÇ');const c=s.cards.find(x=>x.id===cid);save({id:initial?.id||uid(),type,amount:n,category:cat,note:note||cat,date,sourceOrPerson:person,paymentMethod:type==='income'?undefined:(type==='card_expense'?'card':method),cardId:cid,statementKey:c?statementKeyFor(date,c):undefined,attachment:att});close()};
  return<ModalShell show={show}title={initial?'KAYDI DÜZENLE':type==='income'?'GELİR EKLE':type==='allowance'?'HARÇLIK EKLE':type==='card_expense'?'KART HARCAMASI EKLE':'GİDER EKLE'}close={close}><Field label="TUTAR"value={amount}set={setAmount}keyboardType="decimal-pad"/><Field label="KATEGORİ"value={cat}set={setCat}/><Field label="AÇIKLAMA"value={note}set={setNote}/><Field label={type==='income'?'KİMDEN / KAYNAK':type==='allowance'?'KİME VERİLDİ':'KİŞİ / NOT'}value={person}set={setPerson}/><Field label="TARİH (YYYY-AA-GG)"value={date}set={setDate}/>{type!=='income'&&type!=='allowance'&&<><Text style={styles.fieldLabel}>ÖDEME YÖNTEMİ</Text><View style={styles.choiceRow}><Choice label="NAKİT"on={method==='cash'}press={()=>setMethod('cash')}/><Choice label="BANKA"on={method==='bank'}press={()=>setMethod('bank')}/><Choice label="KART"on={method==='card'}press={()=>setMethod('card')}/></View></>}{(type==='card_expense'||method==='card')&&<><Text style={styles.fieldLabel}>KART SEÇ</Text>{s.cards.filter(c=>c.active).map(c=><Choice key={c.id}label={`${c.bank} ${c.name}`}on={card===c.id}press={()=>setCard(c.id)}/>)}</>}{type==='card_expense'&&<AttachmentBox a={att}onCamera={async()=>setAtt((await pickAttachment('camera'))||att)}onGallery={async()=>setAtt((await pickAttachment('gallery'))||att)}onRemove={()=>setAtt(undefined)}/>}<Btn label="KAYDET"icon="checkmark-circle-outline"kind="primary"onPress={commit}/></ModalShell>
}
function CardModal({show,initial,close,save}:{show:boolean;initial?:CreditCard|null;close:()=>void;save:(x:CreditCard)=>void}){
  const[bank,setBank]=useState(''),[name,setName]=useState(''),[holder,setHolder]=useState(''),[last4,setLast4]=useState(''),[cut,setCut]=useState('1'),[due,setDue]=useState('10'),[active,setActive]=useState(true);
  useEffect(()=>{if(show){setBank(initial?.bank||'');setName(initial?.name||'');setHolder(initial?.holder||'');setLast4(initial?.last4||'');setCut(String(initial?.statementDay||1));setDue(String(initial?.dueDay||10));setActive(initial?.active??true)}},[show,initial]);
  return<ModalShell show={show}title={initial?'KARTI DÜZENLE':'KART EKLE'}close={close}><Field label="BANKA"value={bank}set={setBank}/><Field label="KART ADI"value={name}set={setName}/><Field label="KART KİMDE?"value={holder}set={setHolder}/><Field label="SON 4 HANE"value={last4}set={setLast4}keyboardType="number-pad"/><Field label="EKSTRE KESİM GÜNÜ"value={cut}set={setCut}keyboardType="number-pad"/><Field label="SON ÖDEME GÜNÜ"value={due}set={setDue}keyboardType="number-pad"/><Text style={styles.fieldLabel}>KART DURUMU</Text><View style={styles.choiceRow}><Choice label="AKTİF"on={active}press={()=>setActive(true)}/><Choice label="PASİF"on={!active}press={()=>setActive(false)}/></View><Btn label="KAYDET"icon="checkmark-circle-outline"kind="primary"onPress={()=>{if(!bank||!name)return Alert.alert('HANE','BANKA VE KART ADI GİR');save({id:initial?.id||uid(),bank,name,holder,last4:last4.slice(-4),statementDay:Math.max(1,Math.min(31,Number(cut)||1)),dueDay:Math.max(1,Math.min(31,Number(due)||10)),active,paidMonths:initial?.paidMonths||[]});close()}}/></ModalShell>
}
function BillModal({show,s,initial,close,save}:{show:boolean;s:HaneState;initial?:Bill|null;close:()=>void;save:(x:Bill)=>void}){
  const[title,setTitle]=useState(''),[amount,setAmount]=useState(''),[date,setDate]=useState(todayISO()),[owner,setOwner]=useState(''),[method,setMethod]=useState<PaymentMethod>('bank'),[card,setCard]=useState(''),[att,setAtt]=useState<Attachment|undefined>();
  useEffect(()=>{if(show){setTitle(initial?.title||'');setAmount(initial?String(initial.amount):'');setDate(initial?.dueDate||todayISO());setOwner(initial?.owner||'');setMethod(initial?.paymentMethod||'bank');setCard(initial?.cardId||'');setAtt(initial?.attachment)}},[show,initial]);
  return<ModalShell show={show}title={initial?'FATURAYI DÜZENLE':'FATURA EKLE'}close={close}><Field label="FATURA ADI"value={title}set={setTitle}/><Field label="TUTAR"value={amount}set={setAmount}keyboardType="decimal-pad"/><Field label="KİME AİT?"value={owner}set={setOwner}/><Field label="SON ÖDEME TARİHİ"value={date}set={setDate}/><Text style={styles.fieldLabel}>ÖDEME YÖNTEMİ</Text><View style={styles.choiceRow}><Choice label="NAKİT"on={method==='cash'}press={()=>setMethod('cash')}/><Choice label="BANKA"on={method==='bank'}press={()=>setMethod('bank')}/><Choice label="KART"on={method==='card'}press={()=>setMethod('card')}/></View>{method==='card'&&s.cards.filter(c=>c.active).map(c=><Choice key={c.id}label={`${c.bank} ${c.name}`}on={card===c.id}press={()=>setCard(c.id)}/>)}<AttachmentBox a={att}onCamera={async()=>setAtt((await pickAttachment('camera'))||att)}onGallery={async()=>setAtt((await pickAttachment('gallery'))||att)}onRemove={()=>setAtt(undefined)}/><Btn label="KAYDET"icon="checkmark-circle-outline"kind="primary"onPress={()=>{const n=Number(amount.replace(',','.'));if(!title||!n)return Alert.alert('HANE','FATURA ADI VE TUTAR GİR');save({id:initial?.id||uid(),title,amount:n,dueDate:date,paid:initial?.paid||false,owner,paymentMethod:method,cardId:method==='card'?card:undefined,attachment:att});close()}}/></ModalShell>
}
function FixedModal({show,month,initial,close,save}:{show:boolean;month:string;initial?:FixedExpense|null;close:()=>void;save:(x:FixedExpense)=>void}){
  const[title,setTitle]=useState(''),[amount,setAmount]=useState(''),[day,setDay]=useState('1'),[mode,setMode]=useState<'this_month'|'from_now'>('from_now'),[active,setActive]=useState(true);
  useEffect(()=>{if(show){setTitle(initial?.title||'');setAmount(initial?String(initial.amount):'');setDay(String(initial?.dayOfMonth||1));setMode(initial?.mode||'from_now');setActive(initial?.active??true)}},[show,initial]);
  return<ModalShell show={show}title={initial?'SABİT GİDERİ DÜZENLE':'SABİT GİDER EKLE'}close={close}><Field label="ADI"value={title}set={setTitle}/><Field label="TUTAR"value={amount}set={setAmount}keyboardType="decimal-pad"/><Field label="ÖDEME GÜNÜ"value={day}set={setDay}keyboardType="number-pad"/><Text style={styles.fieldLabel}>AYA TAŞIMA</Text><Choice label="SADECE BU AY"on={mode==='this_month'}press={()=>setMode('this_month')}/><Choice label="BU AYDAN İTİBAREN"on={mode==='from_now'}press={()=>setMode('from_now')}/><Text style={styles.fieldLabel}>DURUM</Text><View style={styles.choiceRow}><Choice label="AKTİF"on={active}press={()=>setActive(true)}/><Choice label="PASİF"on={!active}press={()=>setActive(false)}/></View><Btn label="KAYDET"icon="checkmark-circle-outline"kind="primary"onPress={()=>{const n=Number(amount.replace(',','.'));if(!title||!n)return Alert.alert('HANE','ADI VE TUTAR GİR');save({id:initial?.id||uid(),title,amount:n,dayOfMonth:Math.max(1,Math.min(31,Number(day)||1)),active,startMonth:initial?.startMonth||month,mode,paidMonths:initial?.paidMonths||[]});close()}}/></ModalShell>
}
function ReminderModal({show,initial,close,save}:{show:boolean;initial?:Reminder|null;close:()=>void;save:(x:Reminder)=>void}){
  const[title,setTitle]=useState(''),[date,setDate]=useState(todayISO());useEffect(()=>{if(show){setTitle(initial?.title||'');setDate(initial?.date||todayISO())}},[show,initial]);
  return<ModalShell show={show}title={initial?'HATIRLATMAYI DÜZENLE':'HATIRLATMA EKLE'}close={close}><Field label="HATIRLATMA"value={title}set={setTitle}/><Field label="TARİH"value={date}set={setDate}/><Btn label="KAYDET"icon="checkmark-circle-outline"kind="primary"onPress={()=>{if(!title)return;save({id:initial?.id||uid(),title,date,kind:'custom',done:initial?.done||false});close()}}/></ModalShell>
}

export default function App(){
  const[s,setRaw]=useState<HaneState>(emptyState()),[loaded,setLoaded]=useState(false),[screen,setScreen]=useState<Screen>('home');
  const[securityReady,setSecurityReady]=useState(false),[pinSetup,setPinSetup]=useState(false),[locked,setLocked]=useState(true),[sessionPin,setSessionPin]=useState('');
  const[txOpen,setTxOpen]=useState(false),[txType,setTxType]=useState<TxType>('expense'),[editTx,setEditTx]=useState<Transaction|null>(null),[preCard,setPreCard]=useState<CreditCard|null>(null);
  const[cardOpen,setCardOpen]=useState(false),[editCard,setEditCard]=useState<CreditCard|null>(null);
  const[billOpen,setBillOpen]=useState(false),[editBill,setEditBill]=useState<Bill|null>(null);
  const[fixedOpen,setFixedOpen]=useState(false),[editFixed,setEditFixed]=useState<FixedExpense|null>(null);
  const[remOpen,setRemOpen]=useState(false),[editRem,setEditRem]=useState<Reminder|null>(null);
  const alarmShown=useRef(false);

  useEffect(()=>{getPinMode().then(async mode=>{setPinSetup(mode==='new');setLocked(mode!=='disabled');if(mode==='disabled'){setRaw(await loadState());setLoaded(true)}setSecurityReady(true)})},[]);
  useEffect(()=>{if(Platform.OS!=='web'||!securityReady)return;const fn=()=>{if(document.visibilityState==='hidden')hasPin().then(ok=>{if(ok){clearActiveEncryptionKey();setSessionPin('');setLocked(true)}})};document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[securityReady]);
  const setS=(x:HaneState)=>{setRaw(x);persistState(x).catch(()=>{})};
  useEffect(()=>{if(loaded&&!alarmShown.current){const a=alarms(s).filter(x=>x.late);if(a.length){alarmShown.current=true;Alert.alert('HANE ÖDEME UYARISI',`${a.length} GECİKMİŞ / BUGÜN ÖDENECEK KAYIT VAR. HATIRLATMALAR BÖLÜMÜNÜ KONTROL ET.`)}}},[loaded,s]);

  if(!securityReady)return<SafeAreaView style={styles.safe}><View style={styles.loading}><Text style={styles.logo}>H A N E</Text></View></SafeAreaView>;
  if(locked)return<PinLock setup={pinSetup}onUnlock={async (pin:string)=>{try{const x=await unlockState(pin);setRaw(x);setLoaded(true);setPinSetup(false);setSessionPin(pin);setLocked(false)}catch{Alert.alert('HANE','ŞİFRELİ VERİ AÇILAMADI. PINİ KONTROL ET.')}}}/>;
  if(!loaded)return<SafeAreaView style={styles.safe}><View style={styles.loading}><Text style={styles.logo}>H A N E</Text></View></SafeAreaView>;
  const back=()=>setScreen('home');
  const openNewTx=(t:TxType,c?:CreditCard)=>{setEditTx(null);setTxType(t);setPreCard(c||null);setTxOpen(true)};
  const openEditTx=(t:Transaction)=>{setEditTx(t);setTxType(t.type);setPreCard(null);setTxOpen(true)};

  return<SafeAreaView style={styles.safe}><StatusBar barStyle="light-content"backgroundColor={C.bg}/>
    <View style={styles.header}><View><Text style={styles.logo}>H A N E</Text><Text style={styles.brandSub}>MALİ ÖZGÜRLÜĞE DAHA YAKIN</Text></View><View style={styles.headerIcons}><Pressable style={styles.headerBtn}onPress={()=>setScreen('reminders')}><I name="notifications-outline"size={18}/>{alarms(s).length>0&&<View style={styles.redDot}/>}</Pressable><Pressable style={styles.headerBtn}onPress={()=>setScreen('settings')}><I name="settings-outline"size={18}/></Pressable></View></View>
    <View style={styles.body}>
      {screen==='home'&&<Home s={s}setS={setS}go={setScreen}/>}
      {screen==='income'&&<IncomeScreen s={s}setS={setS}back={back}add={()=>openNewTx('income')}edit={openEditTx}/>}
      {screen==='expense'&&<ExpenseScreen s={s}setS={setS}back={back}addExpense={()=>openNewTx('expense')}addAllowance={()=>openNewTx('allowance')}edit={openEditTx}/>}
      {screen==='cards'&&<Cards s={s}setS={setS}back={back}addCard={()=>{setEditCard(null);setCardOpen(true)}}editCard={c=>{setEditCard(c);setCardOpen(true)}}addSpend={c=>openNewTx('card_expense',c)}editSpend={openEditTx}/>}
      {screen==='payments'&&<PaymentsHub s={s}go={setScreen}back={back}/>}
      {screen==='bills'&&<Bills s={s}setS={setS}back={back}add={()=>{setEditBill(null);setBillOpen(true)}}edit={b=>{setEditBill(b);setBillOpen(true)}}/>}
      {screen==='fixed'&&<Fixed s={s}setS={setS}back={back}add={()=>{setEditFixed(null);setFixedOpen(true)}}edit={f=>{setEditFixed(f);setFixedOpen(true)}}/>}
      {screen==='reminders'&&<Reminders s={s}setS={setS}back={back}add={()=>{setEditRem(null);setRemOpen(true)}}edit={r=>{setEditRem(r);setRemOpen(true)}}/>}
      {screen==='analysis'&&<Analysis s={s}back={back}/>}
      {screen==='settings'&&<Settings s={s}setS={setS}back={back}sessionPin={sessionPin}onSessionPin={setSessionPin}onLock={()=>{clearActiveEncryptionKey();setSessionPin('');setLocked(true)}}/>}
    </View>
    <View style={styles.nav}>
      {[
        ['home','home-outline','ANA SAYFA'],
        ['cards','card-outline','KARTLAR'],
        ['payments','receipt-outline','ÖDEMELER'],
        ['analysis','bar-chart-outline','ANALİZ'],
        ['settings','settings-outline','AYARLAR']
      ].map(([id,ic,lb])=><Pressable key={id}style={[styles.navItem,screen===id&&styles.navActive]}onPress={()=>setScreen(id as Screen)}><I name={ic as any}size={18}color={screen===id?C.yellow:'#9EA4AC'}/><Text style={[styles.navText,screen===id&&{color:C.yellow}]}>{lb}</Text></Pressable>)}
    </View>

    <TxModal show={txOpen}type={txType}s={s}initial={editTx}preCard={preCard}close={()=>{setTxOpen(false);setEditTx(null);setPreCard(null)}}save={x=>setS({...s,transactions:editTx?s.transactions.map(t=>t.id===x.id?x:t):[...s.transactions,x]})}/>
    <CardModal show={cardOpen}initial={editCard}close={()=>{setCardOpen(false);setEditCard(null)}}save={x=>setS({...s,cards:editCard?s.cards.map(c=>c.id===x.id?x:c):[...s.cards,x]})}/>
    <BillModal show={billOpen}s={s}initial={editBill}close={()=>{setBillOpen(false);setEditBill(null)}}save={x=>setS({...s,bills:editBill?s.bills.map(b=>b.id===x.id?x:b):[...s.bills,x]})}/>
    <FixedModal show={fixedOpen}month={s.selectedMonth}initial={editFixed}close={()=>{setFixedOpen(false);setEditFixed(null)}}save={x=>setS({...s,fixedExpenses:editFixed?s.fixedExpenses.map(f=>f.id===x.id?x:f):[...s.fixedExpenses,x]})}/>
    <ReminderModal show={remOpen}initial={editRem}close={()=>{setRemOpen(false);setEditRem(null)}}save={x=>setS({...s,reminders:editRem?s.reminders.map(r=>r.id===x.id?x:r):[...s.reminders,x]})}/>
  </SafeAreaView>
}

const styles=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},
  body:{flex:1,backgroundColor:C.bg},
  loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:C.bg},

  header:{height:76,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#020304',borderBottomWidth:1,borderBottomColor:'#17191B'},
  logo:{color:C.text,fontSize:23,fontWeight:'800',letterSpacing:6},
  brandSub:{color:'#A3A7AE',fontSize:9,marginTop:3,letterSpacing:.4},
  headerIcons:{flexDirection:'row',gap:8},
  headerBtn:{width:36,height:36,borderRadius:18,backgroundColor:'#090B0D',borderWidth:1,borderColor:'#292B2E',alignItems:'center',justifyContent:'center'},
  redDot:{position:'absolute',right:2,top:2,width:8,height:8,borderRadius:4,backgroundColor:C.yellow,borderWidth:1,borderColor:'#2B2416'},

  scroll:{padding:12,paddingBottom:96},

  hero:{backgroundColor:'#080A0C',borderWidth:1,borderColor:'#343332',borderRadius:25,padding:12,shadowColor:'#000',shadowOpacity:.5,shadowRadius:14,shadowOffset:{width:0,height:8}},
  monthNav:{flexDirection:'row',justifyContent:'flex-end',alignItems:'center',gap:4},
  monthBtn:{width:27,height:27,borderRadius:14,backgroundColor:'#111315',borderWidth:1,borderColor:'#313337',alignItems:'center',justifyContent:'center'},
  monthText:{color:C.text,fontSize:11,fontWeight:'800',paddingHorizontal:6},
  heroMain:{flexDirection:'row',alignItems:'center'},
  ring:{width:162,height:162,alignItems:'center',justifyContent:'center'},
  ringCenter:{position:'absolute',alignItems:'center'},
  ringSmall:{color:'#B0B2B7',fontSize:8,fontWeight:'700'},
  ringMoney:{fontSize:19,fontWeight:'900',marginVertical:3},
  heroNums:{flex:1,gap:5},
  heroNum:{borderBottomWidth:1,borderBottomColor:'#232527',paddingBottom:5},
  numTitle:{flexDirection:'row',alignItems:'center',gap:5},
  tinyDot:{width:7,height:7,borderRadius:4},
  numLabel:{color:'#E8E6E0',fontSize:9,fontWeight:'800'},
  numMoney:{color:C.text,fontSize:14,fontWeight:'900',marginTop:1},
  compareRow:{flexDirection:'row',alignItems:'center',gap:2,marginTop:2},
  compareText:{fontSize:7.2,fontWeight:'800'},
  compareNeutral:{color:'#7F858C',fontSize:7.2,fontWeight:'700',marginTop:2},
  heroNote:{color:'#9A9EA4',textAlign:'center',fontSize:8.2,marginTop:4},

  grid:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:9},
  homeCard:{width:'49%',minHeight:90,backgroundColor:'#090B0D',borderWidth:1,borderColor:'#2A2D30',borderRadius:18,padding:10,shadowColor:'#000',shadowOpacity:.28,shadowRadius:9,shadowOffset:{width:0,height:5}},
  homeTop:{flexDirection:'row',alignItems:'center'},
  sectionIcon:{width:29,height:29,borderRadius:9,alignItems:'center',justifyContent:'center',marginRight:7,borderWidth:1,borderColor:'#343536'},
  homeTitle:{color:'#F2F0EA',fontSize:11,fontWeight:'900',flex:1},
  homeValue:{color:C.text,fontSize:16,fontWeight:'900',marginTop:5},
  homeSub:{color:'#969BA2',fontSize:8,marginTop:2,lineHeight:11},
  badge:{minWidth:17,height:17,borderRadius:9,backgroundColor:C.red,alignItems:'center',justifyContent:'center',marginRight:3},
  badgeText:{color:'#fff',fontSize:9,fontWeight:'900'},

  panel:{backgroundColor:'#080A0C',borderWidth:1,borderColor:'#2C2F31',borderRadius:18,padding:11,marginTop:9},
  bestCardBox:{backgroundColor:'#0B0B09',borderWidth:1,borderColor:'#4A4028',borderRadius:18,padding:11,marginTop:9},
  bestTitle:{flexDirection:'row',alignItems:'center'},
  panelTitleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  panelTitle:{color:C.text,fontSize:12,fontWeight:'900'},
  best:{color:C.yellow,fontSize:15,fontWeight:'900',marginTop:5},

  txRow:{flexDirection:'row',alignItems:'center',paddingVertical:8,borderTopWidth:1,borderTopColor:'#242628'},
  rowTitle:{color:'#F1EFE9',fontSize:10.5,fontWeight:'800'},
  rowSub:{color:'#969BA2',fontSize:8.5,marginTop:3,lineHeight:12},
  amount:{color:C.text,fontSize:11.5,fontWeight:'900'},
  empty:{color:'#8C9299',fontSize:9.5,paddingVertical:10},

  pageHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:10},
  pageLeft:{flexDirection:'row',alignItems:'center',flex:1},
  backBtn:{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:'#0B0D0F',borderWidth:1,borderColor:'#2D3033',marginRight:7},
  pageTitle:{color:C.text,fontSize:18,fontWeight:'900',letterSpacing:.2},

  record:{backgroundColor:'#080A0C',borderWidth:1,borderColor:'#2A2D30',borderRadius:16,padding:10,marginBottom:7},
  recordRow:{flexDirection:'row',alignItems:'center',gap:7},
  recordTap:{borderRadius:12,paddingVertical:2},
  recordMain:{flex:1},
  rowActions:{flexDirection:'row',justifyContent:'flex-end',gap:13,marginTop:7,borderTopWidth:1,borderTopColor:'#242628',paddingTop:7},
  actionMini:{flexDirection:'row',alignItems:'center',gap:3},
  actionText:{fontSize:8.5,fontWeight:'900'},
  attachedLine:{flexDirection:'row',alignItems:'center',gap:2,marginTop:4},
  attachOk:{color:C.green,fontSize:8.5,fontWeight:'800'},
  payLine:{alignSelf:'flex-end',marginTop:5},

  btn:{borderRadius:10,paddingHorizontal:8,paddingVertical:7,alignItems:'center',justifyContent:'center',marginTop:3,minHeight:32,flexDirection:'row',gap:4},
  btnPrimary:{backgroundColor:C.yellow,borderWidth:1,borderColor:'#F0CE79'},
  btnSecondary:{backgroundColor:'#0C0E10',borderWidth:1,borderColor:'#34373A'},
  btnDanger:{backgroundColor:'#1A0B0E',borderWidth:1,borderColor:'#5E2832'},
  btnText:{color:C.text,fontSize:8.2,fontWeight:'900'},

  segment:{flexDirection:'row',gap:6,marginBottom:8},
  topAction:{alignSelf:'flex-start',marginBottom:8},
  choiceRow:{flexDirection:'row',gap:5,flexWrap:'wrap'},
  choice:{backgroundColor:'#0C0E10',borderWidth:1,borderColor:'#34373A',borderRadius:10,paddingHorizontal:10,paddingVertical:8,marginTop:4},
  choiceOn:{backgroundColor:'#251E0E',borderColor:'#8D7134'},
  choiceText:{color:'#969BA2',fontSize:9,fontWeight:'800'},
  choiceTextOn:{color:'#F5D98F'},

  dualTop:{flexDirection:'row',gap:6,marginBottom:9},
  creditCard:{borderRadius:19,padding:12,marginBottom:8,borderWidth:1,borderColor:'#403B30',backgroundColor:'#090B0D',shadowColor:'#000',shadowOpacity:.32,shadowRadius:10,shadowOffset:{width:0,height:6}},
  cardTap:{borderRadius:14,padding:2},
  cardHeader:{flexDirection:'row',justifyContent:'space-between'},
  cardNameLine:{flexDirection:'row',alignItems:'center'},
  cardBank:{color:'#B9B6AF',fontSize:9.5,fontWeight:'800'},
  cardName:{color:C.text,fontSize:15,fontWeight:'900',marginTop:2},
  cardActive:{fontSize:8.5,fontWeight:'900'},
  cardDigits:{color:'#969BA2',fontSize:9.5,marginTop:9},
  cardStats:{flexDirection:'row',justifyContent:'space-between',marginTop:11},
  statLabel:{color:'#858A90',fontSize:7},
  statValue:{color:C.text,fontSize:9.5,fontWeight:'900',marginTop:2},
  cardButtons:{flexDirection:'row',gap:5,marginTop:6},
  cardSpendList:{marginTop:8,borderTopWidth:1,borderTopColor:'#2A2C2E',paddingTop:5},
  smallSpend:{flexDirection:'row',alignItems:'center',gap:6,paddingVertical:5},
  smallSpendTitle:{color:C.text,fontSize:8.7,fontWeight:'800'},
  smallSpendSub:{color:'#888D94',fontSize:7.5,marginTop:2},
  smallSpendAmt:{color:C.red,fontSize:9,fontWeight:'900'},
  tapHint:{flexDirection:'row',alignItems:'center',justifyContent:'flex-end',gap:4,marginTop:8},
  tapHintText:{color:'#7F858C',fontSize:7.5,fontWeight:'800'},

  alarmRow:{flexDirection:'row',alignItems:'center',paddingVertical:8,borderTopWidth:1,borderTopColor:'#2B2526'},
  alarmStatus:{fontSize:8,fontWeight:'900',textAlign:'right'},
  sectionLabel:{color:'#8C9197',fontSize:9,fontWeight:'900',marginTop:12,marginBottom:6},

  payHub:{gap:8},
  payHubCard:{backgroundColor:'#080A0C',borderWidth:1,borderColor:'#2A2D30',borderRadius:18,padding:12,flexDirection:'row',alignItems:'center'},
  payHubTitle:{color:C.text,fontSize:12,fontWeight:'900'},
  payHubSub:{color:'#969BA2',fontSize:8.5,marginTop:3},

  rangeRow:{flexDirection:'row',gap:5,marginBottom:9},
  rangeBtn:{flex:1,backgroundColor:'#0C0E10',borderWidth:1,borderColor:'#34373A',borderRadius:11,paddingVertical:9,alignItems:'center'},
  rangeBtnOn:{backgroundColor:'#251E0E',borderColor:'#8D7134'},
  rangeText:{color:'#969BA2',fontSize:9,fontWeight:'800'},
  rangeTextOn:{color:'#F2D279'},

  kpis:{flexDirection:'row',gap:5},
  kpi:{flex:1,backgroundColor:'#080A0C',borderWidth:1,borderColor:'#2A2D30',borderRadius:13,padding:8},
  kpiLabel:{color:'#898E95',fontSize:7.5,fontWeight:'800'},
  kpiValue:{fontSize:11.5,fontWeight:'900',marginTop:4},

  chartWrap:{marginTop:5},
  chartLegend:{flexDirection:'row',justifyContent:'flex-end',gap:10},
  legendItem:{flexDirection:'row',alignItems:'center',gap:4},
  legendDot:{width:7,height:7,borderRadius:4},
  chartLegendText:{color:'#92979E',fontSize:7.5,fontWeight:'800'},
  chartLabels:{flexDirection:'row',justifyContent:'space-around',marginTop:-38,paddingHorizontal:12},
  chartLabel:{color:'#92979E',fontSize:7.5,fontWeight:'800'},
  analysisRow:{paddingVertical:8,borderTopWidth:1,borderTopColor:'#242628'},
  catRight:{flexDirection:'row',alignItems:'center',gap:8,marginTop:5},
  catTrack:{height:5,backgroundColor:'#222426',borderRadius:3,flex:1},
  catFill:{height:5,backgroundColor:C.yellow,borderRadius:3},

  privacy:{backgroundColor:'#090B0D',borderWidth:1,borderColor:'#4A4028',borderRadius:17,padding:11},
  privacyTitle:{color:C.yellow,fontSize:12,fontWeight:'900'},
  note:{color:'#D9B45B',fontSize:8.2,lineHeight:12,marginTop:8,fontWeight:'800'},
  version:{textAlign:'center',color:'#696E74',fontSize:7.5,marginTop:10},

  fieldLabel:{color:'#B8B5AF',fontSize:8.5,marginTop:9,marginBottom:4,fontWeight:'800'},
  input:{backgroundColor:'#090B0D',color:C.text,borderWidth:1,borderColor:'#35383A',borderRadius:11,paddingHorizontal:10,paddingVertical:9,fontSize:11.5,textTransform:'uppercase'},
  attachBox:{marginTop:5},
  attachActions:{gap:4},
  preview:{width:'100%',height:145,borderRadius:12,marginTop:4,resizeMode:'cover'},

  modalBack:{flex:1,backgroundColor:'#000000CC',justifyContent:'flex-end'},
  sheet:{backgroundColor:'#050607',borderTopLeftRadius:24,borderTopRightRadius:24,borderWidth:1,borderColor:'#333638',padding:15,paddingBottom:30},
  sheetHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:7},
  sheetTitle:{color:C.text,fontSize:16,fontWeight:'900'},
  closeBtn:{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:'#0C0E10',borderWidth:1,borderColor:'#303336'},

  nav:{height:70,position:'absolute',bottom:0,left:0,right:0,backgroundColor:'#030405F2',borderTopWidth:1,borderTopColor:'#27292B',flexDirection:'row',paddingHorizontal:3,paddingTop:5,paddingBottom:7},
  navItem:{flex:1,alignItems:'center',justifyContent:'center',borderRadius:11},
  navActive:{backgroundColor:'#201A0D',borderWidth:1,borderColor:'#5B4820'},
  navText:{color:'#989DA5',fontSize:7.5,marginTop:3,fontWeight:'800'},
  pinSafe:{flex:1,backgroundColor:C.bg},
  pinWrap:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:30,paddingBottom:20},
  pinShield:{width:58,height:58,borderRadius:29,backgroundColor:'#141006',borderWidth:1,borderColor:'#5A461E',alignItems:'center',justifyContent:'center',marginBottom:18},
  pinLogo:{color:C.text,fontSize:25,fontWeight:'900',letterSpacing:7,marginBottom:28},
  pinTitle:{color:C.text,fontSize:17,fontWeight:'900',textAlign:'center'},
  pinSub:{color:'#969BA2',fontSize:8.5,fontWeight:'700',marginTop:7,textAlign:'center'},
  pinDots:{flexDirection:'row',gap:13,marginTop:24,marginBottom:8},
  pinDot:{width:12,height:12,borderRadius:6,borderWidth:1,borderColor:'#4A4D50',backgroundColor:'#0A0B0C'},
  pinDotOn:{backgroundColor:C.yellow,borderColor:'#E5C673'},
  pinError:{color:C.red,fontSize:9,fontWeight:'900',height:20,marginTop:5},
  pinPad:{width:260,flexDirection:'row',flexWrap:'wrap',justifyContent:'center',marginTop:7},
  pinKey:{width:78,height:62,margin:3,borderRadius:18,alignItems:'center',justifyContent:'center'},
  pinKeyText:{color:C.text,fontSize:24,fontWeight:'700'},
  pinFoot:{color:'#666B71',fontSize:7.5,fontWeight:'700',marginTop:18},
  pinInline:{marginTop:8},
  pinInput:{backgroundColor:'#090B0D',color:C.text,borderWidth:1,borderColor:'#5B4820',borderRadius:12,padding:10,fontSize:18,textAlign:'center',letterSpacing:12,marginTop:7},
});
