import {registry,bedrockVersion} from '../registry.mjs';
import {boundsOf,inventory,key,checkStates} from '../model.mjs';
import {generateGeometry,validateGeometry} from './geometry.mjs';
import {generatePaletteStudy,applyPalette,paletteRegistry} from './palette.mjs';
import {generateKitStudy,placeKit,kitRegistry,validateKitPlacement} from './kit.mjs';
import {kitVolume,surfaceContact} from './kit-shapes.mjs';
import {choices,fields,studyKey,defaults,valuesFor} from './studies.mjs';
import {generateFacade} from '../v21/facade.mjs';
import {assertArchitecture} from '../architectural-validation.mjs';
import {generateRefinedFacade} from '../v22/facade.mjs';
import {assertMaterialMetadata} from '../v21/contextual-palette.mjs';
import {navalRegistry} from '../v3/naval-blocks.mjs';
import {generateShipwreck} from '../v3/shipwreck.mjs';
import {generateSectionStudy} from '../v3/section-studies.mjs';
import {generateStern} from '../v3/stern.mjs';
import {assertNaval} from '../v3/validation.mjs';

export const catalog={...navalRegistry,...registry,...paletteRegistry,...kitRegistry};
export function validateModel(model){
  const counts=inventory(model.blocks),bounds=boundsOf(model.blocks),map=new Map();
  if(!['min','max','size'].every(k=>bounds[k].every((n,i)=>n===model.bounds[k][i]))) throw Error('Limites inconsistentes');
  if(Object.keys(counts).length!==Object.keys(model.materials).length||Object.entries(counts).some(([id,n])=>model.materials[id]!==n)) throw Error('Inventário inconsistente');
  const modules=new Map(model.modules.map(m=>[m.id,m.stage]));
  if(modules.size!==model.modules.length||model.modules.some(m=>!m.label||!Number.isInteger(m.stage)||m.stage<0)) throw Error('Módulos inválidos');
  for(const b of model.blocks){
    if(!modules.has(b.module)||![b.x,b.y,b.z].every(Number.isSafeInteger)) throw Error('Célula inválida');
    checkStates(b,catalog);
    const cell=key(b.x,b.y,b.z);
    if(map.has(cell)) throw Error('Sobreposição na montagem: '+cell);
    map.set(cell,b);
  }
  for(const b of model.blocks) if(Object.hasOwn(kitRegistry,b.id)) validateKitPlacement(b,map,catalog);
  const volumes=new Map(),cache=new Map(),edges=new Map();
  for(const b of model.blocks){
    const signature=b.id+JSON.stringify(b.states);
    if(!cache.has(signature))cache.set(signature,kitVolume(catalog[b.id].shape,b.states));
    volumes.set(b,cache.get(signature));edges.set(b,[]);
  }
  for(const b of model.blocks)for(const d of [[1,0,0],[0,1,0],[0,0,1]]){
    const n=map.get(key(b.x+d[0],b.y+d[1],b.z+d[2]));
    if(n && surfaceContact(volumes.get(b),volumes.get(n),d)){
      edges.get(b).push(n);edges.get(n).push(b);
    }
  }
  for(const stage of new Set(modules.values())){
    const built=model.blocks.filter(b=>modules.get(b.module)<=stage);
    const queue=built.filter(b=>b.y===bounds.min[1]),seen=new Set(queue);
    for(let i=0;i<queue.length;i++)for(const n of edges.get(queue[i])){
      if(!seen.has(n)&&modules.get(n.module)<=stage){seen.add(n);queue.push(n);}
    }
    if(seen.size!==built.length)throw Error('Sem caminho físico até a base na etapa '+stage+': '+built.filter(b=>!seen.has(b)).slice(0,1).map(b=>key(b.x,b.y,b.z)));
  }
  if(model.architecture)assertArchitecture(model,catalog);
  if(model.materialStrategy?.version==='0.2.2')assertMaterialMetadata(model);
  if(model.naval)assertNaval(model,catalog);
  return {cells:map.size,materials:Object.keys(counts).length,size:bounds.size};
}

export function assembleRoof(options={},finish='original',pattern='clusters'){
  let model=generateGeometry(options);
  validateGeometry(model);
  if(finish!=='original') model=applyPalette(model,{family:finish,pattern,seed:42});
  if(model.params.ornament==='carved' && model.kitSockets?.length){
    const module={id:'finials',label:'Remates montados',stage:Math.max(...model.modules.map(m=>m.stage))+1};
    const blocks=[...model.blocks],components=[];
    for(const socket of model.kitSockets){
      const origin=[socket.x,socket.y,socket.z];
      const piece=placeKit('finial',{origin,variation:'mineral'});
      blocks.push(...piece.blocks.map(b=>({...b,module:module.id,component:socket.id})));
      components.push({libraryId:'finial',socket:socket.id,origin,count:piece.blocks.length});
    }
    model={...model,blocks,modules:[...model.modules,module],bounds:boundsOf(blocks),materials:inventory(blocks),components:[...(model.components??[]),...components]};
  }
  validateModel(model);
  return model;
}
export function makeStudy(input){
  const p={...defaults,...input};
  if(!fields[p.study] || fields[p.study].some(field=>!valuesFor(field,p.study).includes(p[field]))) throw Error('Estudo ou opção desconhecida');
  let model;
  if(p.study==='roof'){
    model=assembleRoof({family:p.family,curve:p.curve==='swept'?.75:.05,lift:p.curve==='swept'?2:0,
      bracketLayers:p.bracket==='compound'?2:1,bracketDepth:p.bracket==='compound'?2:1,ornament:p.detail},p.finish);
  }else if(p.study==='palette'){
    model=generatePaletteStudy({family:p.finish,pattern:p.pattern,seed:42});
  }else if(p.study==='facade')model=generateFacade({edition:p.edition,distribution:p.distribution});
  else if(p.study==='refined')model=generateRefinedFacade({bracketStyle:p.console,capital:p.capital,palette:p.surface});
  else if(p.study==='stern'||p.study==='sternwork')model=generateStern({phase:p.phase,refined:p.study==='sternwork'});
  else if(p.study==='sections')model=generateSectionStudy(p);
  else if(p.study==='shipwreck')model=generateShipwreck({composition:p.composition,finish:p.condition});
  else model=generateKitStudy({component:p.component,variation:p.variation});
  if(p.study!=='roof')validateModel(model);
  return {...model,studyId:studyKey(p),studyLabel:fields[p.study].map(k=>choices[k][p[k]]).join(' · '),bedrockSamples:'v'+bedrockVersion};
}
