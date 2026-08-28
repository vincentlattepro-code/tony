const app=document.getElementById("app");
const cover=document.getElementById("cover");
const A=document.getElementById("videoA");
const B=document.getElementById("videoB");
const voice=document.getElementById("voice");
const audioFile=document.getElementById("audioFile");
const talkBtn=document.getElementById("talkBtn");
const restBtn=document.getElementById("restBtn");
const state=document.getElementById("state");
const reply=document.getElementById("reply");

const idleClips=["videos/clip1.mp4", "videos/clip2.mp4", "videos/clip3.mp4", "videos/clip4.mp4", "videos/clip5.mp4"];
const talkClips=["videos/clip6.mp4", "videos/clip7.mp4"];
const CROSSFADE=0.22; // seconds
let mode="idle";
let current=A, next=B;
let lastIdle=-1, lastTalk=-1;
let audioUrl=null;
let transitionArmed=false;

function choose(list,last){
  if(list.length===1)return 0;
  let n;
  do{n=Math.floor(Math.random()*list.length)}while(n===last);
  return n;
}

function pool(){
  return mode==="talk" ? talkClips : idleClips;
}

function pickNextSrc(){
  const list=pool();
  if(mode==="talk"){
    lastTalk=choose(list,lastTalk);
    return list[lastTalk];
  } else {
    lastIdle=choose(list,lastIdle);
    return list[lastIdle];
  }
}

function prepare(el,src){
  el.pause();
  el.src=src;
  el.currentTime=0;
  el.load();
}

function primeNext(){
  transitionArmed=false;
  prepare(next,pickNextSrc());
}

function swapPlayers(){
  const old=current;
  const incoming=next;

  incoming.currentTime=0;
  incoming.play().catch(()=>{});
  incoming.classList.add("active");
  incoming.classList.remove("preload");

  old.classList.remove("active");
  old.classList.add("preload");

  setTimeout(()=>{
    old.pause();
    old.currentTime=0;
    current=incoming;
    next=old;
    primeNext();
  },240);
}

function startMode(newMode){
  mode=newMode;
  transitionArmed=false;

  if(mode==="talk"){
    app.classList.add("speaking");
    state.textContent="TONY PARLE";
    reply.textContent="Tony parle.";
  } else {
    app.classList.remove("speaking");
    state.textContent="TONY DISPONIBLE";
    reply.textContent="Bonjour. Je suis disponible.";
  }

  cover.classList.remove("hidden");
  current.classList.remove("active");
  next.classList.remove("active");
  current.classList.add("preload");
  next.classList.add("preload");

  prepare(current,pickNextSrc());
  current.oncanplay=()=>{
    current.classList.add("active");
    current.classList.remove("preload");
    cover.classList.add("hidden");
    current.play().catch(()=>{});
    primeNext();
    current.oncanplay=null;
  };
}

function watch(el){
  el.addEventListener("timeupdate",()=>{
    if(el!==current) return;
    const remaining=el.duration-el.currentTime;
    if(!transitionArmed && Number.isFinite(remaining) && remaining<=CROSSFADE+0.08){
      transitionArmed=true;
      if(next.readyState>=2) swapPlayers();
      else next.addEventListener("canplay",swapPlayers,{once:true});
    }
  });
  el.addEventListener("ended",()=>{
    if(el!==current) return;
    if(!transitionArmed) swapPlayers();
  });
}
watch(A);watch(B);

audioFile.addEventListener("change",()=>{
  const f=audioFile.files?.[0];
  if(!f)return;
  if(audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl=URL.createObjectURL(f);
  voice.src=audioUrl;
  talkBtn.disabled=false;
  reply.textContent="Audio chargé. Prêt pour le test.";
});

talkBtn.addEventListener("click",()=>{
  if(!voice.src)return;
  voice.currentTime=0;
  startMode("talk");
  voice.play().catch(err=>{
    reply.textContent="Impossible de lire l’audio : "+err.message;
    startMode("idle");
  });
});

voice.addEventListener("ended",()=>startMode("idle"));

restBtn.addEventListener("click",()=>{
  voice.pause();
  startMode("idle");
});

// Cache all clips to minimize stalls
[...idleClips,...talkClips].forEach(src=>{
  const v=document.createElement("video");
  v.preload="auto";
  v.src=src;
  v.muted=true;
});

setTimeout(()=>startMode("idle"),250);
