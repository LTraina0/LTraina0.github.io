import {boundsOf,inventory} from '../model.mjs';
import {gradientIndex} from '../v2/palette.mjs';
import {fillJoineryKit} from './joinery-kits.mjs';
import {sternCatalog} from './stern-catalog.mjs';
const axis=pillar_axis=>({pillar_axis});
const stair=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const half={'minecraft:vertical_half':'bottom'};
const snow={height:0,covered_bit:false};
const rail='spruce_fence',red='red_nether_brick',beam='stripped_spruce_log',oak='dark_oak_log';
export const catalog={...sternCatalog};
for(const [id,tile] of [['crimson_planks','huge_fungus/crimson_planks'],['glowstone','glowstone']]){
 catalog['minecraft:'+id]??={shape:'cube',label:id,states:{},texture:Object.fromEntries(['up','down','side'].map(k=>[k,'textures/blocks/'+tile+'.png']))};
}
const copper='waxed_oxidized_cut_copper_slab';
export function buildEncalhe(){
 const ship=new Map(),world=new Map();
 const key=(x,y,z)=>[x,y,z].join(',');
 let module='casco',component='quilha';
 function put(x,y,z,id,states={},target=ship){
   const b={x,y,z,id:'minecraft:'+id,states:{...states},module,component,origin:[x,y,z]};
   if(!catalog[b.id])throw Error('Fora do catálogo '+id);
   target.set(key(x,y,z),b);
 }
 const width=x=>Math.min(9,Math.max(1,Math.round(10*Math.sqrt(Math.max(0,1-((x-1)/36)**2)))))-(x>25?Math.floor((x-25)/3):0);
 const crown=x=>11+Math.max(0,Math.floor((-x-19)/4))+Math.max(0,Math.floor((x-21)/4));
 for(let x=-34;x<=30;x++){
   const h=crown(x),w=width(x);module='casco';
   for(let y=0;y<=h;y++){
     if(x < -34+Math.max(0,Math.ceil((12-y)*.56)))continue;
     const radius=Math.min(w,Math.round(w*Math.min(1,.12+Math.sin(Math.min(y,9)/9*Math.PI/2)*.88)));
     for(let z=-radius;z<=radius;z++){
       const edge=Math.abs(z)===radius, rib=x%5===0;
       const lower=y===0||y===5||y===h;
       if(!edge&&!lower&&!(rib&&Math.abs(z)===radius-1))continue;
       if(y===h&&x>=10&&x<=12&&z>=-2&&z<=0)continue;
       if(edge&&y>=6&&y<=9&&x>-25&&x<22&&Math.abs(x)%8>=1&&Math.abs(x)%8<=3)continue;
       const tier=gradientIndex((y+1)/(h+1),3,x,y,'clusters',8);
       let id=edge?(y===3||y===4||y===8||y===9?(tier===1?'crimson_planks':red):'dark_oak_planks'):'spruce_planks',states={};
       component=edge?'fiada do costado':'tablado';
       if(rib&&(edge||!lower)){id=oak;states=axis('y');component='caverna'}
       else if(edge&&(y===2||y===7||y===h)){id=beam;states=axis('x');component='verdugo'}
       else if(rib&&lower){id=beam;states=axis('z');component='vau'}
       put(x,y,z,id,states);
     }
     if(y===h||y===7)for(const sign of [-1,1])put(x,y,sign*(radius+1),'dark_oak_slab',half);
   }
   if(x<14)for(const sign of [-1,1]){
     component='amurada';put(x,h+1,w*sign,rail);
     if(x%5===0){put(x,h+1,w*sign,beam,axis('y'));put(x,h+2,w*sign,'snow_layer',snow)}
   }
 }
 component='gurupés e talha da roda';
 for(let i=0;i<10;i++){
   const x=-32-i,y=14+Math.floor(i/3);
   put(x,y,0,beam,axis('x'));
   if(i<6)for(const side of [-1,1])put(x,y-1,side,'andesite_stairs',stair(1,true));
   if(i%3===0)put(x,y+1,0,'snow_layer',snow);
 }
 put(-41,16,0,'iron_chain',axis('y'));put(-41,15,0,'lantern',{hanging:true});
 // Cantilevered counter, an accessible wardroom and a raised rear lantern.
 module='cabine';
 for(let x=15;x<=30;x++)for(let z=-7;z<=7;z++){
   const side=Math.abs(z)===7,end=x===15||x===30;
   for(const y of [14,19]){component='piso e cinta da galeria';put(x,y,z,side||end?beam:'spruce_planks',side?axis('x'):end?axis('z'):{})}
   if(!side&&!end)continue;
   for(let y=15;y<=18;y++){
     if(x===15&&Math.abs(z)<=1&&y<=17)continue;
     const post=side?(x-15)%5===0:(z+7)%4===0;
     component=post?'pilastra':'caixilho';
     put(x,y,z,post?oak:y===15?'dark_oak_planks':'brown_stained_glass',post?axis('y'):{});
     if(side&&!post&&y===16){
       put(x,y,z-Math.sign(z),'glowstone');put(x,15,z+Math.sign(z),'oak_stairs',stair(z>0?3:2,true));
     }
   }
   if(side&&!end){
     put(x,18,z+Math.sign(z),'dark_oak_stairs',stair(z>0?3:2,true));
     if((x-15)%5!==0)put(x,15,z+Math.sign(z),'trapdoor',{direction:z>0?2:3,open_bit:true,upside_down_bit:false});
   }
   if(side&&(x-15)%5===0)fillJoineryKit('gallery-knee',(dx,dy,dz,id,st)=>put(x+dx,12+dy,z+Math.sign(z)*dz,id,st));
 }
 for(let x=14;x<=31;x++)for(let z=-8;z<=8;z++){
   component='cobertura de cobre';const inset=Math.min(x-14,31-x,8-Math.abs(z));
   put(x,20+Math.min(3,Math.floor(inset/2)),z,copper,half);
 }
 for(let x=22;x<=26;x++)for(let z=-2;z<=2;z++){
   if(Math.abs(z)===2||x===22||x===26)for(let y=24;y<=26;y++){
     const post=Math.abs(z)===2&&(x===22||x===26);put(x,y,z,post?oak:y===24?'dark_oak_planks':'brown_stained_glass',post?axis('y'):{});
   }
   put(x,27,z,copper,half);
 }
 for(let y=24;y<=26;y++)put(24,y,0,'glowstone');
 for(let x=21;x<=27;x++)for(let z=-3;z<=3;z++)if(Math.abs(z)===3||x===21||x===27)put(x,27,z,copper,half);
 put(24,28,0,'lantern',{hanging:false});
 // Bowsprit scarf, stepped knees and the taper beneath the forefoot.
 module='casco';component='encaixe do gurupés';
 for(let x=-34;x<=-29;x++)for(let z=-1;z<=1;z++)
   put(x,crown(x)+1,z,'dark_oak_stairs',stair(1,true));
 module='cabine';component='escada da câmara';
 for(let i=0;i<3;i++)for(let z=-1;z<=1;z++)put(12+i,12+i,z,'spruce_stairs',stair(0));
 for(const x of [18,28]){put(x,15,-4,'barrel',{facing_direction:1,open_bit:false});put(x,15,4,'oak_stairs',stair(3))}
 const skull=['..#####..','.#######.','.##.#.##.','..##.##..','...###...','.#.....#.','..##.##..','....#....','..##.##..','.#.....#.'];
 for(const [cx,top,span] of [[-18,34,8],[10,39,10]]){
   module='velame';component='mastro';for(let y=5;y<=top+4;y++)put(cx,y,0,oak,axis('y'));
   for(let u=-span;u<=span;u++){
     const z=Math.round(u*.35);component='verga';put(cx+u,top,z,beam,axis('x'));
     if(u%3!==1)put(cx+u,top+1,z,'snow_layer',snow);
     for(let row=0;row<14;row++){
       const hem=13-Math.abs((u+18)%8-4)-((u>3&&u<7)?4:0);
       if(row>=hem||((u===-5||u===-4)&&row>=4&&row<=6)||(u>=span-2&&row>=6))continue;
       const bulge=Math.round(Math.sin(row/14*Math.PI)*1.5);component='pano rasgado';
       const mark=cx>0&&skull[row-1]?.[u+4]==='#';
       put(cx+u,top-1-row,z+1+bulge,mark?'black_wool':(row<2&&u%4===0?'light_gray_wool':'white_wool'));
     }
     if(Math.abs(u)===span){put(cx+u,top-1,z,'iron_chain',axis('y'));put(cx+u,top-2,z,'lantern',{hanging:true})}
   }
   component='gávea';for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){
     put(cx+i,top+2,j,'spruce_slab',{'minecraft:vertical_half':'top'});
     if(Math.max(Math.abs(i),Math.abs(j))===2)put(cx+i,top+3,j,rail);
   }
   put(cx,top+3,1,'lantern',{hanging:false});
 }
 module='carga';component='turco';fillJoineryKit('cargo-davit',(x,y,z,id,st)=>put(-22+x,14+y,z+4,id,st));
 for(const x of [-28,-14,-9,7,14])for(const z of [-4,4])put(x,crown(x)+1,z,'barrel',{facing_direction:1,open_bit:false});
 // A common body space supplies both broken ends and the displaced planking.
 const bowEnd=(y,z)=>-4+Math.floor((10-y)/4)+Math.round(Math.sin(z*.71)*1.5);
 const sternStart=(y,z)=>3+Math.round(Math.cos(z*.57+y*.32)*1.5);
 for(const b of ship.values()){
   const {x,y,z}=b;
   const attached=b.module==='velame'||b.module==='cabine';
   const rib=b.component==='caverna'||b.component==='vau';
   const torn= z>0&&!rib?Math.max(0,Math.floor((y-3)*.6)):0;
   const bow=attached?(b.module==='velame'&&x<0):x<=bowEnd(y,z)-torn;
   if(!bow&&!attached&&x<sternStart(y,z)+torn)continue;
   if(!attached&&b.component==='tablado'&&y>=10&&Math.abs(z)<6&&x>-13&&x<11)continue;
   const dy=bow?Math.floor((-x-7)/16):0;
   const moved={...b,x:x+(bow?-3:4),y:y+dy,z:z+(bow?2:-3),piece:bow?'vante':'popa'};
   world.set(key(moved.x,moved.y,moved.z),moved);
 }
 function detail(x,y,z,id,st={}){put(x,y,z,id,st,world)}
 module='carga';component='caverna exposta';
 for(const [x,z,base] of [[-11,9,3],[-8,6,2],[-6,-2,1],[7,4,3],[9,-6,4]]){
   for(let j=0;j<9;j++){const off=Math.floor(j/4);detail(x+(x<0?off:-off),base+j,z,oak,axis('y'));
     if(j===3||j===7)detail(x+(x<0?off+1:-off-1),base+j,z,'spruce_stairs',stair(x<0?1:0,true))}
 }
 for(const [x,y,z] of [[-13,5,4],[-16,5,6],[12,6,1],[16,6,2]])detail(x,y,z,'barrel',{facing_direction:3,open_bit:false});
 for(const [x,y,z] of [[-16,9,4],[13,9,1]]){detail(x,y+1,z,beam,axis('x'));detail(x,y,z,'lantern',{hanging:true})}
 module='destrocos';component='painel de costado';
 for(let x=-6;x<=2;x++)for(let y=2;y<=6;y++){
   const z=Math.round(width(x)*(.12+Math.sin(y/9*Math.PI/2)*.88)),src=ship.get(key(x,y,z));
   if(!src||y>5&&x%3===1)continue;
   const b={...src,x:x-4,y:y-2,z:z+9+Math.floor((x+6)/4),module,component};
   world.set(key(b.x,b.y,b.z),b);
 }
 component='amurada arrancada';
 for(let i=0;i<10;i++){const z=14+Math.floor(i/4);for(let j=0;j<3;j++)detail(20+i,1,z+j,'spruce_slab',half);detail(20+i,2,z+2,rail)}
 component='verga caída com pano';for(let i=0;i<13;i++){const z=20+Math.floor(i/5);detail(3+i,2,z,beam,axis('x'));for(let j=1;j<=1+i%3;j++)detail(3+i,1,z+j,'white_wool')}
 module='gelo';component='placa em contato';
 for(const [cx,cz,rx,rz] of [[-32,5,9,6],[25,14,8,4],[-7,17,6,3],[8,22,9,4],[13,3,4,4]]){
   for(let x=cx-rx;x<=cx+rx;x++)for(let z=cz-rz;z<=cz+rz;z++){
     const t=((x-cx)/rx)**2+((z-cz)/rz)**2;if(t>1+.14*Math.sin(x+z))continue;
     const h=cx===-32?Math.floor(3*(1-t)):0;
     for(let y=-1;y<=h;y++)if(!world.has(key(x,y,z)))detail(x,y,z,y<h?'blue_ice':'packed_ice');
     if(!world.has(key(x,h+1,z))&&(x+z)%4!==0)detail(x,h+1,z,'snow_layer',snow);
   }
 }
 // External stair from ice to the open end of the stern deck.
 module='carga';component='escada de embarque';
 for(let i=0;i<11;i++)for(let j=0;j<2;j++){
   const x=12+j,y=1+i,z=9-i;
   world.delete(key(x,y+1,z));world.delete(key(x,y+2,z));
   detail(x,y,z,'spruce_stairs',stair(3));
   if(i>0)detail(x,y-1,z,beam,axis('z'));
 }
 for(let x=12;x<=16;x++)for(let z=-3;z<=-2;z++)detail(x,11,z,'spruce_planks');
 for(const b of world.values())if(b.id==='minecraft:'+rail){
   for(const [d,dx,dz] of [['north',0,-1],['south',0,1],['east',1,0],['west',-1,0]])b.states['minecraft:connection_'+d]=world.has(key(b.x+dx,b.y,b.z+dz));
 }
 const blocks=[...world.values()];return {blocks,bounds:boundsOf(blocks),materials:inventory(blocks),naval:true,project:'andorinha-ultimo-encalhe'};
}
