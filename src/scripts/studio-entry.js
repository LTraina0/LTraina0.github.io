import {installInspection,recordInspectionFailure} from './agent-inspection.js';
const build=document.querySelector('#build'),params=new URLSearchParams(location.search),chosen=params.get('build')||'bamboo';
const allowed=new Set([...build.options].map(o=>o.value));build.value=allowed.has(chosen)?chosen:'bamboo';
build.onchange=()=>{
  const url=new URL(location.href);
  for(const name of ['study','specimen','resolution','phase','section','joint','compare','view','revisao','environment'])url.searchParams.delete(name);
  url.searchParams.set('build',build.value);
  if(build.value==='fachada-022')url.searchParams.set('study','refined');
  url.searchParams.set('theme',document.body.classList.contains('dark')?'night':'day');
  location.assign(url);
};
try{
 if(build.value.startsWith('portal-'))await import('./portal-controller.js');
 else if(['telhado-oriental','atelier-02','fachada-021','fachada-022'].includes(build.value))await import('./roof-controller.js');
 else {await import('./viewer.js');if(params.get('theme')==='night')document.querySelector('#theme').click();}
}catch(error){recordInspectionFailure(error);const loading=document.querySelector('#loading');loading.hidden=false;loading.replaceChildren(document.createTextNode('Não foi possível carregar a construção. Confira a conexão e tente novamente.'));const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=()=>location.reload();loading.append(retry);console.error(error);}

await installInspection();
