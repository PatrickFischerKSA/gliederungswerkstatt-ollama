import {buildChatPrompt,chatReport} from './chat-review.js';
export function setupChatReview({getState,persist,render,status,download,uid}){
 const $=s=>document.querySelector(s);
 const current=()=>getState().chatReview||{prompt:'',response:''};
 function refresh(){const value=current();if($('#chat-prompt').value!==value.prompt)$('#chat-prompt').value=value.prompt;if($('#chat-answer').value!==value.response)$('#chat-answer').value=value.response;$('#chat-copy').disabled=!value.prompt;$('#chat-download').disabled=!value.prompt;$('#chat-save-note').disabled=!value.response.trim();}
 $('#chat-generate').onclick=()=>{try{const prompt=buildChatPrompt(getState());if(current().response.trim()&&!confirm('Neuen Prüfauftrag erstellen und die bisherige eingefügte Antwort ersetzen? Sichere bei Bedarf vorher den Chat-Bericht.'))return;getState().chatReview={prompt,response:''};persist();refresh();$('#chat-status').textContent='Prüfauftrag erstellt. Er enthält Entwurf, Leitfrage, Titel und Gliederung mit Kapitelnotizen. Es wurde nichts an einen Anbieter gesendet.';}catch(e){$('#chat-status').textContent=e.message}};
 $('#chat-copy').onclick=async()=>{const prompt=current().prompt;if(!prompt)return;try{await navigator.clipboard.writeText(prompt);$('#chat-status').textContent='Prüfauftrag kopiert. Jetzt in einem KI-Chat deiner Wahl einfügen und dort absenden.';}catch{$('#chat-prompt').focus();$('#chat-prompt').select();$('#chat-status').textContent='Bitte den markierten Auftrag manuell kopieren: Windows Strg+C, Mac ⌘C.'}};
 $('#chat-answer').addEventListener('input',()=>{getState().chatReview={...current(),response:$('#chat-answer').value};persist();$('#chat-save-note').disabled=!$('#chat-answer').value.trim()});
 $('#chat-download').onclick=()=>{if(!current().prompt){status('Bitte zuerst einen Prüfauftrag erstellen.');return}download('chat-pruefung.md',chatReport(current()),'text/markdown;charset=utf-8')};
 $('#chat-save-note').onclick=()=>{const response=current().response.trim();if(!response)return;getState().materials.push({id:uid(),kind:'Notizen',title:'KI-Rückmeldung aus eigenem Chat',text:response,assigned:[]});persist();render();$('#chat-status').textContent='Antwort als neue Notiz im Materialspeicher gesichert. Du kannst sie einem Kapitel zuordnen.';};
 return {refresh};
}
