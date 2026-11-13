import {navalBoxes,orientNavalPoint} from '../v3/naval-blocks.mjs';
const cardinals=['south','west','north','east'];
const wallDirections=['north','east','south','west'];
const wallStates=Object.fromEntries(wallDirections.map(d=>['wall_connection_type_'+d,['none','short','tall']]));
function spec(label,shape,states,tiles,behavior){
  const texture=Object.fromEntries(Object.entries(tiles).map(([face,name])=>[face,'textures/blocks/'+name+'.png']));
  return {label,shape,states,texture,version:'1.26.60.5',...behavior};
}
function all(name){return {side:name,up:name,down:name};}
export const kitRegistry={
  'minecraft:anvil':spec('Bigorna','anvil',{'minecraft:cardinal_direction':cardinals},{...all('anvil_base'),up:'anvil_top_damaged_0'},
    {family:'metal',roles:['capital','finial'],gravity:true,interaction:'repair'}),
  'minecraft:cauldron':spec('Caldeirão','cauldron',{cauldron_liquid:['water','lava','powder_snow'],fill_level:[0,1,2,3,4,5,6]},{side:'cauldron_side',up:'cauldron_top',down:'cauldron_bottom',inner:'cauldron_inner'},
    {family:'metal',roles:['basin','base'],interaction:'fill',supportedFillLevels:[0]}),
  'minecraft:hopper':spec('Funil','hopper',{facing_direction:[0,2,3,4,5],toggle_bit:[false,true]},{side:'hopper_outside',up:'hopper_top',down:'hopper_inside',inner:'hopper_inside'},
    {family:'metal',roles:['transition','capital'],interaction:'item_transfer'}),
  'minecraft:end_rod':spec('Haste do End','end_rod',{facing_direction:[1,0,2,3,4,5]},all('end_rod'),
    {family:'end',roles:['finial','light'],lightEmission:14}),
  'minecraft:polished_blackstone_brick_wall':spec('Muro de tijolos de pedra-negra polida','wall',{wall_post_bit:[true,false],...wallStates},all('polished_blackstone_bricks'),
    {family:'masonry',roles:['shaft','balustrade'],neighborDependent:true}),
  'minecraft:sea_lantern':spec('Lanterna do mar','cube',{},all('sea_lantern'),
    {family:'prismarine',roles:['light'],lightEmission:15}),
};

const rim=(y0,y1)=>[[0,y0,0,2,y1,16],[14,y0,0,16,y1,16],[2,y0,0,14,y1,2],[2,y0,14,14,y1,16]];
export function kitBoxes(shape,s){
  if(shape.startsWith('naval-'))return navalBoxes(shape,s);
  if(shape==='anvil') return [[2,0,2,14,4,14],[4,4,3,12,5,13],[6,5,4,10,10,12],[3,10,0,13,16,16]];
  if(shape==='end_rod') return [[6,0,6,10,1,10],[7,1,7,9,16,9]];
  if(shape==='cauldron'){
    if(s.fill_level!==0) throw Error('A geometria de kit aceita caldeirão vazio');
    const parts=[...rim(3,16),[2,3,2,14,4,14]];
    for(const x of [0,12]) for(const z of [0,12]){
      parts.push([x,0,z===0?0:14,x+4,3,z===0?2:16],
        [x===0?0:14,0,z===0?2:12,x===0?2:16,3,z===0?4:14]);
    }
    return parts;
  }
  if(shape==='hopper') return [...rim(11,16),[0,10,0,16,11,16],[4,4,4,12,10,12],
    s.facing_direction===0?[6,0,6,10,4,10]:[6,4,0,10,8,4]];
  if(shape==='wall'){
    const parts=s.wall_post_bit?[[4,0,4,12,16,12]]:[];
    for(const d of wallDirections){
      const h=s['wall_connection_type_'+d];
      if(h==='none') continue;
      const top=h==='tall'?16:14;
      parts.push({north:[5,0,0,11,top,8],east:[8,0,5,16,top,11],
        south:[5,0,8,11,top,16],west:[0,0,5,8,top,11]}[d]);
    }
    if(!parts.length) throw Error('Muro sem poste nem braços');
    return parts;
  }
  return null;
}
export function orientKitPoint(point,shape,s,extent=16){
  if(shape.startsWith('naval-'))return orientNavalPoint(point,shape,s);
  let [x,y,z]=point, turns=0;
  if(shape==='anvil') turns=cardinals.indexOf(s['minecraft:cardinal_direction']);
  if(shape==='hopper') turns=({0:0,2:0,3:2,4:3,5:1})[s.facing_direction];
  if(shape==='end_rod'){
    switch(s.facing_direction){
      case 0:return [x,extent-y,extent-z];
      case 2:return [x,z,extent-y];
      case 3:return [x,extent-z,y];
      case 4:return [extent-y,x,z];
      case 5:return [y,extent-x,z];
    }
  }
  for(let i=0;i<turns;i++) [x,z]=[extent-z,x];
  return [x,y,z];
}
export function kitFace(shape,face,[,y]){
  if(shape==='anvil' && face===2 && y<16) return 'side';
  if(shape==='hopper' && face===2 && y<16) return y===11?'inner':'side';
  if(shape==='cauldron' && ((face===2 && y===4)||(face===3 && y===3))) return 'inner';
  return face===2?'up':face===3?'down':'side';
}
// UV in bottom-origin texels of the Bedrock end_rod sprite. The narrow shaft
// and collar have distinct islands in the upper-left of the 16×16 image.
export function kitUV(shape,face,[x,y,z],faceY){
  if(shape!=='end_rod') return null;
  const collar=faceY<=1;
  if(face===2 || face===3){
    if(y===16) return [x-5,16-(z-7)];
    return [x-4,16-(z-4)];
  }
  const lateral=[16-z,z,0,0,x,16-x][face];
  return collar?[lateral-4,9+y]:[lateral-7,y];
}

// Axis-aligned material volume, in sixteenths. Physical collision boxes are
// intentionally separate from the visible face-contact calculation.
export function kitVolume(shape,s){
  if(shape==='cube'||shape==='log') return [[0,0,0,16,16,16]];
  if(shape==='slab'){
    const y=s['minecraft:vertical_half']==='top'?8:0;
    return [[0,y,0,16,y+8,16]];
  }
  if(shape==='trapdoor'){
    if(s.open_bit) return [[[0,0,0,3,16,16],[13,0,0,16,16,16],[0,0,0,16,16,3],[0,0,13,16,16,16]][s.direction]];
    const y=s.upside_down_bit?13:0;
    return [[0,y,0,16,y+3,16]];
  }
  if(shape==='stairs'){
    const y=s.upside_down_bit?8:0, other=8-y;
    const parts=[[0,y,0,16,y+8,16]];
    const [dx,dz]=[[1,0],[-1,0],[0,1],[0,-1]][s.weirdo_direction];
    for(const x of [0,8]) for(const z of [0,8]){
      const high=(x-4)*dx+(z-4)*dz>0, left=(x-4)*dz-(z-4)*dx>0;
      if(({none:high,outer_left:high&&left,outer_right:high&&!left,inner_left:high||left,inner_right:high||!left})[s['minecraft:corner']])
        parts.push([x,other,z,x+8,other+8,z+8]);
    }
    return parts;
  }
  const parts=kitBoxes(shape,s);
  if(!parts) throw Error('Contato não implementado para '+shape);
  return parts.map(bounds=>{
    const a=orientKitPoint(bounds.slice(0,3),shape,s),b=orientKitPoint(bounds.slice(3),shape,s);
    return [...a.map((n,i)=>Math.min(n,b[i])),...a.map((n,i)=>Math.max(n,b[i]))];
  });
}

export function surfaceContact(boxesA,boxesB,offset){
  const axis=offset.findIndex(d=>d!==0);
  if(axis<0 || offset.reduce((sum,n)=>sum+Math.abs(n),0)!==1) return false;
  const positive=offset[axis]>0;
  for(const a of boxesA) for(const b of boxesB){
    if(a[axis+(positive?3:0)]!==(positive?16:0) || b[axis+(positive?0:3)]!==(positive?0:16)) continue;
    if([0,1,2].every(i=>i===axis||Math.min(a[i+3],b[i+3])>Math.max(a[i],b[i]))) return true;
  }
  return false;
}
