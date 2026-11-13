import data from './palette-data.json' with {type:'json'};
import {boundsOf, inventory} from '../model.mjs';

export const paletteRegistry = Object.freeze(data.blocks);
export const measuredTextures = Object.freeze(data.images);
export const paletteVersion = data.version;
export const palettePatterns = Object.freeze(['linear','steps','density','clusters','mosaic']);
const namespace = name => name.startsWith('minecraft:') ? name : 'minecraft:'+name;
const clamp = x => Math.max(0,Math.min(1,x));
const triple=(cube,stairs,slab)=>({cube,stairs,slab});
const dark=triple('polished_blackstone_bricks','polished_blackstone_brick_stairs','polished_blackstone_brick_slab');
const slate=triple('deepslate_bricks','deepslate_brick_stairs','deepslate_brick_slab');
const tuff=triple('polished_tuff','polished_tuff_stairs','polished_tuff_slab');
const red=triple('red_nether_brick','red_nether_brick_stairs','red_nether_brick_slab');
const brick=triple('brick_block','brick_stairs','brick_slab');
const copper=triple('waxed_cut_copper','waxed_cut_copper_stairs','waxed_cut_copper_slab');
const verdigris=triple('waxed_oxidized_cut_copper','waxed_oxidized_cut_copper_stairs','waxed_oxidized_cut_copper_slab');
const ocean=triple('dark_prismarine','dark_prismarine_stairs','dark_prismarine_slab');
const sea=triple('prismarine_bricks','prismarine_bricks_stairs','prismarine_brick_slab');
const cherry=triple('cherry_planks','cherry_stairs','cherry_slab');
const mangrove=triple('mangrove_planks','mangrove_stairs','mangrove_slab');
export const paletteFamilies=Object.freeze({
  mineral:{label:'Mineral · Cinza e calcita',ramp:['polished_blackstone_bricks','deepslate_bricks','polished_tuff','stone_bricks','white_concrete','calcite'],
    tiles:[dark,slate,tuff],wood:'spruce',trim:tuff,accent:'chiseled_tuff_bricks',foot:'polished_blackstone_bricks'},
  ember:{label:'Brasa · Barro e cobre',ramp:['nether_brick','red_nether_brick','red_terracotta','orange_terracotta','yellow_terracotta','raw_gold_block','cut_sandstone'],
    tiles:[red,brick,copper],wood:'mangrove',trim:copper,accent:'waxed_chiseled_copper',foot:'nether_brick'},
  tidal:{label:'Maré · Prismarinho e pátina',ramp:['dark_prismarine','warped_planks','waxed_weathered_cut_copper','waxed_oxidized_cut_copper','prismarine_bricks','calcite'],
    tiles:[ocean,verdigris,sea],wood:'warped',trim:verdigris,accent:'waxed_oxidized_chiseled_copper',foot:'dark_prismarine'},
  blossom:{label:'Florada · Ameixa e cerejeira',ramp:['blue_terracotta','purple_terracotta','magenta_terracotta','amethyst_block','pink_wool','cherry_planks','quartz_bricks'],
    tiles:[slate,mangrove,cherry],wood:'cherry',trim:cherry,accent:'amethyst_block',foot:'blue_terracotta'}
});
const wood={
  spruce:{cube:'spruce_planks',log:'stripped_spruce_log',stairs:'spruce_stairs',slab:'spruce_slab',trapdoor:'spruce_trapdoor'},
  mangrove:{cube:'mangrove_planks',log:'stripped_mangrove_log',stairs:'mangrove_stairs',slab:'mangrove_slab',trapdoor:'bamboo_trapdoor'},
  warped:{cube:'warped_planks',log:'stripped_warped_stem',stairs:'warped_stairs',slab:'warped_slab',trapdoor:'warped_trapdoor'},
  cherry:{cube:'cherry_planks',log:'stripped_cherry_log',stairs:'cherry_stairs',slab:'cherry_slab',trapdoor:'cherry_trapdoor'}
};
function options(input){
  const opts={family:'mineral',pattern:'density',seed:42,...input};
  if(!Object.hasOwn(paletteFamilies,opts.family)||!palettePatterns.includes(opts.pattern)||
     !Number.isSafeInteger(opts.seed)) throw Error('Família, padrão ou semente inválidos');
  return opts;
}
const bayer=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const mod=(v,n)=>((v%n)+n)%n;
function noise(x,y,seed){
  let n=Math.imul(x^seed,0x45d9f3b)^Math.imul(y+71,0x27d4eb2d);
  n=Math.imul(n^(n>>>16),0x85ebca6b);
  return ((n^(n>>>13))>>>0)/4294967296;
}
export function gradientIndex(progress,count,x,y,pattern='density',seed=42){
  if(!palettePatterns.includes(pattern)||!Number.isInteger(count)||count<1||
     !Number.isFinite(progress)||![x,y,seed].every(Number.isSafeInteger)) throw Error('Parâmetros de gradiente inválidos');
  const q=clamp(progress)*(count-1), lo=Math.floor(q), frac=q-lo;
  if(q===0 || q===count-1) return q;
  switch(pattern){
    case 'linear': return lo+Number(frac>=.5);
    case 'steps': return Math.min(count-1,Math.floor(clamp(progress)*count));
    case 'density': return lo+Number(frac>(bayer[mod(y+seed,4)][mod(x,4)]+.5)/16);
    case 'clusters':return lo+Number(frac>noise(Math.floor(x/3),Math.floor(y/2),seed));
    case 'mosaic':{
      // A repeated stepped lozenge. Only the two adjacent stops take part.
      const diamond=Math.abs(mod(x+seed,6)-2.5)+Math.abs(mod(y,6)-2.5);
      return lo+Number(frac>diamond/6);
    }
  }
}

export function generatePaletteStudy(input={}){
  const opt=options(input), f=paletteFamilies[opt.family], width=29,height=11;
  const custom=opt.from!==undefined || opt.to!==undefined;
  if(custom && !(opt.from && opt.to)) throw Error('Forneça os dois extremos do gradiente');
  const ramp=custom?composeGradient(opt.from,opt.to,{stops:opt.stops??6}):f.ramp;
  const modules=[{id:'base',label:'Embasamento',stage:0},{id:'field',label:'Painel de transição',stage:1},
    {id:'swatches',label:'Amostras em sequência',stage:2}];
  const blocks=[];
  const put=(x,y,z,id,module)=>blocks.push({x,y,z,id:namespace(id),module,states:{}});
  for(let x=-14;x<=14;x++)for(let z=-1;z<=1;z++) put(x,0,z,f.foot,'base');
  for(let y=1;y<=height;y++)for(let x=0;x<width;x++){
    const run=opt.pattern==='steps'?Math.floor(x/4)/Math.floor((width-1)/4):x/(width-1);
    const rise=opt.pattern==='steps'?Math.floor((y-1)/3)/Math.floor((height-1)/3):(y-1)/(height-1);
    const t=.68*run+.32*rise;
    const i=gradientIndex(t,ramp.length,x,y-1,opt.pattern,opt.seed);
    put(x-14,y,0,ramp[i],'field');
  }
  for(let x=0;x<width;x++){
    put(x-14,height+1,0,f.foot,'swatches');
    put(x-14,height+2,0,ramp[Math.floor(x*ramp.length/width)],'swatches');
  }
  return {schema:1,project:'estudo-paleta',version:'0.2.0',bedrockSamples:data.version,params:opt,
    modules,blocks,bounds:boundsOf(blocks),materials:inventory(blocks),joints:[['base','field'],['field','swatches']]};
}

function architecturalRole(block){
  if(roles.includes(block.role)) return block.role;
  const tag=(block.role??'')+' '+block.module;
  if(/ridge|trim|ornament|remate|crown|capitel|crest/i.test(tag)) return 'ornament';
  if(/roof|skin|cover|tile|telha|eave/i.test(tag)) return 'roof';
  if(/gable|panel|infill|front|wall|field|drum/i.test(tag)) return 'wall';
  if(/base|foundation|foot/i.test(tag)) return 'foundation';
  if(/beam|post|bracket|support|pillar|column|frame|estrutura/i.test(tag)) return 'structure';
  return null;
}
export function applyPalette(model,input={}){
  const opt=options(input), f=paletteFamilies[opt.family], timber=wood[f.wood];
  // A roof's own height range anchors its finish even if the post height changes.
  const range=new Map();
  for(const b of model.blocks){
    const role=architecturalRole(b);
    const [lo,hi]=range.get(role)??[b.y,b.y];
    range.set(role,[Math.min(lo,b.y),Math.max(hi,b.y)]);
  }
  const blocks=model.blocks.map(b=>{
    const role=architecturalRole(b), spec=paletteRegistry[b.id];
    if(!spec || !role || spec.emission) return b;
    const x=Math.abs(b.x),z=Math.abs(b.z),[lo,hi]=range.get(role);
    const h=(b.y-lo)/Math.max(1,hi-lo);
    let short;
    if(role==='roof' && spec.family==='wood'){
      short=timber[spec.shape];
    }else if(role==='roof'){
      const i=gradientIndex(h,f.tiles.length,x+z,b.y,opt.pattern,opt.seed);
      short=f.tiles[i][spec.shape];
    }else if(role==='structure' || spec.shape==='log' || spec.shape==='trapdoor'){
      short=timber[spec.shape];
    }else if(role==='wall' && spec.shape==='cube'){
      // Restrict infill to the light middle. Preserve the perimeter and the read of the truss.
      const i=gradientIndex(.47+.34*h,f.ramp.length,x,z+b.y,opt.pattern,opt.seed);
      short=f.ramp[i];
    }else if(role==='ornament'){
      short=spec.shape==='cube' && mod(x+z,5)===0?f.accent:f.trim[spec.shape];
    }else if(role==='foundation' && spec.shape==='cube') short=f.foot;
    if(!short) return b;
    const id=namespace(short), target=paletteRegistry[id];
    if(!target || target.shape!==spec.shape ||
       Object.entries(b.states).some(([name,val])=>!target.states[name]?.includes(val))) throw Error('Substituição incompatível '+b.id+' / '+id);
    return id===b.id?b:{...b,id};
  });
  return {...model,params:{...model.params,finish:opt},blocks,materials:inventory(blocks)};
}

export function faceFeatures(id,face='side'){
  const spec=paletteRegistry[namespace(id)];
  if(!spec||!Object.hasOwn(spec.texture,face)) throw Error('Face ou material desconhecido');
  return measuredTextures[spec.texture[face]];
}
export function exposedFeatures(block,normal='south'){
  const axis={up:'y',down:'y',east:'x',west:'x',north:'z',south:'z'}[normal];
  if(!axis) throw Error('Normal desconhecida');
  const spec=paletteRegistry[block.id];
  let face=axis==='y'?normal:'side';
  if(spec?.shape==='log') face=axis===block.states.pillar_axis?'up':'side';
  return faceFeatures(block.id,face);
}

// Contact statistics on a chosen face plane. Call with the exposed panel or
// course of interest; the caller decides which surface should be compared.
export function paletteMetrics(blocks,normal='south'){
  if(!blocks.length) throw Error('O painel está vazio');
  const skip={up:'y',down:'y',east:'x',west:'x',north:'z',south:'z'}[normal];
  const tangents=['x','y','z'].filter(k=>k!==skip);
  const key=b=>[b.x,b.y,b.z].join(',');
  const cells=new Map(blocks.map(b=>[key(b),b]));
  let contacts=0,transitions=0,sum=0,minimum=Infinity,maximum=-Infinity;
  for(const b of blocks){
    const L=exposedFeatures(b,normal).lab[0];minimum=Math.min(minimum,L);maximum=Math.max(maximum,L);
    for(const axis of tangents){
      const neighbor=cells.get(key({...b,[axis]:b[axis]+1}));
      if(!neighbor)continue;
      contacts++; transitions+=Number(neighbor.id!==b.id);
      sum+=Math.abs(L-exposedFeatures(neighbor,normal).lab[0]);
    }
  }
  const counts=inventory(blocks);
  return {counts,contacts,transitions,dominantShare:Math.max(...Object.values(counts))/blocks.length,
    globalLRange:maximum-minimum,meanLocalDeltaL:contacts?sum/contacts:0};
}
const roles=['wall','roof','foundation','ornament','structure'];
function perceptualVector(id,face){
  const f=faceFeatures(id,face);
  return [...f.lab,.65*(f.highlight[0]-f.shade[0]),.55*f.grain[0],.55*f.grain[1]];
}
const distanceSquared=(a,b)=>a.reduce((s,v,i)=>s+(v-b[i])**2,0);

// Ordered least-squares path through real surfaces. Project on the segment so
// the sequence cannot double back; the global fit avoids greedy duplicates.
export function composeGradient(from,to,{stops=6,face='side',candidates}={}){
  const start=namespace(from), end=namespace(to);
  if(!Number.isInteger(stops)||stops<2||stops>16) throw Error('Use de 2 a 16 materiais');
  if([start,end].some(id=>paletteRegistry[id]?.shape!=='cube')) throw Error('Os extremos exigem blocos inteiros sem estados');
  const a=perceptualVector(start,face),b=perceptualVector(end,face), span=distanceSquared(a,b);
  if(span<1e-10 || stops===2)return [...new Set([start,end])];
  const delta=b.map((v,i)=>v-a[i]);
  const pool=[...new Set(candidates?.map(namespace)??Object.keys(paletteRegistry))];
  const rows=pool.filter(id=>id!==start&&id!==end&&paletteRegistry[id]?.shape==='cube').map(id=>{
    const vec=perceptualVector(id,face);
    return {id,vec,t:vec.reduce((s,v,i)=>s+(v-a[i])*delta[i],0)/span};
  }).filter(r=>r.t>0&&r.t<1).sort((x,y)=>x.t-y.t||x.id.localeCompare(y.id,'en'));
  const n=Math.min(stops-2,rows.length);
  if(!n)return [start,end];
  const parents=[];
  let prev=new Array(rows.length).fill(0);
  for(let layer=0;layer<n;layer++){
    const current=new Array(rows.length).fill(Infinity),parent=new Array(rows.length).fill(-1);
    const target=a.map((v,i)=>v+delta[i]*(layer+1)/(n+1));
    let bestCost=Infinity,bestIndex=-1;
    for(let i=0;i<rows.length;i++){
      if(i>0 && prev[i-1]<bestCost){bestCost=prev[i-1];bestIndex=i-1;}
      const cost=distanceSquared(rows[i].vec,target);
      current[i]=cost+(layer===0?0:bestCost);parent[i]=bestIndex;
    }
    parents.push(parent);prev=current;
  }
  let k=prev.indexOf(Math.min(...prev));
  const path=[];
  for(let layer=n-1;layer>=0;layer--){path.unshift(rows[k].id);k=parents[layer][k];}
  return [start,...path,end];
}

export function groupMaterials(ids,{face='side',threshold=.09}={}){
  if(!Number.isFinite(threshold)||threshold<=0) throw Error('Limiar de agrupamento inválido');
  const groups=[];
  for(const id of [...new Set(ids.map(namespace))].sort()){
    const vec=perceptualVector(id,face);
    const cluster=groups.find(group=>group.every(other=>distanceSquared(vec,perceptualVector(other,face))<=threshold**2));
    if(cluster)cluster.push(id);else groups.push([id]);
  }
  return groups;
}
const harmonies=['context','analogous','complementary','monochrome','contrasting'];
function harmonyCost(source,candidate,harmony){
  if(harmony==='context') return 0;
  const [l,a,b]=source.lab,[otherL,otherA,otherB]=candidate.lab;
  const chroma=Math.hypot(a,b),otherChroma=Math.hypot(otherA,otherB);
  if(harmony==='contrasting')return Math.abs(.30-Math.abs(l-otherL))*.45;
  if(harmony==='monochrome')return Math.hypot(a-otherA,b-otherB)*1.3;
  if(Math.min(chroma,otherChroma)<.025) return .11; // neutral swatches have unstable hue
  const cos=(a*otherA+b*otherB)/(chroma*otherChroma);
  return .18*(harmony==='complementary'?1+cos:1-cos);
}
export function recommend(seedId,{role='wall',family='mineral',limit=5,face='side',harmony='context'}={}){
  const seed=namespace(seedId), source=faceFeatures(seed,face);
  if(!roles.includes(role)||!Object.hasOwn(paletteFamilies,family)||!harmonies.includes(harmony)||!Number.isSafeInteger(limit)||limit<1) throw Error('Contexto de recomendação inválido');
  const f=paletteFamilies[family];
  const anchors=role==='roof'?f.tiles.map(t=>t.cube):role==='foundation'?[f.foot,f.ramp[1]]:
    role==='structure'?[wood[f.wood].cube,wood[f.wood].log]:role==='ornament'?[f.accent,f.trim.cube]:f.ramp;
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  const peak=(feat)=>feat.highlight[0]-feat.shade[0];
  const candidates=[];
  for(const [id,spec] of Object.entries(paletteRegistry)){
    if(id===seed || (spec.shape!=='cube' && !(role==='structure' && spec.shape==='log'))) continue;
    if(role==='roof' && !Object.values(paletteFamilies).some(p=>p.tiles.some(t=>namespace(t.cube)===id)))continue;
    if(role==='foundation' && !['stone','ceramic','metal','organic'].includes(spec.family))continue;
    if(role==='structure' && spec.family!=='wood')continue;
    const feature=faceFeatures(id,face), [l]=feature.lab;
    const deltaL=l-source.lab[0], textureDifference=Math.abs(peak(feature)-peak(source));
    const measuredDistance=distance(feature.lab,source.lab);
    const anchorError=Math.min(...anchors.map(anchor=>distance(feature.lab,faceFeatures(anchor,face).lab)));
    const desired=role==='ornament'?.32:role==='foundation'?.15:.11;
    const grainChange=Math.abs(feature.grain[0]-source.grain[0])+Math.abs(feature.grain[1]-source.grain[1]);
    const cost=1.8*anchorError+Math.abs(measuredDistance-desired)*.65+
      Math.abs(textureDifference-(role==='ornament'?.13:.06))*.45+Math.abs(grainChange-.04)*.25+
      harmonyCost(source,feature,harmony);
    candidates.push({id,label:spec.label,score:1/(1+cost),
      reason:`${role==='roof'?'Possui escada e laje':role==='structure'?'Madeira para apoios':role==='foundation'?'Base de material sólido':role==='ornament'?'Acento decorativo':'Preenchimento sólido'}; ${deltaL>=0?'mais claro':'mais escuro'} na face analisada (ΔL ${deltaL.toFixed(2)}); ${peak(feature)>peak(source)?'mais':'menos'} contraste interno. ${spec.family!==paletteRegistry[seed].family?'Família diferente do bloco inicial.':'Continuidade de família.'}`,
      family:spec.family,texture:spec.texture[face]});
  }
  // Diversify the shortlist by family and reject multiple shapes that show the same texture.
  const result=[];
  while(result.length<limit && candidates.length){
    const reuse=c=>result.filter(r=>r.family===c.family).length*.038;
    candidates.sort((a,b)=>(b.score-reuse(b))-(a.score-reuse(a)) || a.id.localeCompare(b.id,'en'));
    const next=candidates.shift();
    if(!result.some(r=>r.texture===next.texture)) result.push(next);
  }
  return result.map(({id,label,reason,score})=>({id,label,reason,score:Number(score.toFixed(4))}));
}

