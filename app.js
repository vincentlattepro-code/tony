const app=document.getElementById("app");
const reply=document.getElementById("reply");
const sceneWrap=document.getElementById("sceneWrap");
let armed=false, gate=false, isSpeaking=false;

function randomBlink(){
  if(isSpeaking && Math.random()<.18) return;
  app.classList.add("blink");
  setTimeout(()=>app.classList.remove("blink"),300);
  const next=2500+Math.random()*4200;
  setTimeout(randomBlink,next);
}
setTimeout(randomBlink,1600);

/* Extremely small natural idle shifts.
   More movement looked less realistic on a single image, so this stays restrained. */
function idleShift(){
  const x=(Math.random()-.5)*2.2;
  const y=(Math.random()-.5)*1.1;
  const r=(Math.random()-.5)*.16;
  sceneWrap.style.transition="transform 2.6s ease-in-out";
  sceneWrap.style.transform=`scale(1.019) translate(${x}px,${y}px) rotate(${r}deg)`;
  setTimeout(idleShift,2600+Math.random()*1800);
}
setTimeout(idleShift,1800);

/* Pointer/device parallax kept tiny to preserve the photographic illusion */
function look(px,py){
  const x=(px-.5)*2.4;
  const y=(py-.5)*1.3;
  sceneWrap.style.transition="transform .55s ease-out";
  sceneWrap.style.transform=`scale(1.02) translate(${x}px,${y}px)`;
}
addEventListener("pointermove",e=>look(e.clientX/innerWidth,e.clientY/innerHeight));

function say(text){
  reply.textContent=text;
  if(!("speechSynthesis" in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="fr-FR";
  u.rate=.92;
  u.pitch=.86;
  u.onstart=()=>{isSpeaking=true;app.classList.add("speaking")};
  u.onend=()=>{isSpeaking=false;app.classList.remove("speaking")};
  u.onerror=()=>{isSpeaking=false;app.classList.remove("speaking")};
  speechSynthesis.speak(u);
}

function toggleAlarm(){
  armed=!armed;
  app.classList.toggle("armed",armed);
  say(armed
      ?"Alarme activée. La maison est sécurisée."
      :"Alarme désactivée. Bon retour à la maison.");
}
function toggleGate(){
  gate=!gate;
  say(gate
      ?"Ouverture du portail. Simulation en cours."
      :"Fermeture du portail. Simulation en cours.");
}
function bedtime(){
  say("Avant de passer en mode nuit : deux lumières sont encore allumées et l’alarme est désactivée. Voulez-vous que je prépare la maison ?");
}
function listen(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){say("La reconnaissance vocale n’est pas disponible dans ce navigateur.");return}
  const r=new SR();
  r.lang="fr-FR";
  r.interimResults=false;
  app.classList.add("listening");
  reply.textContent="Je vous écoute.";
  r.onresult=e=>route(e.results[0][0].transcript.toLowerCase());
  r.onend=()=>app.classList.remove("listening");
  r.onerror=()=>app.classList.remove("listening");
  r.start();
}
function route(t){
  if(t.includes("coucher")||t.includes("dormir")||t.includes("nuit"))return bedtime();
  if(t.includes("portail"))return toggleGate();
  if(t.includes("alarme"))return toggleAlarm();
  say("J’ai entendu : "+t+". Cette commande n’est pas encore reliée à Home Assistant.");
}
setTimeout(()=>say("Bonjour. Interface photoréaliste prête pour les essais."),700);
