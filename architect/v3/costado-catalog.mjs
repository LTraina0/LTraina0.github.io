import {catalog as baseCatalog} from '../v3/encalhe.mjs';

const texture=name=>'textures/blocks/'+name+'.png';
const blocks={...baseCatalog};
function material(id,shape,side,top=side,extra={}){
  const template={cube:'red_nether_brick',log:'dark_oak_log',stairs:'dark_oak_stairs',slab:'dark_oak_slab'}[shape];
  blocks['minecraft:'+id]={...baseCatalog['minecraft:'+template],label:id,shape,
    texture:{side:texture(side),up:texture(top),down:texture(top)},...extra};
}
material('crimson_stem','log','huge_fungus/crimson_log_side','huge_fungus/crimson_log_top');
material('stripped_crimson_stem','log','huge_fungus/stripped_crimson_stem_side','huge_fungus/stripped_crimson_stem_top');
for(const name of ['chiseled_nether_bricks','cracked_nether_bricks','nether_wart_block'])material(name,'cube',name);
material('crimson_slab','slab','huge_fungus/crimson_planks');
material('crimson_stairs','stairs','huge_fungus/crimson_planks');
material('blackstone_stairs','stairs','blackstone');
material('gray_stained_glass','cube','glass_gray','glass_gray',{translucent:true});
material('pearlescent_froglight','log','pearlescent_froglight_side','pearlescent_froglight_top',{lightEmission:15});
export function costadoCatalog(dictionary){
  return Object.fromEntries([...new Set(dictionary.map(([id])=>id))].map(id=>{
    if(!blocks[id])throw Error('Bloco fora da curadoria: '+id);
    return [id,blocks[id]];
  }));
}
