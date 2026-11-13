const $=s=>document.querySelector(s);
const copy=value=>JSON.parse(JSON.stringify(value));
const failures=[];
let revision=0,webmcp={available:false,registered:[],errors:[]},tail=Promise.resolve();
const controls=['build','view','part','mode','step','pitch','lift','finish','lab-study','lab-edition','lab-distribution','lab-family','lab-curve','lab-bracket','lab-detail','lab-finish','lab-pattern','lab-component','lab-variation','lab-compare','lab-console','lab-capital','lab-surface','lab-composition','lab-condition','lab-environment','lab-specimen','lab-resolution','lab-phase','stern-section','stern-joint'];
const safeMessage=error=>String(error?.message??error).slice(0,1000);
function failure(kind,error){failures.push({kind,message:safeMessage(error)});if(failures.length>32)failures.shift();}
export const recordInspectionFailure=error=>failure('loading',error);
window.addEventListener('error',e=>failure('javascript',e.error??e.message));
window.addEventListener('unhandledrejection',e=>failure('promise',e.reason));
const active=()=>window.buildsMine?.model??window.buildsMine?.portal?.model??window.studio?.model??{blocks:window.studio?.blocks??[]};
const blockData=b=>b?copy({x:b.x,y:b.y,z:b.z,id:b.id??b.name,states:b.states??{},module:b.module??b.stage??null,component:b.component??null,appearance:b.appearance??null,...(b.sourceCell?{sourceCell:b.sourceCell,origin:b.origin,piece:b.piece,kitId:b.kitId??null}:{})}):null;
const viewState=()=>Object.fromEntries(controls.filter(id=>$('#'+id)).map(id=>[id,$('#'+id).value]));
function snapshot(){
  const model=active(),b=window.buildsMine,scene=b?.scene,studio=window.studio,renderer=scene?.renderer??studio?.renderer;
  const selected=scene?.selected??studio?.selected??b?.portal?.inspection?.block;
  const materials=model.materials??model.blocks.reduce((counts,block)=>{
    const id=block.id??block.name;counts[id]=(counts[id]??0)+1;return counts;
  },{});
  const camera=scene?.camera??studio?.camera,info=renderer?.info;
  return copy({apiVersion:'1',release:'0.3.3',revision,ready:$('#loading').hidden,project:$('#build').value,
    variant:b?.variant??null,modelVersion:model.version??null,parameters:model.params??{},bounds:model.bounds??model.size??null,
    blocks:model.blocks?.length??0,materials,modules:model.modules??model.stages??[],
    components:model.components??[],validation:model.validation??null,
    stern:model.stern??null,naval:model.naval??null,polar:model.polar??null,datums:model.datums??null,architecturalConstraints:model.architecture??null,
    selected:blockData(selected),controls:viewState(),visible:b?.visible?.size??b?.portal?.visibleBlocks??Number($('#progress').textContent.match(/^\d+/)?.[0]??0),
    theme:document.body.classList.contains('dark')?'night':'day',
    camera:camera?{type:camera.type,position:camera.position.toArray(),zoom:camera.zoom,target:(scene?.controls??studio?.controls)?.target?.toArray()??null}:null,
    rendering:{drawCalls:info?.render.calls??null,triangles:info?.render.triangles??null,geometries:info?.memory.geometries??null,
      textures:info?.memory.textures??null,textureFailures:b?.assets?.failures??studio?.textureFailures??[],status:$('#texture-status').textContent},
    failures,webmcp});
}
function announce(){
  revision++;document.documentElement.dataset.buildsmineRevision=String(revision);
  document.documentElement.dataset.buildsmineReady=String($('#loading').hidden);
  document.dispatchEvent(new CustomEvent('buildsmine:statechange',{detail:{revision,project:$('#build').value}}));
}
async function settled(){
  const end=performance.now()+60000;
  while(!$('#loading').hidden){if(performance.now()>end)throw Error('A construção ainda está carregando');await new Promise(r=>setTimeout(r,50));}
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
}
function options(){
  return controls.filter(id=>$('#'+id)?.tagName==='SELECT').map(id=>({id,label:$('#'+id).labels?.[0]?.textContent.trim()??id,
    visible:!$('#'+id).closest('[hidden]'),value:$('#'+id).value,options:[...$('#'+id).options].map(o=>({value:o.value,label:o.textContent}))}));
}
function blocks({offset=0,limit=64,module,id}={}){
  if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>256||module!==undefined&&typeof module!=='string'||id!==undefined&&typeof id!=='string')throw Error('Filtro inválido, limite de 256 blocos');
  const rows=active().blocks.filter(b=>(module===undefined||String(b.module??b.stage)===module)&&(id===undefined||(b.id??b.name)===id));
  return {total:rows.length,offset,items:rows.slice(offset,offset+limit).map(blockData)};
}
async function control({id,value}){
  if(!controls.includes(id)||typeof value!=='string'||value.length>120)throw Error('Controle inválido');
  const el=$('#'+id);
  if(!el||el.disabled||el.closest('[hidden]'))throw Error('Controle indisponível');
  if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===value))throw Error('Opção inválida');
  if(id==='step'&&(!Number.isSafeInteger(Number(value))||Number(value)<Number(el.min)||Number(value)>Number(el.max)))throw Error('Etapa fora do intervalo');
  if(id==='build'){
    const url=new URL(location.href);url.searchParams.set('build',value);
    return {navigationRequired:true,url:url.href};
  }
  el.value=value;el.dispatchEvent(new Event(id==='step'?'input':'change',{bubbles:true}));
  await settled();announce();return snapshot();
}
async function select({x,y,z}){
  if(![x,y,z].every(Number.isSafeInteger))throw Error('Coordenadas inteiras obrigatórias');
  const b=window.buildsMine,block=active().blocks.find(n=>n.x===x&&n.y===y&&n.z===z);
  if(!block)throw Error('Coordenada ausente');
  if(b?.scene){if(!b.visible.has(block))throw Error('Bloco oculto pelo filtro');b.scene.select(block);}
  else if(b?.portal){if(!b.portal.isVisible(block))throw Error('Bloco oculto pelo filtro');b.portal.selectBlock(block,true);}
  else if(window.studio?.inspectBlock)window.studio.inspectBlock(block);
  else throw Error('Seleção indisponível neste projeto');
  await settled();announce();return blockData(block);
}
const definitions=[
  {name:'buildsmine_inspect',description:'Read the active public construction, camera, parameters, validation limits and render diagnostics.',properties:{},readOnly:true,run:()=>snapshot()},
  {name:'buildsmine_controls',description:'List public viewer controls and their allowed options.',properties:{},readOnly:true,run:()=>options()},
  {name:'buildsmine_blocks',description:'Read a bounded page of canonical blocks, with states and component metadata.',properties:{offset:{type:'integer',minimum:0},limit:{type:'integer',minimum:1,maximum:256},module:{type:'string',maxLength:120},id:{type:'string',maxLength:120}},readOnly:true,run:blocks},
  {name:'buildsmine_view',description:'Change one visible viewer control and wait for the render. For build selection returns a same-origin navigation URL for the caller to open.',properties:{id:{type:'string',enum:controls},value:{type:'string',maxLength:120}},required:['id','value'],run:control},
  {name:'buildsmine_select',description:'Select an existing visible block in the public preview by local integer coordinates.',properties:{x:{type:'integer'},y:{type:'integer'},z:{type:'integer'}},required:['x','y','z'],run:select}
];
function execute(name,input={}){
  const definition=definitions.find(d=>d.name===name);
  if(!definition||!input||Array.isArray(input)||typeof input!=='object'||Object.keys(input).some(k=>!Object.hasOwn(definition.properties,k))||(definition.required??[]).some(k=>!Object.hasOwn(input,k)))return Promise.reject(Error('Operação ou argumentos inválidos'));
  const job=tail.then(()=>definition.run(input));tail=job.catch(()=>{});return job;
}
export async function installInspection(){
  Object.defineProperty(window,'BuildsMineInspector',{value:Object.freeze({snapshot,blocks,controls:options,execute}),configurable:false});
  $('#loading').setAttribute('role','status');$('#selection').setAttribute('aria-label','Bloco selecionado');
  $('#progress').setAttribute('aria-live','polite');$('#canvas').setAttribute('role','region');
  for(const canvas of document.querySelectorAll('canvas')){canvas.setAttribute('aria-label','Modelo tridimensional interativo');canvas.tabIndex=0;}
  document.addEventListener('change',()=>requestAnimationFrame(announce));
  document.addEventListener('input',()=>requestAnimationFrame(announce));
  new MutationObserver(announce).observe($('#loading'),{attributes:true,childList:true});
  new MutationObserver(announce).observe($('#selection'),{attributes:true,childList:true});
  const registry=document.modelContext??navigator.modelContext;
  webmcp={available:typeof registry?.registerTool==='function',provider:document.modelContext?'document':navigator.modelContext?'navigator':null,registered:[],errors:[]};
  if(webmcp.available){
    const lifecycle=new AbortController();
    for(const d of definitions){
      try{
        await registry.registerTool({name:d.name,description:d.description,inputSchema:{type:'object',properties:d.properties,required:d.required??[],additionalProperties:false},
          annotations:{readOnlyHint:!!d.readOnly},
          execute:async input=>({content:[{type:'text',text:JSON.stringify(await execute(d.name,input))}]})},{signal:lifecycle.signal});
        webmcp.registered.push(d.name);
      }catch(e){webmcp.errors.push(safeMessage(e));}
    }
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
  announce();
  if($('#loading').hidden){
    performance.mark('buildsmine-ready');
    document.dispatchEvent(new CustomEvent('buildsmine:ready',{detail:{project:$('#build').value}}));
  }
}
