import {boundsOf, checkStates, directions, inventory, key} from '../model.mjs';
import {faceMasks,normals} from '../contact.mjs';

export const geometryDefaults=Object.freeze({
  family:'irimoya', width:21, length:29, rise:7, curve:.55, lift:2, overhang:3,
  thickness:1, bracketLayers:2, bracketDepth:2, bracketWidth:1, supports:3,
  gableFraction:.60, ornament:'carved', profile:'quadratic'
});
export const families=Object.freeze(['gable','hip','irimoya','tiered']);

const stages=[
  ['posts','Pilares'],['beams','Vigas e montantes'],['brackets','Consolos compostos'],
  ['gables','Frontões em relevo'],['skin','Águas e cornijas'],['ridge','Cumeeira'],
  ['drum','Tambor entre beirais'],['upperSkin','Cobertura superior'],['upperRidge','Cumeeira superior']
];
const log=axis=>({pillar_axis:axis});
const stair=(d,upside=false,corner='none')=>({
  weirdo_direction:d,upside_down_bit:upside,'minecraft:corner':corner
});
const slab={'minecraft:vertical_half':'bottom'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function configuration(input) {
  for(const k of Object.keys(input)) if(!Object.hasOwn(geometryDefaults,k)&&!['pitch','stations','datum','bracketStyle','sealGables'].includes(k)) throw Error('Parâmetro desconhecido: '+k);
  if(input.pitch!==undefined && input.rise!==undefined) throw Error('Escolha rise ou pitch para determinar a cumeeira');
  const p={...geometryDefaults,...input};
  const limit=(key,min,max,integral=false)=>{
    const n=p[key];
    if(!Number.isFinite(n)||n<min||n>max||(integral&&!Number.isInteger(n))) throw Error('Valor inválido: '+key);
  };
  limit('width',17,41,true);limit('length',17,65,true);
  if(p.width%2!==1||p.length%2!==1) throw Error('A largura e o comprimento devem ser ímpares');
  if(p.pitch!==undefined) {limit('pitch',.30,1.35);p.rise=p.pitch*(p.width-1)/2;}
  limit('rise',2,((p.width-1)/2)*1.35);limit('curve',0,1);limit('lift',0,3);
  limit('overhang',2,5,true);limit('thickness',1,3,true);limit('bracketLayers',1,3,true);
  limit('bracketDepth',1,p.overhang,true);limit('bracketWidth',1,2,true);limit('supports',2,5,true);
  limit('gableFraction',.35,.80);
  if(p.datum!==undefined)limit('datum',8,30,true);
  if(p.bracketStyle!==undefined&&!['balanced','fan'].includes(p.bracketStyle))throw Error('Consolo desconhecido');
  if(p.sealGables!==undefined&&typeof p.sealGables!=='boolean')throw Error('Tratamento de encontro inválido');
  if(!families.includes(p.family) || !['plain','carved'].includes(p.ornament)||!['quadratic','swept'].includes(p.profile)) throw Error('Tipologia ou ornamento inválido');
  if(['hip','tiered'].includes(p.family)&&p.length<p.width) throw Error('Esta tipologia exige comprimento maior ou igual à largura');
  const sz=(p.length-1)/2-p.overhang;
  const stations=input.stations || Array.from({length:p.supports},(_,i)=>{
    const f=sz*(2*i/(p.supports-1)-1);
    return Math.sign(f)*Math.round(Math.abs(f));
  });
  if(!Array.isArray(stations)||stations.length<2||stations.length>5||stations.some((z,i)=>
    !Number.isInteger(z)||Math.abs(z)>sz||i&&z-stations[i-1]<=2*p.bracketWidth)) throw Error('Estações incompatíveis com o comprimento ou a largura dos consolos');
  if(input.stations!==undefined && input.supports!==undefined && stations.length!==input.supports) throw Error('Contagem de apoios divergente');
  p.stations=stations.slice();p.supports=stations.length;
  return p;
}

function sections(p) {
  const w=(p.width-1)/2,l=(p.length-1)/2;
  // Datum leaves working room for each arm, bearing course and solid backing.
  const datum=p.datum??7+p.bracketLayers*2+p.thickness;
  const common={w,l,datum,rise:p.rise,curve:p.curve,lift:p.lift,thickness:p.thickness,profile:p.profile};
  if(p.family==='tiered'){
    const inset=Math.min(w-2,p.overhang+2);
    const ring={...common,kind:'skirt',opening:[w-inset,l-inset],inset};
    const upper={...common,kind:'hip',w:w-inset+2,l:l-inset+2,
      datum:datum+Math.ceil(p.rise*(inset/w))+Math.ceil(p.lift)+p.thickness+3,
      rise:Math.max(2,p.rise*.70),lift:p.lift*.55};
    return [ring,upper];
  }
  if(p.family==='irimoya'){
    const setback=clamp(Math.round(w*(1-p.gableFraction)),2,w-2);
    return [{...common,kind:p.family,setback,gableZ:l-setback,ridgeExtent:l-setback}];
  }
  if(p.family==='hip') return [{...common,kind:'hip',ridgeExtent:l-w}];
  return [{...common,kind:'gable',gableZ:l-2,ridgeExtent:l}];
}
const inSection=(s,x,z)=>Math.abs(x)<=s.w && Math.abs(z)<=s.l &&
  (!s.opening || Math.abs(x)>s.opening[0] || Math.abs(z)>s.opening[1]);

function profile(s,x,z){
  const dx=s.w-Math.abs(x),dz=s.l-Math.abs(z);
  // The two gable planes are extruded along Z. A hip is the lower envelope
  // of transverse and longitudinal pitches. Irimoya ends these longitudinal
  // planes at a vertical gable; the two-level roof has an actual opening.
  let run=dx;
  if(s.kind==='hip'||s.kind==='skirt'||s.kind==='irimoya'&&dz<s.setback) run=Math.min(dx,dz);
  const t=clamp(run/s.w,0,1);
  if(s.profile==='swept'){
    const shoulder=(1-s.curve)*t+s.curve*t**1.8;
    const lip=(1-t)**4*(.45+.55*(Math.abs(z)/s.l)**4);
    return s.datum+s.rise*shoulder+s.lift*lip;
  }
  const sweep=(Math.abs(x)/s.w)**4 * (Math.abs(z)/s.l)**4;
  return s.datum+s.rise*((1-s.curve)*t+s.curve*t*t)+s.lift*sweep;
}

function gableBreak(s,x,z,nx,nz){
  return s.kind==='irimoya' && Math.abs(x)<s.w-s.setback && x===nx &&
    (Math.abs(z)<=s.gableZ)!==(Math.abs(nz)<=s.gableZ);
}

function sampleSection(s){
  const cells=new Map();
  for(let z=-s.l;z<=s.l;z++) for(let x=-s.w;x<=s.w;x++){
    if(!inSection(s,x,z)) continue;
    const h=profile(s,x,z), half=Math.round(2*h), top=Math.ceil(half/2)-1;
    cells.set(x+','+z,{x,z,h,half,top,bottom:top-s.thickness});
  }
  for(const c of cells.values()){
    const {x,z}=c;
    const near=directions.map(([a,b])=>{
      if(gableBreak(s,x,z,x+a,z+b)) return undefined;
      return cells.get((x+a)+','+(z+b));
    });
    // A short continuation through the eave is used only for selecting a
    // directional half-block, never for placing cells beyond the footprint.
    const delta=[0,1,2,3].map(i=>near[i]?.h??c.h);
    const grad=[(delta[0]-delta[1])/2,(delta[2]-delta[3])/2];
    const across=Math.abs(grad[0])>=Math.abs(grad[1]);
    const d=across?(grad[0]>=0?0:1):(grad[1]>=0?2:3);
    const ridge=s.kind!=='skirt' && x===0 && Math.abs(z)<=(s.ridgeExtent??s.l-s.w);
    const lower=near[d^1]?.half??c.half;
    let shape=c.half%2?'slab':lower<c.half?'stairs':'cube',corner='none';
    const onHip=s.kind==='hip'||s.kind==='skirt'||s.kind==='irimoya'&&Math.abs(z)>s.gableZ;
    if(shape==='stairs' && onHip && s.w-Math.abs(x)===s.l-Math.abs(z) && x && z){
      const [a,b]=directions[d], cross=grad[0]*b-grad[1]*a;
      corner=cross>=0?'outer_left':'outer_right';
    }
    if(ridge) shape='cube';
    Object.assign(c,{shape,corner,d,ridge});
    for(const n of near) if(n) c.bottom=Math.min(c.bottom,n.top);
  }
  return cells;
}

export function generateGeometry(input={}){
  const p=configuration(input),[s,upper]=sections(p);
  const plane=sampleSection(s), upperPlane=upper?sampleSection(upper):null;
  const cells=new Map(),kitSockets=[];
  function put(x,y,z,id,states,module){
    const pos=key(x,y,z);
    if(cells.has(pos)) throw Error('Interseção '+pos+' entre '+cells.get(pos).module+' e '+module);
    cells.set(pos,{x,y,z,id:'minecraft:'+id,states:{...states},module});
  }
  const timber=(x,y,z,axis,module)=>put(x,y,z,'stripped_mangrove_log',log(axis),module);
  const sx=s.w-p.overhang;
  for(const x of [-sx,sx]){
    for(const z of p.stations) for(let y=0;y<4;y++) timber(x,y,z,'y','posts');
    for(let z=p.stations[0];z<=p.stations.at(-1);z++) timber(x,4,z,'z','beams');
  }
  for(const z of p.stations){
    for(let x=-sx+1;x<sx;x++) timber(x,4,z,'x','beams');
  }
  if(s.gableZ!==undefined){
    // The king posts rest on the longitudinal tie even when the user moves
    // the last transverse frame independently from the gable.
    for(let z=Math.min(-s.gableZ,p.stations[0]);z<=Math.max(s.gableZ,p.stations.at(-1));z++)
      if(!p.stations.includes(z)) timber(0,4,z,'z','beams');
  }
  // An outward arm carries a short tangential beam. Its three small bearing
  // blocks can be read separately in silhouette from the stepped radial arm.
  for(const side of [-1,1]) for(const z of p.stations){
    const x=side*sx;
    if(p.bracketStyle){
      for(let n=0;n<p.bracketLayers;n++){
        const y=5+n,advance=Math.ceil((n+1)*p.bracketDepth/p.bracketLayers),end=x+side*advance;
        for(let r=0;r<=advance;r++){
          const px=x+r*side,terminal=r===advance;
          put(px,y,z,terminal?'mangrove_stairs':'stripped_mangrove_log',
            terminal?stair(side>0?1:0,true):log(r===0?'y':'x'),'brackets');
          Object.assign(cells.get(key(px,y,z)),{structuralRole:r===0?'bearing':terminal?'termination':'radial-arm'});
        }
        const wing=p.bracketStyle==='fan'?Math.min(n+1,p.bracketWidth+1):p.bracketWidth;
        for(let t=-wing;t<=wing;t++)if(t){
          const outer=Math.abs(t)===wing;
          put(end,y,z+t,outer?'mangrove_slab':'stripped_mangrove_log',outer?{'minecraft:vertical_half':'top'}:log('z'),'brackets');
          Object.assign(cells.get(key(end,y,z+t)),{structuralRole:t*Math.sign(z)>0?'corner-return':outer?'termination':'tangential-beam'});
        }
      }
      for(const px of [x,x+side*p.bracketDepth]){
        const bottom=plane.get(px+','+z).bottom;
        for(let y=5+p.bracketLayers;y<bottom;y++)timber(px,y,z,'y','brackets');
      }
      continue;
    }
    for(let n=0;n<p.bracketLayers;n++){
      const y=5+2*n, advance=Math.ceil((n+1)*p.bracketDepth/p.bracketLayers);
      const end=x+side*advance;
      for(let r=-1;r<=advance;r++){
        const px=x+r*side;
        if(r===-1 && p.ornament==='carved') put(px,y,z,'mangrove_stairs',stair(side>0?0:1,true),'brackets');
        else timber(px,y,z,'x','brackets');
      }
      for(let t=-p.bracketWidth;t<=p.bracketWidth;t++) if(t){
        if(Math.abs(t)===p.bracketWidth && p.ornament==='carved') put(end,y,z+t,'mangrove_stairs',stair(t>0?3:2,true),'brackets');
        else timber(end,y,z+t,'z','brackets');
      }
      put(x,y+1,z,'mangrove_planks',{},'brackets');
      for(const t of [-p.bracketWidth,0,p.bracketWidth]) put(end,y+1,z+t,'bamboo_planks',{},'brackets');
    }
    for(const px of [x,x+side*p.bracketDepth]){
      const bottom=plane.get(px+','+z).bottom;
      for(let y=5+2*p.bracketLayers;y<bottom;y++) timber(px,y,z,'y','brackets');
    }
  }

  if(s.gableZ!==undefined) for(const sign of [-1,1]){
    const z=sign*s.gableZ, back=z-sign, ahead=z+sign;
    const available=plane.get('0,'+z).bottom;
    const sill=s.kind==='irimoya'?plane.get('0,'+ahead).top+1:Math.min(s.datum-2,available-2);
    if(available-sill<2) throw Error('Frontão requer maior elevação, menor espessura ou maior gableFraction');
    for(let y=5;y<sill;y++) timber(0,y,z,'y','beams');
    // A seat running through the facade remains a structural stile. The
    // infill is cut to its cheek rather than putting a second block inside.
    const hasSeat=(x,y,z)=>cells.get(key(x,y,z))?.module==='brackets';
    for(let x=-s.w;x<=s.w;x++){
      const underside=plane.get(x+','+z).bottom, backBottom=plane.get(x+','+back).bottom;
      const apron=plane.get(x+','+ahead);
      const occupiedTop=apron.top+(apron.shape==='slab'?.5:1);
      if(p.sealGables&&underside>sill&&occupiedTop<=sill&&!cells.has(key(x,sill-1,z))){
        put(x,sill-1,z,'mangrove_planks',{},'gables');
        cells.get(key(x,sill-1,z)).structuralRole='gable-apron';
      }
      for(let y=sill;y<backBottom;y++){
        if(!hasSeat(x,y,back)) put(x,y,back,x%4===0?'mangrove_planks':'bamboo_planks',{},'gables');
      }
      for(let y=sill;y<underside;y++){
        const rim=y===sill||y===underside-1||x===0;
        const diagonal=p.ornament==='carved' && y===sill+Math.floor(Math.abs(x)*.65);
        if((rim||diagonal)&&!hasSeat(x,y,z)) timber(x,y,z,y===sill?'x':'y','gables');
        if(p.ornament==='carved' && (x===0 || Math.abs(x)%4===2) && y===underside-1) {
          const neighbor=plane.get(x+','+ahead);
          if((y<neighbor.bottom||y>neighbor.top)&&!hasSeat(x,y,ahead)){
            put(x,y,ahead,'bamboo_trapdoor',{direction:sign>0?2:3,open_bit:true,upside_down_bit:false},'gables');
          }
        }
      }
    }
  }

  function cladding(section,samples,skin,ridge){
    for(const c of samples.values()){
      const {x,z,top,bottom}=c;
      for(let y=bottom;y<top;y++){
        const fascia=p.ornament==='carved' && y===bottom && (Math.abs(x)===section.w||Math.abs(z)===section.l);
        put(x,y,z,fascia?'mangrove_planks':'deepslate_bricks',{},skin);
      }
      const ramp=c.shape==='stairs', half=c.shape==='slab';
      const id=c.ridge?'waxed_oxidized_cut_copper':ramp?'deepslate_brick_stairs':half?'deepslate_brick_slab':'deepslate_bricks';
      put(x,top,z,id,ramp?stair(c.d,false,c.corner):half?slab:{},c.ridge?ridge:skin);
    }
    if(section.kind!=='skirt'){
      const ends=section.ridgeExtent??section.l-section.w;
      for(const z of new Set([-ends,ends])){
        const y=samples.get('0,'+z).top+1;
        kitSockets.push({id:z>0?'ridgeSouth':'ridgeNorth',x:0,y,z});
      }
    }
  }
  cladding(s,plane,'skin','ridge');
  if(upper){
    const [iw,il]=s.opening;
    for(let x=-iw;x<=iw;x++) for(let z=-il;z<=il;z++){
      const xEdge=Math.abs(x)===iw,zEdge=Math.abs(z)===il;
      if(!xEdge && !zEdge) continue;
      const nx=xEdge?x+Math.sign(x):x,nz=xEdge?z:z+Math.sign(z);
      const floor=plane.get(nx+','+nz).bottom,ceiling=upperPlane.get(x+','+z).bottom;
      for(let y=floor;y<ceiling;y++){
        const band=y<=floor+1||y===ceiling-1;
        const pier=xEdge&&zEdge || (xEdge?z:x)%3===0;
        if(band||pier) timber(x,y,z,band?(xEdge?'z':'x'):'y','drum');
        else if(y===floor+2) put(x,y,z,'bamboo_planks',{},'drum');
      }
    }
    cladding(upper,upperPlane,'upperSkin','upperRidge');
  }

  const used=new Set([...cells.values()].map(b=>b.module));
  const modules=stages.filter(([id])=>used.has(id)).map(([id,label],stage)=>({id,label,stage}));
  const order=new Map(modules.map(m=>[m.id,m.stage]));
  const blocks=[...cells.values()].sort((a,b)=>order.get(a.module)-order.get(b.module)||a.y-b.y||a.z-b.z||a.x-b.x);
  return {schema:1,project:'laboratorio-arquitetonico',version:'0.2.0',bedrockSamples:'v1.26.60.5',
    params:p,modules,blocks,bounds:boundsOf(blocks),materials:inventory(blocks),kitSockets,
    attachments:Object.fromEntries(kitSockets.map(a=>[a.id,{origin:[a.x,a.y,a.z],normal:[0,1,0]}]))};
}

export function discretizationStudy(options={}){
  const p=configuration(options), result={};
  for(const [name,q] of [['whole',1],['half',2]]){
    let worst=0,total=0,n=0;
    for(const section of sections(p)){
      for(let z=-section.l;z<=section.l;z++) for(let x=-section.w;x<=section.w;x++){
        if(!inSection(section,x,z)) continue;
        const h=profile(section,x,z),error=Math.abs(h-Math.round(q*h)/q);
        worst=Math.max(worst,error); total+=error;n++;
      }
    }
    result[name]={samples:n,maxError:worst,meanError:total/n};
  }
  return result;
}

// Validate a generated geometric master before palette or kit composition.
// Counts after recoloring belong to the composed-model validator.
export function validateGeometry(model) {
  const p=configurationResolved(model.params), blocks=model.blocks, at=new Map();
  const rank=new Map(model.modules.map(m=>[m.id,m.stage]));
  if(!blocks.length || !rank.size) throw Error('Modelo vazio');
  const masks=new Map(),cache=new Map(),neighbors=new Map();
  for(const b of blocks){
    checkStates(b);
    const pos=key(b.x,b.y,b.z);
    if(![b.x,b.y,b.z].every(Number.isSafeInteger)||at.has(pos)||!rank.has(b.module)) throw Error('Célula inválida '+pos);
    at.set(pos,b);
    const signature=b.id+JSON.stringify(b.states);
    if(!cache.has(signature)) cache.set(signature,faceMasks(b));
    masks.set(b,cache.get(signature));
  }
  const expectedBounds=boundsOf(blocks),expectedMaterials=inventory(blocks);
  if(!['min','max','size'].every(k=>model.bounds[k].every((n,i)=>n===expectedBounds[k][i])) ||
     Object.keys(expectedMaterials).length!==Object.keys(model.materials).length ||
     Object.entries(expectedMaterials).some(([id,n])=>model.materials[id]!==n)) throw Error('Metadados divergentes');
  const missing=(x,y,z)=>!at.has(key(x,y,z));
  for(const [index,s] of sections(p).entries()){
    const skin=index?'upperSkin':'skin',ridge=index?'upperRidge':'ridge';
    for(const c of sampleSection(s).values()){
      for(let y=c.bottom;y<c.top;y++) if(at.get(key(c.x,y,c.z))?.module!==skin) throw Error('Curso interrompido '+key(c.x,y,c.z));
      const cap=at.get(key(c.x,c.top,c.z));
      if(!cap || cap.module!==(c.ridge?ridge:skin)) throw Error('Furo na cobertura '+key(c.x,c.top,c.z));
      if(c.shape==='stairs' && (!cap.id.endsWith('_stairs') || cap.states.weirdo_direction!==c.d ||
          cap.states['minecraft:corner']!==c.corner || cap.states.upside_down_bit)) throw Error('Escada de cobertura invertida');
      if(c.shape==='slab' && cap.states['minecraft:vertical_half']!=='bottom') throw Error('Laje de cobertura invertida');
      if(c.shape==='cube' && Object.keys(cap.states).length) throw Error('Volume da telha divergente');
    }
    if(s.gableZ!==undefined){
      const back=s.gableZ-1;
      if(!blocks.some(b=>b.module==='gables'&&Math.abs(b.z)===back) ||
         !blocks.some(b=>b.module==='gables'&&Math.abs(b.z)===s.gableZ)) throw Error('Frontão sem profundidade');
    }
  }
  for(const a of model.kitSockets){
    if(at.get(key(a.x,a.y-1,a.z))?.id!=='minecraft:waxed_oxidized_cut_copper'||!missing(a.x,a.y,a.z)) throw Error('Encaixe de remate inválido');
  }
  for(const b of blocks){
    const adjacent=[];
    for(const [face,[dx,dy,dz]] of normals.entries()){
      const other=at.get(key(b.x+dx,b.y+dy,b.z+dz));
      if(other && (masks.get(b)[face]&masks.get(other)[face^1])) adjacent.push(other);
    }
    neighbors.set(b,adjacent);
  }
  for(const module of model.modules){
    const eligible=blocks.filter(b=>rank.get(b.module)<=module.stage);
    const queue=eligible.filter(b=>b.module==='posts'&&b.y===0),seen=new Set(queue);
    for(let i=0;i<queue.length;i++) for(const neighbor of neighbors.get(queue[i])){
      if(seen.has(neighbor)||rank.get(neighbor.module)>module.stage) continue;
      seen.add(neighbor);queue.push(neighbor);
    }
    if(queue.length!==eligible.length){
      const b=eligible.find(b=>!seen.has(b));
      throw Error('Contato ausente na etapa '+module.id+' em '+key(b.x,b.y,b.z));
    }
  }
  return {blocks:blocks.length,modules:model.modules.length,materials:Object.keys(expectedMaterials).length};
}

function configurationResolved(params){
  // Canonical metadata records the resulting rise even when the author gave a pitch.
  const {pitch,...resolved}=params;
  return configuration(resolved);
}
