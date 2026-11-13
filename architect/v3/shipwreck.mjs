import {hullSection,fractureEnd} from '../v2/naval-geometry.mjs';
import {placeNavalKit,transformKitBlock} from '../v2/kit.mjs';
import {applyNavalPalette} from './naval-palette.mjs';
import {boundsOf,inventory,key} from '../model.mjs';

const M='minecraft:',stair=(d,inverted=false)=>({weirdo_direction:d,upside_down_bit:inverted,'minecraft:corner':'none'});
const slab=half=>({'minecraft:vertical_half':half}),log=axis=>({pillar_axis:axis});
const emptyFence=()=>Object.fromEntries(['north','east','south','west'].map(d=>['minecraft:connection_'+d,false]));
const layouts={
 haven:{label:'Abrigo da popa',side:[19,0,8,0],deck:[-19,0,15,0],bow:[5,0,35,0]},
 rift:{label:'Fenda transversal',side:[-4,0,13,0],deck:[21,0,12,1],bow:[-4,0,40,0]},
 drift:{label:'Deriva lateral',side:[-27,0,3,1],deck:[19,0,19,1],bow:[-12,0,37,1]}
};
export function generateShipwreck({composition='haven',finish='weathered'}={}){
 const layout=layouts[composition];if(!layout)throw Error('Implantação naval desconhecida');
 const cells=new Map(),components=[],routes=[],upperRoute=[],salvageRoute=[],cx=-4,stages={context:0,keel:1,frames:2,hull:3,'side-fragment':3,'bow-fragment':3,deck:4,'deck-fragment':4,walkways:4,cabin:5,quarterdeck:6,rails:7,masts:8,rigging:9,accessories:10};
 function put(module,x,y,z,id,states={},role='structure',extra={}){
  const b={x,y,z,id:id.startsWith(M)?id:M+id,states,module,role,...extra},k=key(x,y,z);
  if(cells.has(k))throw Error('Interseção naval '+k+' '+cells.get(k).module+'/'+module);
  cells.set(k,b);return b;
 }
 const free=(...p)=>!cells.has(key(...p));
 const reuse=(module,x,y,z,id,states={},role='structure',extra={})=>{if(free(x,y,z))return put(module,x,y,z,id,states,role,extra);return cells.get(key(x,y,z));};
 const wood=(module,x,y,z,role='hull',extra={})=>put(module,x,y,z,'spruce_planks',{},role,extra);
 const stations=[[-34,6],[-30,9],[-24,11],[-16,12],[-7,11]],ribs=new Set([-33,-28,-23,-18,-13]);
 for(let z=-34;z<=-5;z++){
  for(let x=-1;x<=1;x++)if(z<=fractureEnd(x,1))put('keel',cx+x,1,z,'dark_oak_log',log('z'),'keel');
  for(let y=2;y<=8;y++){
   const w=hullSection(stations,z,y),prev=y===2?1:hullSection(stations,z,y-1);
   for(const sign of [-1,1])for(let a=Math.max(1,prev);a<=w;a++){
    const x=sign*a;if(z>fractureEnd(x,y))continue;
    const frame=ribs.has(z),portGap=sign===1&&z>=-17&&y>=5&&!frame;
    if(portGap)continue;
    const module=frame?'frames':'hull',role=frame?'frame':'hull',fracture=z>=fractureEnd(x,y)-1;
    if(frame)put(module,cx+x,y,z,'stripped_spruce_log',log(a===w?'y':'x'),role,{fracture,component:'rib-'+z});
    else if(a===w&&y===5)put(module,cx+x,y,z,'dark_oak_log',log('z'),'wale',{fracture});
    else if(a===w&&y>3)put(module,cx+x,y,z,'spruce_stairs',stair(sign===1?1:0,true),role,{fracture});
    else wood(module,cx+x,y,z,role,{fracture});
   }
   if(y===2)reuse(ribs.has(z)?'frames':'hull',cx,2,z,ribs.has(z)?'spruce_log':'spruce_planks',ribs.has(z)?log('x'):{},ribs.has(z)?'frame':'hull');
  }
  const w=hullSection(stations,z,8);
  for(let x=-w;x<=w;x++)if(z<=fractureEnd(x,9)&&!(ribs.has(z)&&z>-20&&x>w-1-((z+20)%3))&&!(!ribs.has(z)&&z>-20&&x>=2+(Math.floor((z+20)/2)%3))){
   const beam=ribs.has(z),edge=Math.abs(x)===w;
   put('deck',cx+x,9,z,beam?'spruce_log':edge?'spruce_slab':'spruce_planks',beam?log('x'):edge?slab('top'):{},'deck',{fracture:z>=fractureEnd(x,9)-1,component:beam?'deck-beam':'planking'});
  }
 }
 // Exposed sternpost and rudder keep the surviving mass legibly naval from behind.
 for(let z=-37;z<=-35;z++)for(let y=1;y<=6;y++)put('keel',cx,y,z,'dark_oak_log',log('y'),'keel',{component:'rudder'});
 for(let z=-36;z<=-34;z++)reuse('keel',cx,4,z,'dark_oak_log',log('z'),'frame',{component:'rudder-hinge'});
 // Transom closes the surviving stern, independently of the forward fracture.
 for(let z=-34;z<=-33;z++)for(let y=3;y<=10;y++){
  const w=hullSection(stations,z,Math.min(y,8));
  for(let x=-w+1;x<w;x++)if(free(cx+x,y,z))wood(y>=9?'quarterdeck':'hull',cx+x,y,z,'hull',{component:'stern-transom'});
 }
 // Stern galleries and timber knees remain actual half blocks around the transom.
 for(const sign of [-1,1])for(let z=-32;z<=-25;z++){
  const x=cx+sign*8;
  if(free(x,10,z))put('quarterdeck',x,10,z,'oak_slab',slab('bottom'),'deck');
  if(free(x,9,z))put('quarterdeck',x,9,z,'spruce_stairs',stair(sign===1?1:0,true),'frame');
 }
 // Cabin enclosed by full timbers and shutter panels, with a traversable open door.
 for(let y=10;y<=14;y++)for(let z=-31;z<=-21;z++)for(let x=-6;x<=6;x++){
  const border=Math.abs(x)===6||z===-31||z===-21;if(!border)continue;
  if(z===-21&&x===0&&(y===10||y===11)){
   put('cabin',cx+x,y,z,'spruce_door',{door_hinge_bit:false,'minecraft:cardinal_direction':'south',open_bit:true,upper_block_bit:y===11},'door');continue;
  }
  const front=z===-21&&[3,4,-3,-4].includes(x),back=z===-31&&[-3,-2,2,3].includes(x),side=Math.abs(x)===6&&[-28,-27,-24].includes(z);
  if((front||back||side)&&(y===11||y===12)){
   const direction=front?3:back?2:x<0?0:1;
   put('cabin',cx+x,y,z,'trapdoor',{direction,open_bit:true,upside_down_bit:false},'window',{component:'shutter-window'});
  }else if(Math.abs(x)===6&&(z===-31||z===-21)||y===14)put('cabin',cx+x,y,z,'spruce_log',log(y===14?'z':'y'),'frame');
  else wood('cabin',cx+x,y,z,'cabin');
 }
 const roofKeep=(x,z)=>!(x===7&&z<-28)&&!(z===-32&&x>=3);
 for(let z=-32;z<=-20;z++)for(let x=-7;x<=7;x++)if(roofKeep(x,z))put('quarterdeck',cx+x,15,z,'spruce_planks',{},'deck',{component:'quarterdeck-roof',fracture:x===7||z===-32,repair:x>=5&&z>=-25&&z<=-23});
 for(const z of [-32,-20])for(let x=-7;x<=7;x++)if(roofKeep(x,z)&&(z===-32||Math.abs(x)>4))put('rails',cx+x,16,z,'spruce_fence',emptyFence(),'rail');
 for(const x of [-7,7])for(let z=-31;z<-20;z++)if(roofKeep(x,z)&&(x<0?![-29,-28].includes(z):![-24,-25].includes(z)))put('rails',cx+x,16,z,'spruce_fence',emptyFence(),'rail');
 // Upper-deck side stair: its central stringer supplies positive face contacts.
 for(let i=0;i<6;i++)for(let x=8;x<=9;x++){
  const z=-19-i,y=10+i;
  for(let j=10;j<y;j++)reuse('walkways',cx+x,j,z,'spruce_planks',{},'repair',{repair:true});
  reuse('walkways',cx+x,y,z,'spruce_stairs',stair(3),'repair',{repair:true});
  if(x===8)upperRoute.push({x:cx+x+.5,y:y+.5,z:z+.8},{x:cx+x+.5,y:y+1,z:z+.2});
 }
 for(let x=8;x>=5;x--)upperRoute.push({x:cx+x+.5,y:16,z:-23.8});
 // Primary recovered access. Nine half-step stairs rise from ice to the main deck.
 for(let i=0;i<9;i++){
  const z=2-i,y=1+i;
  for(let j=1;j<y;j++)reuse('walkways',cx,j,z,'oak_log',log('y'),'repair',{repair:true});
  for(let x=-1;x<=0;x++)reuse('walkways',cx+x,y,z,'oak_stairs',stair(3),i%3===0?'repair':'deck',{repair:i%3===0});
  routes.push({x:cx+.5,y:y+.5,z:z+.75},{x:cx+.5,y:y+1,z:z+.25});
 }
 for(let z=-8;z<=-7;z++)for(let x=-1;x<=1;x++)reuse('walkways',cx+x,9,z,'oak_planks',{},'repair',{repair:true});
 for(let z=-7;z>=-29;z--)routes.push({x:cx+.5,y:10,z:z+.5});
 // Surviving bulwarks deliberately stop before torn edges and gangways.
 for(const sign of [-1,1])for(let z=-30;z<=-12;z++){
  const x=cx+sign*hullSection(stations,z,8);
  if((sign===1&&z>-25)||(z===-18||z===-17))continue;
  if(free(x,10,z))put('rails',x,10,z,'spruce_fence',emptyFence(),'rail');
 }
 // Broken lower mast and a braced, much shorter remnant: no intact sailing rig.
 for(let y=10;y<=22;y++)put('masts',cx-3,y,-16,'spruce_log',log('y'),'mast',{fracture:y>=21});
 for(let x=-9;x<=0;x++)reuse('masts',cx+x,17,-16,'spruce_log',log('x'),'mast',{component:'broken-yard',fracture:x===-9});
 for(let y=10;y<=12;y++)put('masts',cx-9,y,-10,'dark_oak_log',log('y'),'mast',{fracture:y===12});
 // Two orthogonal chain runs connect solid anchors, without invented diagonal states.
 for(let x=-7;x<=-4;x++)reuse('rigging',cx+x,18,-16,'iron_chain',log('x'),'rigging');
 reuse('masts',cx-8,18,-16,'spruce_log',log('y'),'mast');
 for(let y=14;y<=16;y++)reuse('rigging',cx-9,y,-16,'iron_chain',log('y'),'rigging',{component:'severed-stay'});
 // Tattered canvas hangs from a remaining yard, with a stepped tear rather than noise.
 for(let x=-8;x<=-5;x++)for(let y=14+(x+8)%2;y<=16;y++)if(free(cx+x,y,-16))put('rigging',cx+x,y,-16,x===-8?'light_gray_wool':'white_wool',{},'canvas',{fracture:y===14+(x+8)%2});
 // Small torn black pennant, built from wool cells rather than an invented banner entity.
 for(let y=19;y<=21;y++)for(let x=-2;x<=y-20;x++)put('rigging',cx+x,y,-16,'black_wool',{},'canvas',{component:'torn-black-pennant',fracture:x===y-20});
 function fragment(name,origin,build){
  const local=[];build((x,y,z,id,states={},role='hull',extra={})=>local.push({x,y,z,id:M+id,states,module:name,role,fragment:name,...extra}));
  const[ox,oy,oz,turns]=origin;
  for(const b of local){const t=transformKitBlock(b,{turns});put(name,t.x+ox,t.y+oy,t.z+oz,t.id,t.states,t.role,{fragment:name,fracture:t.fracture??false,component:t.component??name});}
  components.push({libraryId:name,origin:[ox,oy,oz],turns,blocks:local.length,intent:'separated structural fragment'});
 }
 fragment('side-fragment',layout.side,P=>{
  const stations=[[-8,5],[0,8],[8,6]];
  for(let z=-8;z<=8;z++){
   P(0,1,z,'dark_oak_log',log('z'),'keel');
   for(let y=2;y<=8;y++){
    if(z===7&&y>6)continue;
    const w=hullSection(stations,z,y),prev=y===2?0:hullSection(stations,z,y-1),frame=[-7,-2,3,7].includes(z);
    for(let x=frame&&y===8?0:Math.max(0,prev);x<=w;x++)if(frame||y<=4||z<-3||z>4)P(-x,y,z,frame?'stripped_spruce_log':'spruce_planks',frame?log(x===w?'y':'x'):{},frame?'frame':'hull',{fracture:z===-8||z===8});
   }
   for(let x=-5;x<=-1;x++)if(z<=4-((-x)%3))P(x,9,z,'spruce_slab',slab('bottom'),'deck',{fracture:z===4-((-x)%3)});
  }
 });
 fragment('deck-fragment',layout.deck,P=>{
  for(let z=-5;z<=6;z++)for(let x=-5;x<=5;x++)if(z<=6-Math.floor((x+5)/3)&&!(z>3&&x>1)){
   P(x,1,z,'dark_oak_log',log('z'),'frame');
   P(x,2,z,(z===-4||z===0||z===4)?'spruce_log':'spruce_planks',(z===-4||z===0||z===4)?log('x'):{},'deck',{fracture:z>=4});
  }
  for(let y=3;y<=7;y++)P(-3,y,-2,'spruce_log',log('y'),'mast',{fracture:y===7});
  for(let x=-2;x<=5;x++)P(x,3,-2,'spruce_log',log('x'),'mast',{fracture:x===5});
 });
 fragment('bow-fragment',layout.bow,P=>{
  const stations=[[-5,5],[0,4],[7,1]];
  for(let z=-5;z<=7;z++){
   P(0,1,z,'dark_oak_log',log('z'),'keel');
   P(0,2,z,'dark_oak_log',log('z'),'frame');
   for(let y=2;y<=6;y++)for(const sign of [-1,1]){
    const w=hullSection(stations,z,y,6),prev=y===2?0:hullSection(stations,z,y-1,6);
    for(let x=Math.max(1,prev);x<=w;x++)if(sign===1||z%4===0||y<4)P(sign*x,y,z,z%4===0?'spruce_log':'spruce_planks',z%4===0?log('y'):{},z%4===0?'frame':'hull',{fracture:sign===-1});
   }
   if(z>=0){P(0,6,z,'spruce_log',log('z'),'frame');P(0,7,z,'spruce_log',log('z'),'mast',{fracture:z===7});}
  }
 });
 // A recovered dogleg links the ice landing to the low fragment of deck.
 const[dx,,dz]=layout.deck,entry=[dx,dz-6],bridge=[];
 const line=(a,b)=>{const n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let i=0;i<=n;i++)bridge.push([a[0]+Math.sign(b[0]-a[0])*i,a[1]+Math.sign(b[1]-a[1])*i]);};
 line([cx,4],[entry[0],4]);line([entry[0],4],[entry[0],entry[1]-1]);
 for(const[x,z]of bridge)for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)reuse('walkways',x+a,1,z+b,'oak_planks',{},'repair',{repair:true,component:'recovered-link'});
 for(let a=-1;a<=1;a++){
  const x=entry[0]+a,z=entry[1];
  reuse('walkways',x,2,z,'oak_stairs',stair(2),'repair',{repair:true});
 }
 for(const[x,z]of bridge)salvageRoute.push({x:x+.5,y:2,z:z+.5});
 salvageRoute.push({x:entry[0]+.5,y:2.5,z:entry[1]+.2},{x:entry[0]+.5,y:3,z:entry[1]+.8},{x:entry[0]+.5,y:3,z:entry[1]+1.5});
 // Few small fragments retain axes and belong to explicit debris groups.
 for(const [x,z,length]of [[-7,8,5],[8,22,6],[24,29,4]]){
  for(let i=0;i<length;i++)reuse('deck-fragment',x,1,z+i,'spruce_log',log('z'),'frame',{fragment:'loose-timber',fracture:i===length-1});
  reuse('accessories',x+1,1,z+2,'barrel',{facing_direction:2,open_bit:false},'storage');
 }
 for(const x of [-4,4])for(const z of [-28,-26,-24])put('accessories',cx+x,10,z,'barrel',{facing_direction:x<0?5:4,open_bit:false},'storage',{access:'aisle-facing'});
 for(const [x,z]of [[-4,-23],[4,-29],[-7,-19],[7,-26]]){
  const y=z===-19?10:z===-26?16:10;
  if(free(cx+x,y,z))put('accessories',cx+x,y,z,'lantern',{hanging:false},'light');
 }
 for(const [component,origin,turns]of [['windlass',[cx-5,10,-20],0],['cleat',[cx-6,10,-13],0]]){
  const piece=placeNavalKit(component,{origin,turns});for(const b of piece.blocks)if(free(b.x,b.y,b.z))put('accessories',b.x,b.y,b.z,b.id,b.states,b.role,{component});components.push({libraryId:component,origin,turns,behavior:'visual assembly of real blocks; no mechanism simulation'});
 }
 // Small independent ice plates support each remnant; not a generated landscape.
 const projection=new Set();for(const b of cells.values())for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)if(dx*dx+dz*dz<=5)projection.add(key(b.x+dx,0,b.z+dz));
 for(const k of projection){const[x,,z]=k.split(',').map(Number);put('context',x,0,z,'packed_ice',{},'environment');}
 for(const k of projection){const[x,,z]=k.split(',').map(Number),north=!projection.has(key(x,0,z-1)),west=!projection.has(key(x-1,0,z));
  if((north||west)&&free(x,1,z)&&((Math.floor((x+2*z)/7)%3)+3)%3===1)put('context',x,1,z,'snow_layer',{height:north?0:1,covered_bit:false},'environment');
 }
 // Native connection states derive from the final neighboring occupied cells.
 const connections={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};
 for(const b of cells.values())if(b.id===M+'spruce_fence')for(const[d,[dx,dz]]of Object.entries(connections)){
  const n=cells.get(key(b.x+dx,b.y,b.z+dz));b.states['minecraft:connection_'+d]=Boolean(n&&!['iron_chain','lantern','spruce_door'].some(id=>n.id===M+id));
 }
 const labels={context:'Gelo e neve · contexto mínimo',keel:'Quilha sobrevivente',frames:'Cavernames expostos',hull:'Costado e espelho da popa','side-fragment':'Costado arrancado','bow-fragment':'Proa separada',deck:'Convés principal','deck-fragment':'Convés partido e peças soltas',walkways:'Acessos recuperados',cabin:'Cabine da popa',quarterdeck:'Castelo e convés superior',rails:'Amuradas e guarda-corpos',masts:'Mastreação partida',rigging:'Amarrações e velame',accessories:'Armazenamento e acessórios'};
 const modules=Object.entries(stages).filter(([id])=>[...cells.values()].some(b=>b.module===id)).map(([id,stage])=>({id,label:labels[id],stage}));
 const blocks=[...cells.values()].sort((a,b)=>stages[a.module]-stages[b.module]||a.y-b.y||a.z-b.z||a.x-b.x);
 const model={schema:1,project:'o-ultimo-encalhe',version:'0.3.0',bedrockSamples:'v1.26.60.5',params:{composition,finish},modules,components,blocks,bounds:boundsOf(blocks),materials:inventory(blocks),
  naval:{title:'O Último Encalhe',composition:layout.label,origin:[cx,0,0],axis:'+Z rumo à proa perdida',reference:'fragmented-wreck-diorama',contextModules:['context'],routes:{main:routes,upper:upperRoute,salvage:salvageRoute},cabin:{floor:9,ceiling:15,interior:{min:[cx-5,10,-30],max:[cx+6,15,-21]},reservedBed:{min:[cx-2,10,-30],max:[cx,12,-27]},storageCount:6},fracture:'oblique component termination; missing starboard strakes; staggered deck'},
  validation:{game:'pending',geometry:'canonical cell solids and declared contact proxies',circulation:'sampled 0.6 by 1.8 body; 0.6 step allowance; not a player physics simulation',states:'bedrock-samples-v1.26.60.5',limitations:['chain and lantern handle contacts use bounding proxies; rendered as cropped alpha planes','neighbor updates, door hinge and barrel behavior need Bedrock test','preview lantern lights do not implement block occlusion or Bedrock light propagation']}};
 return applyNavalPalette(model,{finish});
}
