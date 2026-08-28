const $=id=>document.getElementById(id);
let state={armed:false,gate:false,listening:false};
let memories=JSON.parse(localStorage.getItem("tony.memories")||"[]");

function tick(){const d=new Date();$("clock").childNodes[0].nodeValue=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});$("date").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long"}).toUpperCase()}
tick();setInterval(tick,1000); updateMemory();

function speak(t){$("reply").textContent=t;if("speechSynthesis"in window){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang="fr-FR";u.rate=.94;u.pitch=.9;speechSynthesis.speak(u)}}
function toggleAlarm(){state.armed=!state.armed;$("alarm").textContent=state.armed?"ACTIVÉE":"DÉSACTIVÉE";speak(state.armed?"Alarme activée. Maison sécurisée.":"Alarme désactivée.")}
function toggleGate(){state.gate=!state.gate;$("gate").textContent=state.gate?"OUVERT":"FERMÉ";speak(state.gate?"Ouverture du portail, simulation.":"Fermeture du portail, simulation.")}
function demoBed(){speak("Avant de passer en mode nuit : deux lumières sont encore allumées et l’alarme est désactivée. Voulez-vous que je prépare la maison ?")}
function remember(){let v=prompt("Que dois-je retenir ?");if(!v)return;memories.push({text:v,created:new Date().toISOString()});localStorage.setItem("tony.memories",JSON.stringify(memories));updateMemory();speak("C’est enregistré dans ma mémoire locale de démonstration.")}
function updateMemory(){$("memoryInfo").textContent=memories.length+" souvenir"+(memories.length>1?"s":"")+" utile"+(memories.length>1?"s":"")+" enregistré"+(memories.length>1?"s":"")+"."}

function listen(){
 if(!("webkitSpeechRecognition"in window||"SpeechRecognition"in window)){speak("La reconnaissance vocale de ce navigateur n’est pas disponible.");return}
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition, r=new SR();r.lang="fr-FR";r.interimResults=false;
 document.getElementById("app").classList.add("listening");speak("Je vous écoute.");
 r.onresult=e=>{let t=e.results[0][0].transcript.toLowerCase();route(t)};
 r.onend=()=>document.getElementById("app").classList.remove("listening");r.start();
}
function route(t){
 if(t.includes("alarme")&&(t.includes("active")||t.includes("arme"))){if(!state.armed)toggleAlarm();return}
 if(t.includes("désactive")&&t.includes("alarme")){if(state.armed)toggleAlarm();return}
 if(t.includes("portail")){toggleGate();return}
 if(t.includes("coucher")||t.includes("dormir")){demoBed();return}
 speak("J’ai entendu : "+t+". Cette intention n’est pas encore reliée à une action.");
}

/* FUTURE BRIDGES
   HA: call Home Assistant REST/WebSocket through a secure local backend/proxy.
   AI: send transcribed text + safe context to an LLM backend; never expose API secrets in this browser file.
   Identity: speaker recognition must be performed by a dedicated voice-ID component, not guessed from speech-to-text.
   Memory: persistent household memory should move from localStorage to a controlled database with profiles/permissions.
*/
