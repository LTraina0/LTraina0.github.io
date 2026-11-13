// Selective Bedrock v1.26.60.5 curation. No Preview blocks or Java identifiers.
const bits=[false,true],cardinals=['north','east','south','west'];
const common={cube:{},log:{pillar_axis:['y','x','z']},stairs:{'minecraft:corner':['none','inner_left','inner_right','outer_left','outer_right'],upside_down_bit:bits,weirdo_direction:[0,1,2,3]},slab:{'minecraft:vertical_half':['bottom','top']},trapdoor:{direction:[0,1,2,3],open_bit:bits,upside_down_bit:bits}};
const tile=n=>'textures/blocks/'+n+'.png';
function material(label,shape,side,states=common[shape],extra={}){return {label,shape,states,texture:typeof side==='string'?{side:tile(side),up:tile(side),down:tile(side)}:Object.fromEntries(Object.entries(side).map(([k,v])=>[k,tile(v)])),version:'1.26.60.5',...extra};}
const rows=[];
for(const [wood,label,texture] of [['spruce','Abeto','planks_spruce'],['dark_oak','Carvalho escuro','planks_big_oak'],['oak','Carvalho','planks_oak']]){
 for(const [suffix,shape,name] of [['planks','cube','Tábuas'],['stairs','stairs','Escadas'],['slab','slab','Laje'],['trapdoor','trapdoor','Alçapão']])rows.push(['minecraft:'+(wood==='oak'&&suffix==='trapdoor'?'trapdoor':wood+'_'+suffix),material(name+' de '+label,shape,suffix==='trapdoor'?(wood==='oak'?'trapdoor':wood+'_trapdoor'):texture)]);
 const log=wood==='dark_oak'?'log_big_oak':wood==='spruce'?'log_spruce':'log_oak';
 rows.push(['minecraft:'+wood+'_log',material('Tora de '+label,'log',{side:log,up:log+'_top',down:log+'_top'})]);
}
rows.push(['minecraft:stripped_spruce_log',material('Tora de abeto descascada','log',{side:'stripped_spruce_log',up:'stripped_spruce_log_top',down:'stripped_spruce_log_top'})]);
for(const [suffix,shape] of [['planks','cube'],['stairs','stairs'],['slab','slab']]){
 const name={planks:'Tábuas',stairs:'Escadas',slab:'Laje'}[suffix];
 rows.push(['minecraft:pale_oak_'+suffix,material(name+' de carvalho pálido',shape,'pale_oak_planks')]);
}
rows.push(['minecraft:pale_oak_log',material('Tora de carvalho pálido','log',{side:'pale_oak_log_side',up:'pale_oak_log_top',down:'pale_oak_log_top'})]);
rows.push(['minecraft:stripped_pale_oak_log',material('Tora de carvalho pálido descascada','log',{side:'stripped_pale_oak_log_side',up:'stripped_pale_oak_log_top',down:'stripped_pale_oak_log_top'})]);
rows.push(['minecraft:brown_stained_glass',material('Vidro tingido de marrom','cube','glass_brown',{}, {translucent:true})]);
rows.push(['minecraft:iron_trapdoor',material('Alçapão de ferro','trapdoor','iron_trapdoor')]);
rows.push(['minecraft:spruce_fence',material('Cerca de abeto','naval-fence','planks_spruce',Object.fromEntries(cardinals.map(d=>['minecraft:connection_'+d,bits])),{neighborDependent:true})]);
rows.push(['minecraft:barrel',material('Barril','naval-barrel',{side:'barrel_side',up:'barrel_side',down:'barrel_side',front:'barrel_top',open:'barrel_top_open',back:'barrel_bottom'},{facing_direction:[2,3,4,5,0,1],open_bit:bits},{interaction:'storage'})]);
rows.push(['minecraft:lantern',material('Lanterna','naval-lantern','lantern',{hanging:bits},{lightEmission:15,previewEmission:'sprite only; no propagation'})]);
rows.push(['minecraft:iron_chain',material('Corrente de ferro','naval-chain',{side:'chain1',up:'chain1',down:'chain1',alternate:'chain2'},{pillar_axis:['y','x','z']})]);
rows.push(['minecraft:spruce_door',material('Porta de abeto','naval-door',{side:'door_spruce_lower',up:'door_spruce_lower',down:'door_spruce_lower',upper:'door_spruce_upper'},{door_hinge_bit:bits,'minecraft:cardinal_direction':cardinals,open_bit:bits,upper_block_bit:bits},{interaction:'door',neighborDependent:true})]);
rows.push(['minecraft:snow_layer',material('Camada de neve','naval-snow','snow',{height:[0,1,2,3,4,5,6,7],covered_bit:bits})]);
for(const [id,label,texture]of [['packed_ice','Gelo compactado','ice_packed'],['blue_ice','Gelo azul','blue_ice'],['snow','Neve','snow'],['white_wool','Lã branca','wool_colored_white'],['black_wool','Lã preta','wool_colored_black'],['light_gray_wool','Lã cinza-clara','wool_colored_silver']])rows.push(['minecraft:'+id,material(label,'cube',texture)]);
// Stable polar terrain palette, checked against tagged Mojang block and terrain metadata.
for(const [block,label,texture] of [
 ['stone','Pedra','stone'],
 ['andesite','Andesito','stone_andesite'],
 ['cobblestone','Pedregulho','cobblestone'],
 ['cobbled_deepslate','Pedregulho de ardósia','deepslate/cobbled_deepslate']
])rows.push(['minecraft:'+block,material(label,'cube',texture)]);
rows.push(['minecraft:andesite_stairs',material('Escadas de andesito','stairs','stone_andesite')]);
rows.push(['minecraft:andesite_slab',material('Laje de andesito','slab','stone_andesite')]);
rows.push(['minecraft:ice',material('Gelo','cube','ice',{}, {translucent:true})]);
export const navalRegistry=Object.fromEntries(rows);

export function navalBoxes(shape,s){
 if(shape==='naval-barrel')return [[0,0,0,16,16,16]];
 if(shape==='naval-snow')return [[0,0,0,16,2*(s.height+1),16]];
 if(shape==='naval-door')return [s.open_bit?(s.door_hinge_bit?[13,0,0,16,16,16]:[0,0,0,3,16,16]):[0,0,0,16,16,3]];
 if(shape==='naval-chain')return [[6.5,0,6.5,9.5,16,9.5]]; // contact proxy, not the alpha-tested crossed planes
 if(shape==='naval-lantern'){const y=s.hanging?1:0;return [[5,y,5,11,y+7,11],[6,y+7,6,10,y+9,10],[6.5,y+9,6.5,9.5,y+15,9.5]];}
 if(shape==='naval-fence'){
  const parts=[[6,0,6,10,16,10]];
  for(const d of cardinals)if(s['minecraft:connection_'+d])for(const y of [6,12])parts.push({north:[7,y,0,9,y+3,8],south:[7,y,8,9,y+3,16],east:[8,y,7,16,y+3,9],west:[0,y,7,8,y+3,9]}[d]);
  return parts;
 }
 return null;
}
export function orientNavalPoint(point,shape,s){
 let[x,y,z]=point,turns=0;
 if(shape==='naval-chain'){
  if(s.pillar_axis==='x')return [y,16-x,z];
  if(s.pillar_axis==='z')return [x,16-z,y];
 }
 if(shape==='naval-door')turns=cardinals.indexOf(s['minecraft:cardinal_direction']);
 if(shape==='naval-barrel'){
  if(s.facing_direction===0)return [x,z,16-y];
  if(s.facing_direction===1)return [x,16-z,y];
  turns=({2:0,3:2,4:3,5:1})[s.facing_direction];
 }
 for(let i=0;i<turns;i++)[x,z]=[16-z,x];return[x,y,z];
}
