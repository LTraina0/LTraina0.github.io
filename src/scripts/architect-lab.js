import {sternViews} from './stern-views.js';
import {defaults,choices,fields,valuesFor,studyKey} from '../../architect/v2/studies.mjs';
import {unpackModel} from '../../architect/v2/transport.mjs';
import {createRoofScene} from './roof-scene.js';
import {createRoofAssets} from './roof-assets.js';
import {materialDiscovery} from './architect-materials.js';

async function json(url){
  const response=await fetch(url); if(!response.ok) throw Error('Falha ao carregar '+url);
  return response.json();
}
function fetchModel(id){
  if(id==='baseline')return json('/modelos/telhado/classica-curvo-slate.json');
  if(id==='polar-main')return json('/andorinha-polar/model.json').then(unpackModel);
  const revision=/^carpintaria-(intact|broken|displaced)$/.exec(id);
  const url=revision?'/andorinha-carpintaria/'+revision[1]+'.json':'/modelos/atelier/'+encodeURIComponent(id)+'.json';
  return json(url).then(unpackModel);
}
export async function createLab(){
  const catalog=await json('/modelos/atelier/catalogo.json');
  const updateDiscovery=materialDiscovery(catalog);
  const bar=document.querySelector('#portal-controls'),container=document.querySelector('#canvas');
  document.body.classList.add('architect-lab');
  const surfaces=document.createElement('div');surfaces.className='lab-surfaces';container.append(surfaces);
  function pane(title){
    const element=document.createElement('div');element.className='lab-pane';
    const badge=document.createElement('span');badge.className='lab-caption';badge.textContent=title;
    element.append(badge);surfaces.append(element);
    return {element,badge};
  }
  const left=pane('Referência'),right=pane('Em estudo');left.element.hidden=true;
  const form=document.createElement('div');form.className='lab-fields';bar.append(form);
  const labels={study:'Estudo',family:'Tipologia',curve:'Beiral',bracket:'Consolo',detail:'Acabamento',finish:'Paleta',pattern:'Distribuição',component:'Componente',variation:'Material',edition:'Versão',distribution:'Distribuição material',console:'Consolo',capital:'Capitel',surface:'Materiais',composition:'Implantação',condition:'Madeiras',specimen:'Componente naval',resolution:'Resolução',phase:'Estado da popa'};
  const state={...defaults},query=new URLSearchParams(location.search),inputs={};
  for(const k of Object.keys(choices)) if(Object.hasOwn(choices[k],query.get(k))) state[k]=query.get(k);
  if(query.get('build')==='fachada-021'&&!query.has('study'))state.study='facade';
  if(query.get('build')==='fachada-022'&&!query.has('study'))state.study='refined';
  if(query.get('build')==='naufragio-03'&&!query.has('study'))state.study='shipwreck';
  if(query.get('build')==='estudos-navais'&&!query.has('study'))state.study='sections';
  if(query.get('build')==='popa-painel'&&!query.has('study'))state.study='stern';
  if(query.get('build')==='popa-refinada'&&!query.has('study'))state.study='sternwork';
  const officialCarpentry=query.get('build')==='andorinha-carpintaria';
  const polar=query.get('build')==='andorinha-polar';
  if(officialCarpentry){
    state.study='sternwork';
    if(!Object.hasOwn(choices.phase,query.get('phase')))state.phase='displaced';
  }
  if(polar)state.study='sternwork';
  const isCarpentry=()=>state.study==='sternwork'&&(officialCarpentry||(query.get('revisao')==='carpintaria'&&query.get('build')==='popa-refinada'));
  const isStern=()=>['stern','sternwork'].includes(state.study);
  for(const k of Object.keys(choices)){
    const field=document.createElement('label'),select=document.createElement('select');
    field.className='roof-field';field.append(labels[k]+' ',select);select.id='lab-'+k;
    form.append(field);inputs[k]={field,select};
  }
  const environmentField=document.createElement('label'),environment=document.createElement('select');
  environmentField.className='roof-field';environment.id='lab-environment';
  environment.replaceChildren(new Option('Conjunto completo','all'),new Option('Somente embarcação','naval'),new Option('Somente ambiente','context'));
  if(['all','naval','context'].includes(query.get('environment')))environment.value=query.get('environment');
  environmentField.append('Contexto ',environment);form.append(environmentField);

  function sternField(id,label,entries){
    const field=document.createElement('label'),select=document.createElement('select');
    field.className='roof-field';select.id=id;field.append(label+' ',select);form.append(field);
    for(const [value,text] of entries)select.add(new Option(text,value));
    return {field,select};
  }
  const section=sternField('stern-section','Corte',[['all','Sem corte'],['z10','Seção na caverna 10'],['port','Metade de bombordo']]);
  const joint=sternField('stern-joint','Conexões',[['all','Todas as peças']]);
  const status=document.createElement('output');status.setAttribute('aria-live','polite');form.append(status);
  let contactCells=null;
  function updateJoint(model){
    const j=model?.stern?.joints.find(g=>g.id===joint.select.value);
    contactCells=j?new Set(j.contacts.flat().map(p=>p.join(','))):null;
    if(!j){status.textContent='';status.title='';return;}
    const [a,b]=j.contacts[0];
    const find=p=>model.blocks.find(cell=>cell.origin?.every((v,i)=>v===p[i]));
    const location=p=>{const cell=find(p);return cell?[cell.x,cell.y,cell.z].join(', '):'retirado';};
    status.textContent=j.contacts.length+' '+(j.contacts.length===1?'contato':'contatos')+' · '+(j.status==='broken'?'ligação rompida':j.status==='removed'?'junto ao painel retirado':'ligação preservada');
    status.title='Exemplo na origem: '+a.join(', ')+' ↔ '+b.join(', ')+'. Neste estado: '+location(a)+' ↔ '+location(b)+'.';
  }
  const include=b=>{
    if(polar){
      const environmental=Boolean(b.environment)||shown?.polar?.environmentModules?.includes(b.module);
      return environment.value==='all'||(environment.value==='context')===environmental;
    }
    if(state.study==='shipwreck')return environment.value==='all'||(environment.value==='context')===(b.module==='context');
    if(!isStern()||!b.origin)return true;
    return (section.select.value!=='z10'||b.origin[2]===10)&&(section.select.value!=='port'||b.origin[0]<=0)&&(!contactCells||contactCells.has(b.origin.join(',')));
  };
  let refreshFilter;
  environment.onchange=()=>{const url=new URL(location.href);url.searchParams.set('environment',environment.value);history.replaceState(null,'',url);refreshFilter?.();};

  for(const [name,control] of [['section',section],['joint',joint]]){
    control.select.onchange=()=>{
      const url=new URL(location.href);
      if(control.select.value==='all')url.searchParams.delete(name);else url.searchParams.set(name,control.select.value);
      history.replaceState(null,'',url);updateJoint(shown);refreshFilter?.();
    };
  }
  if([...section.select.options].some(o=>o.value===query.get('section')))section.select.value=query.get('section');
  const reference=document.createElement('label'),selector=document.createElement('select'),pin=document.createElement('button');
  selector.id='lab-compare';selector.add(new Option('Desativada','off'));selector.add(new Option('Telhado 0.1','baseline'));
  if(polar)selector.add(new Option('Andorinha aprovada · sem ambiente','carpintaria-displaced'));
  for(const [phase,label] of Object.entries(choices.phase))selector.add(new Option(label,'stern-'+phase));
  for(const [phase,label] of Object.entries(choices.phase))selector.add(new Option('Refinada · '+label,'sternwork-'+phase));
  for(const edition of ['A','B','C'])selector.add(new Option('Fachada '+choices.edition[edition],'facade-'+edition+'-contextual'));
  selector.add(new Option('Refinamento 0.2.2 · madeira','refined-balanced-timber-mineral'));
  for(const c of Object.keys(choices.composition))selector.add(new Option('Naufrágio · '+choices.composition[c],'shipwreck-'+c+'-weathered'));
  for(const [part,title] of Object.entries(choices.specimen)){
    for(const [scale,label] of Object.entries(choices.resolution)){
      selector.add(new Option(title+' · '+label,'sections-'+part+'-'+scale));
    }
  }
  reference.className='roof-field';reference.append('Comparação ',selector);
  pin.type='button';pin.id='lab-pin';pin.textContent='Fixar estudo';pin.title='Manter este modelo à esquerda e mudar o estudo à direita';
  form.append(reference,pin);
  const scaleGuide=document.createElement('a');
  scaleGuide.href='/estudos-navais/';scaleGuide.textContent='Guia das escalas';
  const sternGuide=document.createElement('a');sternGuide.href='/popa-painel/';sternGuide.textContent='Prancha e auditoria';
  form.append(scaleGuide,sternGuide);
  let main,shown,referenceScene,referenceModel,referenceAssets,referenceSet,pinned=null,change,inspect;
  let refTicket=0,syncing=false,refReady=false;
  const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  function updateFields(){
    sternGuide.hidden=!isStern()&&!polar;
    sternGuide.textContent=polar||isCarpentry()?'Dados da construção':'Prancha e auditoria';
    sternGuide.href=polar?'/inspecao/polar-main/':isCarpentry()?'/inspecao/carpintaria-'+state.phase+'/':state.study==='sternwork'?'/popa-refinada/':'/popa-painel/';
    scaleGuide.hidden=state.study!=='sections';
    const cameraSelect=document.querySelector('#view');
    const forward=cameraSelect.querySelector('option[value="avante"]');
    for(const [value,{label}] of Object.entries(sternViews)){
      const option=cameraSelect.querySelector('option[value="'+value+'"]');
      const available=value.startsWith('polar')?polar:isStern();
      if(available&&!option)cameraSelect.add(new Option(label,value));
      if(!available&&option)option.remove();
    }
    if((isStern()||polar)&&!forward)cameraSelect.add(new Option('Perspectiva por estibordo','avante'));
    if(!isStern()&&!polar&&forward)forward.remove();
    section.field.hidden=joint.field.hidden=status.hidden=polar||!isStern();
    environmentField.hidden=!polar&&state.study!=='shipwreck';
    for(const [k,{field,select}] of Object.entries(inputs)){
      const active=!polar&&(k==='study'?!officialCarpentry:fields[state.study].includes(k));
      field.hidden=!active;if(!active)continue;
      const values=valuesFor(k,state.study);
      if(!values.includes(state[k])) state[k]=values[0];
      select.replaceChildren(...values.map(v=>new Option(choices[k][v],v)));select.value=state[k];
    }
  }
  updateFields();
  for(const [k,{select}] of Object.entries(inputs))select.onchange=()=>{state[k]=select.value;if(k==='study')query.delete('revisao');updateFields();change?.();};
  function decorateBadge(pane,text){pane.badge.textContent=text;pane.badge.title=text;}
  async function prepare(model,prior){
    const ids=Object.keys(model.materials);
    if(prior && ids.every(id=>Object.hasOwn(prior.icons,id)))return prior;
    return createRoofAssets(Object.fromEntries(ids.map(id=>[id,catalog[id]])));
  }
  function sync(from,to){
    if(syncing||!refReady)return;
    syncing=true;try{to.matchView(from);}finally{syncing=false;}
  }
  function framing(view,candidates){
    const both=refReady && referenceSet?.size?[...candidates,...referenceSet]:candidates;
    const envelope=!polar&&shown?.stern?.frame?.map(([x,y,z])=>({x,y,z}));
    main.fit(view,envelope?(refReady&&!referenceModel.stern?[...envelope,...referenceSet]:envelope):both);if(refReady)sync(main,referenceScene);
  }
  function refFilter(part,mode,n){
    if(!refReady) return;
    const m=referenceModel, stages=new Map(m.modules.map(x=>[x.id,x.stage]));
    // Unrelated studies have different module names; their intersection may be empty.
    const subset=m.blocks.filter(b=>(part==='all'||b.module===part)&&include(b));
    referenceSet=new Set(subset.filter((b,i)=>mode==='layer'?b.y<=n:mode==='stage'?stages.get(b.module)<=n:mode==='block'?i<n:true));
    referenceScene.filter(referenceSet);
    const name=m.studyLabel||'Telhado 0.1 · clássico';
    decorateBadge(left,'Referência · '+name+' · '+referenceSet.size+' blocos');
  }
  async function compare(){
    const ticket=++refTicket,selection=selector.value;
    if(selection!=='pinned'){
      const url=new URL(location.href);
      if(selection==='off')url.searchParams.delete('compare');else url.searchParams.set('compare',selection);
      history.replaceState(null,'',url);
    }
    refReady=false;left.element.hidden=selection==='off';
    surfaces.classList.toggle('paired',selection!=='off');
    if(selection==='off'){
      if(referenceScene) referenceScene.select(null);
      await frame();if(ticket===refTicket) framing(document.querySelector('#view').value,shown.blocks);
      return;
    }
    decorateBadge(left,'Carregando referência…');
    try{
      const next=selection==='pinned'?pinned:await fetchModel(selection);
      const assets=await prepare(next,referenceAssets);
      if(ticket!==refTicket){if(assets!==referenceAssets)assets.dispose();return;}
      if(!referenceScene){
        referenceScene=createRoofScene(left.element,assets,b=>inspect(b,referenceModel,referenceScene));
        referenceScene.controls.addEventListener('change',()=>sync(referenceScene,main));
      }
      referenceModel=next;const previous=referenceAssets;referenceAssets=assets;
      referenceScene.load(next,assets);if(previous&&previous!==assets)previous.dispose();
      referenceScene.lighting(document.body.classList.contains('dark'));referenceScene.grid.visible=main.grid.visible;
      refReady=true;
      refFilter(document.querySelector('#part').value,document.querySelector('#mode').value,Number(document.querySelector('#step').value));
      await frame();if(ticket===refTicket) framing(document.querySelector('#view').value,shown.blocks.filter(b=>document.querySelector('#part').value==='all'||b.module===document.querySelector('#part').value));
    }catch(error){if(ticket!==refTicket)return;decorateBadge(left,'Falha na referência · selecione novamente');console.error(error);}
  }
  selector.onchange=compare;
  pin.onclick=()=>{
    if(!shown)return;pinned=shown;
    if(!selector.querySelector('[value="pinned"]'))selector.add(new Option('Estudo fixado','pinned'));
    selector.value='pinned';compare();
  };
  return {
    catalog,host:right.element,prepare,include,
    key:()=>polar?'polar-main':isCarpentry()?'carpintaria-'+state.phase:studyKey(state),load:fetchModel,
    bind(scene,changed,showSelection,filtered){main=scene;change=changed;inspect=showSelection;refreshFilter=filtered;main.controls.addEventListener('change',()=>sync(main,referenceScene));},
    commit(next,url){
      const previous=shown;shown=next;
      if(polar&&!previous){
        const requested=query.get('view'),view=document.querySelector('#view');
        view.value=requested&&[...view.options].some(o=>o.value===requested)?requested:'polarOverview';
      }
      if(next.stern&&!previous?.stern){
        const preset=query.get('view');const view=document.querySelector('#view');
        view.value=preset&&[...view.options].some(o=>o.value===preset)?preset:section.select.value==='z10'?'front':'avante';
      }
      if(next.stern){
        const selected=previous?.stern?joint.select.value:new URL(location.href).searchParams.get('joint');
        joint.select.replaceChildren(new Option('Todas as peças','all'),...next.stern.joints.map(g=>new Option(g.label,g.id)));
        if([...joint.select.options].some(o=>o.value===selected))joint.select.value=selected;
        updateJoint(next);
      }
      updateDiscovery(next,state.study==='refined'?(state.surface==='patina'?'tidal':'mineral'):state.finish);
      for(const k of Object.keys(inputs)){if(!polar&&(k==='study'||fields[state.study].includes(k)))url.searchParams.set(k,state[k]);else url.searchParams.delete(k);}
      if(!isCarpentry())url.searchParams.delete('revisao');
      decorateBadge(right,next.studyLabel);
    },
    refFilter,framing,compareInitial(){if([...selector.options].some(o=>o.value===query.get('compare'))){selector.value=query.get('compare');return compare();}},
    lighting(night){if(refReady)referenceScene.lighting(night);},
    backdrop(value){if(refReady)referenceScene.setBackdrop(value);},
    grid(value){if(refReady){referenceScene.grid.visible=value;referenceScene.draw();}},
    get reference(){return refReady?referenceModel:null;},get referenceScene(){return refReady?referenceScene:null;},
    get referenceVisible(){return refReady?referenceSet:null;}
  };
}
