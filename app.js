const $=id=>document.getElementById(id);
const app=$("app"), world=$("world");
let armed=false, gate=false;

function tick(){
 const d=new Date();
 $("clock").childNodes[0].nodeValue=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
 $("date").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long"}).toUpperCase();
}
tick(); setInterval(tick,1000);

// Simulated eye blinking
function blink(){
 app.classList.add("blink");
 setTimeout(()=>app.classList.remove("blink"),380);
}
setInterval(()=>{ if(Math.random()>.22) blink(); }, 3200);

// Subtle "look at you" / pseudo-3D parallax
function moveLook(x,y){
 const rx=(.5-y)*2.2, ry=(x-.5)*3.4;
 world.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;
}
window.addEventListener("pointermove",e=>moveLook(e.clientX/innerWidth,e.clientY/innerHeight));
window.addEventListener("deviceorientation",e=>{
 if(e.gamma==null||e.beta==null)return;
 moveLook(Math.max(0,Math.min(1,.5+e.gamma/90)),Math.max(0,Math.min(1,.5+(e.beta-45)/120)));
});

function say(text){
 $("reply").textContent=text;
 if(!("speechSynthesis" in window)) return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 u.lang="fr-FR"; u.rate=.93; u.pitch=.88;
 u.onstart=()=>app.classList.add("speaking");
 u.onend=()=>app.classList.remove("speaking");
 u.onerror=()=>app.classList.remove("speaking");
 speechSynthesis.speak(u);
}
function toggleAlarm(){
 armed=!armed;
 app.classList.toggle("armed",armed);
 $("alarm").textContent=armed?"ACTIVÉE":"DÉSACTIVÉE";
 say(armed?"Alarme activée. La maison est sécurisée.":"Alarme désactivée. Bon retour.");
}
function toggleGate(){
 gate=!gate;
 $("gate").textContent=gate?"OUVERT":"FERMÉ";
 say(gate?"Ouverture du portail. Simulation en cours.":"Fermeture du portail. Simulation en cours.");
}
function bedtime(){
 say("Avant de passer en mode nuit : deux lumières sont encore allumées et l’alarme est désactivée. Voulez-vous que je prépare la maison ?");
}
function listen(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){say("La reconnaissance vocale n’est pas disponible dans ce navigateur.");return}
 const r=new SR(); r.lang="fr-FR"; r.interimResults=false;
 app.classList.add("listening");
 $("reply").textContent="Je vous écoute.";
 r.onresult=e=>route(e.results[0][0].transcript.toLowerCase());
 r.onend=()=>app.classList.remove("listening");
 r.onerror=()=>app.classList.remove("listening");
 r.start();
}
function route(t){
 if(t.includes("coucher")||t.includes("dormir")) return bedtime();
 if(t.includes("portail")) return toggleGate();
 if(t.includes("alarme")){
   if((t.includes("désactive")||t.includes("désarme")) && armed) return toggleAlarm();
   if((t.includes("active")||t.includes("arme")) && !armed) return toggleAlarm();
 }
 say("J’ai entendu : "+t+". Cette commande n’est pas encore connectée.");
}

// Initial greeting after load
setTimeout(()=>say("Bonjour. Interface animée prête pour les essais."),700);
