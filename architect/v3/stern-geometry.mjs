import {radius} from './section-studies.mjs';
import {placeNavalKit} from '../v2/kit.mjs';
import {applyNavalPalette} from './naval-palette.mjs';

const axis=pillar_axis=>({pillar_axis});
const half={'minecraft:vertical_half':'bottom'};
const stair=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const depth=12;
const end=y=>21+Math.floor(y*.43);
const breadth=z=>15.3-.010*(z-5)**2;
const rim=(y,z)=>radius(y,depth,breadth(z));
const stations=[0,5,10,15,20,24];
const seamStart=[6,5,3,4,2,3,4,2,3,4],seamEnd=[15,16,18,17,19,18,16,17,18,16];
const exterior=(y,z)=>y>=3&&y<=12&&z>=seamStart[y-3]&&z<=seamEnd[y-3];

export const moduleNames={
  keel:['Quilha e sobrequilha',0],frames:['Cavernames e varengas',0],skin:['Fiadas do casco',0],
  bands:['Cintas e verdugos',0],lining:['Forro interior',0],beams:['Vaus, curvas e escoas',0],
  deck:['Tabuado e braçola',0],counter:['Espelho e abóbada de popa',0],
  gallery:['Galeria e janelas recuadas',1],carving:['Mísulas, frisos e remates',2],fittings:['Cabeços de amarração',2]
};
export function buildOriginal(refinement){
  const cells=new Map();
  // At a joint, the first member occupies the shared cell. Connections are measured on its faces.
  function put(x,y,z,module,component,id,states={},role=module,panel=false){
    const k=[x,y,z].join(',');
    if(!cells.has(k))cells.set(k,{x:x||0,y,z,module,component,id:'minecraft:'+id,states,role,piece:panel?'panel':'body'});
  }
  for(let z=0;z<=end(0);z++){
    for(let x=-1;x<=1;x++)put(x,0,z,'keel','quilha','dark_oak_log',axis('z'));
    put(0,1,z,'keel','sobrequilha','dark_oak_log',axis('z'));
  }
  for(const z of stations.filter(z=>z<=end(0)))for(let x=-3;x<=3;x++)
    put(x,2,z,'frames','varenga-'+z,'stripped_spruce_log',axis('x'),'frame');
  for(let y=1;y<=depth;y++)for(let z=0;z<=end(y);z++){
    const r=rim(y,z),prev=rim(y-1,z),lo=Math.min(r,prev),hi=Math.max(r,prev);
    for(const side of [-1,1]){
      const prefix=side>0?'BE':'BB', peels=side>0&&exterior(y,z);
      const band=y===6||y===9;
      for(let a=lo;a<=hi;a++){
        const bevel=!band&&r>prev&&a===hi&&y>1;
        put(side*a,y,z,band?'bands':'skin',prefix+'-fiada-'+y,
          band?(y===6?'dark_oak_log':'stripped_spruce_log'):bevel?'spruce_stairs':'spruce_planks',
          band?axis('z'):bevel?stair(side>0?1:0,true):{},band?'wale':'hull',peels);
      }
      if(y===6)put(side*(hi+1),y,z,'bands',prefix+'-verdugo','dark_oak_log',axis('z'),'wale',peels);
      if(stations.includes(z)){
        for(let a=(y===1?0:Math.max(0,lo-3));a<lo;a++)
          put(side*a,y,z,'frames',prefix+'-caverna-'+z,'stripped_spruce_log',axis(hi-lo>=2?'x':'y'),'frame',side>0&&z===10&&y>=4);
      }
      if([4,8].includes(y)){
        const inside=Math.max(1,lo-3);
        for(let a=inside;a<=Math.max(inside,rim(y-1,Math.max(0,z-1))-3);a++)
          put(side*a,y,z,'lining',prefix+'-forro-'+y,'spruce_planks',{},'lining');
      }
      if(y===11){
        put(side*(lo-2),y,z,'beams',prefix+'-escoa','dark_oak_log',axis('z'),'beam');
        if(stations.includes(z)){
          for(let a=0;a<lo;a++)put(side*a,y,z,'beams','vau-'+z,'spruce_log',axis('x'),'beam',side>0&&z===10&&a>=lo-5);
          for(let a=lo-5;a<=lo-3;a++)put(side*a,y-1,z,'beams',prefix+'-curva-'+z,'spruce_stairs',stair(side>0?0:1,true),'frame',side>0&&z===10);
        }
      }
    }
    // The raked transom closes each waterline at its own aftermost station.
    if(z===end(y))for(let x=-r;x<=r;x++){
      put(x,y,z,'counter','espelho-'+y,y===6||y===9?'dark_oak_log':'spruce_planks',y===6||y===9?axis('x'):{},'counter');
      if(z>end(y-1))put(x,y,z-1,'counter','encaixe-espelho-'+y,'spruce_planks');
    }
  }
  // Open upper deck above the hold. Broken starboard margin follows the ends of the boards.
  for(let z=0;z<=end(12);z++){
    const r=rim(12,z);
    for(let x=-r+1;x<r;x++){
      if(Math.abs(x)<=3&&z>=4&&z<=12)continue;
      const peel=x>=r-(z===10?5:2+(z%3===0?1:0))&&exterior(12,z);
      put(x,12,z,'deck','convés-'+x,'spruce_planks',{},'deck',peel);
    }
    for(const x of [-4,4])if(z>=3&&z<=13)put(x,13,z,'deck','braçola-longitudinal','dark_oak_log',axis('z'));
    if(z===3||z===13)for(let x=-3;x<=3;x++)put(x,13,z,'deck','braçola-transversal','dark_oak_log',axis('x'));
    for(const side of [-1,1]){
      if(z>=20)continue;
      put(side*r,13,z,'bands',(side>0?'BE':'BB')+'-borda','spruce_slab',half,'wale',side>0&&exterior(12,z));
    }
  }
  // The gallery turns the aft corners. A full-cell recess behind each window keeps the light openings legible.
  for(let y=13;y<=19;y++){
    const t=y-13, aft=26+Math.floor((t+1)/3);
    const spread=9+(t>=2?1:0)+(t===6?1:0);
    for(let x=-spread;x<=spread;x++){
      const curve=Math.floor(Math.abs(x)**2/37), z=aft-curve;
      const post=[-9,-5,0,5,9].includes(x), rail=t<=1||t>=5;
      if(post||rail)put(x,y,z,'gallery',post?'montante-'+x:'travessa-galeria-'+t,post?'stripped_spruce_log':t===1?'oak_log':'dark_oak_log',axis(post?'y':'x'));
      if(post&&t>0)put(x,y,z-1,'gallery','jamba-interior-'+x,'stripped_spruce_log',axis('y'));
      if(!post&&t===2)put(x,y,z-1,'gallery','peitoril-recuado','oak_slab',half);
      if(t===0||t===6)for(let zz=19;zz<=z;zz++)put(x,y,zz,'gallery',t===0?'piso-galeria':'teto-galeria','spruce_planks');
      if([1,5,6].includes(t))put(x,y,z+1,'carving','friso-do-espelho-'+t,t===5?'oak_stairs':'oak_slab',t===5?stair(3,true):half);
      if(post&&t>=2&&t<=4){
        const id=t===2?'oak_stairs':t===4?'dark_oak_stairs':'oak_log';
        put(x,y,z+1,'carving','mísula-'+x,id,t===3?axis('y'):stair(3,t===4));
      }
    }
    for(const s of [-1,1])for(let z=19;z<aft-2;z++){
      const x=s*(spread-(z===19?1:0));
      if(railAt(t))put(x-s,y,z,'gallery','soleira-lateral-'+s,'dark_oak_log',axis('z'));
      if(railAt(t)||z===19||z===22)put(x,y,z,'gallery','retorno-'+s+'-'+z,railAt(t)?'dark_oak_log':'stripped_spruce_log',axis(railAt(t)?'z':'y'));
    }
  }

  // The counter rises at its centre. Stepped backing carries both scrolls above the gallery,
  // with the end grain of the central boss framed by lighter quarter-round trim.
  for(let x=-10;x<=10;x++){
    const a=Math.abs(x), aft=28-Math.floor(a*a/37);
    const height=a<=1?3:a<=4?2:a<=7?1:0;
    for(let z=aft-2;z<=aft;z++){
      for(let level=0;level<height;level++)put(x,20+level,z,'carving','coroamento-'+x,'dark_oak_planks');
      const bevel=a===2||a===5||a===8;
      put(x,20+height,z,'carving','talha-superior-'+x,bevel?'oak_stairs':'spruce_slab',bevel?stair(x<0?0:1):half);
    }
    if(height>=2)put(x,20,aft+1,'carving','moldura-coroamento','oak_stairs',stair(3,true));
    if(a===0)put(x,21,aft+1,'carving','medalhão-de-topo','stripped_spruce_log',axis('z'));
    if(a===1)put(x,21,aft+1,'carving','orelha-do-medalhão','oak_stairs',stair(x<0?0:1));
  }
  for(const x of [-8,-6,-4,-1,1,4,6,8])for(const y of [16,17]){
    const fixedLeft=[-8,-4,1,6].includes(x);
    const z=26+Math.floor((y-12)/3)-Math.floor(Math.abs(x)**2/37)-1;
    put(x,y,z,'gallery','veneziana-'+x,'trapdoor',{direction:fixedLeft?0:1,open_bit:true,upside_down_bit:false});
  }
  for(const side of [-1,1])for(const z of [19,22]){
    for(let t=0;t<3;t++){
      const x=side*(9+t);
      put(x,12+t,z,'carving','curva-da-sacada-'+side+'-'+z,'oak_stairs',stair(side>0?1:0,true));
      put(x,13+t,z,'carving','cachorro-da-sacada-'+side+'-'+z,'dark_oak_log',axis('x'));
    }
  }
  for(const side of [-1,1])for(const b of placeNavalKit('cleat',{origin:[6*side,13,2],turns:1}).blocks)
    put(b.x,b.y,b.z,'fittings','cabeço-'+side,b.id.slice(10),b.states,'fitting');
  refinement?.apply(cells);
  const labels=refinement?{...moduleNames,...refinement.modules}:moduleNames;
  const blocks=[...cells.values()].sort((a,b)=>labels[a.module][1]-labels[b.module][1]||a.y-b.y||a.z-b.z||a.x-b.x);
  return applyNavalPalette({blocks},{wetLine:3,wetDescription:'madeira escura na faixa inferior do bojo',profile:refinement?.palette});
}
function railAt(t){return t===0||t===1||t>=5;}
