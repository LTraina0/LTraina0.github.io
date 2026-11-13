import {boundsOf,checkStates,inventory,key,transformBlock} from '../model.mjs';
import {registry} from '../registry.mjs';
import {fillJoineryKit} from '../v3/joinery-kits.mjs';
import {navalRegistry} from '../v3/naval-blocks.mjs';
import {kitRegistry,kitBoxes,kitVolume,surfaceContact} from './kit-shapes.mjs';
export {kitRegistry} from './kit-shapes.mjs';

const M='minecraft:';
const variations=['mineral','timber'];
const axes={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};
const cardinalNumber=['down','up','north','south','west','east'];
const specs={...navalRegistry,...registry,...kitRegistry};
const neutralWall={wall_post_bit:true,...Object.fromEntries(Object.keys(axes).map(d=>['wall_connection_type_'+d,'none']))};
const makeMeta=(name,role,size,anchors,restrictions)=>({name,role,size,origin:[0,0,0],
  anchors,rotations:[0,90,180,270],mirrors:['x','z'],variations,
  compatiblePalettes:variations,bedrockVersion:'1.26.60.5',restrictions});
export const kitComponents={
  colonnade:makeMeta('Colunata de bigornas','Moldura de vãos com capitéis e consolos',[11,8,3],
    {sill:[0,0,0],crown:[0,7,0]},['A bigorna precisa de apoio estável.','A abertura e a distância entre pilares mudam por células inteiras.']),
  lantern:makeMeta('Lanterna de pedestal','Luminária vazada de quatro faces',[3,6,3],
    {foot:[0,0,0],light:[0,4,0]},['Funil vazio orientado para baixo.','Alçapões fixados ao corpo central.']),
  crest:makeMeta('Acrotério de caldeirão','Remate bilateral com corpo vazado e coroa',[7,4,3],
    {foot:[0,0,0],crown:[0,3,0]},['Caldeirão vazio.','Instalar sobre uma faixa contínua de apoio.']),
  finial:makeMeta('Pináculo de bigorna','Terminal vertical de cumeeira',[1,3,1],
    {foot:[0,0,0],crown:[0,2,0]},['Base inferior centrada sobre um bloco sólido.','Peças mantêm suas dimensões vanilla.'])
};
const stair=(direction,upside=false)=>({weirdo_direction:direction,upside_down_bit:upside,'minecraft:corner':'none'});
function plane(x,z,t){
  if(t.mirrorX) x=-x;
  if(t.mirrorZ) z=-z;
  for(let i=0;i<((t.turns??0)%4+4)%4;i++) [x,z]=[-z,x];
  return [x||0,z||0];
}
function remap(direction,t){
  if(!(direction in axes)) return direction;
  const [dx,dz]=plane(...axes[direction],t);
  return Object.keys(axes).find(d=>axes[d][0]===dx && axes[d][1]===dz);
}
function checkState(block){
  checkStates(block,specs);
  if(block.id===M+'cauldron' && block.states.fill_level!==0) throw Error('O estudo suporta caldeirão vazio');
}
export function transformKitBlock(block,t={}){
  if(!Number.isInteger(t.turns??0)) throw Error('Rotação inválida');
  if(!kitRegistry[block.id]&&!navalRegistry[block.id]) return transformBlock(block,t);
  checkState(block);
  const {x,z,states}=transformBlock(block,t,specs);
  if(Object.hasOwn(states,'minecraft:cardinal_direction')) states['minecraft:cardinal_direction']=remap(states['minecraft:cardinal_direction'],t);
  if(Object.hasOwn(states,'facing_direction')) states.facing_direction=cardinalNumber.indexOf(remap(cardinalNumber[states.facing_direction],t));
  if(kitRegistry[block.id]?.shape==='wall') for(const d of Object.keys(axes))
    states['wall_connection_type_'+remap(d,t)]=block.states['wall_connection_type_'+d];
  if(navalRegistry[block.id]?.shape==='naval-fence')for(const d of Object.keys(axes))states['minecraft:connection_'+remap(d,t)]=block.states['minecraft:connection_'+d];
  if(navalRegistry[block.id]?.shape==='naval-door'&&Boolean(t.mirrorX)!==Boolean(t.mirrorZ))states.door_hinge_bit=!states.door_hinge_bit;
  return {...block,x,z,states};
}
export function validateKitPlacement(block,at,catalog=specs){
  if(!kitRegistry[block.id]) return;
  checkState(block);
  if(kitRegistry[block.id].shape==='wall') kitBoxes('wall',block.states);
  if(block.id===M+'anvil'){
    const below=at.get(key(block.x,block.y-1,block.z));
    // The kit's supported configuration uses a continuous, full upper face.
    // Other Bedrock supports could work but are outside this template's tested arrangements.
    if(!below || !['cube','log'].includes(catalog[below.id]?.shape)) throw Error('Bigorna sem base estável');
  }
}

// Reusable assemblies of native cells; no scaled barrels or arbitrary block rotations.
export function placeNavalKit(component,{origin=[0,0,0],turns=0}={}){
 const blocks=[];
 const put=(x,y,z,id,states={})=>blocks.push({x,y,z,id:'minecraft:'+id,states,module:'accessories',component,role:'fitting'});
 if(component==='windlass'){
  for(let x=-2;x<=2;x++)put(x,0,0,'spruce_planks');
  put(0,1,0,'barrel',{facing_direction:1,open_bit:false});
  for(const x of [-1,1])put(x,1,0,'spruce_log',{pillar_axis:'x'});
  for(const x of [-2,2])put(x,1,0,'spruce_fence',Object.fromEntries(Object.keys(axes).map(d=>['minecraft:connection_'+d,false])));
 }else if(component==='cleat'){
  for(let y=0;y<3;y++)put(0,y,0,'dark_oak_log',{pillar_axis:'y'});
  for(const x of [-1,1])put(x,2,0,'spruce_log',{pillar_axis:'x'});
 }else if(!fillJoineryKit(component,put))throw Error('Kit naval desconhecido');
 return {libraryId:component,origin,blocks:blocks.map(b=>{const t=transformKitBlock(b,{turns});return {...t,x:t.x+origin[0],y:t.y+origin[1],z:t.z+origin[2]};})};
}
export function validateKit(model){
  const at=new Map(),modules=new Set(model.modules.map(m=>m.id));
  for(const b of model.blocks){
    const pos=key(b.x,b.y,b.z);
    if(![b.x,b.y,b.z].every(Number.isSafeInteger) || at.has(pos)) throw Error('Célula conflitante: '+pos);
    if(!modules.has(b.module)) throw Error('Módulo desconhecido');
    checkState(b);at.set(pos,b);
  }
  for(const b of model.blocks){
    validateKitPlacement(b,at);
    if(b.id===M+'bamboo_trapdoor' && b.states.open_bit){
      const [dx,dz]=[[-1,0],[1,0],[0,-1],[0,1]][b.states.direction];
      if(!at.has(key(b.x+dx,b.y,b.z+dz))) throw Error('Painel de alçapão sem apoio na face da dobradiça');
    }
  }
  if(!at.size) throw Error('Kit vazio');
  const volumes=new Map(model.blocks.map(b=>[b,kitVolume(specs[b.id].shape,b.states)]));
  const visited=new Set([model.blocks[0]]),queue=[...visited];
  for(let i=0;i<queue.length;i++){
    const b=queue[i];
    for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
      const next=at.get(key(b.x+dx,b.y+dy,b.z+dz));
      if(next&&!visited.has(next)&&surfaceContact(volumes.get(b),volumes.get(next),[dx,dy,dz])){
        visited.add(next);queue.push(next);
      }
    }
  }
  if(visited.size!==at.size) throw Error('Componente descontínuo');
  return model;
}
function build(id,{variation,span,bays}){
  const mineral=variation==='mineral', body=mineral?'polished_blackstone_bricks':'mangrove_planks';
  const step=mineral?'polished_blackstone_brick_stairs':'mangrove_stairs',accent=mineral?'waxed_oxidized_cut_copper':'waxed_cut_copper';
  const blocks=[], registered=new Map();
  function put(module,label,x,y,z,id,states={}){
    if(!registered.has(module)) registered.set(module,{id:module,label,stage:registered.size});
    blocks.push({x,y,z,id:M+id,states:{...states},module});
  }
  const foot=(x,y,z,id=body,s)=>put('base','Embasamento',x,y,z,id,s);
  const shaft=(x,y,z,id,s)=>put('shaft','Fustes e apoios',x,y,z,id,s);
  const crown=(x,y,z,id,s)=>put('crown','Capitéis e coroa',x,y,z,id,s);
  const trim=(x,y,z,id,s)=>put('trim','Remates e painéis',x,y,z,id,s);
  if(id==='colonnade'){
    const start=-Math.floor(span*bays/2),end=start+span*bays;
    for(let x=start-1;x<=end+1;x++) foot(x,0,0);
    for(let i=0;i<=bays;i++){
      const x=start+i*span;
      for(const sign of [-1,1]) foot(x,0,sign,step,stair(sign===-1?2:3));
      foot(x,1,0,accent);
      shaft(x,2,0,'polished_blackstone_brick_wall',neutralWall);
      shaft(x,3,0,'polished_blackstone_brick_wall',neutralWall);
      shaft(x,4,0,body);
      crown(x,5,0,'anvil',{'minecraft:cardinal_direction':'east'});
      crown(x,6,0,body);
      for(const sign of [-1,1]){
        crown(x+sign,6,0,step,stair(sign===1?1:0,true));
        trim(x,7,sign,step,stair(sign===1?3:2,true));
      }
    }
    for(let x=start-1;x<=end+1;x++) crown(x,7,0,body);
  }else if(id==='lantern'){
    foot(0,0,0,body);shaft(0,1,0,'polished_blackstone_brick_wall',neutralWall);
    shaft(0,2,0,accent);crown(0,3,0,'hopper',{facing_direction:0,toggle_bit:false});
    crown(0,4,0,'sea_lantern');crown(0,5,0,body);
    for(const [d,[x,z]] of Object.entries(axes)){
      foot(x,0,z,step,stair({north:2,south:3,east:1,west:0}[d]));
      trim(x,4,z,'bamboo_trapdoor',{direction:{north:3,south:2,east:0,west:1}[d],open_bit:true,upside_down_bit:false});
      trim(x,5,z,step,stair({north:2,south:3,east:1,west:0}[d],true));
    }
  }else if(id==='crest'){
    for(let x=-3;x<=3;x++) foot(x,0,0,body);
    for(const sign of [-1,1]){
      foot(0,0,sign,step,stair(sign===1?3:2));
      shaft(sign,1,0,body);shaft(sign*2,1,0,step,stair(sign===1?1:0));
      trim(sign,2,0,step,stair(sign===1?1:0));
    }
    shaft(0,1,0,'cauldron',{cauldron_liquid:'water',fill_level:0});
    crown(0,2,0,accent);crown(0,3,0,'end_rod',{facing_direction:1});
  }else{
    foot(0,0,0,mineral?'waxed_oxidized_cut_copper':'stripped_mangrove_log',mineral?{}:{pillar_axis:'y'});
    crown(0,1,0,'anvil',{'minecraft:cardinal_direction':'north'});trim(0,2,0,'end_rod',{facing_direction:1});
  }
  const stages=new Map([...registered.values()].map(m=>[m.id,m.stage]));
  blocks.sort((a,b)=>stages.get(a.module)-stages.get(b.module)||a.y-b.y||a.z-b.z||a.x-b.x);
  return {blocks,modules:[...registered.values()]};
}
export function placeKit(component,options={}){
  const meta=kitComponents[component];
  if(!Object.hasOwn(kitComponents,component)) throw Error('Componente desconhecido');
  const {variation='mineral',span=4,bays=2,turns=0,mirrorX=false,mirrorZ=false,origin=[0,0,0]}=options;
  if(!variations.includes(variation)||!Number.isInteger(span)||span<4||span>8||!Number.isInteger(bays)||bays<1||bays>4) throw Error('Variação, vão ou quantidade de vãos inválidos');
  if(!Array.isArray(origin)||origin.length!==3||!origin.every(Number.isSafeInteger)) throw Error('Origem inválida');
  const t={turns,mirrorX,mirrorZ},built=build(component,{variation,span,bays});
  const translate=({x,y,z,...b})=>({...b,x:x+origin[0],y:y+origin[1],z:z+origin[2]});
  const blocks=built.blocks.map(b=>translate(transformKitBlock(b,t)));
  const anchors=Object.fromEntries(Object.entries(meta.anchors).map(([k,[x,y,z]])=>{
    const [dx,dz]=plane(x,z,t);return [k,[origin[0]+dx,origin[1]+y,origin[2]+dz]];
  }));
  return validateKit({schema:1,project:'atelier-kit',version:'0.2.0',bedrockSamples:'v1.26.60.5',design:meta.name,
    params:{component,variation,span,bays,turns,mirrorX,mirrorZ,origin:[...origin]},
    modules:built.modules,bounds:boundsOf(blocks),materials:inventory(blocks),blocks,anchors,restrictions:meta.restrictions});
}
export function generateKitStudy({component='colonnade',...options}={}){return placeKit(component,options);}
