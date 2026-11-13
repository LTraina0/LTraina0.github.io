import {generateStern} from './stern.mjs';
import {sternCatalog} from './stern-catalog.mjs';
import {fjordStern} from './stern-fjord.mjs';
import {boundsOf, inventory, key} from '../model.mjs';

const modules=[
  ['env-rock','Escarpas e margens',0],['env-channel','Canal congelado',1],
  ['env-floes','Placas e pressão do gelo',2],['env-glacier','Gruta e formações glaciais',3],
  ['env-ruins','Cais em ruínas',4],['env-access','Acesso ao abrigo',5],
  ['env-snow','Neve depositada',6],['env-light','Lanternas do percurso',7]
].map(([id,label,stage])=>({id,label,stage}));
const slab={'minecraft:vertical_half':'bottom'};
const stair=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const log=pillar_axis=>({pillar_axis});
const leaf=direction=>({direction,open_bit:true,upside_down_bit:false});
const sq=x=>x*x;
const ellipse=(x,z,cx,cz,rx,rz)=>sq((x-cx)/rx)+sq((z-cz)/rz);
const ripple=(x,z)=>Math.sin(x*.39+z*.11)+Math.sin(z*.37-x*.17)*.6;
let cached;

export function generatePolarScene(){
  if(cached)return cached;
  const ship=generateStern({phase:'displaced',design:fjordStern});
  const navalCells=new Map(ship.blocks.map(b=>[key(b.x,b.y,b.z),b]));
  const cells=new Map(),tops=new Map(),routes=[];
  const at=(x,y,z)=>navalCells.get(key(x,y,z))??cells.get(key(x,y,z));
  function put(x,y,z,module,block,states={},component=module){
    const address=key(x,y,z);
    if(navalCells.has(address))return false;
    cells.set(address,{x,y,z,id:'minecraft:'+block,states,module,environment:true,component});
    return true;
  }
  const clear=(x,y,z)=>cells.delete(key(x,y,z));
  function column(x,z,top,module,material){
    for(let y=-7;y<=top;y++)put(x,y,z,module,typeof material==='function'?material(y):material);
    tops.set(x+','+z,top);
  }
  // Curving rock lobes make an open horseshoe. Broad benches alternate with
  // broken buttresses. The ship occupies the quiet middle of the bend.
  for(let z=-33;z<=49;z++)for(let x=-43;x<=53;x++){
    const edge=ellipse(x,z,3,9,49,43);
    if(edge>1+.045*ripple(x,z)||x-z>75||x+z>88)continue;
    const west=ellipse(x,z,-37,12,16,43);
    const back=ellipse(x,z,-9,44,43,15);
    const east=ellipse(x,z,50,27,13,26);
    const shoulder=Math.max(
      west<1?29*Math.pow(1-west,.32):0,
      back<1?25*Math.pow(1-back,.38):0,
      east<1?12*Math.pow(1-east,.65):0);
    let height=shoulder>0?Math.floor((shoulder+Math.floor(ripple(x,z)*1.5))/2)*2:-5;
    const shelf=ellipse(x,z,-25,-10,14,25);
    if(shelf<1)height=Math.max(height,Math.floor(4*(1-shelf))+1);
    const entry=ellipse(x,z,40,-22,16,18);
    if(entry<1)height=Math.max(height,Math.floor(2*(1-entry)));
    // Reserve the preserved hull and detached panel as shallow carved berths.
    if(x>=-19&&x<=19&&z>=-3&&z<=34)height=Math.min(height,-2);
    if(x>=23&&x<=39&&z>=-17&&z<=5)height=Math.min(height,-2);
    if(height>-4){
      column(x,z,height,'env-rock',y=>{
        if(y<height-5)return 'stone';
        const seam=Math.floor((y+z*.16-x*.12)/3);
        return seam%5===0?'cobbled_deepslate':seam%3===0?'andesite':'stone';
      });
      if(height>=0){
        const wind=Math.sin(x*.19-z*.13);
        if(wind>-.15&&Math.sin(x*.31+z*.27)>-.4)put(x,height+1,z,'env-snow','snow_layer',{height:height>16?5:height>7?2:0,covered_bit:false},'corniche-de-neve');
      }
    }else{
      column(x,z,-5,'env-rock','cobbled_deepslate');
      put(x,-4,z,'env-channel','cobbled_deepslate',{},'fundo-do-canal');
      put(x,-3,z,'env-channel','ice',{},'canal-escuro-congelado');
    }
  }
  // Frost follows the exposed inner faces, rather than outlining every
  // geological contour. Wide ice curtains alternate with sheltered dark rock.
  for(const b of [...cells.values()]){
    if(b.module!=='env-rock'||b.y<1)continue;
    const h=tops.get(b.x+','+b.z);
    if(h<9)continue;
    const exposed=[[1,0],[-1,0],[0,-1],[0,1]].some(([dx,dz])=>(tops.get((b.x+dx)+','+(b.z+dz))??-7)<b.y);
    if(!exposed)continue;
    const glacial=(b.x<-22&&b.z>2)||(b.z>33&&b.x<17);
    const shelter=Math.sin(b.x*.23+b.z*.12)>.68&&b.y<13;
    if(glacial&&!shelter){
      const groove=(Math.floor((b.x+b.z*.31)/3)%6===0);
      put(b.x,b.y,b.z,'env-glacier',groove?'blue_ice':'packed_ice',{},'cortina-glacial');
      const inside=b.x<-22?[-1,0]:[0,1];
      const backing=at(b.x+inside[0],b.y,b.z+inside[1]);
      if(backing?.environment)put(backing.x,backing.y,backing.z,'env-glacier','packed_ice',{},'espessura-da-geleira');
    }
  }
  // Overlapping pressure plates follow a staggered broken course between the
  // foreground fragment and the hull. Their outlines are clipped ellipses.
  const plates=[
    [-4,10,22,27,-1],[31,-7,11,15,-1],[5,-20,17,10,-2],
    [28,20,17,16,-1],[-19,-22,13,12,-1],[39,-24,12,10,0],
    [13,-32,12,7,-2],[-19,25,12,9,-1],[9,33,14,7,-2]
  ];
  for(const [cx,cz,rx,rz,y]of plates){
    for(let z=Math.ceil(cz-rz);z<=cz+rz;z++)for(let x=Math.ceil(cx-rx);x<=cx+rx;x++){
      const radius=ellipse(x,z,cx,cz,rx,rz);
      const notch=(Math.abs(x-cx+2*(z-cz))%23===0&&radius>.33);
      if(radius>1+.07*ripple(x,z)||notch||!tops.has(x+','+z))continue;
      if((tops.get(x+','+z)??0)>y)continue;
      for(let by=-2;by<=y;by++)put(x,by,z,'env-floes',radius>.78?'blue_ice':'packed_ice',{},'placa-fraturada');
      tops.set(x+','+z,y);
      const lee=x<cx-2&&z>cz-4;
      if((lee&&radius<.93)||radius<.5&&Math.sin((x+z)*.22)>.5)
        put(x,y+1,z,'env-snow','snow_layer',{height:lee?2:0,covered_bit:false},'neve-na-placa');
    }
  }
  // The port quarter is wedged into a pressure tongue. It rises only to the
  // underside of existing timbers and preserves the hull's complete payload.
  const underHull=new Map();
  for(const b of ship.blocks.filter(b=>b.piece==='body'&&b.x>=-15&&b.x<=-6&&b.z>=15&&b.z<=29)){
    const k=b.x+','+b.z,prior=underHull.get(k);
    if(!prior||b.y<prior.y)underHull.set(k,b);
  }
  for(const b of underHull.values()){
    if(b.y>9)continue;
    for(let y=-2;y<b.y;y++)put(b.x,y,b.z,'env-floes',y===b.y-1?'packed_ice':'blue_ice',{},'berco-de-pressao');
  }
  // A second pressure wedge is visible beneath the starboard bilge. Its
  // ledges rise towards the original underside, leaving the broken side exposed.
  for(let z=11;z<=30;z++)for(let x=3;x<=24;x++){
    const radius=ellipse(x,z,13,22,12,12);
    if(radius>1+.06*ripple(x,z))continue;
    const navalColumn=ship.blocks.filter(b=>b.piece==='body'&&b.x===x&&b.z===z);
    const underside=navalColumn.length?Math.min(...navalColumn.map(b=>b.y)):Infinity;
    const top=Math.min(Math.floor(2+6*(1-radius)),underside-1);
    for(let y=-2;y<=top;y++)put(x,y,z,'env-floes',x%7===0?'blue_ice':'packed_ice',{},'cunha-do-encalhe');
    if(top>1&&!at(x,top+1,z)&&(x+2*z)%5!==0)
      put(x,top+1,z,'env-snow','snow_layer',{height:1,covered_bit:false},'neve-no-encalhe');
  }
  // Glacial columns hug the high inner scarps. Each has a separate shoulder,
  // taper, melt groove and cap; the lower tails open sightlines along the shore.
  for(const [cx,cz,radius,height]of [[-29,28,4,24],[-32,8,4,20],[-28,-4,3,15],[-22,41,4,24],[-7,40,4,27],[12,42,3,19],[40,34,3,15],[45,16,3,12],[-39,20,4,30]]){
    for(let y=-2;y<=height;y++){
      const r=Math.max(1,radius-Math.floor((y+2)/10));
      for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
        if(Math.abs(dx)+Math.abs(dz)>r+1)continue;
        if((dx===r&&dz===0)&&y>5&&y<height-3)continue;
        put(cx+dx,y,cz+dz,'env-glacier',(dx===0||y%7===0)?'blue_ice':'packed_ice',{},'contraforte-glacial');
      }
    }
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)
      put(cx+dx,height+1,cz+dz,'env-snow','snow_layer',{height:2,covered_bit:false},'neve-no-coroamento');
  }
  // A side cavern is cut right through the rock, beyond the ship's port quarter.
  // The entry arch thickens into three irregular ribs before the dark chamber.
  for(let z=10;z<=48;z++)for(let x=-39;x<=-23;x++)for(let y=1;y<=17;y++){
    const width=7-Math.max(0,Math.floor((y-9)*.58));
    const center=-31+Math.floor(Math.sin(z*.14)*1.2);
    if(Math.abs(x-center)<=width && y<16-Math.abs(x-center)*.35)clear(x,y,z);
  }
  // An open cleft reaches the mouth from the old quay. Without this cut the
  // outer ridge would hide both the entrance and the approach from ground level.
  for(let z=-33;z<10;z++)for(let x=-36;x<=-24;x++){
    for(let y=2;y<=34;y++)clear(x,y,z);
    put(x,0,z,'env-glacier','packed_ice',{},'soleira-da-fenda');
  }
  for(let z=10;z<=45;z++)for(let x=-36;x<=-26;x++){
    put(x,0,z,'env-glacier','packed_ice',{},'piso-da-gruta');
    if(Math.abs(x+31)<3)put(x,1,z,'env-glacier','ice',{},'gelo-do-percurso');
  }
  for(const [z,bottom,length]of [[11,10,6],[18,11,5],[29,9,7],[40,10,5]]){
    for(const x of [-36,-25]){
      for(let y=bottom;y<=bottom+length;y++){
        const r=y<bottom+2?0:1;
        for(let dx=-r;dx<=r;dx++)put(x+dx,y,z,'env-glacier',dx===0?'blue_ice':'packed_ice',{},'stalactite');
      }
    }
  }
  // A closed rear chamber ends the discovery route. Faceted ribs, short
  // side spires and the ice fan keep the void readable without an empty sky.
  for(let z=44;z<=45;z++)for(let x=-38;x<=-24;x++)for(let y=0;y<=18;y++){
    const dx=Math.abs(x+31);
    put(x,y,z,'env-glacier',dx>5||y<3?'stone':(x+y)%7===0?'blue_ice':'packed_ice',{},'fundo-da-gruta');
  }
  for(const [x,z,h]of [[-36,25,4],[-26,31,6],[-35,38,5],[-28,41,7]]){
    for(let y=1;y<=h;y++){
      const r=y>h-2?0:1;
      for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)
        if(Math.abs(dx)+Math.abs(dz)<=r)put(x+dx,y,z+dz,'env-glacier',dx===0?'blue_ice':'packed_ice',{},'espigao-da-gruta');
    }
  }
  // Pressure ridges are long tilted stair-and-slab silhouettes at the ice edge,
  // using full-height blue ice ribs separated by snow-filled seams.
  for(const [cx,cz,dx,dz,len]of [[19,-24,1,0,11],[40,6,0,1,12],[-18,-8,0,1,9]]){
    for(let i=0;i<len;i++){
      const x=cx+dx*i,z=cz+dz*i;
      const h=i<3||i>len-4?1:3;
      for(let y=-2;y<=h;y++)put(x,y,z,'env-floes',i%4===0?'blue_ice':'packed_ice',{},'crista-de-pressao');
      if(i%3!==1)put(x,h+1,z,'env-snow','snow_layer',{height:i%2,covered_bit:false},'crosta-de-neve');
    }
  }
  // A compact ruined landing borrows the battered silhouette of Lone Fortress.
  // One buttressed corner and an interrupted arcade give it a readable depth.
  for(let x=-29;x<=-21;x++)for(let z=-13;z<=-5;z++){
    for(let y=-4;y<=2;y++)put(x,y,z,'env-ruins',y===2?'stone_bricks':'cobblestone',{},'base-do-antigo-cais');
    if((x+z)%4!==0)put(x,3,z,'env-snow','snow_layer',{height:0,covered_bit:false},'neve-no-cais');
  }
  for(const [x,height]of [[-29,9],[-25,6],[-21,11]]){
    for(let y=3;y<=height;y++)for(let z=-12;z<=-10;z++){
      put(x,y,z,'env-ruins',y<5?'cobbled_deepslate':'stone_bricks',{},'pilar-do-cais');
      if(y<6)put(x+1,y,z,'env-ruins','stone_brick_stairs',stair(1),'contraforte');
    }
    put(x,height+1,-11,'env-snow','snow_layer',{height:2,covered_bit:false},'topo-da-ruina');
  }
  for(let x=-28;x<=-22;x++)if(x!==-24){
    put(x,7,-11,'env-ruins','stone_brick_stairs',stair(x<-25?0:1,true),'arco-rompido');
  }
  // Human-scale landing, mooring frame and timber stair reach the existing
  // starboard breach. Every tread and landing occupies an environmental cell.
  for(let x=31;x<=38;x++)for(let z=6;z<=12;z++)
    put(x,0,z,'env-access',z===6||z===12?'dark_oak_log':'spruce_planks',z===6||z===12?log('x'):{},'patamar-do-gelo');
  for(const x of [32,37])for(const z of [6,12]){
    for(let y=-3;y<=2;y++)put(x,y,z,'env-access','spruce_log',log('y'),'estaca-do-cais');
    put(x,3,z,'env-snow','snow_layer',{height:1,covered_bit:false},'neve-na-estaca');
  }
  const mainFloor=[];
  for(let x=33;x>=21;x--){
    const y=33-x;
    for(const z of [8,9]){
      // Landing ends use planks; all intervening risers use real wood stairs.
      put(x,y,z,'env-access',x===33||x===21?'spruce_planks':'spruce_stairs',x===33||x===21?{}:stair(1),'escada-do-abrigo');
      if(x%4===1)for(let by=-3;by<y;by++)put(x,by,z,'env-access','dark_oak_log',log('y'),'pé-da-escada');
    }
    mainFloor.push([x,y,8]);
  }
  for(let x=20;x>=8;x--){
    for(const z of [8,9])put(x,12,z,'env-access',x%4===0?'spruce_log':'spruce_planks',x%4===0?log('z'):{},'passarela-da-avaria');
    mainFloor.push([x,12,8]);
  }
  // Solid handrails finish short of the jagged opening so the broken hull
  // and visible beam can still be read on either side of the new footway.
  for(let x=24;x<=33;x++){
    const y=33-x;
    if(x%4===0)put(x,y+1,10,'env-access','spruce_log',log('y'),'baliza-da-escada');
  }
  routes.push({id:'do-cais-ao-conves',floor:mainFloor,clearance:2});
  const caveFloor=[];
  for(let z=-30;z<=37;z++){
    const x=-31;
    for(let dx=-1;dx<=1;dx++)put(x+dx,1,z,'env-access','stone_brick_slab',{'minecraft:vertical_half':'top'},'trilho-da-gruta');
    caveFloor.push([x,1,z]);
  }
  routes.push({id:'entrada-da-gruta',floor:caveFloor,clearance:2});
  // One recovered spar and a few barrels explain the small working landing.
  for(let z=7;z<=10;z++)put(36,1,z,'env-access','barrel',{facing_direction:2,open_bit:false},'carga-recuperada');
  function lamp(x,y,z){
    for(let by=-2;by<y;by++)put(x,by,z,'env-access','spruce_log',log('y'),'poste-da-lanterna');
    put(x,y,z,'env-access','spruce_log',log('x'),'braço-da-lanterna');
    put(x+1,y,z,'env-access','spruce_log',log('x'),'braço-da-lanterna');
    put(x+1,y-1,z,'env-light','lantern',{hanging:true},'luz-do-percurso');
    put(x,y+1,z,'env-snow','snow_layer',{height:1,covered_bit:false},'neve-no-poste');
  }
  lamp(39,5,-24);lamp(37,5,5);lamp(25,12,11);lamp(-27,7,-7);lamp(-35,7,21);lamp(-35,7,36);
  // Tapered boulders and layered snowbanks create a third, smaller rhythm.
  for(const [cx,cz,r,h]of [[-19,-27,4,2],[49,-8,4,4],[-19,31,3,5],[39,-18,3,2],[22,30,3,3],[-35,-18,3,4],[49,4,2,4]]){
    for(let y=-1;y<=h;y++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){
      if(Math.abs(dx)+Math.abs(dz)>r+1-Math.floor(y/3))continue;
      put(cx+dx,y,cz+dz,'env-rock',y%3===0?'andesite':'stone',{},'rocha-desprendida');
    }
    for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)put(cx+dx,h+1,cz+dz,'env-snow','snow_layer',{height:3,covered_bit:false},'neve-no-bloco');
  }
  // Clear actual walking prisms after all scenery is placed. Approved naval
  // blocks are never erased; the generator rejects a route that would hit them.
  for(const route of routes)for(const [x,y,z]of route.floor){
    for(const dz of [0,1])for(let dy=1;dy<=route.clearance;dy++){
      if(navalCells.has(key(x,y+dy,z+dz)))throw Error('Percurso invade o navio '+[x,y+dy,z+dz]);
      clear(x,y+dy,z+dz);
    }
  }
  // Snow deposition on exposed horizontal ship surfaces belongs to the
  // environment. Neither the source block nor its states/materials are changed.
  for(const b of ship.blocks){
    if(b.y<12||!['deck','gallery','carving'].includes(b.module))continue;
    if(at(b.x,b.y+1,b.z)||at(b.x,b.y+2,b.z))continue;
    if(b.id.endsWith('trapdoor')||b.id.endsWith('fence')||b.id.endsWith('stairs')||b.states['minecraft:vertical_half']==='bottom')continue;
    const lee=b.z>=26||Math.abs(b.x)>=13;
    const margin=Math.abs(b.x)%6===0&&b.z%5===0;
    if(lee||margin)put(b.x,b.y+1,b.z,'env-snow','snow_layer',{height:lee?1:0,covered_bit:false},'neve-sobre-o-navio');
  }
  // Snow has a full support face. A partial slab or a removed cornice cannot
  // hold a sheet at the next integer height in Bedrock.
  for(const b of [...cells.values()])if(b.module==='env-snow'){
    const support=at(b.x,b.y-1,b.z),shape=support&&sternCatalog[support.id]?.shape;
    const solid=['cube','log','naval-barrel'].includes(shape)||(shape==='slab'&&support.states['minecraft:vertical_half']==='top');
    if(!solid)clear(b.x,b.y,b.z);
  }
  const blocks=[...ship.blocks,...cells.values()];
  const models={ship:ship.stern.canonicalId,source:'/andorinha-carpintaria/displaced.json',blocks:ship.blocks.length,stern:ship.stern};
  cached={
    schema:1,version:'0.3-parte-II',project:'andorinha-polar',studyId:'polar-main',
    studyLabel:'Andorinha · Creeping Winter · Fiorde do Último Encalhe',
    params:{composition:'fiorde-do-ultimo-encalhe',edition:'stable',environment:'all'},
    blocks,modules:[...ship.modules,...modules.map(m=>({...m,stage:m.stage+8}))],
    bounds:boundsOf(blocks),materials:inventory(blocks),
    polar:{navalModel:models,environmentModules:modules.map(m=>m.id),routes,
      origin:[0,0,0],seaLevel:-3,cave:{min:[-39,0,10],max:[-23,17,48]},
      sources:['https://chatgpt.com/space/page_f122e99424608191bda5d54488e6377f'],
      compatibility:{version:'1.26.60.5',previewBlocks:false,fluidSurface:'gelo translúcido, sem simulação de água'},
      lighting:'Prévia de luz fria e lanternas. Propagação e degelo dependem de ensaio no Bedrock.'},
    validation:{geometry:'células e contatos independentes, prismas de circulação reservados',states:'bedrock-samples-v1.26.60.5',game:'pending'}
  };
  return cached;
}
