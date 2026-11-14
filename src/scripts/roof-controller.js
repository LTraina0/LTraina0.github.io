import {registry as roofRegistry} from '../../architect/registry.mjs';
import {pitches,lifts,finishes,variantId} from '../../architect/presets.mjs';
import {createRoofAssets} from './roof-assets.js';
import {createRoofScene} from './roof-scene.js';

const $=s=>document.querySelector(s);
const search=new URLSearchParams(location.search);
const controlBar=$('#portal-controls');
controlBar.hidden=false;
const lab=['atelier-02','fachada-021','fachada-022','naufragio-03','estudos-navais','popa-painel','popa-refinada','andorinha-carpintaria','andorinha-polar'].includes($('#build').value)?await (await import('./architect-lab.js')).createLab():null;
const registry=lab?.catalog??roofRegistry;
function selector(id,label,choices,initial){
  const field=document.createElement('label'),select=document.createElement('select');
  field.className='roof-field';field.append(label+' ');select.id=id;
  for(const item of choices) select.add(new Option(item.label,item.id));
  select.value=choices.some(item=>item.id===search.get(id))?search.get(id):initial;
  field.append(select);controlBar.append(field);return select;
}
const controls=lab?[]:[selector('pitch','Inclinação',pitches,'classica'),selector('lift','Beiral',lifts,'curvo'),selector('finish','Telha',finishes,'slate')];
const variant=()=>lab?lab.key():variantId(...controls.map(s=>s.value));
let assets,scene,inspectedScene;
const part=$('#part'),mode=$('#mode'),step=$('#step');
mode.add(new Option('Por etapa','stage'));
let model,visible=new Set(),subset=[],request=0,origin=null,currentVariant='';
function showSelection(b,owner=model,source=scene){
  const panel=$('#selection');panel.hidden=!b;panel.replaceChildren();
  if(!b) return;
  inspectedScene=source;
  const close=document.createElement('button');close.className='selection-close';close.textContent='×';
  close.setAttribute('aria-label','Limpar seleção');close.onclick=()=>source.select(null);
  const name=document.createElement('strong');name.textContent=registry[b.id].label;
  const coords=document.createElement('span');coords.textContent='Local X '+b.x+', Y '+b.y+', Z '+b.z;
  const module=owner.modules.find(m=>m.id===b.module),details=document.createElement('details');
  const summary=document.createElement('summary');summary.textContent='Detalhes técnicos';
  const state=document.createElement('small');state.textContent=b.id+' · '+JSON.stringify(b.states);
  const role=document.createElement('small');role.textContent=(owner!==model?'Referência · ':'')+module.label+' · etapa '+(module.stage+1);
  details.append(summary,state);panel.append(close,name,coords,role,details);
  if(b.component){const text=document.createElement('small');text.textContent='Componente · '+b.component;panel.append(text);}
  if(b.kitId){const text=document.createElement('small');text.textContent='Montagem · '+b.kitId;panel.append(text);}
  if(b.sourceCell){const lineage=document.createElement('small');lineage.textContent='Origem '+b.origin.join(', ')+' · '+(b.piece==='panel'?'painel':'estrutura fixa');details.append(lineage);}
  if(b.appearance){const text=document.createElement('small');text.textContent='Material · '+b.appearance.rule;details.append(text);}
  if(owner.validation?.game==='pending'){const text=document.createElement('small');text.textContent='Conferência no Bedrock pendente';details.append(text);}
  if(origin){
    const world=document.createElement('small');
    world.textContent='Mundo X '+(origin[0]+b.x)+', Y '+(origin[1]+b.y)+', Z '+(origin[2]+b.z);
    coords.after(world);
  }
}
function inventory(){
  const counts=new Map();
  for(const b of visible) counts.set(b.id,(counts.get(b.id)||0)+1);
  $('#material-summary').textContent=(lab?'Em estudo · ':'')+counts.size+' materiais · '+visible.size+' blocos visíveis';
  const rows=[];
  for(const [id,count] of [...counts].sort((a,b)=>b[1]-a[1])){
    const row=document.createElement('div');row.className='material-row';
    const slot=document.createElement('span');slot.className='item-slot';
    const img=new Image();img.alt='';img.src=assets.icons[id];slot.append(img);
    const name=document.createElement('span');name.className='item-name';name.textContent=registry[id].label;
    const stacks=document.createElement('small');stacks.className='roof-stacks';
    stacks.textContent=Math.floor(count/64)+' pilhas + '+count%64+' un.';name.append(stacks);
    const n=document.createElement('strong');n.textContent=count;
    row.title=id;row.append(slot,name,n);rows.push(row);
  }
  $('#material-list').replaceChildren(...rows);
}
function filter(){
  const n=Number(step.value), stages=new Map(model.modules.map(m=>[m.id,m.stage]));
  visible=new Set(subset.filter((b,i)=>{
    if(mode.value==='layer') return b.y<=n;
    if(mode.value==='stage') return stages.get(b.module)<=n;
    if(mode.value==='block') return i<n;
    return true;
  }));
  scene.filter(visible);
  lab?.refFilter(part.value,mode.value,n);
  $('#progress').textContent=visible.size+' de '+model.blocks.length+' blocos';
  const labels={all:'Completa',layer:'Corte Y '+n,stage:'Etapa '+(n+1)+' de '+(Number(step.max)+1),block:n+' de '+subset.length};
  $('#step-label').textContent=labels[mode.value];
  step.disabled=mode.value==='all';
  $('#prev').disabled=step.disabled||n<=Number(step.min);$('#next').disabled=step.disabled||n>=Number(step.max);
  if(!$('#material-dialog').hidden) inventory();
}
function range(){
  subset=model.blocks.filter(b=>(part.value==='all'||b.module===part.value)&&(!lab||lab.include(b)));
  step.min=mode.value==='layer'?model.bounds.min[1]:0;
  step.max=mode.value==='layer'?model.bounds.max[1]:mode.value==='stage'?Math.max(...model.modules.map(m=>m.stage)):subset.length;
  step.value=step.max;filter();
}
async function changeVariant(){
  const ticket=++request, id=variant();
  $('#loading').hidden=false;$('#loading').textContent='Carregando a variante…';
  try{
    let next;
    if(lab)next=await lab.load(id);
    else {
      const res=await fetch('/modelos/telhado/'+id+'.json');
      if(!res.ok)throw Error('HTTP '+res.status);
      next=await res.json();
    }
    if(ticket!==request) return;
    const previousAssets=assets;
    const nextAssets=lab?await lab.prepare(next,assets):assets??await createRoofAssets(registry);
    if(ticket!==request){if(nextAssets!==previousAssets)nextAssets.dispose();return;}
    assets=nextAssets;
    const initial=!model, previousPart=part.value;
    const differentStudy=model?.studyId?.split('-')[0]!==next.studyId?.split('-')[0];
    model=next;currentVariant=id;
    if(!scene){
      scene=createRoofScene(lab?.host??$('#canvas'),assets,showSelection);
      lab?.bind(scene,changeVariant,showSelection,range);
    }
    part.replaceChildren(new Option('Todas as partes','all'),...model.modules.map(m=>new Option(m.label,m.id)));
    if([...part.options].some(o=>o.value===previousPart)) part.value=previousPart;
    scene.load(model,assets);if(previousAssets && previousAssets!==assets)previousAssets.dispose();
    const url=new URL(location.href);
    for(const select of controls) url.searchParams.set(select.id,select.value);
    lab?.commit(model,url);range();
    if(initial||differentStudy)fitCurrent($('#view').value);
    $('#texture-status').textContent=assets.failures.length?'Texturas indisponíveis (xadrez): '+assets.failures.join(', '):'';
    history.replaceState(null,'',url);$('#loading').hidden=true;
  }catch(e){
    if(ticket!==request) return;
    $('#loading').textContent='Falha ao carregar a variante. ';
    const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=changeVariant;$('#loading').append(retry);
    if(!model) throw e;
  }
}
for(const s of controls) s.onchange=changeVariant;
function fitCurrent(view){if(lab)lab.framing(view,subset);else scene.fit(view,subset);}
mode.onchange=range;step.oninput=filter;
part.onchange=()=>{range();fitCurrent($('#view').value);};
for(const [id,d] of [['#prev',-1],['#next',1]]) $(id).onclick=()=>{step.value=Number(step.value)+d;filter();};
$('#view').onchange=e=>fitCurrent(e.target.value);
$('#fit').onclick=()=>{const view=model?.polar?'polarOverview':model?.stern?'avante':'perspective';$('#view').value=view;fitCurrent(view);};
$('#grid').onclick=e=>{scene.grid.visible=!scene.grid.visible;e.currentTarget.setAttribute('aria-pressed',String(scene.grid.visible));scene.draw();lab?.grid(scene.grid.visible);};
$('#theme').onclick=()=>{
  const night=document.body.classList.toggle('dark');scene.lighting(night);lab?.lighting(night);
  $('#theme').setAttribute('aria-pressed',String(night));$('#theme span').textContent=night?'Noite':'Dia';
};
const initialBackdrop=search.get('fundo')||search.get('backdrop');
if(initialBackdrop&&['editor','studio','classic'].includes(initialBackdrop)&&$('#backdrop'))$('#backdrop').value=initialBackdrop;
if($('#backdrop'))$('#backdrop').onchange=e=>{scene?.setBackdrop(e.target.value);lab?.backdrop?.(e.target.value);};
function materials(open){
  $('#material-dialog').hidden=!open;$('#materials').setAttribute('aria-expanded',String(open));
  if(open){inventory();$('#close-materials').focus();}else $('#materials').focus();
}
$('#materials').onclick=()=>materials($('#material-dialog').hidden);$('#close-materials').onclick=()=>materials(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#material-dialog').hidden) materials(false);else (inspectedScene??scene)?.select(null);}});
$('#origin-form').onsubmit=e=>{
  e.preventDefault();const raw=['x','y','z'].map(k=>$('#origin-'+k).value.trim());
  if(raw.every(v=>!v)) origin=null;
  else if(raw.every(v=>v && Number.isSafeInteger(Number(v)))) origin=raw.map(Number);
  else {$('#origin-status').textContent='Preencha os três valores inteiros.';return;}
  $('#origin-status').textContent=origin?'Origem aplicada.':'Origem removida.';const source=inspectedScene??scene;showSelection(source.selected,source===scene?model:lab?.reference,source);
};
$('.hint').textContent='Arraste para girar · roda para aproximar · clique em um bloco para inspecionar';
$('.note').textContent='Quantidades de blocos colocados, em pilhas de 64. Texturas vanilla da Mojang. Iluminação de prévia.';
document.title=$('#build').value==='andorinha-polar'?'BuildsMine · Andorinha · Creeping Winter':$('#build').value==='andorinha-carpintaria'?'BuildsMine · Popa da Andorinha':$('#build').value==='popa-refinada'?'BuildsMine · Andorinha refinada':$('#build').value==='popa-painel'?'BuildsMine · Popa e painel desprendido':$('#build').value==='estudos-navais'?'BuildsMine · Anatomia naval':$('#build').value==='naufragio-03'?'BuildsMine · O Último Encalhe':$('#build').value==='fachada-022'?'BuildsMine · Fachada refinada 0.2.2':lab?'BuildsMine · Ateliê de arquitetura 0.2':'BuildsMine · Telhado oriental';
await changeVariant();
if(search.get('theme')==='night') $('#theme').click();
await lab?.compareInitial();
window.buildsMine={project:$('#build').value,ready:true,scene,lab,get assets(){return assets;},get variant(){return currentVariant;},get model(){return model;},get visible(){return visible;}};
