const app=document.getElementById("app");
const video=document.getElementById("avatarVideo");
const cover=document.getElementById("cover");
const voice=document.getElementById("voice");
const audioFile=document.getElementById("audioFile");
const talkBtn=document.getElementById("talkBtn");
const restBtn=document.getElementById("restBtn");
const state=document.getElementById("state");
const reply=document.getElementById("reply");

const idleClips=["videos/clip1.mp4", "videos/clip2.mp4", "videos/clip3.mp4", "videos/clip4.mp4", "videos/clip5.mp4"];
const talkClips=["videos/clip6.mp4", "videos/clip7.mp4"];
let mode="idle", lastIdle=-1, lastTalk=-1, audioUrl=null;

function choose(list,last){
  if(list.length===1)return 0;
  let n; do{n=Math.floor(Math.random()*list.length)}while(n===last);
  return n;
}

function showVideo(src){
  video.classList.remove("visible");
  cover.classList.remove("hidden");
  video.src=src;
  video.currentTime=0;
  video.load();
  video.oncanplay=()=>{
    video.classList.add("visible");
    cover.classList.add("hidden");
    video.play().catch(()=>{});
  };
}

function idle(){
  mode="idle";
  app.classList.remove("speaking");
  state.textContent="TONY DISPONIBLE";
  reply.textContent="Bonjour. Je suis disponible.";
  lastIdle=choose(idleClips,lastIdle);
  showVideo(idleClips[lastIdle]);
}

function talking(){
  mode="talk";
  app.classList.add("speaking");
  state.textContent="TONY PARLE";
  reply.textContent="Tony parle.";
  lastTalk=choose(talkClips,lastTalk);
  showVideo(talkClips[lastTalk]);
}

video.addEventListener("ended",()=>{
  if(mode==="talk" && !voice.paused && !voice.ended) talking();
  else idle();
});

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
  talking();
  voice.play().catch(err=>{
    reply.textContent="Impossible de lire l’audio : "+err.message;
    idle();
  });
});

voice.addEventListener("ended",idle);
restBtn.addEventListener("click",()=>{
  voice.pause();
  idle();
});

// Start with the exact still image for a short moment, then begin natural idle clips.
setTimeout(idle,900);
