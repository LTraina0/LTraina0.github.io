import {boundsOf, inventory, key} from '../model.mjs';
import {placeNavalKit} from '../v2/kit.mjs';
import {applyNavalPalette} from './naval-palette.mjs';

export const resolutions = {compact: 1, middle: 1.5, large: 2};
const labels = {
  keel: ['Quilha e sobrequilha', 0], ribs: ['Cavernames e varengas', 1],
  shell: ['Fiadas do costado', 2], wale: ['Cinta longitudinal', 2],
  ceiling: ['Forro interior preservado', 2],
  beams: ['Vaus e curvas de ligação', 3], deck: ['Tabuado seccionado', 4],
  foot: ['Madeira deitada', 0], bearers: ['Longarinas arrancadas', 1],
  cross: ['Vaus partidos', 2], planks: ['Tábuas do convés', 3],
  rim: ['Braçola e amurada', 4], fittings: ['Cabeço recuperado', 5]
};
const axis = pillar_axis => ({pillar_axis});
const stair = (weirdo_direction, upside_down_bit=false) => ({weirdo_direction, upside_down_bit, 'minecraft:corner':'none'});
const half = position => ({'minecraft:vertical_half':position});

function sample(specimen, resolution) {
  const factor = resolutions[resolution];
  if (!factor) throw Error('Resolução naval inválida');
  const cells = new Map();
  // At shared joints the already placed structural member owns the cell.
  function join(module,x,y,z,id,states={},role='frame',extra={}) {
    const pos=key(x,y,z);
    if (!cells.has(pos)) cells.set(pos,{x:x||0,y,z,module,id:'minecraft:'+id,states,role,...extra});
  }
  return {specimen,factor,join,cells};
}

// Station envelope with deadrise, bilge, maximum breadth and inward tumblehome.
// Fractions couple the same section to longitudinal narrowing and sheer.
const offsets = [[0,0.08],[.12,.34],[.29,.66],[.48,.86],[.67,.98],[.80,1],[1,.91]];
export function radius(level,depth,breadth) {
  const t=Math.min(1,Math.max(0,level/depth));
  const i=offsets.findIndex(([height])=>height>=t);
  if(i===0) return Math.max(1,Math.round(breadth*offsets[0][1]));
  const [lo,r0]=offsets[i-1], [hi,r1]=offsets[i];
  return Math.max(1,Math.round(breadth*(r0+(r1-r0)*(t-lo)/(hi-lo))));
}

function hull({factor:s, specimen, join}) {
  const torn=specimen==='breach';
  const length=Math.round((torn?22:16)*s);
  const frames=[.05,.31,.57,.83].map(t=>Math.round(t*(length-1)));
  const innerThickness=s===2?2:1;
  const liningEnds=new Map();
  for(let z=0;z<length;z++) {
    const t=z/(length-1), breadth=12*s*(.74+.26*Math.sin(Math.PI*(.12+.65*t)));
    const depth=Math.round(s*(8.5+1.65*(1-t)**2));
    const rib=frames.some(station=>z>=station&&z<station+innerThickness);
    const beamZ=frames.includes(z);
    const center=1+(s===2?1:0);
    for(let x=-center;x<=center;x++) join('keel',x,0,z,'dark_oak_log',axis('z'),'keel');
    join('keel',0,1,z,'dark_oak_log',axis('z'),'keel');
    for(const side of [-1,1]) {
      for(let y=1;y<=depth;y++) {
        const r=radius(y,depth,breadth), prev=radius(y-1,depth,breadth);
        const low=Math.min(prev,r), high=Math.max(prev,r);
        const lane=Math.floor(y/(1.35*s));
        const splinter=[.00,.13,.04,.18,.07,.20,.02,.12][lane%8];
        // A progressive shear retreats furthest at the starboard sheer strake.
        const skinEnd=torn?(side>0?.84-.56*y/depth:.99-.23*y/depth)-splinter:1;
        const ribEnd=torn?(side>0?.99-.17*y/depth:1):1;
        if(rib && t<=ribEnd) {
          const from=y===1?0:Math.max(0,low-1-innerThickness);
          for(let a=from;a<high;a++) join('ribs',side*a,y,z,'stripped_spruce_log',axis(high-low>=2?'x':'y'),'frame',{component:'cavername-'+frames.find(n=>z>=n&&z<n+innerThickness)});
        }
        // Two salvaged ceiling strakes sit inboard of the frame, bridging the
        // bays. The larger section accommodates a second run below the first.
        const lining=y===Math.round(depth*.52)?'upper':s>=1.5&&y===Math.round(depth*.34)?'lower':null;
        if(side<0 && lining && (!torn || t<.55)) {
          const inside=Math.max(1,low-2-innerThickness);
          join('ceiling',-inside,y,z,'spruce_planks',{},'lining');
          const last=liningEnds.get(lining);
          if(last) {
            for(let a=Math.min(last.inside,inside);a<=Math.max(last.inside,inside);a++)
              join('ceiling',-a,last.y,z,'spruce_planks',{},'lining');
            for(let h=Math.min(last.y,y);h<=Math.max(last.y,y);h++)
              join('ceiling',-inside,h,z,'spruce_planks',{},'lining');
          }
          liningEnds.set(lining,{inside,y});
        }
        if(t>skinEnd) continue;
        for(let a=low;a<=high;a++) {
          const isWale=y===Math.round(.7*depth);
          const chamfer=!isWale && a===high && r>prev && y>1;
          const material=isWale?'dark_oak_log':chamfer?'spruce_stairs':'spruce_planks';
          const state=isWale?axis('z'):chamfer?stair(side>0?1:0,true):{};
          join(isWale?'wale':'shell',side*a,y,z,material,state,isWale?'wale':'hull',{fracture:torn&&skinEnd-t<.10});
        }
        if(y===Math.round(.7*depth)) join('wale',side*(high+1),y,z,'dark_oak_log',axis('z'),'wale');
        if(y===depth) join('shell',side*r,y+1,z,'spruce_slab',half('bottom'),'hull');
      }
      if(!beamZ) continue;
      const level=depth-1, seat=radius(level,depth,breadth)-1;
      const span=torn?Math.round(seat*Math.max(.22,1-1.3*t)+(side<0?2:0)):seat;
      if(torn&&t>.82&&side>0) continue;
      for(let i=0;i<=span;i++) join('beams',side*(seat-i),level,z,'spruce_log',axis('x'),'beam');
      for(let j=0;j<Math.round(2*s);j++) {
        join('beams',side*(seat-j),level-1,z,'spruce_stairs',stair(side>0?0:1,true),'frame');
      }
    }
    if(torn) {
      const level=depth, r=radius(level-1,depth,breadth)-1;
      // Shelf timber fastened under the surviving port-side deck, across the frames.
      if(t<=.78) {
        join('beams',-r,level-1,z,'dark_oak_log',axis('z'),'beam');
        join('beams',-r+1,level-1,z,'dark_oak_log',axis('z'),'beam');
      }
      for(let a=0;a<r*.66;a++) {
        const tail=.63-.36*a/r+[.02,.15,-.06,.10][Math.floor(a/s)%4];
        if(t>tail) continue;
        const lip=t>tail-.055;
        join('deck',-r+a,level,z,lip?'spruce_slab':'spruce_planks',lip?half('bottom'):{},'deck',{fracture:lip});
      }
    }
  }
}

function fallenDeck({factor:s,join}) {
  const L=Math.round(17*s), width=Math.round(10*s);
  const top=x=>2+Math.floor((x+1)*.48);
  const stations=[.17,.49,.79].map(t=>Math.round(L*t));
  const hatchX=Math.max(2,Math.round(.35*width)), hatchW=Math.max(2,Math.round(.29*width));
  const hatchLo=stations[0]+1, hatchHi=stations[1]-1;
  for(let z=0;z<=L;z++) {
    // The low edge lands on a fallen spar. The surviving stringer
    // crosses all three beams while the high edge hangs free.
    join('foot',0,0,z,'dark_oak_log',axis('z'),'mast');
    join('bearers',0,1,z,'stripped_spruce_log',axis('z'),'frame');
    // Two pieces of lower side framing stayed with the torn deck beams.
    // They curve back under the high edge as they approach the old bilge.
    // The port face retains three short strakes; daylight breaks through at the tips.
    if(z>=stations[0] && z<=stations[1]+1) {
      const isFrame=z===stations[0]||z===stations[1];
      const deep=top(width)-1;
      for(let drop=0;drop<deep;drop++){
        const inset=Math.floor((drop/deep)**1.7 * width*.44);
        const lastInset=Math.floor((Math.max(0,drop-1)/deep)**1.7 * width*.44);
        const level=deep-drop;
        if(isFrame)for(let a=lastInset;a<=inset;a++){
          join('cross',width-a,level,z,'stripped_spruce_log',axis(inset>lastInset?'x':'y'),'frame');
        }
        if(drop>0 && drop<deep*.8 && z<=stations[0]+(stations[1]-stations[0])*(.88-.50*drop/deep) && drop%3!==2)
          join('rim',width-inset+1,level,z,'spruce_planks',{},'hull',{fracture:true});
      }
    }
    for(let x=0;x<=width;x++) {
      const h=top(x), rising=x>0&&h>top(x-1);
      const beam=stations.indexOf(z);
      if(beam!==-1 && x<=width-(beam===2?Math.ceil(s):0)) {
        join('cross',x,h-1,z,'stripped_spruce_log',axis('x'),'beam');
        if(rising)join('cross',x,h-2,z,'spruce_log',axis('x'),'beam');
      }
      const lead=Math.round((.05+.15*x/width)*L)+[0,1,0,2][Math.floor(x/s)%4];
      const split=Math.max(0,1-Math.abs(x/width-.70)/.26);
      const tail=L-Math.floor((.10+.24*(x/width)**1.5+.25*split)*L)+[0,2,-1,1][Math.floor(x/s)%4];
      if(z<lead||z>tail) continue;
      const opening=x>=hatchX&&x<hatchX+hatchW&&z>=hatchLo&&z<=hatchHi;
      if(opening)continue;
      const splinter=z===tail||z===lead;
      join('planks',x,h,z,rising?'spruce_stairs':splinter?'spruce_slab':'spruce_planks',rising?stair(0):splinter?half('bottom'):{},'deck',{fracture:splinter,repair:x===1&&z>=stations[0]&&z<=stations[1]});
      const coaming=(x===hatchX-1||x===hatchX+hatchW)&&z>=hatchLo-1&&z<=hatchHi+1;
      if(coaming)join('rim',x,h+1,z,'dark_oak_log',axis('z'),'frame');
      if(z===hatchLo-1 && x>=hatchX && x<hatchX+hatchW)join('rim',x,h+1,z,'spruce_slab',half('bottom'),'frame');
      if(x===width && z>=stations[0]+1&&z<=stations[1]) {
        join('rim',x,h+1,z,'dark_oak_log',axis('z'),'wale');
        const upright=z===stations[1]||z===stations[0]+1;
        if(upright) {
          const height=z===stations[1]?Math.round(2*s):Math.round(s);
          for(let lift=2;lift<=1+height;lift++)join('rim',x,h+lift,z,'stripped_spruce_log',axis('y'),'frame');
        }
      }
    }
  }
  const mastX=Math.round(width*.70), mastZ=stations[1];
  for(const b of placeNavalKit('cleat',{origin:[mastX,top(mastX)+1,mastZ],turns:1}).blocks) {
    join('fittings',b.x,b.y,b.z,b.id.slice(10),b.states,'fitting',{component:'cabeço-de-amarração'});
  }
}

export function generateSectionStudy({specimen='breach',resolution='middle'}={}) {
  const study=sample(specimen,resolution);
  if(specimen==='deck') fallenDeck(study);
  else if(['breach','hull'].includes(specimen)) hull(study);
  else throw Error('Corpo de prova naval inválido');
  const blocks=[...study.cells.values()].sort((a,b)=>labels[a.module][1]-labels[b.module][1]||a.y-b.y||a.z-b.z||a.x-b.x);
  const modules=[...new Set(blocks.map(b=>b.module))].map(id=>({id,label:labels[id][0],stage:labels[id][1]}));
  const model={schema:1,project:'estudos-navais',version:'0.3.1',params:{specimen,resolution,factor:study.factor},blocks,modules,
    components:[],bounds:boundsOf(blocks),materials:inventory(blocks),validation:{game:'pending',geometry:'canonical-cell-solid-contact',states:'bedrock-samples-v1.26.60.5'}};
  return applyNavalPalette(model,{originX:0,wetLine:Math.round(3*study.factor),exposeFracture:true});
}
