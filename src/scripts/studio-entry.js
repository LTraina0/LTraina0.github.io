import {installInspection,recordInspectionFailure} from './agent-inspection.js';
const build=document.querySelector('#build'),params=new URLSearchParams(location.search),chosen=params.get('build')||'bamboo';
const archive={"naufragio-03": "O Último Encalhe · Naufrágio 0.3", "estudos-navais": "Anatomia naval · Estudos de escala", "popa-painel": "Popa · painel desprendido", "popa-refinada": "Andorinha · acabamentos navais", "andorinha-carpintaria": "Popa da Andorinha · painel deslocado", "andorinha-polar": "Andorinha · Creeping Winter"};
if(Object.hasOwn(archive,chosen))build.add(new Option(archive[chosen]+" · Acervo",chosen));
const directRoute=id=>[...build.options].find(option=>option.value===id)?.dataset.href;
const dedicated=id=>id==='andorinha-ultimo-encalhe'||id==='andorinha-aparelho'||id==='andorinha-cabine';
if(dedicated(chosen))location.replace(directRoute(chosen));
const allowed=new Set([...build.options].map(o=>o.value));build.value=allowed.has(chosen)?chosen:'bamboo';
build.onchange=()=>{if(dedicated(build.value)){location.assign(directRoute(build.value));return;}const url=new URL(location.href);
 if(['andorinha-carpintaria','andorinha-polar'].includes(build.value)||['andorinha-carpintaria','andorinha-polar'].includes(chosen)||['sections','stern','sternwork'].includes(url.searchParams.get('study'))){
   for(const name of ['study','specimen','resolution','phase','section','joint','compare','view','revisao','environment'])url.searchParams.delete(name);
 }
 if(build.value==='andorinha-carpintaria')url.searchParams.set('phase','displaced');
 url.searchParams.set('build',build.value);if(build.value==='popa-refinada')url.searchParams.set('study','sternwork');if(build.value==='popa-painel')url.searchParams.set('study','stern');if(build.value==='estudos-navais')url.searchParams.set('study','sections');if(build.value==='naufragio-03')url.searchParams.set('study','shipwreck');if(build.value==='fachada-022')url.searchParams.set('study','refined');url.searchParams.set('theme',document.body.classList.contains('dark')?'night':'day');location.assign(url);};
try{
 if(build.value.startsWith('portal-'))await import('./portal-controller.js');
 else if(['telhado-oriental','atelier-02','fachada-021','fachada-022','naufragio-03','estudos-navais','popa-painel','popa-refinada','andorinha-carpintaria','andorinha-polar'].includes(build.value))await import('./roof-controller.js');
 else {await import('./viewer.js');if(params.get('theme')==='night')document.querySelector('#theme').click();}

}catch(error){recordInspectionFailure(error);const loading=document.querySelector('#loading');loading.hidden=false;loading.replaceChildren(document.createTextNode('Não foi possível carregar a construção. Confira a conexão e tente novamente.'));const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=()=>location.reload();loading.append(retry);console.error(error);}

await installInspection();
