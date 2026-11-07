(function(root){
"use strict";
const V="aeıioöuüâîûAEIİOÖUÜ";
/* Türkçe hece ayırıcı: iki ünlü arası 0-1 ünsüz -> sonrakine, 2+ ünsüz -> ilki öncekinde kalır */
function syllabify(w){
  const idx=[];
  for(let i=0;i<w.length;i++)if(V.includes(w[i]))idx.push(i);
  if(idx.length<2)return [w];
  const cuts=[];
  for(let k=0;k<idx.length-1;k++){
    const c=idx[k+1]-idx[k]-1;
    cuts.push(idx[k]+1+Math.max(0,c-1));
  }
  const out=[];let s=0;
  for(const c of cuts){out.push(w.slice(s,c));s=c;}
  out.push(w.slice(s));
  return out;
}

const STORIES=[
{id:"nane",title:"Nane ile Lale",cover:"🌿🌷",level:1,color:"#e3f9d8",pages:[
 {pic:"🌿 🌷",text:"Bu nane. Bu lale."},
 {pic:"🟢🔴",text:"Nane yeşil. Lale kırmızı."},
 {pic:"👧🌿",text:"Ela nane kokladı."},
 {pic:"👦🌷",text:"Ali lale kokladı."},
 {pic:"🌼",text:"Bahçe çok güzel!"}],
 quiz:[["Nane ne renk?","yeşil",["yeşil","kırmızı","mavi"]],["Ela neyi kokladı?","nane",["nane","top","kitap"]],["Ali neyi kokladı?","lale",["lale","nane","elma"]]]},
{id:"kek",title:"Kek Zamanı",cover:"🧁",level:1,color:"#ffe6ef",pages:[
 {pic:"👩🧁",text:"Anne kek yaptı."},
 {pic:"👃",text:"Kek çok güzel kokuyor."},
 {pic:"👧👦",text:"Ela keke baktı. Ali keke baktı."},
 {pic:"🔪",text:"Anne keki kesti."},
 {pic:"😋",text:"Herkes kek yedi. Ne güzel!"}],
 quiz:[["Anne ne yaptı?","kek",["kek","pasta","ekmek"]],["Keki kim kesti?","anne",["anne","baba","Ali"]],["Kek nasıl kokuyor?","güzel",["güzel","kötü","soğuk"]]]},
{id:"kus",title:"Küçük Kuş",cover:"🐦",level:1,color:"#e0f3ff",pages:[
 {pic:"🐦",text:"Bu küçük bir kuş."},
 {pic:"🌳🐦",text:"Kuş ağaçta."},
 {pic:"🎵",text:"Kuş şarkı söyler."},
 {pic:"☁️🐦",text:"Kuş uçtu. Güle güle kuş!"}],
 quiz:[["Kuş nerede?","ağaçta",["ağaçta","evde","denizde"]],["Kuş ne söyler?","şarkı",["şarkı","kitap","top"]],["Kuş ne yaptı?","uçtu",["uçtu","yüzdü","uyudu"]]]},
{id:"ela-ahmet",title:"Ela ile Ahmet",cover:"👧👦",level:1,color:"#e6f9d2",pages:[
 {pic:"👧 👦",text:"Bu Ela. Bu Ahmet."},
 {pic:"🌳🌼",text:"Ela ile Ahmet parka gitti."},
 {pic:"⚽",text:"Ahmet top attı. Ela topu tuttu."},
 {pic:"🍎🥛",text:"Ela elma yedi. Ahmet süt içti."},
 {pic:"🏠🌙",text:"Akşam oldu. Ela ile Ahmet eve gitti."}],
 quiz:[["Ela ile Ahmet nereye gitti?","parka",["parka","okula","denize"]],["Ahmet ne attı?","top",["top","kitap","taş"]],["Ela ne yedi?","elma",["elma","muz","ekmek"]]]},

{id:"pamuk",title:"Minik Kedi Pamuk",cover:"🐱",level:1,color:"#ffeccf",pages:[
 {pic:"🐱",text:"Bu Pamuk. Pamuk minik bir kedi."},
 {pic:"🥛",text:"Pamuk süt içer."},
 {pic:"🧶",text:"Pamuk yumakla oynar."},
 {pic:"🐟",text:"Pamuk balık sever."},
 {pic:"😴",text:"Pamuk uyudu. İyi geceler Pamuk!"}],
 quiz:[["Pamuk kim?","kedi",["kedi","köpek","kuş"]],["Pamuk ne içer?","süt",["süt","su","çay"]],["Pamuk ne ile oynar?","yumak",["yumak","top","araba"]]]},

{id:"balon",title:"Kırmızı Balon",cover:"🎈",level:2,color:"#ffe0e0",pages:[
 {pic:"🧒🎈",text:"Ali kırmızı bir balon aldı."},
 {pic:"😀",text:"Balon çok güzeldi. Ali çok sevindi."},
 {pic:"💨",text:"Rüzgâr esti. Balon uçtu."},
 {pic:"😢",text:"Ali çok üzüldü."},
 {pic:"👧🎈",text:"Ayşe balonu buldu. Ali ile Ayşe balonla oynadı."},
 {pic:"🎉",text:"Birlikte çok eğlendiler."}],
 quiz:[["Ali ne aldı?","balon",["balon","top","kitap"]],["Balonu ne uçurdu?","rüzgâr",["rüzgâr","kuş","Ayşe"]],["Balonu kim buldu?","Ayşe",["Ayşe","Ela","Ahmet"]]]},

{id:"bahce",title:"Bahçedeki Arı",cover:"🐝",level:2,color:"#fff6c9",pages:[
 {pic:"🌷🌻",text:"Bahçede çiçekler açtı."},
 {pic:"🐝",text:"Küçük bir arı geldi."},
 {pic:"🍯",text:"Arı çiçekten bal topladı."},
 {pic:"🦋",text:"Bir kelebek de çiçeğe kondu."},
 {pic:"🌈",text:"Bahçe çok güzel oldu."}],
 quiz:[["Arı nereye geldi?","bahçeye",["bahçeye","okula","denize"]],["Arı neyden bal topladı?","çiçekten",["çiçekten","ağaçtan","taştan"]],["Çiçeğe başka kim kondu?","kelebek",["kelebek","kuş","balık"]]]},

{id:"yaris",title:"Tavşan ile Kaplumbağa",cover:"🐢",level:2,color:"#dff7ee",pages:[
 {pic:"🐰💨",text:"Tavşan çok hızlı koşar."},
 {pic:"🐢",text:"Kaplumbağa yavaş yürür."},
 {pic:"🏁",text:"Bir gün yarış yaptılar."},
 {pic:"😴",text:"Tavşan yolda uyudu."},
 {pic:"👣",text:"Kaplumbağa durmadan yürüdü."},
 {pic:"🏆",text:"Yarışı kaplumbağa kazandı!"}],
 quiz:[["Kim hızlı koşar?","tavşan",["tavşan","kaplumbağa","kedi"]],["Tavşan yolda ne yaptı?","uyudu",["uyudu","yedi","oynadı"]],["Yarışı kim kazandı?","kaplumbağa",["kaplumbağa","tavşan","kuş"]]]},

{id:"yagmur",title:"Yağmurlu Gün",cover:"🌧️",level:2,color:"#dff0ff",pages:[
 {pic:"🌧️",text:"Bugün hava yağmurlu."},
 {pic:"☂️👧",text:"Ela şemsiyesini aldı."},
 {pic:"🧥👦",text:"Ahmet yağmurluk giydi."},
 {pic:"💦",text:"Su birikintisine atladılar. Şap şap!"},
 {pic:"🍲",text:"Eve gelince sıcak çorba içtiler."},
 {pic:"🌈",text:"Yağmur dindi. Gökkuşağı çıktı!"}],
 quiz:[["Ela neyi aldı?","şemsiyesini",["şemsiyesini","topunu","çantasını"]],["Eve gelince ne içtiler?","çorba",["çorba","süt","su"]],["Yağmurdan sonra ne çıktı?","gökkuşağı",["gökkuşağı","kar","ay"]]]},

{id:"okul",title:"Ela ile Ahmet Okulda",cover:"🏫",level:3,color:"#e9e4ff",pages:[
 {pic:"🌅🏫",text:"Sabah oldu. Ela ile Ahmet okula gitti."},
 {pic:"👩‍🏫",text:"Öğretmen sınıfa girdi. Günaydın çocuklar dedi."},
 {pic:"🔤",text:"Çocuklar yeni harfleri öğrendi."},
 {pic:"🖼️",text:"Ahmet tahtaya güzel bir resim çizdi."},
 {pic:"⚽🌳",text:"Teneffüste herkes bahçede oynadı."},
 {pic:"😊",text:"Okul bitince Ela ile Ahmet çok mutluydu."}],
 quiz:[["Ela ile Ahmet nereye gitti?","okula",["okula","parka","denize"]],["Çocuklar ne öğrendi?","harfleri",["harfleri","şarkıyı","oyunu"]],["Ahmet ne çizdi?","resim",["resim","top","ev"]]]},

{id:"deniz",title:"Deniz Kenarında",cover:"🏖️",level:3,color:"#d9f3ff",pages:[
 {pic:"☀️🌊",text:"Yaz geldi. Ela ile Ahmet denize gitti."},
 {pic:"🏰",text:"Kumda koca bir kale yaptılar."},
 {pic:"🚩",text:"Ahmet kaleye bayrak taktı."},
 {pic:"🦀",text:"Bir yengeç yürüyerek geçti."},
 {pic:"👋",text:"Ela yengece el salladı."},
 {pic:"🌇",text:"Güneş batınca eve döndüler. Çok güzel bir gündü."}],
 quiz:[["Kumda ne yaptılar?","kale",["kale","araba","ev"]],["Kumda kim yürüyerek geçti?","yengeç",["yengeç","kuş","balık"]],["Güneş batınca ne yaptılar?","eve döndüler",["eve döndüler","yüzdüler","uyudular"]]]},

{id:"tilki",title:"Küçük Tilki",cover:"🦊",level:3,color:"#ffe9d6",pages:[
 {pic:"🌲🦊",text:"Ormanda minik bir tilki yaşardı."},
 {pic:"😋",text:"Bir gün tilki çok acıktı."},
 {pic:"🐻",text:"Ayı ona bal verdi."},
 {pic:"🙏",text:"Tilki ayıya teşekkür etti."},
 {pic:"🎵",text:"İkisi birlikte şarkı söyledi."},
 {pic:"🌈🌲",text:"Orman çok neşeli oldu."}],
 quiz:[["Tilki nerede yaşardı?","ormanda",["ormanda","denizde","evde"]],["Ayı tilkiye ne verdi?","bal",["bal","süt","elma"]],["İkisi birlikte ne yaptı?","şarkı söyledi",["şarkı söyledi","uyudu","yüzdü"]]]}
];

const API={STORIES,syllabify};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.OgrenioStories=API;
})(typeof window!=="undefined"?window:globalThis);
