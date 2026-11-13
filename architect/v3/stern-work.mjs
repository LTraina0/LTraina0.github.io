import {key} from '../model.mjs';
import {placeNavalKit} from '../v2/kit.mjs';
import {sternCatalog} from './stern-catalog.mjs';

const axis=pillar_axis=>({pillar_axis});
const half=(position='bottom')=>({'minecraft:vertical_half':position});
const stair=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const leaf=(direction,open_bit,upside_down_bit=false)=>({direction,open_bit,upside_down_bit});
const neighbors={north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};
const fence=()=>Object.fromEntries(Object.keys(neighbors).map(d=>['minecraft:connection_'+d,false]));
export const workModules={ports:['Portinholas, cintas e reforços',2],hatch:['Escotilha, escada e patamar',2],tackle:['Aparelho de carga e amarração',2],balcony:['Sacada, gelosias e ferragens',2]};

export function refineOriginal(cells){
  const at=(x,y,z)=>cells.get(key(x,y,z));
  function add(x,y,z,module,component,id,states={},meta={}){
    if(!at(x,y,z))cells.set(key(x,y,z),{x:x||0,y,z,module,component,id:'minecraft:'+id,states,piece:'body',role:module,...meta});
  }
  function insertKit(name,origin,module,component,turns=0){
    for(const b of placeNavalKit(name,{origin,turns}).blocks)
      add(b.x,b.y,b.z,module,component,b.id.slice(10),b.states,{kitId:name});
  }
  // Port openings follow the existing stepped skin. Each fitting belongs to its host strake.
  const shellRows=new Map();
  for(const b of cells.values())if(['skin','bands'].includes(b.module)&&b.x){
    const side=Math.sign(b.x),k=key(side,b.y,b.z);
    if(!shellRows.has(k)||Math.abs(b.x)>Math.abs(shellRows.get(k).x))shellRows.set(k,b);
  }
  const shell=(side,y,z)=>shellRows.get(key(side,y,z));
  for(const side of [-1,1]){
    for(const start of [2,7,12,17]){
      const group=(side>0?'BE':'BB')+'-portinhola-'+start;
      for(let z=start;z<=start+2;z++){
        for(const y of [7,8]){
          const host=shell(side,y,z);if(!host)continue;
          const edge=Math.abs(host.x);
          for(let a=edge;a>=edge-2;a--){
            const b=at(side*a,y,z);
            if(b?.module==='skin')cells.delete(key(b.x,y,z));
          }
          if(y===7)add(side*edge,y,z,'ports',group+'-soleira','oak_slab',half(),{piece:shell(side,6,z).piece});
          if(y===8){
            const lintel=shell(side,9,z);
            for(let a=Math.min(Math.abs(lintel.x)+1,edge+1);a<=edge+1;a++)
              add(side*a,9,z,'ports',group+'-verga','oak_slab',half(),{piece:lintel.piece});
            add(side*(edge+1),y,z,'ports',group+'-folha','spruce_trapdoor',leaf(side>0?0:1,false,true),{piece:lintel.piece});
          }
        }
        const sill=shell(side,6,z);
        add(sill.x+side,6,z,'ports',group+'-pingadeira','waxed_cut_copper_slab',half('top'),{piece:sill.piece,role:'flashing',drainage:z===start?'outfall':'sheltered'});
      }
      for(const z of [start-1,start+3]){
        const host=shell(side,8,z);
        add(host.x+side,8,z,'ports','jamba-'+side+'-'+z,'oak_stairs',stair(side>0?1:0,true),{piece:host.piece});
        const foot=shell(side,7,z);
        add(foot.x+side,7,z,'ports','jamba-'+side+'-'+z,'stripped_spruce_log',axis('y'),{piece:foot.piece});
      }
    }
    // A half-height rubbing rail below the existing wale feathers back into the bilge.
    for(let z=0;z<=21;z++){
      const host=shell(side,5,z);
      const terminal=z===0||z===21, scarf=[5,10,15,20].includes(z);
      add(host.x+side,5,z,'ports','defensa-'+side,terminal||scarf?'dark_oak_stairs':'spruce_slab',
        terminal||scarf?stair(z===0?2:z===21?3:side>0?1:0,true):half('top'),{piece:host.piece});
    }
  }

  // Cut through the coaming where the working passage crosses the rim. Descend across
  // the ship between two original transverse beams. No stair occupies the opening above it.
  for(const z of [8,9])cells.delete(key(4,13,z));
  for(const z of [8,9]){
    for(let x=-2;x<=3;x++)add(x,x+9,z,'hatch','escada-de-porão','oak_stairs',stair(0));
    for(let x=-3;x<=3;x++)add(x,x+8,z,'hatch','longarina-da-escada','dark_oak_planks');
    for(let x=-5;x<=-2;x++)add(x,6,z,'hatch','patamar-inferior','spruce_planks');
  }
  for(const z of [4,7,11,12])for(let x=-3;x<=3;x++)
    add(x,12,z,'hatch','barrote-da-grelha-'+z,'stripped_spruce_log',axis('x'));
  for(const z of [4,5,6,7,11,12])insertKit(z===7?'hatch-leaves-raised':'hatch-leaves',[0,13,z],'hatch','folhas-da-grelha-'+z);
  for(const x of [-4,4])for(let z=4;z<=12;z++){
    if(x>0&&z>=7&&z<=10)continue;
    add(x,14,z,'hatch','guarda-da-escotilha','spruce_fence',fence());
  }
  for(const b of cells.values()){
    if(b.module==='deck'&&b.role==='deck'&&b.y===12&&((b.x>=5&&b.x<=7&&b.z>=5&&b.z<=14-(b.x%2))||(b.x===-5&&b.z>=3&&b.z<=9)))b.repair=true;
  }
  insertKit('cargo-davit',[-6,13,11],'tackle','turco-sobre-a-escotilha');
  insertKit('windlass',[-7,13,5],'tackle','sarilho-de-carga',1);
  for(const z of [14,15])add(-6,13,z,'tackle','barris-de-serviço','barrel',{facing_direction:5,open_bit:false});
  add(-7,13,15,'tackle','berço-de-carga','spruce_stairs',stair(0));

  // A continuous, walkable gallery follows the stepped curve of the transom.
  const lip=x=>30-Math.floor(x*x/37);
  for(let x=-10;x<=10;x++){
    const z=lip(x),previous=lip(x-1);
    for(let p=z-4;p<=z;p++)add(x,14,p,'balcony','tablado-da-sacada','spruce_planks');
    const scupper=[-9,-5,5,9].includes(x);
    add(x,14,z+1,'balcony',scupper?'biqueira-da-sacada':'fasquia-da-sacada',scupper?'waxed_cut_copper_slab':'dark_oak_slab',half('top'),scupper?{role:'flashing',drainage:'outfall'}:{});
    for(let p=Math.min(z,previous);p<=z;p++)add(x,15,p,'balcony','balaustrada-curva','spruce_fence',fence());
    if(previous>z&&x>-10){add(x-1,15,z,'balcony','retorno-da-balaustrada','spruce_fence',fence());}
    // Slender pierced screen one block behind the forward faces of the posts.
    if(![-9,-5,0,5,9].includes(x)&&Math.abs(x)<9){
      const recess=26-Math.floor(x*x/37);
      for(const y of [16,17])add(x,y,recess,'gallery','gelosia-recuada-'+x,'bamboo_trapdoor',leaf(2,true));
      add(x,18,recess,'gallery','lintel-da-gelosia','oak_log',axis('x'));
      add(x,18,recess+1,'gallery','verga-da-janela','bamboo_planks');
    }
  }
  for(const x of [-9,-5,0,5,9]){
    const z=lip(x);
    insertKit('gallery-knee',[x,11,z-2],'balcony','curva-sob-a-sacada-'+x);
    // A copper foot, wooden pilaster and inverted capital define the negative space of each bay.
    add(x,16,z-2,'balcony','plinto-'+x,'waxed_cut_copper_slab',half(),{role:'flashing',drainage:'sheltered'});
    add(x,17,z-2,'balcony','pilastra-'+x,'bamboo_trapdoor',leaf(2,true));
    add(x,18,z-2,'balcony','capitel-'+x,'oak_stairs',stair(3,true));
    add(x,19,z-2,'balcony','arquitrave-'+x,'bamboo_planks');
    if(Math.abs(x)===9){
      add(x,16,z,'balcony','base-do-fanal-'+x,'oak_log',axis('y'));
      add(x,17,z,'balcony','fanal-da-sacada-'+x,'lantern',{hanging:false});
    }
  }
  for(const x of [-6,6]){
    const z=lip(x)-1;
    add(x,19,z,'balcony','braço-do-fanal','dark_oak_log',axis('z'));
    add(x,19,z+1,'balcony','braço-do-fanal','dark_oak_log',axis('z'));
    add(x,18,z+1,'balcony','pendural','iron_chain',axis('y'));
    add(x,17,z+1,'balcony','fanal-pendente','lantern',{hanging:true});
  }
  for(const b of cells.values())if(b.id==='minecraft:spruce_fence'){
    const states=fence();
    for(const [direction,[dx,dz]] of Object.entries(neighbors)){
      const n=at(b.x+dx,b.y,b.z+dz);
      states['minecraft:connection_'+direction]=!!n&&['cube','log','naval-fence','naval-barrel'].includes(sternCatalog[n.id].shape);
    }
    b.states=states;
  }
}

