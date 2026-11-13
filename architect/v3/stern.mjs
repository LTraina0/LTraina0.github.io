import {refineOriginal,workModules} from './stern-work.mjs';
import {sternCatalog} from './stern-catalog.mjs';
import {kitRegistry} from '../v2/kit.mjs';
import {boundsOf,inventory,key,transformBlock} from '../model.mjs';
import {transformKitBlock} from '../v2/kit.mjs';
import {kitVolume,surfaceContact} from '../v2/kit-shapes.mjs';
import {navalRegistry} from './naval-blocks.mjs';
import {identifyCell} from './stern-space.mjs';
import {buildOriginal,moduleNames} from './stern-geometry.mjs';

export const sternTransform={turns:2,translation:[42,-3,4]};
export function movePanel(b){
  const t={turns:sternTransform.turns};
  const turn=navalRegistry[b.id]||kitRegistry[b.id]?transformKitBlock(b,t):transformBlock(b,t,sternCatalog);
  const [dx,dy,dz]=sternTransform.translation;
  return {...turn,x:turn.x+dx,y:turn.y+dy,z:turn.z+dz};
}
const directions=[[1,0,0],[0,1,0],[0,0,1]];
export const pos=b=>[b.x,b.y,b.z];
const jointLabels={
 beam:'Extremidade do vau 10',rib:'Pé e apoios da caverna 10',wale:'Cinta escura e fiada descascada',ceiling:'Forro e escoa interiores',
 boards:'Bordas das fiadas e do convés',panelFrame:'Caverna solidária ao painel',bodyFrame:'Caverna 15 e sua pele sustentada',keel:'Quilha e varenga conservadas'
};
function jointName(a,b){
  if(a.piece!==b.piece){
    const members=[a,b].map(c=>c.component);
    if(members.includes('vau-10')||members.includes('BE-curva-10'))return 'beam';
    if(members.includes('BE-caverna-10'))return 'rib';
    if([a,b].some(c=>c.module==='bands'))return 'wale';
    if([a,b].some(c=>c.module==='lining'||c.module==='beams'))return 'ceiling';
    return 'boards';
  }
  if(a.component===b.component)return null;
  const frame=[a,b].find(c=>c.module==='frames'), skin=[a,b].some(c=>['skin','bands'].includes(c.module));
  if(frame?.component==='BE-caverna-10'&&skin&&frame.piece==='panel')return 'panelFrame';
  if(frame?.component==='BE-caverna-15'&&skin)return 'bodyFrame';
  if(frame&&frame.z===10&&[a,b].some(c=>c.module==='keel'))return 'keel';
  return null;
}
function canonicalData(refinement){
  const model=buildOriginal(refinement);
  const map=new Map(model.blocks.map(b=>[key(b.x,b.y,b.z),b])),volumes=new Map();
  const volume=b=>{
    const sig=b.id+JSON.stringify(b.states);
    if(!volumes.has(sig))volumes.set(sig,kitVolume(sternCatalog[b.id].shape,b.states));
    return volumes.get(sig);
  };
  const groups=new Map();
  for(const a of model.blocks)for(const d of directions){
    const b=map.get(key(a.x+d[0],a.y+d[1],a.z+d[2]));
    if(!b)continue;
    const name=jointName(a,b);
    if(!name||!surfaceContact(volume(a),volume(b),d))continue;
    if(!groups.has(name))groups.set(name,{id:name,label:jointLabels[name],interface:a.piece!==b.piece?'cut':a.piece,contacts:[]});
    // The moving endpoint of a cut is always last. Each triple is an address in the original hull.
    groups.get(name).contacts.push(a.piece==='panel'&&b.piece==='body'?[pos(b),pos(a)]:[pos(a),pos(b)]);
  }
  const panel=model.blocks.filter(b=>b.piece==='panel').map(movePanel);
  const frame=boundsOf([...model.blocks,...panel]);
  return {model,groups:[...groups.values()],frame:[frame.min,frame.max]};
}
const canonicals=new Map();
const finish={apply:refineOriginal,modules:workModules};
export function generateStern({phase='intact',refined=false,design}={}){
  if(!['intact','broken','displaced'].includes(phase))throw Error('Estado de popa desconhecido');
  const spec=design??(refined?finish:undefined);
  if(!canonicals.has(spec))canonicals.set(spec,canonicalData(spec));
  const {model,groups,frame}=canonicals.get(spec);
  const blocks=model.blocks.filter(b=>phase!=='broken'||b.piece==='body').map(b=>phase==='displaced'&&b.piece==='panel'?movePanel(b):b);
  const space={canonicalId:design?.canonicalId??(refined?'andorinha-acabamentos-01':'popa-estacoes-01'),panelTransform:phase==='displaced'?sternTransform:{turns:0,translation:[0,0,0]}};
  const modules=Object.entries(spec?{...moduleNames,...spec.modules}:moduleNames).filter(([id])=>!design||model.blocks.some(b=>b.module===id)).map(([id,[label,stage]])=>({id,label,stage}));
  const joints=groups.map(g=>({...g,status:g.interface==='cut'&&phase!=='intact'?'broken':g.interface==='panel'&&phase==='broken'?'removed':'preserved'}));
  return {schema:1,version:design?.version??(refined?'0.3.3':'0.3.2'),project:design?.project??(refined?'popa-refinada':'popa-painel'),params:{phase},blocks:blocks.map(b=>identifyCell(b,space)),modules,
    bounds:boundsOf(blocks),materials:inventory(blocks),materialStrategy:model.materialStrategy,
    stern:{...space,phase,frame,sourceAddress:'canonicalId + original integer (x,y,z)',
      sourceModel:design?.source??(refined?'/modelos/atelier/sternwork-intact.json':'/modelos/atelier/stern-intact.json'),station:10,joints},
    validation:{geometry:'face contacts of preview solids',states:'bedrock-samples-v1.26.60.5',game:'pending'}};
}
