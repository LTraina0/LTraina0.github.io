import {installInspection,recordInspectionFailure} from './agent-inspection.js';
let pointerSelect=null,pointerButton=null;
function focusViewportCanvas(){
  const canvas=document.querySelector('#canvas canvas');
  const frame=document.querySelector('#canvas iframe');
  if(canvas&&canvas.getClientRects().length){canvas.focus({preventScroll:true});return;}
  const innerCanvas=frame?.contentWindow?.portal?.renderer?.domElement;
  if(innerCanvas){frame.focus?.({preventScroll:true});innerCanvas.focus?.({preventScroll:true});}
}
document.addEventListener('pointerdown',e=>{
  pointerSelect=e.target?.closest?.('.view-tools select, .timeline select')??null;
  pointerButton=e.target?.closest?.('.view-tools button, #theme')??null;
},true);
document.addEventListener('keydown',e=>{if(e.key==='Tab'||e.key==='Escape'){pointerSelect=null;pointerButton=null;}});
document.addEventListener('click',e=>{
  const btn=e.target?.closest?.('.view-tools button, #theme');
  if(!btn||btn!==pointerButton)return;
  pointerButton=null;
  requestAnimationFrame(focusViewportCanvas);
});
document.addEventListener('change',e=>{
  if(e.target!==pointerSelect)return;
  pointerSelect=null;
  focusViewportCanvas();
});
const build=document.querySelector('#build'),params=new URLSearchParams(location.search),chosen=build.dataset.directProject||params.get('build')||'bamboo';
const allowed=new Set([...build.options].map(o=>o.value));build.value=allowed.has(chosen)?chosen:'bamboo';
if(!build.dataset.directProject){
  build.onchange=()=>{
    const url=new URL(location.href);
    for(const name of ['study','specimen','resolution','phase','section','joint','compare','view','revisao','environment'])url.searchParams.delete(name);
    url.searchParams.set('build',build.value);
    if(build.value==='fachada-022')url.searchParams.set('study','refined');
    url.searchParams.set('theme',document.body.classList.contains('dark')?'night':'day');
    location.assign(url);
  };
}
try{
 if(build.value.startsWith('portal-'))await import('./portal-controller.js');
 else if(['telhado-oriental','atelier-02','fachada-021','fachada-022'].includes(build.value))await import('./roof-controller.js');
 else {await import('./viewer.js');if(params.get('theme')==='night')document.querySelector('#theme').click();}
}catch(error){recordInspectionFailure(error);const loading=document.querySelector('#loading');loading.hidden=false;loading.replaceChildren(document.createTextNode('Não foi possível carregar a construção. Confira a conexão e tente novamente.'));const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=()=>location.reload();loading.append(retry);console.error(error);}

await installInspection();
