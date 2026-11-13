import {gradientIndex,paletteRegistry} from '../v2/palette.mjs';
import {navalRegistry} from './naval-blocks.mjs';
import {inventory} from '../model.mjs';
import {kitVolume} from '../v2/kit-shapes.mjs';

export function applyNavalPalette(model,{finish='weathered',originX=model.naval?.origin?.[0]??0,wetLine=4,exposeFracture=false,wetDescription,profile}={}){
 if(!['weathered','repaired'].includes(finish))throw Error('Acabamento naval desconhecido');
 const catalog={...navalRegistry,...paletteRegistry};
 const at=new Map(model.blocks.map(b=>[[b.x,b.y,b.z].join(','),b])),cache=new Map();
 const volume=b=>{const k=b.id+JSON.stringify(b.states);if(!cache.has(k))cache.set(k,kitVolume(catalog[b.id].shape,b.states));return cache.get(k);};
 const sky=b=>{
  let visible=0,samples=0;
  for(const x of [4,12])for(const z of [4,12]){
   const parts=volume(b).filter(v=>x>=v[0]&&x<v[3]&&z>=v[2]&&z<v[5]);if(!parts.length)continue;
   const top=b.y+Math.max(...parts.map(v=>v[4]))/16;let blocked=false;samples++;
   for(let y=Math.floor(top);y<=Math.floor(top)+12;y++){
    const n=at.get([b.x,y,b.z].join(','));
    if(n&&volume(n).some(v=>x>=v[0]&&x<v[3]&&z>=v[2]&&z<v[5]&&y+v[4]/16>top+1e-6&&y+v[1]/16<top+12)){blocked=true;break;}
   }
   if(!blocked)visible++;
  }
  return {exposure:samples?visible/samples:0,skySamples:samples};
 };
 const blocks=model.blocks.map(b=>{
  const source=b.id,shape=catalog[source]?.shape,{exposure,skySamples}=sky(b);
  const wet=b.y<=wetLine,broken=b.fracture??false,repair=Boolean(b.repair),tier=gradientIndex(exposure,3,b.x,b.z,'steps',0);
  const context={role:b.role,exposure,shadow:1-exposure,skySamples,wet,broken,repair,gradientTier:tier,finish,route:Math.abs(b.x-originX)<=2,frame:'design-local'};
  if(exposeFracture)context.exposeFracture=true;
  if(b.drainage)context.drainage=b.drainage;
  const decision=profile?.select(b,shape,context)??navalMaterialDecision(source,shape,context);
  if(wetDescription&&decision.ruleId==='wet-bilge')decision.rule=wetDescription;
  return {...b,id:decision.id,appearance:{inputId:source,selected:decision.id,ruleId:decision.ruleId,rule:decision.rule,context}};
 });
 return {...model,blocks,materials:inventory(blocks),materialStrategy:{version:'0.3.0',finish,method:profile?.id??'naval-role-and-repair-zones',weathering:'composição estática; não simula umidade ou envelhecimento do jogo'}};
}
export function navalMaterialDecision(source,shape,c){
  const {role,wet,repair,finish,route,exposure}=c;
  if(role==='flashing'&&shape==='slab'){
    const oxidation=c.drainage==='outfall'?'oxidized':c.drainage==='weather'||exposure>.5?'weathered':'';
    const prefix=oxidation?oxidation+'_':'';
    return {id:'minecraft:waxed_'+prefix+'cut_copper_slab',ruleId:'copper-'+(oxidation||'protected'),rule:oxidation==='oxidized'?'pátina concentrada na saída de água':oxidation?'cobre exposto na borda externa':'cobre protegido sob o ressalto'};
  }
  if(c.exposeFracture && c.broken && !wet && role==='hull'){
   return {id:source,ruleId:'exposed-strake-end',rule:'fibra exposta no extremo da fiada rompida'};
  }
  let id=source,ruleId='component-preserved',rule='material próprio do componente';
  if(['cube','stairs','slab'].includes(shape)&&['hull','deck','repair','cabin'].includes(role)){
   const family=role==='hull'?(wet||exposure<.25?'dark_oak':'spruce'):role==='cabin'?'dark_oak':(repair||finish==='repaired'&&route?'oak':'spruce');
   const suffix={cube:'planks',stairs:'stairs',slab:'slab'}[shape];id='minecraft:'+family+'_'+suffix;
   ruleId=role==='hull'?(wet?'wet-bilge':exposure<.25?'sheltered-strakes':'upper-strakes'):repair?'salvaged-repair':role==='cabin'?'sheltered-cabin':finish==='repaired'&&family==='oak'?'renewed-route':exposure<.25?'sheltered-deck':'exposed-deck';
   rule={ 'wet-bilge':'faixa inferior escura junto ao gelo','sheltered-strakes':'costado sob recobrimento real das formas da prévia','upper-strakes':'tábuas acima da faixa úmida, sem recobrimento','salvaged-repair':'madeira clara na passagem recuperada','sheltered-cabin':'cabine protegida em madeira escura','renewed-route':'substituição localizada no percurso principal','sheltered-deck':'convés protegido sob cobertura','exposed-deck':'convés exposto em abeto'}[ruleId];
  }
  return {id,ruleId,rule};
}
