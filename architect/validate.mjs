import {boundsOf,checkStates,inventory,key,transformBlock} from './model.mjs';
import {palettes,roofColumn,modules} from './roof.mjs';
import {faceMasks,normals} from './contact.mjs';
const requireCondition=(ok,message)=>{if(!ok) throw Error(message);};
export function validate(model) {
  const {params:p}=model, at=new Map(), counts=inventory(model.blocks), bounds=boundsOf(model.blocks);
  requireCondition(JSON.stringify(bounds)===JSON.stringify(model.bounds),'Limites divergentes');
  requireCondition(Object.keys(counts).length===Object.keys(model.materials).length &&
    Object.entries(counts).every(([id,n])=>model.materials[id]===n),'Inventário divergente');
  // Diagnose support and slope in the design axes, after checking world-space bounds.
  let blocks=model.blocks;
  for(const t of [...(model.transforms??[])].reverse()){
    blocks=blocks.map(b=>transformBlock(transformBlock(b,{turns:-(t.turns??0)}),{mirrorX:t.mirrorX,mirrorZ:t.mirrorZ}));
  }
  const metadata=new Map(model.modules.map(m=>[m.id,m.stage]));
  requireCondition(metadata.size===modules.length && modules.every(m=>metadata.get(m.id)===m.stage),'Módulos ou etapas inválidos');
  const finish=palettes[p.palette];
  const allowedByModule={
    posts:['stripped_mangrove_log'],beams:['stripped_mangrove_log'],brackets:['mangrove_stairs','mangrove_planks'],
    gables:['stripped_mangrove_log','bamboo_planks','bamboo_trapdoor'],
    skin:[finish.tile,finish.slab,finish.stair,'mangrove_planks'],
    ridge:[finish.ridge,'waxed_oxidized_cut_copper_stairs','waxed_oxidized_cut_copper_slab']
  };
  const seenModules=new Set(), joints=new Set();
  for(const b of blocks) {
    checkStates(b);
    const pos=key(b.x,b.y,b.z);
    requireCondition([b.x,b.y,b.z].every(Number.isSafeInteger),'Coordenada inválida '+pos);
    requireCondition(!at.has(pos),'Interseção '+pos);
    requireCondition(metadata.has(b.module),'Módulo inválido '+pos);
    requireCondition(allowedByModule[b.module].includes(b.id.slice('minecraft:'.length)),'Material fora da paleta '+pos);
    seenModules.add(b.module); at.set(pos,b);
  }
  requireCondition(seenModules.size===modules.length,'Componente ausente');
  const masks=new Map(), cache=new Map(), neighbors=new Map();
  for(const b of blocks){
    const stateKey=b.id+JSON.stringify(b.states);
    if(!cache.has(stateKey)) cache.set(stateKey,faceMasks(b));
    masks.set(b,cache.get(stateKey));
  }
  for(const b of blocks){
    const adjacent=[];
    for(const [face,[x,y,z]] of normals.entries()){
      const neighbor=at.get(key(b.x+x,b.y+y,b.z+z));
      if(!neighbor || !(masks.get(b)[face]&masks.get(neighbor)[face^1])) continue;
      if(b.module!==neighbor.module) joints.add([b.module,neighbor.module].sort().join('/'));
      adjacent.push(neighbor);
    }
    neighbors.set(b,adjacent);
  }
  for(const {stage} of modules){
    const eligible=blocks.filter(b=>metadata.get(b.module)<=stage);
    const queue=eligible.filter(b=>b.y===0 && b.module==='posts'),seen=new Set(queue);
    for(let i=0;i<queue.length;i++) for(const neighbor of neighbors.get(queue[i])){
      if(metadata.get(neighbor.module)>stage || seen.has(neighbor)) continue;
      seen.add(neighbor);queue.push(neighbor);
    }
    requireCondition(seen.size===eligible.length,'Peças sem contato com os apoios na etapa '+stage);
  }
  for(const pair of model.joints) requireCondition(joints.has([...pair].sort().join('/')),'Encaixe ausente '+pair);
  // Bilateral symmetry includes handed stair corners and the hinge wall of open shutters.
  for(const b of blocks) for(const mirror of [{mirrorX:true},{mirrorZ:true}]) {
    const mate=transformBlock(b,mirror), other=at.get(key(mate.x,mate.y,mate.z));
    requireCondition(other?.id===mate.id && other.module===mate.module &&
      Object.entries(mate.states).every(([k,v])=>other.states[k]===v),'Espelho inconsistente '+key(b.x,b.y,b.z));
  }
  const {halfWidth:w,halfLength:l}=p;
  for(let x=-w;x<=w;x++) for(let z=-l;z<=l;z++){
    const c=roofColumn(p,x,z), ridge=x===0 && Math.abs(z)<=l-3;
    const b=at.get(key(x,c.y,z)),soffit=at.get(key(x,c.y-1,z));
    requireCondition(b?.module===(ridge?'ridge':'skin') && soffit?.module==='skin','Lacuna na cobertura '+key(x,c.y,z));
    if (ridge) requireCondition(b.id==='minecraft:'+finish.ridge,'Material da cumeeira');
    else if(c.cap==='stair') {
      requireCondition(b.id==='minecraft:'+finish.stair && b.states.weirdo_direction===c.direction &&
        !b.states.upside_down_bit && b.states['minecraft:corner']===c.cornerState,'Orientação da água');
    } else if(c.cap==='slab') requireCondition(b.id==='minecraft:'+finish.slab && b.states['minecraft:vertical_half']==='bottom','Laje da cobertura');
    else requireCondition(b.id==='minecraft:'+finish.tile,'Platô da cobertura');
    for(const [a,d] of [[1,0],[0,1]]) {
      if(x+a>w||z+d>l) continue;
      const next=roofColumn(p,x+a,z+d);
      const high=c.y>next.y?[x,z]:[x+a,z+d];
      for(let y=Math.min(c.y,next.y);y<Math.max(c.y,next.y);y++){
        requireCondition(at.has(key(high[0],y,high[1])),'Fresta entre cursos '+key(high[0],y,high[1]));
      }
    }
    if(b.module==='brackets' && b.id.endsWith('_stairs')){
      const [a,d]=[[1,0],[-1,0],[0,1],[0,-1]][b.states.weirdo_direction];
      const run=b.y-4;
      requireCondition(b.states.upside_down_bit && b.states['minecraft:corner']==='none' &&
        at.get(key(b.x+a*run,0,b.z+d*run))?.module==='posts','Consolo invertido ou desalinhado');
    }
  }
  const front=l-3, sill=roofColumn(p,0,front+1).y;
  for(const z of [-front,front]) for(let x=3-w;x<=w-3;x++){
    for(let y=sill;y<roofColumn(p,x,z).y;y++){
      requireCondition(at.has(key(x,y,z)),'Abertura indevida no frontão '+key(x,y,z));
    }
  }
  for(const b of blocks){
    if(b.id==='minecraft:bamboo_trapdoor') {
      requireCondition(b.states.open_bit && !b.states.upside_down_bit &&
        b.states.direction===(b.z>0?2:3) && at.get(key(b.x,b.y,b.z-Math.sign(b.z)))?.module==='gables','Alçapão sem apoio ou invertido');
    }
  }
  for(const x of [3-w,w-3]) for(const z of (l-4<5?[4-l,l-4]:[4-l,0,l-4])) {
    for(let y=0;y<roofColumn(p,x,z).y;y++) requireCondition(at.has(key(x,y,z)),'Apoio interrompido '+key(x,y,z));
  }
  return {blocks:blocks.length,materials:Object.keys(counts).length,modules:seenModules.size,size:bounds.size};
}
