// Local X is athwartships, local +Z points outboard on a gallery knee.
const axis=pillar_axis=>({pillar_axis});
const stair=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const leaf=(direction,open_bit,upside_down_bit=false)=>({direction,open_bit,upside_down_bit});
export function fillJoineryKit(kind,put){
  if(kind==='hatch-leaves'||kind==='hatch-leaves-raised'){
    for(let x=-3;x<=3;x++){
      const raised=kind==='hatch-leaves-raised'&&x<0;
      put(x,0,0,'trapdoor',leaf(raised?2:3,raised));
    }
    return true;
  }
  if(kind==='cargo-davit'){
    for(let y=0;y<=5;y++)put(0,y,0,'dark_oak_log',axis('y'));
    for(const z of [-1,1])put(0,0,z,'spruce_stairs',stair(z<0?2:3));
    for(let x=1;x<=4;x++)put(x,5,0,'stripped_spruce_log',axis('x'));
    put(1,3,0,'oak_stairs',stair(1,true));
    put(1,4,0,'oak_log',axis('x'));put(2,4,0,'oak_stairs',stair(1,true));
    put(4,4,0,'barrel',{facing_direction:3,open_bit:false});
    for(let y=2;y<=3;y++)put(4,y,0,'iron_chain',axis('y'));
    put(0,2,1,'spruce_trapdoor',leaf(2,true));
    return true;
  }
  if(kind==='gallery-knee'){
    for(let y=0;y<3;y++)put(0,y,0,'stripped_spruce_log',axis('y'));
    put(0,1,1,'dark_oak_stairs',stair(3,true));
    put(0,2,1,'oak_log',axis('z'));put(0,2,2,'oak_stairs',stair(3,true));
    return true;
  }
  return false;
}

