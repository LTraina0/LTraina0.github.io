import {fjordStern} from './stern-fjord.mjs';
import {fillJoineryKit} from './joinery-kits.mjs';

const axis=pillar_axis=>({pillar_axis});
const stairs=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const half={'minecraft:vertical_half':'bottom'};
export function hatchDesign(kind){
  if(!['claraboia','portico'].includes(kind))throw Error('Escotilha desconhecida');
  return {...fjordStern,canonicalId:fjordStern.canonicalId+'-'+kind,source:'/escotilha/'+kind+'.json',apply(cells){
    fjordStern.apply(cells);
    for(const [key,b] of cells){
      if(b.component==='turco-sobre-a-escotilha'||(b.module==='hatch'&&b.y>=12&&Math.abs(b.x)<=4&&b.z>=3&&b.z<=13&&!b.component.startsWith('escada-')))cells.delete(key);
    }
    function put(x,y,z,id,states,component){
      const key=[x,y,z].join(',');
      if(cells.has(key))throw Error('Encaixe ocupado '+key+' '+cells.get(key).component);
      cells.set(key,{x,y,z,id:'minecraft:'+id,states,module:'hatch',role:'hatch',piece:'body',component});
    }
    if(kind==='claraboia'){
      // A low glazed lantern covers the forward grate. Its aft end stops before the stair.
      for(let z=4;z<=7;z++){
        for(let x=-3;x<=3;x++){
          const a=Math.abs(x),end=z===4||z===7,y=13+(3-a);
          if(a===3)put(x,12,z,'dark_oak_log',axis('z'),'soleira-da-claraboia');
          if(end)for(let h=12;h<y;h++)if(!(a===3&&h===12))
            put(x,h,z,h===12?'stripped_spruce_log':a===0?'dark_oak_log':'brown_stained_glass',h===12?axis('x'):a===0?axis('y'):{},'frontao-envidracado');
          if(!a)put(x,y,z,'oak_slab',half,'cumeeira-clara');
          else if(end||a===3)put(x,y,z,'dark_oak_stairs',stairs(x<0?0:1),'caibro-do-frontao');
          else put(x,y,z,'brown_stained_glass',{},'pano-de-vidro');
        }
      }
      for(let z=11;z<=12;z++)fillJoineryKit('hatch-leaves',(x,y,d,id,state)=>put(x,12+y,z+d,id,state,'folhas-de-ventilacao'));
    }else{
      // Two bracketed posts carry one crossbeam; the hook is offset from the ladder.
      for(const x of [-4,4]){
        for(let y=13;y<=17;y++)put(x,y,5,'dark_oak_log',axis('y'),'perna-do-portico');
        for(const z of [4,6])put(x,13,z,'spruce_stairs',stairs(z===4?2:3),'sapata-do-portico');
        const sign=Math.sign(x);
        put(x-sign,16,5,'oak_stairs',stairs(sign>0?0:1,true),'consolo-invertido');
        put(x-sign,17,5,'oak_log',axis('x'),'cabeca-do-consolo');
        put(x-2*sign,17,5,'oak_stairs',stairs(sign>0?0:1,true),'consolo-invertido');
      }
      for(let x=-4;x<=4;x++)put(x,18,5,'stripped_spruce_log',axis('x'),'travessa-do-portico');
      put(-1,17,5,'barrel',{facing_direction:3,open_bit:false},'tambor-do-guincho');
      for(let y=14;y<=16;y++)put(-1,y,5,'iron_chain',axis('y'),'elo-de-icamento');
      for(let z=4;z<=12;z++)for(const x of [-3,3]){
        if(x===3&&z>=8&&z<=10)continue;
        put(x,12,z,'stripped_spruce_log',axis('z'),'longarina-do-poco');
      }
      for(const z of [4,12])for(let x=-2;x<=2;x++)put(x,12,z,'oak_log',axis('x'),'vau-exposto');
      for(let z=10;z<=11;z++)for(const x of [-2,-1])put(x,12,z,'spruce_planks',{},'patamar-de-servico');
    }
  }};
}
