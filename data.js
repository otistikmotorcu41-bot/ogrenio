(function(root){
"use strict";
const up=s=>s.toLocaleUpperCase("tr"), low=s=>s.toLocaleLowerCase("tr");
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const sample=(a,n)=>shuffle(a).slice(0,n);
const ALPHABET="abcçdefgğhıijklmnoöprsştuüvyz".split("");

const RAW=[
["el-ma","🍎"],["ar-mut","🍐"],["muz","🍌"],["ü-züm","🍇"],["ki-raz","🍒"],["çi-lek","🍓"],["kar-puz","🍉"],["por-ta-kal","🍊"],
["li-mon","🍋"],["ha-vuç","🥕"],["do-ma-tes","🍅"],["pa-ta-tes","🥔"],["ek-mek","🍞"],["pey-nir","🧀"],["süt","🥛"],["yu-mur-ta","🥚"],
["don-dur-ma","🍦"],["pas-ta","🎂"],["ke-di","🐱"],["kö-pek","🐶"],["as-lan","🦁"],["fil","🐘"],["tav-şan","🐰"],["kuş","🐦"],
["ba-lık","🐟"],["a-rı","🐝"],["i-nek","🐄"],["at","🐴"],["ko-yun","🐑"],["ta-vuk","🐔"],["kur-ba-ğa","🐸"],["ke-le-bek","🦋"],
["ör-dek","🦆"],["fa-re","🐭"],["kap-lan","🐯"],["may-mun","🐵"],["zü-ra-fa","🦒"],["a-yı","🐻"],["a-ra-ba","🚗"],["u-çak","✈️"],
["ge-mi","🚢"],["tren","🚂"],["kam-yon","🚚"],["bi-sik-let","🚲"],["ki-tap","📚"],["ka-lem","✏️"],["çan-ta","🎒"],["top","⚽"],
["ba-lon","🎈"],["ev","🏠"],["o-kul","🏫"],["ka-pı","🚪"],["a-nah-tar","🔑"],["ya-tak","🛏️"],["sa-at","⌚"],["te-le-fon","📱"],
["göz-lük","👓"],["şap-ka","🎩"],["el-bi-se","👗"],["a-yak-ka-bı","👟"],["çi-çek","🌸"],["a-ğaç","🌳"],["or-man","🌲"],["gü-neş","☀️"],
["ay","🌙"],["yıl-dız","⭐"],["bu-lut","☁️"],["yağ-mur","🌧️"],["kar","❄️"],["de-niz","🌊"],["dağ","⛰️"],["şem-si-ye","☂️"],
["ı-şık","💡"],["mum","🕯️"],["ka-şık","🥄"],["diş","🦷"],["kalp","❤️"],["re-sim","🖼️"],["he-li-kop-ter","🚁"],["kap-lum-ba-ğa","🐢"],["bil-gi-sa-yar","💻"],["te-le-viz-yon","📺"],["çi-ko-la-ta","🍫"],["ma-ka-ra-na","🍝"],["o-to-büs","🚌"],["ro-ket","🚀"],["til-ki","🦊"]
];
const WORDS=RAW.map(([s,e])=>({w:s.replace(/-/g,""),e,syl:s.split("-")}));

function uniq(arr){return [...new Set(arr)];}
function letterDistractors(L,c,n){
  const near=shuffle(c.letters.filter(x=>x!==L)).slice(0,n);
  const pool=shuffle(ALPHABET.filter(x=>x!==L&&!near.includes(x)));
  while(near.length<n)near.push(pool.pop());
  return near;
}
function numOpts(ans,lo,hi){
  lo=lo||0;hi=Math.max(hi||10,ans+3);
  const s=new Set([ans]);let g=0;
  while(s.size<4&&g++<60){const v=ans+pick([-3,-2,-1,1,2,3]);if(v>=lo&&v<=hi)s.add(v);}
  let k=lo;while(s.size<4)s.add(k++);
  return shuffle([...s].map(String));
}
function lettersWithWords(c){
  const f=c.letters.filter(l=>WORDS.some(w=>w.w[0]===l));
  return f.length?f:ALPHABET.filter(l=>WORDS.some(w=>w.w[0]===l));
}

/* ---------- OKUMA / YAZMA ---------- */
function gLetterHear(c){
  const L=pick(c.letters),upper=Math.random()<.5,f=upper?up:low,ans=f(L);
  return {cat:"reading",kind:"choice",prompt:"Duyduğun harfi bul!",speak:up(L)+" harfi. Hangisi?",pic:"🔊",
    options:shuffle([ans,...letterDistractors(L,c,3).map(f)]),answer:ans,optStyle:"letter"};
}
function gCase(c){
  const L=pick(c.letters),toLow=Math.random()<.5;
  const f=toLow?low:up,from=toLow?up:low;
  const ans=f(L);
  return {cat:"reading",kind:"choice",prompt:toLow?"Büyük harfin küçüğünü bul!":"Küçük harfin büyüğünü bul!",speak:toLow?"Büyük harfin küçüğünü bul":"Küçük harfin büyüğünü bul",
    big:from(L),options:shuffle([ans,...letterDistractors(L,c,3).map(f)]),answer:ans,optStyle:"letter"};
}
function gLetterWord(c){
  const L=pick(lettersWithWords(c));
  const good=pick(WORDS.filter(w=>w.w[0]===L));
  const bad=sample(WORDS.filter(w=>w.w[0]!==L),3);
  return {cat:"reading",kind:"choice",prompt:"Hangi resim “"+up(L)+"” harfiyle başlıyor?",speak:"Hangi resim "+up(L)+" harfiyle başlıyor?",
    big:up(L)+" "+L,options:shuffle([good.e,...bad.map(w=>w.e)]),answer:good.e,optStyle:"emoji",reveal:good.w};
}
function gFirstLetter(c){
  const ls=lettersWithWords(c);
  const w=pick(WORDS.filter(w=>ls.includes(w.w[0])));
  const L=w.w[0],ans=up(L);
  return {cat:"reading",kind:"choice",prompt:"Bu resim hangi harfle başlıyor?",speak:w.w+". Hangi harfle başlıyor?",pic:w.e,
    options:shuffle([ans,...letterDistractors(L,c,3).map(up)]),answer:ans,optStyle:"letter",reveal:w.w};
}
function gHasLetter(c){
  for(const L of shuffle(c.letters)){
    const withL=WORDS.filter(w=>w.w.includes(L)),without=WORDS.filter(w=>!w.w.includes(L));
    if(withL.length&&without.length>=3){
      const g=pick(withL);
      return {cat:"reading",kind:"choice",prompt:"“"+up(L)+"” harfi hangi kelimede var?",speak:up(L)+" harfi hangi kelimede var?",big:up(L),
        options:shuffle([g.w,...sample(without,3).map(w=>w.w)]),answer:g.w,optStyle:"text",reveal:g.w};
    }
  }
  return gPicWord(c);
}
function gMissing(c){
  const cand=c.words.filter(w=>w.w.length>=3);
  const w=pick(cand.length?cand:WORDS);
  const pref=[];w.w.split("").forEach((ch,i)=>{if(c.letters.includes(ch))pref.push(i);});
  const idx=pref.length?pick(pref):rnd(w.w.length);
  const ans=w.w[idx];
  const disp=w.w.split("").map((ch,i)=>i===idx?"＿":ch).join(" ");
  return {cat:"writing",kind:"choice",prompt:"Eksik harfi bul!",speak:"Eksik harfi bul. Bu resim "+w.w,pic:w.e,big:disp,
    options:shuffle([ans,...letterDistractors(ans,{letters:ALPHABET},3)]),answer:ans,optStyle:"letter",reveal:w.w};
}
function gPicWord(c){
  const w=pick(c.words);
  const bad=sample(WORDS.filter(x=>x.w!==w.w&&Math.abs(x.w.length-w.w.length)<=2),3);
  const more=sample(WORDS.filter(x=>x.w!==w.w&&!bad.includes(x)),3-bad.length);
  return {cat:"reading",kind:"choice",prompt:"Bu resmin adı nedir?",speak:"Bu resmin adı nedir?",pic:w.e,
    options:shuffle([w.w,...bad.concat(more).slice(0,3).map(x=>x.w)]),answer:w.w,optStyle:"text",reveal:w.w};
}
function gListenPick(c){
  const w=pick(c.words),bad=sample(WORDS.filter(x=>x.w!==w.w),3);
  return {cat:"listening",kind:"choice",prompt:"Dinle ve doğru resmi bul!",speak:w.w,pic:"🔊",
    options:shuffle([w.e,...bad.map(x=>x.e)]),answer:w.e,optStyle:"emoji",reveal:w.w};
}
function scramble(arr){let s=shuffle(arr),g=0;while(g++<10&&s.join("|")===arr.join("|")&&arr.length>1)s=shuffle(arr);return s;}
function gListenSpell(c){
  const w=pick(c.words.filter(x=>x.w.length<=(c.maxLen||7)).length?c.words.filter(x=>x.w.length<=(c.maxLen||7)):WORDS.filter(x=>x.w.length<=(c.maxLen||7)));
  const letters=w.w.split(""),extra=sample(ALPHABET.filter(l=>!letters.includes(l)),2);
  return {cat:"listening",kind:"build",prompt:"Dinle ve yaz!",speak:w.w,pic:w.e,tiles:scramble(letters.concat(extra)),solution:letters,join:"",reveal:w.w};
}
function gBuild(c){
  const pool=c.words.filter(x=>x.w.length<=(c.maxLen||7)&&x.w.length>=2);
  const w=pick(pool.length?pool:WORDS.filter(x=>x.w.length<=(c.maxLen||7)));
  const letters=w.w.split("");
  return {cat:"writing",kind:"build",prompt:"Harfleri sıraya dizip kelimeyi yaz!",speak:"Harfleri sıraya dizip kelimeyi yaz",pic:w.e,tiles:scramble(letters),solution:letters,join:"",reveal:w.w};
}
function gSyllableBuild(c){
  const pool=c.words.filter(x=>x.syl.length>=2),w=pick(pool.length?pool:WORDS.filter(x=>x.syl.length>=2));
  const other=pick(WORDS.filter(x=>x.w!==w.w&&x.syl.length>=2).flatMap(x=>x.syl).filter(s=>!w.syl.includes(s)));
  return {cat:"writing",kind:"build",prompt:"Heceleri birleştir!",speak:"Heceleri birleştirip kelimeyi bul",pic:w.e,tiles:scramble(w.syl.concat(other)),solution:w.syl,join:"",reveal:w.w};
}
function gSyllableCount(c){
  const w=pick(c.words);
  return {cat:"reading",kind:"choice",prompt:"Kaç hece var?",speak:w.w+". Kaç hece var? Alkışlayarak say!",pic:w.e,big:w.w,
    options:["1","2","3","4"],answer:String(w.syl.length),optStyle:"num",reveal:w.syl.join(" - ")};
}
const FILL=[
 ["Kedi ___ içer.","süt",["süt","taş","masa"]],["Ali top ___.","oynar",["oynar","uçar","yer"]],["Kuş gökte ___.","uçar",["uçar","yüzer","yer"]],
 ["Balık suda ___.","yüzer",["yüzer","uçar","koşar"]],["Ben ekmek ___.","yerim",["yerim","içerim","giderim"]],["Anne yemek ___.","yapar",["yapar","uçar","yazar"]],
 ["Ayşe kitap ___.","okur",["okur","yüzer","uçar"]],["Ben kalemle ___.","yazarım",["yazarım","koşarım","uçarım"]],["Gece gökyüzünde ___ var.","yıldız",["yıldız","balık","araba"]],
 ["Köpek havlar, kedi ___.","miyavlar",["miyavlar","uçar","yazar"]],["Ali okula ___.","gider",["gider","uçar","yüzer"]],["Arı ___ yapar.","bal",["bal","kalem","kar"]],
 ["Kış gelince ___ yağar.","kar",["kar","muz","top"]],["Ördek gölde ___.","yüzer",["yüzer","koşar","yazar"]],["Ben su ___.","içerim",["içerim","yerim","okurum"]],["Tavuk ___ yumurtlar.","her gün",["her gün","masa","çanta"]]
];
function gSentenceFill(){
  const [s,a,o]=pick(FILL);
  return {cat:"reading",kind:"choice",prompt:"Cümleyi tamamla!",speak:"Cümleyi tamamla. "+s.replace("___","…"),big:s.replace("___","＿＿＿"),
    options:shuffle(o),answer:a,optStyle:"text",reveal:s.replace("___",a)};
}
const ORDER=["Ben okula giderim.","Kedi süt içer.","Anne yemek yapar.","Kuş gökte uçar.","Ali kitap okur.","Balık suda yüzer.","Ayşe resim yapar.","Baba çay içer.","Güneş çok sıcak.","Ben elma yerim.","Köpek bahçede koşar.","Bugün hava güzel."];
function gSentenceOrder(){
  const s=pick(ORDER),words=s.split(" ");
  return {cat:"writing",kind:"build",prompt:"Kelimeleri sıraya diz, cümle kur!",speak:"Kelimeleri sıraya dizip cümle kur",pic:"🧩",tiles:scramble(words),solution:words,join:" ",reveal:s};
}
const OPP=[["büyük","küçük"],["uzun","kısa"],["sıcak","soğuk"],["açık","kapalı"],["gece","gündüz"],["yukarı","aşağı"],["ağır","hafif"],["hızlı","yavaş"],["tatlı","ekşi"],["temiz","kirli"],["ıslak","kuru"],["dolu","boş"],["iyi","kötü"],["ileri","geri"],["gülmek","ağlamak"],["ön","arka"]];
function gOpposite(){
  const p=pick(OPP),rev=Math.random()<.5,w=rev?p[1]:p[0],a=rev?p[0]:p[1];
  const bad=sample(OPP.filter(x=>x!==p).flat().filter(x=>x!==w&&x!==a),3);
  return {cat:"reading",kind:"choice",prompt:"Zıt anlamlısını bul!",speak:w+" kelimesinin zıt anlamlısını bul",big:w,options:shuffle([a,...bad]),answer:a,optStyle:"text",reveal:w+" ↔ "+a};
}
const READ=[
 ["Elif’in küçük bir kedisi var. Kedinin adı Pamuk.","Kedinin adı ne?","Pamuk",["Pamuk","Elif","Ali"]],
 ["Mert sabah okula gider. Okulda arkadaşlarıyla oynar.","Mert nereye gider?","okula",["okula","denize","ormana"]],
 ["Bahçede sarı bir çiçek var. Arı çiçeğe konar.","Çiçeğe ne konar?","arı",["arı","kuş","kedi"]],
 ["Anne pasta yaptı. Pasta çok güzel.","Anne ne yaptı?","pasta",["pasta","ekmek","çay"]],
 ["Yağmur yağıyor. Zeynep şemsiyesini açtı.","Zeynep neyi açtı?","şemsiyesini",["şemsiyesini","kapıyı","kitabı"]],
 ["Deniz kıyıda kum kale yaptı. Rüzgâr kaleyi yıktı.","Kaleyi ne yıktı?","rüzgâr",["rüzgâr","kuşlar","kedi"]],
 ["Can’ın kırmızı bir topu var. Can topla bahçede oynar.","Can ile ne oynar?","top",["top","kitap","araba"]],
 ["Ayşe sabah süt içti. Sonra okula gitti.","Ayşe ne içti?","süt",["süt","su","çay"]]
];
function gRead(){
  const [t,q,a,o]=pick(READ);
  return {cat:"reading",kind:"choice",prompt:q,speak:t+" "+q,text:t,options:shuffle(o),answer:a,optStyle:"text",reveal:a};
}

/* ---------- MATEMATİK ---------- */
const FRUIT=["🍎","⭐","🐟","🎈","🚗","🐥","🍪","🌸"];
function gAdd(c){
  const max=c.max||10,a=1+rnd(max-1),b=1+rnd(max-a),ans=a+b,e=pick(FRUIT);
  return {cat:"math",kind:"choice",prompt:"Topla!",speak:a+" artı "+b+" kaç eder?",pic:max<=10?e.repeat(a)+" ➕ "+e.repeat(b):null,big:a+" + "+b+" = ?",
    options:numOpts(ans,0,max),answer:String(ans),optStyle:"num",reveal:a+" + "+b+" = "+ans};
}
function gSub(c){
  const max=c.max||10,a=2+rnd(max-1),b=1+rnd(a-1),ans=a-b,e=pick(FRUIT);
  return {cat:"math",kind:"choice",prompt:"Çıkar!",speak:a+" eksi "+b+" kaç eder?",pic:max<=10?e.repeat(a):null,big:a+" − "+b+" = ?",
    options:numOpts(ans,0,max),answer:String(ans),optStyle:"num",reveal:a+" − "+b+" = "+ans};
}
function gCount(c){
  const max=Math.min(c.max||10,12),n=1+rnd(max),e=pick(FRUIT);
  return {cat:"math",kind:"choice",prompt:"Kaç tane var? Say bakalım!",speak:"Kaç tane var? Say bakalım!",pic:e.repeat(n),
    options:numOpts(n,0,Math.max(max,10)),answer:String(n),optStyle:"num",reveal:String(n)};
}
function gMakeTen(c){
  const T=(c.max||10)>10?20:10,a=1+rnd(T-1),ans=T-a;
  return {cat:"math",kind:"choice",prompt:T+" olması için kaç eksik?",speak:a+" ile kaç toplarsak "+T+" olur?",big:a+" + ? = "+T,
    options:numOpts(ans,0,T),answer:String(ans),optStyle:"num",reveal:a+" + "+ans+" = "+T};
}
function gCompare(c){
  const max=c.max||10;let a=rnd(max+1),b=rnd(max+1);while(a===b)b=rnd(max+1);
  const big=Math.random()<.5,ans=big?Math.max(a,b):Math.min(a,b);
  return {cat:"math",kind:"choice",prompt:big?"Hangisi daha BÜYÜK?":"Hangisi daha KÜÇÜK?",speak:big?"Hangisi daha büyük?":"Hangisi daha küçük?",
    options:[String(a),String(b)],answer:String(ans),optStyle:"num",reveal:String(ans)};
}
function gNumSeq(c){
  const max=c.max||10,step=max>10?pick([1,2]):1;
  const start=1+rnd(Math.max(1,max-4*step)),seq=[0,1,2,3,4].map(i=>start+i*step),b=1+rnd(3),ans=seq[b];
  return {cat:"math",kind:"choice",prompt:"Eksik sayıyı bul!",speak:"Eksik sayıyı bul",big:seq.map((n,i)=>i===b?"＿":n).join("  "),
    options:numOpts(ans,0,max+step),answer:String(ans),optStyle:"num",reveal:String(ans)};
}
const NW=["sıfır","bir","iki","üç","dört","beş","altı","yedi","sekiz","dokuz","on","on bir","on iki","on üç","on dört","on beş","on altı","on yedi","on sekiz","on dokuz","yirmi"];
function gNumWord(c){
  const max=Math.min(c.max||10,20),n=rnd(max+1);
  if(Math.random()<.5){
    const bad=sample(NW.slice(0,max+1).filter(x=>x!==NW[n]),3);
    return {cat:"math",kind:"choice",prompt:"Bu sayı nasıl okunur?",speak:"Bu sayı nasıl okunur?",big:String(n),options:shuffle([NW[n],...bad]),answer:NW[n],optStyle:"text",reveal:NW[n]};
  }
  return {cat:"math",kind:"choice",prompt:"Okuduğun sayıyı bul!",speak:NW[n]+". Hangi sayı?",big:NW[n],options:numOpts(n,0,max),answer:String(n),optStyle:"num",reveal:String(n)};
}
function gPattern(){
  const syms=sample(["🔴","🔵","🟡","🟢","⭐","🍎","🐟","🌸"],3),t=pick(["AB","AAB","ABC"]);
  const seq=[],L=t.length;for(let i=0;i<L*2+1;i++)seq.push(syms["ABC".indexOf(t[i%L])]);
  const ans=seq.pop();
  const opts=shuffle(uniq([ans,...syms.filter(x=>x!==ans),"🟣","🟤"]).slice(0,4));
  return {cat:"math",kind:"choice",prompt:"Sıradaki hangisi?",speak:"Örüntüde sıradaki hangisi?",pic:seq.join(" ")+" ❓",options:opts,answer:ans,optStyle:"emoji",reveal:ans};
}
const NAMES=["Ali’nin","Elif’in","Mert’in","Zeynep’in","Can’ın","Ayşe’nin"];
function gStory(c){
  const max=c.max||10,e=pick(FRUIT),n=pick(NAMES);
  if(Math.random()<.5){
    const a=1+rnd(max-1),b=1+rnd(max-a),ans=a+b;
    return {cat:"math",kind:"choice",prompt:"Problemi çöz!",speak:n+" "+a+" tane vardı. "+b+" tane daha aldı. Toplam kaç oldu?",
      text:n+" "+a+" "+e+" var. "+b+" "+e+" daha aldı. Toplam kaç "+e+" oldu?",options:numOpts(ans,0,max),answer:String(ans),optStyle:"num",reveal:String(ans)};
  }
  const a=3+rnd(max-2),b=1+rnd(a-1),ans=a-b;
  return {cat:"math",kind:"choice",prompt:"Problemi çöz!",speak:n+" "+a+" tane vardı. "+b+" tanesi gitti. Kaç tane kaldı?",
    text:n+" "+a+" "+e+" vardı. "+b+" "+e+" gitti. Kaç "+e+" kaldı?",options:numOpts(ans,0,max),answer:String(ans),optStyle:"num",reveal:String(ans)};
}
const SH={
 daire:{svg:'<circle cx="50" cy="50" r="40" fill="#ff9600"/>',k:0},
 üçgen:{svg:'<polygon points="50,10 92,86 8,86" fill="#1cb0f6"/>',k:3},
 kare:{svg:'<rect x="16" y="16" width="68" height="68" rx="4" fill="#58cc02"/>',k:4},
 dikdörtgen:{svg:'<rect x="6" y="26" width="88" height="48" rx="4" fill="#ce82ff"/>',k:4}
};
function gShape(){
  const names=Object.keys(SH),n=pick(names),svg='<svg viewBox="0 0 100 100" width="130" height="130">'+SH[n].svg+'</svg>';
  if(Math.random()<.6){
    return {cat:"math",kind:"choice",prompt:"Bu şeklin adı nedir?",speak:"Bu şeklin adı nedir?",svg,options:shuffle(names),answer:n,optStyle:"text",reveal:n};
  }
  const k=SH[n].k;
  return {cat:"math",kind:"choice",prompt:"Bu şeklin kaç köşesi var?",speak:"Bu şeklin kaç köşesi var?",svg,options:["0","3","4","5"],answer:String(k),optStyle:"num",reveal:String(k)};
}

const GENS={letterHear:gLetterHear,case:gCase,letterWord:gLetterWord,firstLetter:gFirstLetter,hasLetter:gHasLetter,missing:gMissing,picWord:gPicWord,
 listenPick:gListenPick,listenSpell:gListenSpell,build:gBuild,syllableBuild:gSyllableBuild,syllableCount:gSyllableCount,sentenceFill:gSentenceFill,
 sentenceOrder:gSentenceOrder,opposite:gOpposite,read:gRead,add:gAdd,sub:gSub,count:gCount,makeTen:gMakeTen,compare:gCompare,numSeq:gNumSeq,
 numWord:gNumWord,pattern:gPattern,story:gStory,shape:gShape};

function keyOf(q){return [q.prompt,q.big||"",q.pic||"",q.text||"",q.answer||q.solution.join("|")].join("§");}
function makeOne(name,ctx,avoid){
  let q,g=0;
  do{q=GENS[name](ctx);q.gen=name;q.ctx=ctx;q.key=keyOf(q);}while(avoid&&avoid.has(q.key)&&g++<40);
  return q;
}
function buildQuestions(names,ctx,n){
  const out=[],seen=new Set();let tries=0;
  while(out.length<n&&tries++<400){
    const name=names[out.length%names.length];
    const q=makeOne(name,ctx,null);
    if(seen.has(q.key))continue;
    seen.add(q.key);out.push(q);
  }
  return out;
}

const UNITS=[
 {title:"E L A K İ N",sub:"İlk harflerimiz",icon:"🔤",color:"#58cc02",dark:"#46a302",letters:"elakin".split(""),
  lessons:[["Harfleri Tanı",["letterHear","case"]],["Harf ve Resim",["letterWord","firstLetter","hasLetter"]],["Kelime Avı",["missing","picWord","listenPick"]]]},
 {title:"O M U T I R",sub:"Yeni harfler geldi",icon:"🦉",color:"#1cb0f6",dark:"#1899d6",letters:"omutır".split(""),
  lessons:[["Harfleri Tanı",["letterHear","case"]],["Harf ve Resim",["letterWord","firstLetter","hasLetter"]],["Kelime Avı",["missing","picWord","listenPick"]]]},
 {title:"Ö D Ü B S Y",sub:"Şapkalı ve yeni harfler",icon:"🐻",color:"#ff9600",dark:"#e08600",letters:"ödübsy".split(""),
  lessons:[["Harfleri Tanı",["letterHear","case"]],["Harf ve Resim",["letterWord","firstLetter","hasLetter"]],["Kelime Avı",["missing","picWord","listenPick"]]]},
 {title:"H Ç Z G Ş C",sub:"Daha çok harf!",icon:"🐸",color:"#ce82ff",dark:"#a560e8",letters:"hçzgşc".split(""),
  lessons:[["Harfleri Tanı",["letterHear","case"]],["Harf ve Resim",["letterWord","firstLetter","hasLetter"]],["Kelime Avı",["missing","picWord","listenPick"]]]},
 {title:"P F V J Ğ",sub:"Son harfler",icon:"🦄",color:"#ff4b8b",dark:"#d33a72",letters:"pfvjğ".split(""),
  lessons:[["Harfleri Tanı",["letterHear","case"]],["Harf ve Resim",["letterWord","firstLetter","hasLetter"]],["Kelime Avı",["missing","picWord","listenPick"]]]},
 {title:"Heceler",sub:"Kelimeleri parçalara ayır",icon:"👏",color:"#00b8a9",dark:"#009185",
  lessons:[["Hece Say",["syllableCount","picWord"]],["Heceleri Birleştir",["syllableBuild","listenPick","syllableCount"]],["Hece Ustası",["syllableBuild","listenSpell","missing"]]]},
 {title:"Kelime Atölyesi",sub:"Oku, dinle ve yaz",icon:"✏️",color:"#f5a300",dark:"#d18900",
  lessons:[["Kelime Kur",["build","picWord"]],["Dinle ve Yaz",["listenSpell","listenPick"]],["Süper Yazar",["build","missing","listenSpell","syllableBuild"]]]},
 {title:"Cümle Ormanı",sub:"Cümleler ve anlamlar",icon:"🌳",color:"#3fa34d",dark:"#2e8a3b",
  lessons:[["Cümle Tamamla",["sentenceFill","opposite"]],["Cümle Kur",["sentenceOrder","sentenceFill"]],["Oku ve Anla",["read","sentenceOrder","opposite"]]]},
 {title:"Sayılar Gezegeni",sub:"Say, karşılaştır, oku",icon:"🪐",color:"#7c5cff",dark:"#5f43d6",
  lessons:[["Say",["count","numWord"],{max:10}],["Sıra ve Karşılaştır",["numSeq","compare","count"],{max:10}],["20’ye Kadar",["numWord","numSeq","compare","count"],{max:20}]]},
 {title:"Toplama - Çıkarma",sub:"İşlem zamanı!",icon:"➕",color:"#ef476f",dark:"#c93659",
  lessons:[["Toplama",["add","makeTen"],{max:10}],["Çıkarma",["sub","add"],{max:10}],["Problemler",["story","add","sub"],{max:20}]]},
 {title:"Şekil ve Örüntü",sub:"Zeka oyunları",icon:"🔷",color:"#118ab2",dark:"#0b6f91",
  lessons:[["Şekiller",["shape","pattern"],{max:10}],["Örüntüler",["pattern","story","shape"],{max:10}],["Büyük Final",["shape","pattern","add","sub","story","count","build","picWord"],{max:20}]]},
 {title:"Uzun Kelimeler",sub:"Büyük kelimeleri parçala!",icon:"🚁",color:"#e76f51",dark:"#c45a3f",
  lessons:[["Hece Hece Oku",["syllableCount","picWord"],{minSyl:3,maxLen:12}],["Uzun Kelime Kur",["syllableBuild","listenPick"],{minSyl:3,maxLen:12}],["Uzun Kelime Ustası",["syllableBuild","build","listenSpell","syllableCount"],{minSyl:3,maxLen:12}]]}
];
function ctxFor(ui,li){
  const u=UNITS[ui],les=u.lessons[li],letters=u.letters||ALPHABET;
  let words=WORDS;
  if(u.letters){const f=WORDS.filter(w=>u.letters.some(l=>w.w.includes(l)));if(f.length>=6)words=f;}
  if(les[2]&&les[2].minSyl){const f=WORDS.filter(w=>w.syl.length>=les[2].minSyl);if(f.length>=4)words=f;}
  return {letters,words,max:(les[2]&&les[2].max)||10,maxLen:les[2]&&les[2].maxLen};
}
const PRACTICE={
 reading:["picWord","firstLetter","letterWord","hasLetter","case"],
 writing:["missing","build","listenSpell","syllableBuild"],
 listening:["listenPick","listenSpell","letterHear"],
 syllable:["syllableCount","syllableBuild"],
 long:["syllableBuild","syllableCount","picWord","build"],
 letters:["letterHear","case","letterWord","firstLetter"],
 sentences:["sentenceFill","sentenceOrder","opposite","read"],
 math:["add","sub","count","compare","numSeq","numWord","makeTen","story","pattern","shape"]
};
const DAILY=["picWord","missing","build","listenPick","syllableCount","sentenceFill","add","count","opposite","read","numWord","pattern"];

const API={up,low,rnd,pick,shuffle,sample,ALPHABET,WORDS,UNITS,GENS,PRACTICE,DAILY,buildQuestions,makeOne,ctxFor};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.OgrenioData=API;
})(typeof window!=="undefined"?window:globalThis);
