import {catalog} from '../v2/laboratory.mjs';
import {inventory,key} from '../model.mjs';
import {exposedFeatures,paletteRegistry} from '../v2/palette.mjs';
import {kitVolume} from '../v2/kit-shapes.mjs';

const M='minecraft:';
const faces=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const faceNames=['east','west','up','down','south','north'];
const tileSets={
  slate:{cube:'deepslate_bricks',stairs:'deepslate_brick_stairs',slab:'deepslate_brick_slab'},
  dark:{cube:'polished_blackstone_bricks',stairs:'polished_blackstone_brick_stairs',slab:'polished_blackstone_brick_slab'},
  copper:{cube:'waxed_weathered_cut_copper',stairs:'waxed_weathered_cut_copper_stairs',slab:'waxed_weathered_cut_copper_slab'},
  patina:{cube:'waxed_oxidized_cut_copper',stairs:'waxed_oxidized_cut_copper_stairs',slab:'waxed_oxidized_cut_copper_slab'}
};
export function surfaceContext(block,at,bounds){
  const normals=faces.filter(d=>!at.has(key(block.x+d[0],block.y+d[1],block.z+d[2])));
  let overhead=0;
  for(let dy=1;dy<=6;dy++)if(at.has(key(block.x,block.y+dy,block.z))){overhead=dy;break;}
  const front=normals.some(d=>d[2]===-1),height=(block.y-bounds.min[1])/Math.max(1,bounds.size[1]-1);
  return {normals,overhead,sheltered:overhead>0,front,height,
    depth:Math.max(0,block.z-bounds.min[2]),bay:Math.floor((block.x+9)/6),
    role:block.role??({skin:'roof',ridge:'crest',gables:'ornament',brackets:'structure',walls:'wall',base:'foundation'})[block.module]??'structure'};
}
export function applyContextualPalette(model,{edition='A',mode='contextual'}={}){
  if(!['A','B','C'].includes(edition)||!['contextual','illustrative'].includes(mode))throw Error('Contexto de material inválido');
  const at=new Map(model.blocks.map(b=>[key(b.x,b.y,b.z),b]));
  const blocks=model.blocks.map(block=>{
    const c=surfaceContext(block,at,model.bounds),shape=catalog[block.id].shape;
    let id=block.id,rule='continuidade estrutural';
    if(c.role==='roof'&&['cube','stairs','slab'].includes(shape)){
      // Pátina is a frozen material composition, represented by waxed states.
      let set=tileSets.slate;
      if(edition==='C'){
        const distance=Math.abs(block.x);
        set=(distance>=9||c.sheltered)?tileSets.patina:tileSets.copper;
        rule=distance>=9?'pátina nas margens expostas':'cobre envelhecido no campo da cobertura';
      }else{
        set=c.sheltered||Math.abs(block.x)>=10?tileSets.dark:tileSets.slate;
        rule=c.sheltered?'faixa escura sob recobrimento':'telha e borda com continuidade';
      }
      id=M+set[shape];
    }else if(c.role==='wall'&&shape==='cube'){
      if(mode==='illustrative'){
        id=M+(['deepslate_bricks','red_terracotta','calcite'][Math.min(2,Math.floor(c.height*5))]);
        rule='régua vertical ilustrativa';
      }else{
        const footing=block.y<=3,shadow=c.sheltered&&c.overhead<=3;
        id=M+(edition==='C'?(footing?'blue_terracotta':shadow?'purple_terracotta':'cherry_planks'):
          footing?'polished_tuff':shadow?'cut_sandstone':'calcite');
        rule=footing?'rodapé de desgaste':shadow?'recuo sob proteção':'preenchimento exposto do pano';
      }
    }else if(c.role==='ornament'&&shape==='cube'&&block.id!==M+'anvil'){
      const accent=block.component==='cornice'&&Math.abs(block.x)%4===0||block.module==='gables'&&block.x===0;
      if(accent){id=M+(edition==='C'?'waxed_oxidized_chiseled_copper':'waxed_chiseled_copper');rule='acento no eixo ou no ritmo modular';}
    }
    if(!catalog[id]||catalog[id].shape!==shape)throw Error('Material incompatível com a forma '+id);
    const appearance={role:c.role,rule,normal:c.normals[0]??null,sheltered:c.sheltered,overhead:c.overhead,depth:c.depth,bay:c.bay,height:Number(c.height.toFixed(3))};
    // Color is evaluated on the face actually exposed when the catalog has measurements.
    const normal=c.normals[0],face=normal?faceNames[faces.findIndex(d=>d.every((v,i)=>v===normal[i]))]:'up';
    if(Object.hasOwn(paletteRegistry,id))appearance.lightness=Number(exposedFeatures({...block,id},face).lab[0].toFixed(4));
    return {...block,id,appearance};
  });
  return {...model,blocks,materials:inventory(blocks),materialStrategy:{edition,mode,
    intent:edition==='C'?'madeira ameixa, pátina e hierarquia axial':'madeira quente, argamassa clara e base mineral',
    weathering:'composição de blocos encerados; envelhecimento dinâmico não simulado'}};
}

// Architectural finishes operate on the canonical geometry and retain the selected rule.
export function applyArchitecturalPalette(model,{palette='mineral'}={}){
  if(!['mineral','patina'].includes(palette))throw Error('Paleta arquitetônica desconhecida');
  const at=new Map(model.blocks.map(b=>[key(b.x,b.y,b.z),b])),cache=new Map();
  const boxes=b=>{
    const signature=b.id+JSON.stringify(b.states);
    if(!cache.has(signature))cache.set(signature,kitVolume(catalog[b.id].shape,b.states));
    return cache.get(signature);
  };
  const occupied=point=>{
    const cell=point.map(Math.floor),b=at.get(key(...cell));if(!b)return false;
    const local=point.map((n,i)=>(n-cell[i])*16);
    return boxes(b).some(box=>[0,1,2].every(i=>local[i]>=box[i]&&local[i]<box[i+3]));
  };
  const anchors=[[-9,-5],[-9,5],[9,-5],[9,5]];
  const blocks=model.blocks.map(b=>{
    const shape=catalog[b.id].shape,parts=boxes(b);
    let sky=0,samples=0;
    for(const x of [.25,.75])for(const z of [.25,.75]){
      const column=parts.filter(p=>p[0]<=x*16&&p[3]>x*16&&p[2]<=z*16&&p[5]>z*16);
      if(!column.length)continue;
      const top=b.y+Math.max(...column.map(p=>p[4]))/16;
      samples++;let blocked=false;
      for(let dy=.01;dy<12;dy+=.5)if(occupied([b.x+x,top+dy,b.z+z])){blocked=true;break;}
      if(!blocked)sky++;
    }
    const exposure=samples?sky/samples:0,shadow=1-exposure;
    const normals=faces.filter(d=>parts.some(p=>{
      const center=[0,1,2].map(i=>b[['x','y','z'][i]]+(p[i]+p[i+3])/32),axis=d.findIndex(n=>n);
      center[axis]=b[['x','y','z'][axis]]+p[axis+(d[axis]>0?3:0)]/16+d[axis]*.001;
      return !occupied(center);
    }));
    const normal=normals.find(d=>d[2]===1)??normals.find(d=>d[0])??normals[0]??[0,1,0];
    const orientation=normal[2]===1?0:normal[0]!==0?.5:1;
    const depth=Math.max(0,normal[2]===1?3-b.z:normal[2]===-1?b.z+6:8-Math.abs(b.x));
    const ridgeDistance=Math.hypot(b.x,Math.max(0,Math.abs(b.z)-4));
    const cornerDistance=Math.hypot(12-Math.abs(b.x),8-Math.abs(b.z));
    const supportDistance=Math.min(...anchors.map(([x,z])=>Math.hypot(b.x-x,b.z-z)));
    const rhythm=(Math.abs(b.x)%6)/5,height=(b.y-2)/Math.max(1,model.datums.roofDatum-2);
    const face=faceNames[faces.findIndex(d=>d.every((v,i)=>v===normal[i]))];
    const feature=paletteRegistry[b.id]?exposedFeatures(b,face):null;
    const grain=feature?(feature.grain[0]+feature.grain[1])/2:0;
    const context={role:b.role??'structure',orientation,face,lateral:Math.abs(b.x)/12,onAxis:Math.abs(b.x)<=1,normal,exposure,shadow,depth,ridgeDistance,cornerDistance,supportDistance,rhythm,height,grain,
      frame:'design-local',sampling:'visible solid boxes; 4 sky samples; 12-block vertical ray'};
    const decision=architecturalMaterialDecision(b,context,palette);
    return {...b,id:decision.id,appearance:{...context,inputId:b.id,rule:decision.rule,ruleId:decision.ruleId,score:decision.score,selected:decision.id,palette}};
  });
  return {...model,blocks,materials:inventory(blocks),materialStrategy:{palette,version:'0.2.2',method:'architectural-surfaces',weathering:'composição de blocos encerados'}};
}

export function architecturalMaterialDecision(b,context,palette){
  const shape=catalog[b.id].shape;
  const {orientation,exposure,shadow,depth,ridgeDistance,cornerDistance,supportDistance,rhythm,height,grain,face,lateral,onAxis}=context;
  let id=b.id,ruleId=context.role==='window'?'window-preserved':context.role==='balustrade'?'ornamental-wall':'structure-continuity',
    rule=context.role==='window'?'folha de treliça preservada':context.role==='balustrade'?'mureta ornamental de enquadramento':'material contínuo do componente',score=0;
  if(context.role==='roof'&&['cube','stairs','slab'].includes(shape)){
    score=.27*orientation+.30*exposure+.15*Math.min(1,lateral)+.12*Math.max(0,1-cornerDistance/4)+.10*Math.min(1,ridgeDistance/12)+.06*grain;
    const tier=score<.36?0:score<.64?1:2;
    const sets=palette==='patina'?[tileSets.copper,tileSets.copper,tileSets.patina]:
      [tileSets.slate,tileSets.slate,tileSets.dark];
    // The least exposed copper remains a distinct, unweathered material.
    const selected=palette==='patina'&&tier===0?{cube:'waxed_cut_copper',stairs:'waxed_cut_copper_stairs',slab:'waxed_cut_copper_slab'}:sets[tier];
    id=M+selected[shape];ruleId=palette+'-roof-'+tier;rule='cobertura · exposição '+exposure.toFixed(2)+' · face '+face+' · proximidade de bordas e cumeeira';
  }else if(context.role==='wall'&&shape==='cube'){
    score=.28*shadow+.25*Math.min(1,depth/3)+.15*orientation+.14*Math.max(0,1-height)+.10*rhythm+.08*grain;
    const tier=score<.35?0:score<.62?1:2;
    id=M+(palette==='patina'?['cherry_planks','purple_terracotta','blue_terracotta'][tier]:['calcite','cut_sandstone','polished_tuff'][tier]);
    ruleId=palette+'-wall-'+tier;rule='pano · recuo '+depth.toFixed(2)+' · abrigo '+shadow.toFixed(2)+' · altura e repetição modular';
  }else if(context.role==='ornament'&&shape==='cube'){
    const nearSupport=supportDistance<=2,axis=onAxis;
    id=M+(palette==='patina'?(nearSupport?'waxed_oxidized_chiseled_copper':axis?'waxed_weathered_cut_copper':'mangrove_planks'):
      nearSupport?'waxed_chiseled_copper':axis?'bamboo_planks':'mangrove_planks');
    ruleId=nearSupport?'ornament-support':axis?'ornament-axis':'ornament-background';
    rule=nearSupport?'acento junto ao apoio':axis?'acento no eixo da fachada':'continuidade do fundo ornamental';
  }
  if(catalog[id]?.shape!==shape)throw Error('Substituição incompatível '+id);
  return {id,rule,ruleId,score:Number(score.toFixed(6))};
}

export function assertMaterialMetadata(model){
  for(const b of model.blocks){
    const a=b.appearance;
    if(!a||a.palette!==model.materialStrategy.palette||!a.inputId)throw Error('Metadados materiais ausentes');
    const d=architecturalMaterialDecision({...b,id:a.inputId},a,a.palette);
    if(d.id!==b.id||a.selected!==b.id||d.rule!==a.rule||d.ruleId!==a.ruleId||d.score!==a.score)throw Error('Justificativa material inconsistente');
  }
}
