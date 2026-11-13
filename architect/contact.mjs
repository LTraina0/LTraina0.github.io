import {registry} from './registry.mjs';
import {directions} from './model.mjs';

// Each supported shape splits tangential axes at 3, 8 or 13 sixteenths.
// The two outer samples cover opposite halves; a central sample distinguishes
// opposite thin leaves where necessary. Each bit is shared by both mating faces.
const sample=[1/16,4/16,12/16,15/16];
const normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
export {normals};
function occupied(shape,s,x,y,z) {
  if(shape==='slab') return s['minecraft:vertical_half']==='top'?y>.5:y<.5;
  if(shape==='trapdoor'){
    if(s.open_bit) return [x,1-x,z,1-z][s.direction]<3/16;
    return (s.upside_down_bit?1-y:y)<3/16;
  }
  if(shape!=='stairs') return true;
  if((s.upside_down_bit?1-y:y)<.5) return true;
  const [a,b]=directions[s.weirdo_direction], high=(x-.5)*a+(z-.5)*b>0, left=(x-.5)*b-(z-.5)*a>0;
  switch(s['minecraft:corner']){
    case 'outer_left': return high&&left;
    case 'outer_right': return high&&!left;
    case 'inner_left': return high||left;
    case 'inner_right': return high||!left;
    default: return high;
  }
}
export function faceMasks(block) {
  const {shape}=registry[block.id];
  return normals.map(([x,y,z])=>{
    let mask=0;
    for(const [i,a] of sample.entries()) for(const [j,b] of sample.entries()){
      const point=x?[x>0?1:0,a,b]:y?[a,y>0?1:0,b]:[a,b,z>0?1:0];
      if(occupied(shape,block.states,...point)) mask|=1<<(i*4+j);
    }
    return mask;
  });
}
