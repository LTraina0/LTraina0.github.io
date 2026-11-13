import {transformBlock} from '../model.mjs';
import {transformKitBlock,kitRegistry} from '../v2/kit.mjs';
import {catalog} from '../v2/laboratory.mjs';

const stair=(d,up=true)=>({weirdo_direction:d,upside_down_bit:up,'minecraft:corner':'none'});
export const componentLibrary={
  opening:{label:'Abertura escalonada',role:'opening',size:[7,8,3],anchor:'duas ombreiras sobre o piso'},
  capital:{label:'Capitel de braços cruzados',role:'capital',size:[3,3,3],anchor:'base integral sobre o pilar',behavior:'bigorna sujeita à gravidade'},
  cornice:{label:'Cornija de três projeções',role:'cornice',size:[15,2,3],anchor:'travessa sobre a parede'}
};
export function composeComponent(name,{origin=[0,0,0],turns=0,mirrorX=false,rich=true,capital='anvil'}={}){
  if(!Object.hasOwn(componentLibrary,name))throw Error('Componente desconhecido');
  const cells=[];
  const put=(x,y,z,id,states={})=>cells.push({x,y,z,id:'minecraft:'+id,states,module:name,component:name,role:name==='capital'?'structure':'ornament'});
  if(name==='opening'){
    for(let x=-3;x<=3;x++){
      const low=Math.abs(x)===3?0:6-Math.floor(Math.abs(x)/1.4);
      for(let y=low;y<=7;y++){
        put(x,y,0,'mangrove_planks');
        if(y===low&&Math.abs(x)<3)put(x,y,-1,'mangrove_stairs',stair(x<0?1:x>0?0:2));
        else if(Math.abs(x)===3||y===7)put(x,y,-1,'mangrove_planks');
        if(rich&&(y===low||y===7))put(x,y,1,'bamboo_planks');
      }
    }
  }else if(name==='capital'){
    put(0,0,0,'mangrove_planks');
    if(!['anvil','timber'].includes(capital))throw Error('Capitel desconhecido');
    if(capital==='anvil')put(0,1,0,'anvil',{'minecraft:cardinal_direction':'east'});
    else{
      put(0,1,0,'stripped_mangrove_log',{pillar_axis:'y'});
      for(const s of [-1,1]){
        put(s,1,0,'mangrove_stairs',stair(s>0?1:0));
        if(rich)put(0,1,s,'mangrove_slab',{'minecraft:vertical_half':'top'});
      }
    }
    put(0,2,0,'stripped_mangrove_log',{pillar_axis:'x'});
    for(const s of [-1,1]){
      put(s,2,0,'mangrove_stairs',stair(s>0?1:0));
      if(rich)put(0,2,s,'mangrove_stairs',stair(s>0?3:2));
    }
  }else{
    for(let x=-7;x<=7;x++){
      put(x,0,0,'stripped_mangrove_log',{pillar_axis:'x'});
      put(x,0,-1,'mangrove_stairs',stair(2));
      put(x,1,-2,rich&&x%4===0?'waxed_cut_copper_slab':'mangrove_slab',{'minecraft:vertical_half':'bottom'});
      // The upper fillet returns to the carrier instead of floating beyond it.
      put(x,1,-1,'mangrove_slab',{'minecraft:vertical_half':'bottom'});
    }
  }
  const transformed=cells.map(b=>Object.hasOwn(kitRegistry,b.id)?transformKitBlock(b,{turns,mirrorX}):transformBlock(b,{turns,mirrorX},catalog));
  return {libraryId:name,origin,blocks:transformed.map(b=>({...b,x:b.x+origin[0],y:b.y+origin[1],z:b.z+origin[2]})),
    evidence:'preview-contact-tested; bedrock-in-game-pending'};
}
