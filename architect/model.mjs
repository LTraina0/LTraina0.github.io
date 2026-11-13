import {registry} from './registry.mjs';

export const key = (x,y,z) => [x,y,z].join(',');
export const directions = [[1,0],[-1,0],[0,1],[0,-1]];
const hinges = [[-1,0],[1,0],[0,-1],[0,1]];

export function boundsOf(blocks) {
  if (!blocks.length) throw Error('Modelo vazio');
  const min = [Infinity,Infinity,Infinity], max = min.map(n=>-n);
  for (const {x,y,z} of blocks) {
    [x,y,z].forEach((n,i)=>{ min[i]=Math.min(min[i],n); max[i]=Math.max(max[i],n); });
  }
  return {min,max,size:max.map((n,i)=>n-min[i]+1)};
}

export function checkStates({id,states},catalog=registry) {
  const spec = catalog[id];
  if (!spec) throw Error('ID fora do catálogo: '+id);
  if (!states || typeof states !== 'object' || Array.isArray(states)) throw Error('Estados ausentes: '+id);
  const keys = Object.keys(spec.states);
  if (keys.length!==Object.keys(states).length ||
      !keys.every(k=>Object.hasOwn(states,k) && spec.states[k].includes(states[k]))) {
    throw Error('Estados inválidos: '+id+' '+JSON.stringify(states));
  }
}

export function transformBlock(block,{turns=0,mirrorX=false,mirrorZ=false}={},catalog=registry) {
  if (!Number.isInteger(turns)) throw Error('Rotação requer quartos de volta inteiros');
  checkStates(block,catalog);
  const plane=(x,z)=>{
    if (mirrorX) x=-x;
    if (mirrorZ) z=-z;
    for(let n=0;n<((turns%4)+4)%4;n++) [x,z]=[-z,x];
    return [x||0,z||0];
  };
  const [x,z]=plane(block.x,block.z), states={...block.states};
  for(const [state,axes] of [['weirdo_direction',directions],['direction',hinges]]) {
    if (!Object.hasOwn(states,state)) continue;
    const [a,b]=plane(...axes[states[state]]);
    states[state]=axes.findIndex(([i,j])=>a===i && b===j);
  }
  if (mirrorX!==mirrorZ && states['minecraft:corner']) {
    states['minecraft:corner']=states['minecraft:corner'].replace(/left|right/,s=>s==='left'?'right':'left');
  }
  if (turns%2 && ['x','z'].includes(states.pillar_axis)) states.pillar_axis=states.pillar_axis==='x'?'z':'x';
  return {...block,x,z,states};
}

export function inventory(blocks) {
  const result={};
  for (const {id} of blocks) result[id]=(result[id]??0)+1;
  return result;
}

export function transformModel(model,transform) {
  const blocks=model.blocks.map(b=>transformBlock(b,transform));
  return {...model,blocks,bounds:boundsOf(blocks),transforms:[...(model.transforms??[]),{...transform}]};
}
