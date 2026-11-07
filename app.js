(function(){
"use strict";
const D=window.OgrenioData;
const {up,low,rnd,pick,shuffle,WORDS,ALPHABET,UNITS}=D;
const $=id=>document.getElementById(id);

/* ================= DURUM ================= */
const KEY="ogrenio.v2";
const DEF={name:"",avatar:"🦊",owned:["🦊"],coins:0,earned:0,xp:0,streak:0,lastDate:"",dailyDate:"",dailyDone:0,bonusDate:"",
  stars:{},stickers:[],badges:[],correct:0,wrong:0,best:{memory:0,balloon:0},settings:{sound:true,speech:true,unlockAll:false}};
function load(){
  try{const o=JSON.parse(localStorage.getItem(KEY)||"{}");
    return Object.assign({},DEF,o,{settings:Object.assign({},DEF.settings,o.settings||{}),best:Object.assign({},DEF.best,o.best||{})});
  }catch(e){return JSON.parse(JSON.stringify(DEF));}
}
let S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
const today=()=>new Date().toLocaleDateString("en-CA");
function resetDaily(){if(S.dailyDate!==today()){S.dailyDate=today();S.dailyDone=0;}}
function updateStreak(){
  const now=today();if(S.lastDate===now)return;
  const y=new Date(Date.now()-864e5).toLocaleDateString("en-CA");
  S.streak=S.lastDate===y?S.streak+1:1;S.lastDate=now;
}
if(S.lastDate){const y=new Date(Date.now()-864e5).toLocaleDateString("en-CA");if(S.lastDate!==today()&&S.lastDate!==y)S.streak=0;}

const STICKERS=["🦄","🐲","🦖","🐙","🐬","🐳","🦜","🦉","🐧","🐨","🐵","🦔","🐞","🌈","🍭","🍩","🧁","🎸","🎨","🚀","🛸","🏰","🎯","🎁","🧸","🎠","🌻","🍀","🐢","🦀","🐠","🦆","🐿️","🦒","🐘","🏆","👑","💎","🎪","🎡"];
const AVATARS=[["🦊",0],["🐼",20],["🐸",20],["🐱",30],["🦁",40],["🐻",40],["🐰",50],["🐯",60],["🦄",80],["🐙",80],["🐲",120]];
const PRAISE=["Harika!","Süpersin!","Aferin sana!","Çok güzel!","Bravo!","Mükemmel!","Muhteşem!","Yaşasın!"];
const OOPS=["Olsun, tekrar deneriz!","Neredeyse oldu!","Hata yapmak öğrenmenin parçası!","Birlikte öğreniyoruz!"];
const CATS={reading:"📖 OKUMA",writing:"✏️ YAZMA",math:"🔢 MATEMATİK",listening:"🎧 DİNLEME"};

/* ================= SES & KONUŞMA ================= */
let AC=null,voice=null;
function sfx(name){
  if(!S.settings.sound)return;
  const seqs={ok:[[660,.1],[880,.18]],bad:[[300,.12],[220,.22]],win:[[523,.12],[659,.12],[784,.12],[1047,.35]],tap:[[520,.04]],pop:[[900,.06],[1200,.05]],flip:[[420,.05]]};
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended")AC.resume();
    let t=AC.currentTime;
    (seqs[name]||[]).forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type="triangle";o.frequency.value=f;
      g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);t+=d*.9;});
  }catch(e){}
}
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms);}catch(e){}}
function loadVoice(){try{const vs=speechSynthesis.getVoices();voice=vs.find(v=>/^tr/i.test(v.lang))||null;}catch(e){}}
if("speechSynthesis" in window){loadVoice();speechSynthesis.onvoiceschanged=loadVoice;}
function say(t,force){
  if(!t||!("speechSynthesis" in window))return;
  if(!force&&!S.settings.speech)return;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="tr-TR";if(voice)u.voice=voice;u.rate=.85;u.pitch=1.1;speechSynthesis.speak(u);}catch(e){}
}
function confetti(n,list){
  const fx=$("fx");list=list||["🎉","⭐","✨","🎈","💛","🌟"];
  for(let i=0;i<(n||36);i++){
    const s=document.createElement("span");s.textContent=pick(list);s.style.left=rnd(100)+"%";
    s.style.animationDuration=(1.8+Math.random()*1.8)+"s";s.style.animationDelay=(Math.random()*.6)+"s";s.style.fontSize=(20+rnd(22))+"px";
    fx.appendChild(s);setTimeout(()=>s.remove(),4500);
  }
}
function toast(t){const o=$("toast");if(o)o.remove();const d=document.createElement("div");d.id="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600);}
function modal(html){const m=$("modal");m.innerHTML='<div class="box">'+html+'</div>';m.classList.remove("hidden");}
function closeModal(){$("modal").classList.add("hidden");$("modal").innerHTML="";}

/* ================= ANA EKRAN ================= */
let tab="path";
const TABS=[["path","🗺️","Yol"],["books","📖","Kitaplık"],["play","🎮","Oyunlar"],["album","🏆","Albüm"],["shop","🛍️","Dükkan"],["me","👤","Ben"]];
const ALL=[];UNITS.forEach((u,ui)=>u.lessons.forEach((l,li)=>ALL.push({ui,li,id:ui+"-"+li,title:l[0]})));
const isOpen=i=>S.settings.unlockAll||i===0||(S.stars[ALL[i-1].id]||0)>0;
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;if(tab==="path"||tab==="me")render();});
window.addEventListener("appinstalled",()=>{deferredInstall=null;toast("🎉 Uygulama yüklendi!");render();});
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;

function renderTop(){
  $("top").innerHTML='<div class="brand">öğren<b>io</b></div><div class="chips"><span class="chip">🔥 '+S.streak+'</span><span class="chip">⭐ '+S.coins+'</span><span class="chip av">'+S.avatar+'</span></div>';
}
function renderTabs(){
  $("tabs").innerHTML=TABS.map(t=>'<button data-tab="'+t[0]+'" class="'+(tab===t[0]?"on":"")+'"><span>'+t[1]+'</span>'+t[2]+'</button>').join("");
}
function render(){
  resetDaily();renderTop();renderTabs();
  const v=$("view");
  v.innerHTML=({path:viewPath,play:viewPlay,album:viewAlbum,shop:viewShop,me:viewMe,books:viewBooks})[tab]();
}
const OFFS=[0,46,74,46,0,-46,-74,-46];

function viewPath(){
  const cur=ALL.findIndex(l=>!(S.stars[l.id]>0));
  const pct=Math.min(100,S.dailyDone/3*100);
  let h='';
  if(!standalone()&&(deferredInstall||true)&&!S.installHide){
    h+='<div class="card installbar"><div style="font-size:34px">📲</div><div style="flex:1"><b>Telefona yükle!</b><div class="muted">İnternetsiz de oynarsın.</div></div><button class="btn small orange" data-a="install">Yükle</button></div>';
  }
  h+='<div class="card daily"><div class="big">'+S.avatar+'</div><div style="flex:1"><h3>'+(S.name?S.name+", ":"")+'günün görevi hazır!</h3><div class="goal"><i style="width:'+pct+'%"></i></div><small><b>'+Math.min(S.dailyDone,3)+' / 3</b> ders · tamamla, +10 ⭐ kazan</small></div><button class="btn small blue" data-a="daily">Başla</button></div>';
  let gi=0;
  UNITS.forEach((u,ui)=>{
    h+='<section class="unit" style="--c:'+u.color+';--d:'+u.dark+'"><div class="unit-head"><div class="ui">'+u.icon+'</div><div><b>Bölüm '+(ui+1)+': '+u.title+'</b><small>'+u.sub+'</small></div></div><div class="nodes">';
    u.lessons.forEach((les,li)=>{
      const idx=gi++,st=S.stars[ALL[idx].id]||0,open=isOpen(idx),isCur=idx===cur&&open;
      const cls=st?"done":(!open?"locked":(isCur?"current":""));
      const ic=!open?"🔒":(st?"✔":["📖","✏️","🏅"][li%3]);
      h+='<div class="nwrap" style="transform:translateX('+OFFS[idx%OFFS.length]+'px)">'+(isCur?'<div class="start-tag">BAŞLA!</div>':'')+
        '<button class="node '+cls+'" data-a="lesson" data-ui="'+ui+'" data-li="'+li+'" data-open="'+(open?1:0)+'">'+ic+'</button>'+
        '<div class="nstars">'+(st?"⭐".repeat(st)+"☆".repeat(3-st):"")+'</div><div class="nlabel">'+les[0]+'</div></div>';
    });
    h+='</div></section>';
  });
  return h;
}
function viewPlay(){
  return '<div class="gcards"><button class="gcard" style="background:#1cb0f6" data-a="balloon"><span>🎈</span>Balon Patlat<small>Harfi bul, patlat!</small></button>'+
  '<button class="gcard" style="background:#a560e8" data-a="memory"><span>🧠</span>Hafıza Kartları<small>Resim ve kelimeyi eşle</small></button></div>'+
  '<div class="card"><h3>⚡ Hızlı Antrenman</h3><p class="muted" style="margin-top:0">İstediğin konuyu seç, 10 soru çöz!</p><div class="prac">'+
  '<button data-a="prac" data-c="reading"><span>📖</span>Okuma</button><button data-a="prac" data-c="writing"><span>✏️</span>Yazma</button>'+
  '<button data-a="prac" data-c="listening"><span>🎧</span>Dinleme</button><button data-a="prac" data-c="syllable"><span>👏</span>Hece</button>'+
  '<button data-a="prac" data-c="sentences"><span>💬</span>Cümle</button><button data-a="prac" data-c="math"><span>🔢</span>Matematik</button><button data-a="prac" data-c="long"><span>🚁</span>Uzun Kelime</button><button data-a="prac" data-c="letters"><span>🔤</span>Harfler</button></div></div>'+
  '<div class="card"><h3>🏅 Rekorların</h3><div class="row"><span>🎈 Balon Patlat</span><b>'+S.best.balloon+' puan</b></div><div class="row"><span>🧠 Hafıza Kartları</span><b>'+(S.best.memory?S.best.memory+" hamle":"—")+'</b></div></div>';
}
const BADGES=[
 ["🌱","İlk Adım",()=>doneCount()>=1],["📚","5 Ders",()=>doneCount()>=5],["🏃","15 Ders",()=>doneCount()>=15],["🎓","Tüm Dersler",()=>doneCount()>=ALL.length],
 ["🔥","3 Gün Seri",()=>S.streak>=3],["🌟","7 Gün Seri",()=>S.streak>=7],["⭐","50 Yıldız",()=>S.earned>=50],["💎","200 Yıldız",()=>S.earned>=200],
 ["🎯","100 Doğru",()=>S.correct>=100],["🦸","500 XP",()=>S.xp>=500],["📖","İlk Kitap",()=>booksDone()>=1],["🐛","Kitap Kurdu",()=>booksDone()>=5],["🎈","Balon Ustası",()=>S.best.balloon>=15],["🧠","Hafıza Ustası",()=>S.best.memory>0&&S.best.memory<=8]
];
const doneCount=()=>ALL.filter(l=>S.stars[l.id]>0).length;
function checkBadges(){
  const nw=[];BADGES.forEach(b=>{if(!S.badges.includes(b[1])&&b[2]()){S.badges.push(b[1]);nw.push(b);}});return nw;
}
function viewAlbum(){
  return '<div class="card"><h2>🎴 Çıkartma Albümü</h2><p class="muted">Her dersi bitirince yeni bir çıkartma kazanırsın! ('+S.stickers.length+'/'+STICKERS.length+')</p><div class="stickers">'+
   STICKERS.map(s=>'<div class="stk '+(S.stickers.includes(s)?"on":"")+'">'+(S.stickers.includes(s)?s:"?")+'</div>').join("")+'</div></div>'+
   '<div class="card"><h2>🏆 Rozetler</h2><div class="badges">'+BADGES.map(b=>'<div class="bdg '+(S.badges.includes(b[1])?"":"off")+'"><span>'+b[0]+'</span>'+b[1]+'</div>').join("")+'</div></div>';
}
function viewShop(){
  return '<div class="card"><h2>⭐ '+S.coins+' yıldızın var</h2><p class="muted">Yıldızlarla yeni arkadaşlar al!</p></div><div class="shop">'+
   AVATARS.map(([a,c])=>{const own=S.owned.includes(a),sel=S.avatar===a;
     return '<div class="item '+(sel?"sel":"")+'"><div class="e">'+a+'</div><small>'+(own?(sel?"Seçili":"Sende var"):"⭐ "+c)+'</small>'+
     '<button class="btn small '+(own?"blue":"")+'" data-a="'+(own?"setav":"buy")+'" data-v="'+a+'" data-c="'+c+'" '+(sel?"disabled":"")+'>'+(own?"Seç":"Al")+'</button></div>';}).join("")+'</div>';
}
function viewMe(){
  const lvl=Math.floor(S.xp/100)+1,tot=S.correct+S.wrong,acc=tot?Math.round(S.correct/tot*100):0;
  const sw=(k,t)=>'<div class="row"><span>'+t+'</span><button class="sw '+(S.settings[k]?"on":"")+'" data-a="toggle" data-k="'+k+'"></button></div>';
  return '<div class="card"><div class="profile-av">'+S.avatar+'</div><div style="text-align:center;font-size:22px;font-weight:900">'+(S.name||"Öğrenme Kahramanı")+'</div>'+
   '<div class="muted" style="text-align:center">Seviye '+lvl+'</div>'+
   '<input class="txt" id="nameIn" maxlength="16" placeholder="Adını yaz..." value="'+(S.name||"").replace(/"/g,"")+'"><button class="btn wide" data-a="savename">Adımı Kaydet</button>'+
   '<div class="stat3"><div><b>'+doneCount()+'</b><small>Ders</small></div><div><b>'+S.xp+'</b><small>XP</small></div><div><b>%'+acc+'</b><small>Başarı</small></div></div></div>'+
   '<div class="card"><h3>⚙️ Ayarlar</h3>'+sw("sound","🔊 Oyun sesleri")+sw("speech","🗣️ Sesli okuma (soruları okur)")+'</div>'+
   (standalone()?'':'<div class="card"><h3>📲 Telefona Yükle</h3><p class="muted" style="margin-top:0">Ana ekrana ekle, uygulama gibi aç. İnternet olmadan da çalışır.</p><button class="btn wide orange" data-a="install">Nasıl yüklenir?</button></div>')+
   '<div class="card"><h3>👨‍👩‍👧 Veli Alanı</h3>'+sw("unlockAll","🔓 Tüm dersleri aç")+
   '<div class="row"><span>Tüm ilerlemeyi sil</span><button class="btn small red" data-a="reset">Sıfırla</button></div></div>';
}

/* ================= ETKİLEŞİM ================= */
$("tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(!b)return;sfx("tap");tab=b.dataset.tab;render();$("view").scrollTop=0;});
$("view").addEventListener("click",e=>{
  const t=e.target.closest("[data-a]");if(!t)return;
  const d=t.dataset,a=d.a;
  if(a!=="lesson")sfx("tap");
  if(a==="lesson"){
    if(d.open==="0"){sfx("bad");t.classList.remove("shake");void t.offsetWidth;t.classList.add("shake");toast("🔒 Önce önceki dersi bitir!");return;}
    startPath(+d.ui,+d.li);
  }else if(a==="daily")startDaily();
  else if(a==="prac")startPractice(d.c);
  else if(a==="balloon")startBalloon();
  else if(a==="memory")startMemory();
  else if(a==="buy"){
    const c=+d.c;if(S.coins<c){toast("Yeterli ⭐ yok. Ders bitirip kazan!");sfx("bad");return;}
    S.coins-=c;S.owned.push(d.v);S.avatar=d.v;save();sfx("win");confetti(24);render();
  }else if(a==="setav"){S.avatar=d.v;save();render();}
  else if(a==="toggle"){S.settings[d.k]=!S.settings[d.k];save();render();}
  else if(a==="savename"){const v=$("nameIn").value.trim();if(!v){toast("Lütfen bir isim yaz.");return;}S.name=v;save();toast("Adın kaydedildi! 🎉");render();}
  else if(a==="install")doInstall();
  else if(a==="reset"){
    modal('<h2>Emin misin?</h2><p>Tüm ilerleme, yıldız ve çıkartmalar silinecek.</p><div class="rbtns"><button class="btn ghost" data-m="close">Vazgeç</button><button class="btn red" data-m="reset">Sil</button></div>');
  }
});
$("modal").addEventListener("click",e=>{
  const t=e.target.closest("[data-m]");if(!t)return;
  if(t.dataset.m==="close")closeModal();
  else if(t.dataset.m==="reset"){S=JSON.parse(JSON.stringify(DEF));save();closeModal();render();toast("İlerleme silindi.");welcome();}
  else if(t.dataset.m==="welcome"){const v=($("wname").value||"").trim();S.name=v||"Kahraman";S.welcomed=true;save();closeModal();render();say("Merhaba "+S.name+"! Hadi birlikte öğrenelim!");}
});
function doInstall(){
  if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(()=>{deferredInstall=null;});return;}
  modal('<h2>📲 Telefona Yükle</h2><p><b>iPhone / iPad (Safari):</b><br>Alttaki <b>Paylaş</b> ⬆️ düğmesine bas → <b>Ana Ekrana Ekle</b> → Ekle.</p>'+
   '<p><b>Android (Chrome):</b><br>Sağ üstteki <b>⋮</b> menüsüne bas → <b>Uygulamayı yükle</b> (veya <b>Ana ekrana ekle</b>).</p><p class="muted">Not: Yükleme için uygulamanın bir internet adresinden (https) açılması gerekir.</p><button class="btn wide" data-m="close">Tamam</button>');
}
function welcome(){
  if(S.welcomed&&S.name)return;
  modal('<div style="font-size:70px">🦊</div><h2>Merhaba! Ben Tilki!</h2><p style="text-align:center">Birlikte harfleri, kelimeleri ve sayıları öğreneceğiz. Adın ne?</p><input class="txt" id="wname" maxlength="16" placeholder="Adını yaz..."><button class="btn wide" data-m="welcome">Başlayalım! 🚀</button>');
}

/* ================= DERS MOTORU ================= */
let L=null;
const cur=()=>L.queue[L.i];
function startPath(ui,li){
  const u=UNITS[ui],les=u.lessons[li],ctx=D.ctxFor(ui,li);
  const mk=()=>D.buildQuestions(les[1],ctx,8);
  runLesson(mk,{id:ui+"-"+li,title:les[0],type:"path",color:u.color});
}
function startPractice(c){
  const ctx={letters:ALPHABET,words:WORDS,max:c==="math"?20:10};
  if(c==="long"){ctx.words=WORDS.filter(w=>w.syl.length>=3);ctx.maxLen=12;}
  runLesson(()=>D.buildQuestions(D.PRACTICE[c],ctx,10),{type:"practice"});
}
function startDaily(){
  const ctx={letters:ALPHABET,words:WORDS,max:10};
  runLesson(()=>D.buildQuestions(shuffle(D.DAILY),ctx,10),{type:"daily"});
}
function runLesson(mk,meta){
  const qs=mk();
  L={queue:qs,i:0,total:qs.length,done:0,correct:0,wrong:0,combo:0,answered:false,meta,mk,built:[]};
  $("lesson").classList.remove("hidden");
  $("lmascot").textContent=S.avatar;
  bubble("Hadi başlayalım"+(S.name?", "+S.name:"")+"!");
  renderQ();
}
function bubble(t,hop){$("lbubble").textContent=t;if(hop){const m=$("lmascot");m.classList.remove("hop");void m.offsetWidth;m.classList.add("hop");}}
function setSheet(mode,msg,btn){
  const s=$("sheet");s.className="sheet "+mode;$("smsg").innerHTML=msg||"";
  const b=$("sbtn");
  if(btn){b.style.display="";b.textContent=btn.text;b.disabled=!!btn.disabled;b.onclick=btn.fn;}else{b.style.display="none";b.onclick=null;}
}
function renderQ(){
  if(L.i>=L.queue.length){finishLesson();return;}
  const q=cur();L.answered=false;L.built=[];
  $("lbar").style.width=(L.done/L.total*100)+"%";
  $("lcount").textContent=Math.min(L.done+1,L.total)+"/"+L.total;
  let h='<div class="cat">'+(CATS[q.cat]||"")+'</div><h2 class="prompt">'+q.prompt+' <button class="spk" data-s="1" aria-label="Dinle">🔊</button></h2>';
  if(q.pic)h+='<div class="pic'+(q.pic.length>14?" long":"")+'">'+q.pic+'</div>';
  if(q.svg)h+='<div class="svgpic">'+q.svg+'</div>';
  if(q.text)h+='<p class="para">'+q.text+'</p>';
  if(q.big)h+='<div class="big">'+q.big+'</div>';
  if(q.kind==="choice"){
    const long=q.optStyle==="text"&&q.options.some(o=>o.length>11);
    h+='<div class="opts'+(long?" one":"")+'">'+q.options.map((o,i)=>'<button class="opt '+q.optStyle+'" data-o="'+i+'">'+o+'</button>').join("")+'</div>';
    setSheet("idle","Dokun ve cevapla 👆",null);
  }else{
    L.tiles=q.tiles.map((t,i)=>({id:i,label:t,used:false}));
    h+='<div class="slots" id="slots"></div><div class="tiles" id="tiles"></div>';
    setSheet("idle","",{text:"Kontrol Et",disabled:true,fn:checkBuild});
  }
  $("qcard").innerHTML=h;
  if(q.kind==="build")drawBuild();
  $("qcard").parentElement.scrollTop=0;
  setTimeout(()=>{if(L&&cur()===q&&!L.answered)say(q.speak||q.prompt);},250);
}
function drawBuild(){
  const q=cur();
  $("slots").innerHTML=L.built.map((t,i)=>'<button class="tile in" data-b="'+i+'">'+t.label+'</button>').join("");
  $("tiles").innerHTML=L.tiles.map((t,i)=>'<button class="tile '+(t.used?"used":"")+'" data-t="'+i+'">'+t.label+'</button>').join("");
  const full=L.built.length===q.solution.length;
  if(!L.answered)setSheet("idle",full?"":"Karelere dokunarak diz 👆",{text:"Kontrol Et",disabled:!full,fn:checkBuild});
}
$("qcard").addEventListener("click",e=>{
  if(!L)return;
  const q=cur();if(!q)return;
  if(e.target.closest("[data-s]")){say(q.speak||q.prompt,true);return;}
  if(L.answered)return;
  const o=e.target.closest("[data-o]");
  if(o){answerChoice(+o.dataset.o);return;}
  const t=e.target.closest("[data-t]");
  if(t){const tile=L.tiles[+t.dataset.t];if(tile.used)return;tile.used=true;L.built.push(tile);sfx("tap");drawBuild();return;}
  const b=e.target.closest("[data-b]");
  if(b){const tile=L.built.splice(+b.dataset.b,1)[0];tile.used=false;sfx("tap");drawBuild();}
});
function answerChoice(i){
  const q=cur(),val=q.options[i];L.answered=true;
  const ok=val===q.answer;
  document.querySelectorAll(".opt").forEach((b,k)=>{b.disabled=true;if(q.options[k]===q.answer)b.classList.add("ok");else if(k===i)b.classList.add("no");});
  feedback(ok,q,q.answer);
}
function checkBuild(){
  const q=cur();if(L.answered)return;L.answered=true;
  const ok=L.built.map(t=>t.label).join("|")===q.solution.join("|");
  $("slots").className="slots "+(ok?"ok":"no");
  document.querySelectorAll("#tiles .tile,#slots .tile").forEach(b=>b.disabled=true);
  feedback(ok,q,q.solution.join(q.join));
}
function feedback(ok,q,correctText){
  const reveal=q.reveal&&q.reveal!==correctText?q.reveal:"";
  if(ok){
    L.done++;L.correct++;L.combo++;
    sfx("ok");buzz(15);
    const p=pick(PRAISE);
    bubble(L.combo>=3?"🔥 "+L.combo+" doğru üst üste!":p,true);
    if(L.combo===5||L.combo===8)confetti(20);
    setSheet("good","🎉 "+p+(reveal?"<small>"+reveal+"</small>":(q.kind==="build"?"<small>"+correctText+"</small>":"")),{text:"Devam",fn:nextQ});
    say(q.reveal||(q.kind==="build"?correctText:p));
  }else{
    L.wrong++;L.combo=0;
    sfx("bad");buzz(60);
    bubble(pick(OOPS),true);
    setSheet("bad","Doğrusu:<small style='font-size:20px'>"+correctText+(reveal?" — "+reveal:"")+"</small>",{text:"Devam",fn:nextQ});
    say("Doğrusu: "+(q.reveal||correctText));
    if(L.queue.length<L.total+5){const n=q.gen?D.makeOne(q.gen,q.ctx,new Set([q.key])):Object.assign({},q);L.queue.push(n);}
  }
  $("lbar").style.width=(L.done/L.total*100)+"%";
}
function nextQ(){L.i++;renderQ();}
function exitLesson(){
  try{speechSynthesis.cancel();}catch(e){}
  $("lesson").classList.add("hidden");L=null;render();
}
$("lx").addEventListener("click",()=>{
  if(L&&L.i<L.queue.length&&L.done>0){
    modal('<h2>Çıkmak mı istiyorsun?</h2><p>Bu dersin ilerlemesi kaybolacak.</p><div class="rbtns"><button class="btn ghost" data-m="close">Devam et</button><button class="btn red" id="reallyExit">Çık</button></div>');
    $("reallyExit").onclick=()=>{closeModal();exitLesson();};
  }else exitLesson();
});
function finishLesson(){
  const stars=L.wrong<=1?3:L.wrong<=3?2:1;
  let gain=stars*3+(L.meta.type==="daily"?5:0);
  S.xp+=L.correct*10;
  resetDaily();updateStreak();S.dailyDone++;
  let bonus=false;
  if(S.dailyDone===3&&S.bonusDate!==today()){gain+=10;S.bonusDate=today();bonus=true;}
  S.coins+=gain;S.earned+=gain;
  if(L.meta.id)S.stars[L.meta.id]=Math.max(S.stars[L.meta.id]||0,stars);
  S.correct+=L.correct;S.wrong+=L.wrong;
  const un=STICKERS.filter(x=>!S.stickers.includes(x)),stk=un.length?pick(un):null;
  if(stk)S.stickers.push(stk);
  const nb=checkBadges();save();
  const meta=L.meta,mk=L.mk,correct=L.correct,wrong=L.wrong;
  $("lbar").style.width="100%";$("lcount").textContent="✓";
  bubble(stars===3?"Mükemmel iş çıkardın!":"Aferin, bitirdin!",true);
  $("qcard").innerHTML='<div class="result"><div class="trophy">🏆</div><h2>Ders bitti!</h2><div class="rstars">'+
   [1,2,3].map(i=>'<span class="'+(i<=stars?"":"off")+'">⭐</span>').join("")+'</div>'+
   '<div class="rstats"><div><b>'+correct+'</b><small>Doğru</small></div><div><b>'+wrong+'</b><small>Yanlış</small></div><div><b>+'+gain+'⭐</b><small>Kazandın</small></div></div>'+
   (bonus?'<div class="newstk">🎁 Günlük hedefi tamamladın! +10 ⭐ bonus</div>':'')+
   (stk?'<div class="newstk"><span>'+stk+'</span>Yeni çıkartma kazandın!</div>':'')+
   nb.map(b=>'<div class="newstk"><span>'+b[0]+'</span>Yeni rozet: '+b[1]+'</div>').join("")+
   '<div class="rbtns"><button class="btn ghost" id="again">Tekrar</button><button class="btn" id="cont">Devam</button></div></div>';
  setSheet("good","",null);$("sheet").style.display="none";
  sfx("win");confetti(60);say(stars===3?"Mükemmel! Üç yıldız kazandın!":"Aferin! Dersi bitirdin!");
  $("again").onclick=()=>{$("sheet").style.display="";runLesson(mk,meta);};
  $("cont").onclick=()=>{$("sheet").style.display="";exitLesson();};
}

/* ================= BALON PATLAT ================= */
function startBalloon(){
  const g=$("game");g.classList.remove("hidden");
  let score=0,time=45,hits=0,target="a",run=true;
  g.innerHTML='<div class="g-top"><button class="x" id="gx">✕</button><b>🎈 Balon Patlat</b><span class="timer" id="gtime">45</span></div>'+
   '<div class="g-target">Patlat: <b id="gt"></b><small id="gs">Puan: 0</small></div><div class="field" id="field"></div>';
  const field=$("field");
  function setT(){let n;do{n=pick(ALPHABET);}while(n===target&&score>0);target=n;$("gt").textContent=up(n)+" "+n;say(up(n)+" harfini patlat");}
  setT();
  function spawn(){
    if(!run)return;
    const w=document.createElement("div");w.className="balloon";
    const isT=Math.random()<.45,l=isT?target:pick(ALPHABET.filter(x=>x!==target));
    const bl=document.createElement("div");bl.className="bl";bl.textContent=Math.random()<.5?up(l):l;
    bl.style.background="hsl("+rnd(360)+" 80% 58%)";w.appendChild(bl);
    w.style.left=(3+rnd(76))+"%";w.style.setProperty("--t",(5+Math.random()*2.5)+"s");w.dataset.l=l;
    w.addEventListener("pointerdown",ev=>{
      ev.preventDefault();if(!run||w.dataset.done)return;
      if(w.dataset.l===target){
        w.dataset.done=1;bl.classList.add("pop");sfx("pop");buzz(15);score++;hits++;$("gs").textContent="Puan: "+score;
        setTimeout(()=>w.remove(),250);
        if(hits%3===0){setT();}
      }else{sfx("bad");bl.classList.add("bad");setTimeout(()=>bl.classList.remove("bad"),300);}
    });
    w.addEventListener("animationend",()=>w.remove());
    field.appendChild(w);
  }
  const sp=setInterval(spawn,720);
  const tm=setInterval(()=>{time--;$("gtime").textContent=time;if(time<=0)end();},1000);
  function end(){
    run=false;clearInterval(sp);clearInterval(tm);
    const coins=Math.floor(score/2)+1;S.coins+=coins;S.earned+=coins;
    const rec=score>S.best.balloon;if(rec)S.best.balloon=score;
    resetDaily();updateStreak();checkBadges();save();
    const r=document.createElement("div");r.className="gres";
    r.innerHTML='<div class="trophy">🎈</div><h2>Süre bitti!</h2><div style="font-size:22px;font-weight:900">'+score+' balon patlattın!'+(rec?"<br>🏅 Yeni rekor!":"")+'</div><div style="font-size:20px;font-weight:900">+'+coins+' ⭐</div><div class="rbtns" style="max-width:360px"><button class="btn ghost" id="gc">Kapat</button><button class="btn" id="ga">Tekrar</button></div>';
    field.appendChild(r);sfx("win");confetti(40);
    $("gc").onclick=closeGame;$("ga").onclick=startBalloon;
  }
  $("gx").onclick=()=>{run=false;clearInterval(sp);clearInterval(tm);closeGame();};
}
function closeGame(){$("game").classList.add("hidden");$("game").innerHTML="";render();}

/* ================= HAFIZA KARTLARI ================= */
function startMemory(){
  const g=$("game");g.classList.remove("hidden");
  const ws=shuffle(WORDS).slice(0,6);
  const cards=shuffle(ws.flatMap(w=>[{id:w.w,t:"p",c:w.e},{id:w.w,t:"w",c:w.w}]));
  let first=null,lock=false,moves=0,matched=0;
  g.innerHTML='<div class="g-top"><button class="x" id="gx">✕</button><b>🧠 Hafıza Kartları</b><span class="timer" id="mv">0</span></div>'+
   '<div class="g-target" style="font-size:18px">Resmi ve kelimeyi eşleştir!</div><div class="mem" id="mem">'+
   cards.map((c,i)=>'<button class="mc" data-i="'+i+'"><div class="in"><div class="back">❓</div><div class="front '+c.t+'">'+c.c+'</div></div></button>').join("")+'</div>';
  $("gx").onclick=closeGame;
  $("mem").onclick=e=>{
    const b=e.target.closest(".mc");if(!b||lock||b.classList.contains("flip"))return;
    b.classList.add("flip");sfx("flip");
    const i=+b.dataset.i;
    if(cards[i].t==="w")say(cards[i].c);
    if(first===null){first=i;return;}
    moves++;$("mv").textContent=moves;
    const a=first;first=null;
    if(cards[a].id===cards[i].id){
      matched++;const A=g.querySelector('.mc[data-i="'+a+'"]');
      setTimeout(()=>{A.classList.add("done");b.classList.add("done");sfx("ok");say(cards[i].id);},300);
      if(matched===6)setTimeout(finish,900);
    }else{
      lock=true;
      setTimeout(()=>{g.querySelector('.mc[data-i="'+a+'"]').classList.remove("flip");b.classList.remove("flip");lock=false;},900);
    }
  };
  function finish(){
    const stars=moves<=9?3:moves<=14?2:1,coins=stars*3;
    S.coins+=coins;S.earned+=coins;
    const rec=!S.best.memory||moves<S.best.memory;if(rec)S.best.memory=moves;
    resetDaily();updateStreak();checkBadges();save();
    const r=document.createElement("div");r.className="gres";
    r.innerHTML='<div class="trophy">🏆</div><h2>Hepsini buldun!</h2><div class="rstars">'+[1,2,3].map(i=>'<span class="'+(i<=stars?"":"off")+'">⭐</span>').join("")+'</div><div style="font-size:20px;font-weight:900">'+moves+' hamlede bitirdin'+(rec?" · 🏅 rekor!":"")+'<br>+'+coins+' ⭐</div><div class="rbtns" style="max-width:360px"><button class="btn ghost" id="gc">Kapat</button><button class="btn" id="ga">Tekrar</button></div>';
    g.appendChild(r);sfx("win");confetti(50);
    $("gc").onclick=closeGame;$("ga").onclick=startMemory;
  }
}

/* ================= KİTAPLIK ================= */
const ST=window.OgrenioStories,STORIES=ST.STORIES;
const LV=["","Kolay","Orta","Uzun"];
const booksDone=()=>STORIES.filter(s=>S.stars["b:"+s.id]>0).length;
function viewBooks(){
  let h='<div class="card daily" style="background:linear-gradient(120deg,#cfe9ff,#9fd3ff);color:#124a73"><div class="big">📚</div><div style="flex:1"><h3>Kitaplık</h3><small>Hikâyeleri oku, kelimelere dokun, dinle! Okuyunca sorular seni bekliyor. <b>'+booksDone()+' / '+STORIES.length+'</b> kitap okundu.</small></div></div><div class="shelf">';
  STORIES.forEach(s=>{
    const st=S.stars["b:"+s.id]||0;
    h+='<button class="book" data-a="book" data-id="'+s.id+'" style="--bc:'+s.color+'"><div class="cv">'+s.cover+'</div><div style="flex:1"><b>'+s.title+'</b><div class="muted">'+LV[s.level]+" · "+s.pages.length+' sayfa</div><div class="nstars">'+(st?"⭐".repeat(st)+"☆".repeat(3-st):"Henüz okunmadı")+'</div></div><span class="go">▶</span></button>';
  });
  return h+'</div>';
}
let reading=false;
function stopRead(){
  reading=false;try{speechSynthesis.cancel();}catch(e){}
  document.querySelectorAll("#reader .w.hl").forEach(x=>x.classList.remove("hl"));
}
function speakOne(t,done){
  if(!("speechSynthesis" in window)){setTimeout(done,700);return;}
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(t);u.lang="tr-TR";if(voice)u.voice=voice;u.rate=.8;
    let fired=false;const f=()=>{if(fired)return;fired=true;setTimeout(done,150);};
    u.onend=f;u.onerror=f;setTimeout(f,3000);
    speechSynthesis.speak(u);
  }catch(e){setTimeout(done,700);}
}
function wordHtml(text,syl){
  return text.split(" ").map(tk=>{
    const m=tk.match(/^(.*?)([.,!?…]*)$/),core=m[1],p=m[2];
    const inner=syl?ST.syllabify(core).map((s,i)=>'<i class="s'+(i%2)+'">'+s+'</i>').join(""):core;
    return '<span class="w" data-w="'+core+'">'+inner+'</span>'+p;
  }).join(" ");
}
function openBook(id){
  const st=STORIES.find(s=>s.id===id);if(!st)return;
  let p=0;
  const r=$("reader");r.classList.remove("hidden");
  const syl=()=>S.settings.syl!==false;
  function draw(){
    stopRead();
    const pg=st.pages[p],last=p===st.pages.length-1;
    r.innerHTML='<div class="g-top"><button class="x" id="rx">✕</button><b>'+st.title+'</b><span class="timer">'+(p+1)+'/'+st.pages.length+'</span></div>'+
     '<div class="rbody"><div class="rpic">'+pg.pic+'</div><div class="rtext">'+wordHtml(pg.text,syl())+'</div><div class="muted">Bir kelimeye dokun, sana okusun 👆</div></div>'+
     '<div class="rctl"><button class="btn small blue" id="rlisten">🔊 Dinle</button><button class="btn small orange" id="rword">👆 Kelime kelime</button><button class="btn small ghost" id="rsyl">Heceler: '+(syl()?"Açık":"Kapalı")+'</button></div>'+
     '<div class="rnav"><button class="btn ghost" id="rprev" '+(p===0?"disabled":"")+'>◀</button><div class="dots">'+st.pages.map((x,i)=>'<i class="'+(i===p?"on":"")+'"></i>').join("")+'</div><button class="btn" id="rnext">'+(last?"Sorular ✏️":"▶")+'</button></div>';
  }
  r.onclick=e=>{
    const w=e.target.closest(".w");
    if(w){stopRead();r.querySelectorAll(".w.hl").forEach(x=>x.classList.remove("hl"));w.classList.add("hl");sfx("tap");speakOne(w.dataset.w,()=>w.classList.remove("hl"));return;}
    const b=e.target.closest("button");if(!b)return;
    const pg=st.pages[p];
    if(b.id==="rx"){stopRead();r.classList.add("hidden");r.innerHTML="";render();}
    else if(b.id==="rsyl"){S.settings.syl=!syl();save();draw();}
    else if(b.id==="rlisten"){stopRead();speakOne(pg.text,()=>{});}
    else if(b.id==="rword"){
      if(reading){stopRead();return;}
      reading=true;
      const ws=[...r.querySelectorAll(".w")];let i=0;
      const next=()=>{
        ws.forEach(x=>x.classList.remove("hl"));
        if(!reading||i>=ws.length){reading=false;return;}
        const el=ws[i++];el.classList.add("hl");speakOne(el.dataset.w,next);
      };
      next();
    }
    else if(b.id==="rprev"&&p>0){p--;draw();}
    else if(b.id==="rnext"){
      if(p<st.pages.length-1){p++;sfx("tap");draw();}
      else{stopRead();r.classList.add("hidden");r.innerHTML="";startBookQuiz(st);}
    }
  };
  draw();
}
function startBookQuiz(st){
  const mk=()=>shuffle(st.quiz).map(q=>({cat:"reading",kind:"choice",prompt:q[0],speak:q[0],pic:st.cover,options:shuffle(q[2]),answer:q[1],optStyle:"text",reveal:q[1]}));
  runLesson(mk,{id:"b:"+st.id,title:st.title,type:"book"});
}
$("view").addEventListener("click",e=>{
  const t=e.target.closest('[data-a="book"]');if(t){sfx("tap");openBook(t.dataset.id);}
});

/* ================= BAŞLANGIÇ ================= */
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
document.addEventListener("contextmenu",e=>e.preventDefault());
render();
welcome();
})();
