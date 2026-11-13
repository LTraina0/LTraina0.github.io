import {refineOriginal,workModules} from './stern-work.mjs';
import {sternCatalog} from './stern-catalog.mjs';
import {kitVolume,surfaceContact} from '../v2/kit-shapes.mjs';
import {key} from '../model.mjs';

const axis=pillar_axis=>({pillar_axis});
const slab=(half='bottom')=>({'minecraft:vertical_half':half});
const stair=(weirdo_direction,upside_down_bit=false)=>({weirdo_direction,upside_down_bit,'minecraft:corner':'none'});
const leaf=(direction,open_bit=false,upside_down_bit=false)=>({direction,open_bit,upside_down_bit});
const id=s=>'minecraft:'+s;
const sheer=(start,control,end,t)=>(1-t)**2*start+2*(1-t)*t*control+t*t*end;

// The rules operate on the intact ship, before any material or directional state is moved.
const palette={
  id:'andorinha-exposure-and-joinery',
  select(b,shape,c){
    const select=(block,ruleId,rule)=>({id:id(block),ruleId,rule});
    // The woodwork runs through the ship. Mineral facing follows its two
    // protective edges and turns onto the quarters. Keep the bearing timber
    // and the reveals visible in the space between the two courses.
    const shaped=(base)=>base+({slab:'_slab',stairs:'_stairs'}[shape]??'');
    if(b.component==='lábio-da-cornija')
      return select(Math.abs(b.x)===9?'deepslate_brick_slab':'polished_blackstone_brick_slab','cold-drip-edge','Cornija em pedra-negra, com remates de ardósia');
    if(['orelha-chanfrada','ábaco-da-pilastra','arco-segmentar','verga-de-alheta'].includes(b.component))
      return select(shaped('polished_blackstone_brick'),'dark-window-head','Pedra-negra sob a cornija e nas cabeças dos vãos');
    if(['peitoril-externo','peitoril-de-alheta','fasquia-da-sacada','moldura-em-arco'].includes(b.component))
      return select(shaped('deepslate_brick'),'slate-counter-moulding','Ardósia nos peitoris, no bordo inferior e no retorno da sacada');
    if(b.component==='aba-do-trincaniz'||b.component==='pé-da-jamba')
      return select(shaped('deepslate_brick'),'slate-sheer-edge','Ardósia no remate do costado e sob os montantes das portinholas');
    if(b.component==='espelho-7'&&shape==='cube')
      return select('deepslate_bricks','slate-counter-strake','Fiada de proteção mineral entre os verdugos de madeira da popa');
    if(b.component.startsWith('talha-superior-')&&Math.abs(b.x)>=2)
      return select(shaped('polished_blackstone_brick'),'dark-crown-edge','Contorno escuro recortado sobre o coroamento de madeira');
    if(b.component==='moldura-coroamento'||b.component==='asa-do-cartucho'&&shape==='stairs')
      return select(shaped('deepslate_brick'),'slate-crown-rebate','Moldura de ardósia ao redor da talha do espelho');
    if(b.component==='assento-da-janela')return select('dark_oak_planks','oak-window-seat','Madeira escura do assento atrás do peitoril de ardósia');
    // The old tarred waterline predates the breach; a new light path through
    // missing deck planks does not bleach an intact strake.
    if(b.role==='hull' && b.y<=8 && ['cube','stairs','slab'].includes(shape))
      return select(shape==='cube'?'dark_oak_planks':shaped('dark_oak'),'tarred-strake','Madeira escurecida da carena anterior à avaria');
    if(b.role==='flashing')return select(b.drainage==='outfall'?'deepslate_brick_slab':'polished_blackstone_brick_slab','stone-drain','Biqueira de ardósia e calha abrigada de pedra-negra');
    if(b.role==='waterway')return select(c.exposure>.49?'spruce_log':'stripped_spruce_log','weathered-waterway','Fibra longitudinal desgastada junto ao escoadouro');
    if(b.role==='deck'&&shape==='cube'){
      const worn=c.exposure>=.5&&Math.abs(b.x)>=5&&Math.abs(b.x)<=8;
      if(b.repair)return select('oak_planks','deck-repair','Tábuas de reposição entre o sarilho e a escada');
      if(worn && Math.abs(b.x)===8 && b.z>12 && b.z<=16)return select('oak_planks','worn-working-lane','Tábuas castanhas nos percursos exteriores expostos');
    }
    if(b.role==='wale'&&shape==='log'&&b.y===9)return select('spruce_log','salt-wale','Cinta superior escurecida, com fibra contínua entre portinholas');
    if(b.role==='upper-board')return select(c.exposure<.25?'dark_oak_log':'stripped_spruce_log','upper-strake','Fibra longitudinal da fiada superior, escura sob o ressalto');
    return null;
  }
};
// Shape-changing selections must establish their orientation in the cell geometry.
function refine(cells){
  refineOriginal(cells);
  const at=(x,y,z)=>cells.get(key(x,y,z));
  const remove=b=>cells.delete(key(b.x,b.y,b.z));
  // Re-machining keeps ownership of each cell. New pieces on the hull inherit
  // the exact host strake, including along the jagged seam of the removable panel.
  function fit(x,y,z,host,module,component,block,states={},role=module){
    if(!host)throw Error('Missing host for '+component);
    const out={x:x||0,y,z,piece:host.piece,module,component,role,id:id(block),states};
    cells.set(key(x,y,z),out);return out;
  }
  const body={piece:'body'};
  const shell=new Map();
  for(const b of cells.values())if(b.x&&['skin','bands'].includes(b.module)&&b.component.includes('fiada')){
    const k=key(Math.sign(b.x),b.y,b.z);
    if(!shell.has(k)||Math.abs(b.x)>Math.abs(shell.get(k).x))shell.set(k,b);
  }
  const sideAt=(side,y,z)=>shell.get(key(side,y,z));
  for(const b of [...cells.values()]){
    if(b.component.startsWith('defensa-'))remove(b);
    // Longitudinal fibre in the unpainted upper strake. The contextual engine
    // selects its shade. Use a log input so the state stays legal in shade too.
    if(b.role==='hull'&&b.y===10&&b.id===id('spruce_planks')){
      fit(b.x,b.y,b.z,b,b.module,b.component,'stripped_spruce_log',axis('z'),'upper-board');
    }
  }
  // Fair the rubbing strake in half-block increments. Its height follows one
  // quadratic profile; its transverse position follows the real station skin.
  for(const side of [-1,1]){
    for(let z=0;z<=22;z++){
      const height=Math.round(2*sheer(4.4,3.25,7.4,z/22));
      const next=Math.round(2*sheer(4.4,3.25,7.4,Math.min(1,(z+1)/22)));
      const y=Math.floor(height/2),host=sideAt(side,y,z)??sideAt(side,y-1,z);
      if(!host)continue;
      const x=host.x+side;
      if(at(x,y,z))continue;
      const rises=height!==next,half=height%2?'top':'bottom';
      let block=rises?'dark_oak_stairs':'dark_oak_slab';
      let state=rises?stair(next>height?2:3,half==='top'):slab(half);
      const wood=kitVolume(sternCatalog[host.id].shape,host.states);
      if(!surfaceContact(wood,kitVolume(sternCatalog[id(block)].shape,state),[side,0,0])){
        block='dark_oak_stairs';
        state=stair(side>0?1:0);
      }
      fit(x,y,z,host,'ports','defensa-curva-'+side,block,state);
    }
    for(const start of [2,7,12,17]){
      // The central port leaf is furled in the lintel. In the two outer
      // ports a wooden shutter stands in the rebate, leaving a light slit.
      for(let z=start;z<=start+2;z++){
        const lip=[...cells.values()].find(b=>Math.sign(b.x)===side&&b.y===8&&b.z===z&&b.component.endsWith('-folha'));
        if(!lip)continue;
        const sill=sideAt(side,6,z);
        const sx=sill.x+side;
        const base=at(sx,6,z);
        if(base?.component.endsWith('pingadeira'))fit(sx,6,z,base,'ports','bainha-da-soleira','deepslate_brick_slab',slab('top'));
        if(z===start+1||start===7||start===12){
          fit(lip.x,8,z,lip,'ports','folha-recolhida','dark_oak_trapdoor',leaf(side>0?0:1,false,true));
        }else{
          fit(lip.x,8,z,lip,'ports','portinhola-em-rebaixo','spruce_trapdoor',leaf(side>0?0:1,true));
        }
        const lintel=at(lip.x,9,z);
        if(lintel?.module==='ports')fit(lintel.x,9,z,lintel,'ports','verga-biselada',z===start+1?'stripped_spruce_log':'dark_oak_stairs',z===start+1?axis('z'):stair(z===start?2:3,true));
      }
      // Timber jambs articulate the moment where the transverse frames reach
      // the shell. A half lap stays below the upper wale at each bay shoulder.
      for(const z of [start-1,start+3]){
        const jamb=[...cells.values()].find(b=>Math.sign(b.x)===side&&b.y===7&&b.z===z&&b.component.startsWith('jamba-'));
        if(!jamb)continue;
        fit(jamb.x,7,z,jamb,'ports','pé-da-jamba','deepslate_brick_stairs',stair(side>0?1:0));
        const h=at(jamb.x,8,z);
        if(h?.module==='ports')fit(h.x,8,z,h,'ports','curva-da-verga','dark_oak_stairs',stair(z===start-1?3:2,true));
      }
    }
  }

  // Between station heads, recess the bulwark a blade's thickness into its
  // original skin. Keep an interior lining and the full beam ends at each bay.
  for(const side of [-1,1]){
    for(let z=1;z<=23;z++){
      const host=sideAt(side,11,z);
      if(!host||host.module!=='skin')continue;
      const station=z%5, x=host.x;
      if(station===0){
        fit(x,11,z,host,'skin','cabeça-de-caverna','spruce_log',axis('x'));
      }else if(station===1||station===4){
        fit(x,11,z,host,'skin','joelho-do-trincaniz','dark_oak_stairs',stair(station===1?3:2,true));
      }else{
        fit(x,11,z,host,'skin','rebaixo-do-trincaniz','spruce_trapdoor',leaf(side>0?0:1,true));
        if(!at(x-side,11,z))fit(x-side,11,z,host,'skin','fundo-do-rebaixo','dark_oak_planks');
      }
      const rail=sideAt(side,12,z);
      if(rail && !at(rail.x+side,12,z) && Math.abs(rail.x)<16){
        const feather=station===1||station===4;
        fit(rail.x+side,12,z,rail,'bands','aba-do-trincaniz',feather?'dark_oak_stairs':'spruce_slab',feather?stair(side>0?1:0,true):slab('top'));
      }
    }
  }

  // Planked working deck, with recessed drains in the two outboard waterways.
  for(const b of [...cells.values()])if(b.module==='deck'&&b.role==='deck'&&b.y===12){
    const a=Math.abs(b.x);
    if(a===10&&b.z<=18){
      if([5,12,17].includes(b.z))fit(b.x,12,b.z,b,'deck','ralo-embutido','trapdoor',leaf(2,false,true));
      else fit(b.x,12,b.z,b,'deck','calha-longitudinal','stripped_spruce_log',axis('z'),'waterway');
    }else if((a===5||a===6)&&b.z>=1&&b.z<=16 && (b.z+(a===6?4:0))%8===0){
      fit(b.x,12,b.z,b,'deck','emenda-no-vau','stripped_spruce_log',axis('x'));
    }
  }
  for(const b of [...cells.values()])if(b.component.startsWith('folhas-da-grelha')||b.component==='guarda-da-escotilha')remove(b);
  // Two flush ventilation gratings straddle a permanently open ladder well.
  // A folded leaf sits on the port rim. Four corner shoes hold the coaming.
  for(const z of [4,5,6,7,11,12])for(let x=-3;x<=3;x++){
    const end=z===4||z===7||z===12;
    const rail=end||x===-3||x===0||x===3;
    fit(x,12,z,body,'hatch',rail?'travessa-da-grelha':'grade-embutida',rail?'stripped_spruce_log':'trapdoor',rail?axis(end?'x':'z'):leaf(2,false,true));
    if(x===-3&&z<=7)fit(x,13,z,body,'hatch','tampa-rebatida','spruce_trapdoor',leaf(0,true));
  }
  for(const side of [-1,1]){
    for(const z of [3,13]){
      fit(side*4,13,z,body,'hatch','sapata-da-braçola','dark_oak_stairs',stair(z===3?2:3));
      fit(side*3,13,z,body,'hatch','ombro-da-braçola','dark_oak_stairs',stair(side>0?1:0));
    }
    for(let z=4;z<=12;z++){
      if(side>0&&z>=7&&z<=10)continue;
      const b=at(side*4,13,z);if(!b)continue;
      fit(b.x,13,z,b,'hatch','bordo-chanfrado','dark_oak_stairs',stair(side>0?1:0));
      const upright=[4,6,11,12].includes(z);
      fit(b.x,14,z,b,'hatch',upright?'malhete-do-corrimao':'corrimao-de-elo',upright?'stripped_spruce_log':'iron_chain',axis(upright?'y':'z'));
    }
  }

  // Barrels face the cargo aisle. The chocks key into the deck, and the keeper
  // crosses the backs of the barrels, leaving both working ends free.
  for(const z of [14,15]){
    fit(-7,13,z,body,'tackle','calço-do-berço','dark_oak_stairs',stair(0));
    fit(-7,14,z,body,'tackle','cinta-do-berço','spruce_trapdoor',leaf(1,true));
  }
  for(const z of [13,16])fit(-6,13,z,body,'tackle','cunha-do-barril','spruce_stairs',stair(z===13?2:3));

  const lip=x=>30-Math.floor(x*x/37);
  // Work inside the old sill and roof. Remove the overlapping shutters of v18
  // to make each aperture readable from both the gallery and the wardroom.
  for(const b of [...cells.values()]){
    if(b.module==='gallery'&&b.y>=15&&b.y<=18&&b.z>=23&&Math.abs(b.x)<9&&!b.component.startsWith('montante')&&!b.component.startsWith('jamba-interior'))remove(b);
    if(b.module==='balcony'&&/^(balaustrada|retorno-da-balaustrada|pilastra-|plinto-|capitel-|arquitrave-)/.test(b.component))remove(b);
  }
  for(let x=-10;x<=10;x++){
    const a=Math.abs(x),z=lip(x),post=[0,5,9].includes(a);
    const host=at(x,14,z)??body;
    const previous=lip(x-1);
    for(let p=Math.min(z,previous);p<=Math.max(z,previous);p++){
      const turn=previous!==z, ped=post||turn||a===10;
      const cell=at(x,15,p);
      if(!cell||cell.module==='balcony')fit(x,15,p,host,'balcony',ped?'pilarete-da-sacada':'balaustrada-de-elo',ped?'dark_oak_log':'iron_chain',axis(ped?'y':'x'));
    }
    // A projecting sill, a splayed reveal and a shutter three planes in.
    if(a<9&&!post){
      const middle=[2,3,7].includes(a);
      const face=z-2;
      fit(x,15,face,body,'gallery','peitoril-externo','spruce_slab',slab('top'));
      fit(x,15,face-1,body,'gallery','assento-da-janela','oak_planks');
      fit(x,18,face,body,'gallery','arco-segmentar',middle?'spruce_slab':'dark_oak_stairs',middle?slab('top'):stair(x<0?0:1,true));
      if(!middle)for(const y of [16,17])fit(x,y,face-2,body,'gallery','folha-no-rebaixo','dark_oak_trapdoor',leaf(2,true));
    }
    if(post){
      fit(x,16,z-2,body,'balcony','base-da-pilastra','spruce_stairs',stair(3));
      fit(x,17,z-2,body,'balcony','montante-externo','stripped_spruce_log',axis('y'));
      fit(x,18,z-2,body,'balcony','capitel-de-retorno','dark_oak_stairs',stair(3,true));
      fit(x,19,z-2,body,'balcony','frechal-da-galeria','dark_oak_log',axis('x'));
    }
    // Curved moulding steps up under the quarters; two materials mark
    // the bearing and the wearing edge. Both lie below the existing balcony.
    const h=Math.round(2*sheer(11.4,11.0,13.35,a/10)),y=Math.floor(h/2);
    for(let p=z-3;p<z;p++){
      if(!at(x,y,p))fit(x,y,p,body,'balcony','sainel-do-espelho','dark_oak_stairs',stair(2,true));
    }
    if(!at(x,y,z))fit(x,y,z,body,'balcony','moldura-em-arco','spruce_slab',slab(h%2?'top':'bottom'));
    if(a===2||a===7){
      for(let yy=10;yy<14;yy++){
        const reach=z-1-(13-yy);
        for(let p=reach-2;p<=reach;p++)if(!at(x,yy,p))fit(x,yy,p,body,'balcony','joelho-escarvado','stripped_spruce_log',axis('z'));
      }
    }
  }
  // A real after-cabin partition catches light behind the existing openings.
  // Stepped returns frame the warm benches. The middle entrance opens forward
  // onto the original quarterdeck at z=19; the side and centre aisles stay free.
  for(let x=-8;x<=8;x++){
    const a=Math.abs(x),z=20+(a>=6?1:0);
    for(let y=14;y<=18;y++){
      if(a<=1&&y<=17)continue;
      const post=[2,6,8].includes(a);
      const material=post?'dark_oak_log':y===14||y===18?'stripped_spruce_log':'spruce_planks';
      if(!at(x,y,z))fit(x,y,z,body,'gallery','antepara-da-camara',material,post?axis('y'):material.endsWith('_log')?axis('x'):{});
    }
    if(a>=3&&a<=5)fit(x,14,z+1,body,'gallery','banco-de-vigia','oak_stairs',stair(3));
  }
  for(const b of [...cells.values()])if(['braço-do-fanal','pendural','fanal-pendente'].includes(b.component))remove(b);
  for(const x of [-3,3]){
    fit(x,18,23,body,'gallery','pendural-na-camara','iron_chain',axis('y'));
    fit(x,17,23,body,'gallery','fanal-no-rebaixo','lantern',{hanging:true});
  }
  // Frame the forward bulkhead from the deck side. Glazing replaces solid
  // infill. Sills, shutter hinges and the short hood occupy different planes.
  for(const s of [-1,1]){
    for(const a of [3,4,5,7]){
      const x=s*a,z=a===7?21:20;
      const pane=a!==4;
      fit(x,16,z,body,'gallery',pane?'vidraça-da-câmara':'mainel-da-câmara',pane?'brown_stained_glass':'stripped_spruce_log',pane?{}:axis('y'));
      if(pane)fit(x,17,z,body,'gallery','vidraça-da-câmara','brown_stained_glass');
      fit(x,15,z-1,body,'gallery','soleira-em-retorno','deepslate_brick_stairs',stair(2,true));
      fit(x,17,z-1,body,'gallery','folha-no-lintel','dark_oak_trapdoor',leaf(3,false,true));
      fit(x,18,z-1,body,'gallery','verga-da-antepara',a===4?'stripped_spruce_log':'dark_oak_stairs',a===4?axis('x'):stair(s>0?1:0,true));
    }
    for(const a of [2,6,8]){
      const x=s*a,z=a===2?19:20;
      fit(x,14,z,body,'gallery','pé-em-esquadro','dark_oak_stairs',stair(2));
      fit(x,15,z,body,'gallery','montante-do-caixilho','stripped_spruce_log',axis('y'));
      fit(x,16,z,body,'gallery','folha-aberta-da-câmara','spruce_trapdoor',leaf(s>0?0:1,true));
      fit(x,17,z,body,'gallery','mão-francesa-da-verga','spruce_stairs',stair(2,true));
    }
    fit(2*s,17,18,body,'gallery','consolo-do-alpendre','dark_oak_stairs',stair(2,true));
    fit(2*s,16,18,body,'gallery','ombro-do-consolo','spruce_trapdoor',leaf(3,true));
    for(const z of [18,19])fit(2*s,18,z,body,'gallery','cachorro-do-alpendre','spruce_log',axis('z'));
    fit(s*7,17,19,body,'gallery','luz-do-vão','lantern',{hanging:true});
    fit(s*7,18,19,body,'gallery','gancho-do-vão','iron_chain',axis('y'));
  }
  for(let x=-3;x<=3;x++){
    fit(x,18,17,body,'gallery','aba-sobre-a-entrada',Math.abs(x)===3?'deepslate_brick_stairs':'dark_oak_slab',Math.abs(x)===3?stair(x>0?1:0,true):slab('top'));
    fit(x,18,18,body,'gallery','verga-do-alpendre','dark_oak_log',axis('x'));
    if(Math.abs(x)<=1)fit(x,13,18,body,'gallery','degrau-da-câmara','spruce_stairs',stair(2));
  }

  // A jagged break runs from the starboard side into the deck, leaving the
  // station-10 beam and attached frame in place. Both bodies keep their old ownership.
  for(const [z,first,last] of [[6,13,15],[7,11,15],[8,9,15],[9,8,15],[10,10,14],[11,11,13]]){
    for(let x=first;x<=last;x++){
      for(const y of [12,13]){
        const b=at(x,y,z);
        if(b&&['deck','skin','bands'].includes(b.module))remove(b);
      }
    }
    const edge=at(first-1,12,z);
    if(edge?.module==='deck')fit(edge.x,12,z,edge,'deck','tábua-estilhaçada',z%2?'spruce_stairs':'spruce_slab',z%2?stair(1):slab('top'));
    if(z>=7&&z<=9)for(let y=10;y<=11;y++)for(let x=13;x<=15;x++){
      const b=at(x,y,z);
      if(b?.module==='skin')remove(b);
    }
  }
  // These three split ends belonged to the mobile panel but lost their last
  // bearing in the break. They have fallen away from the surviving section.
  for(const [x,z] of [[11,6],[12,6],[9,10]]){
    const b=at(x,12,z);
    if(b?.piece==='panel' && b.module==='deck')remove(b);
  }
  // A sprung ledge still bears on the deck at its intact end. The two visible
  // ends of the plank and the torn hatch leaf all point along the fracture.
  for(const [x,z] of [[-1,5],[-2,5],[-2,6]]){
    const b=at(x,12,z);if(b?.component==='grade-embutida')remove(b);
  }
  fit(-2,13,6,body,'hatch','folha-dobrada','trapdoor',leaf(0,true));
  fit(-3,13,6,body,'hatch','dobradiça-da-folha','stripped_spruce_log',axis('z'));
  // Port-side belaying rail and a recovered spar on timber chocks. The aisle
  // on the open side of the service barrels stays clear.
  for(const z of [6,11]){
    fit(-11,13,z,body,'tackle','pé-do-cabide','dark_oak_log',axis('y'));
    fit(-11,14,z,body,'tackle','cabeço-do-cabide','stripped_spruce_log',axis('y'));
  }
  for(let z=7;z<=10;z++)fit(-11,14,z,body,'tackle','cabide-de-amarração','spruce_slab',slab());
  fit(-11,13,8,body,'tackle','elo-pendente','iron_chain',axis('y'));
  for(let z=13;z<=17;z++){
    if(z===13||z===17)fit(-10,13,z,body,'tackle','berço-da-verga','dark_oak_stairs',stair(1));
    fit(-10,14,z,body,'tackle','verga-recolhida','spruce_log',axis('z'));
  }

  // Frame the existing side-light in each quarter. Leave a slit behind the
  // inclined knees and return the same sill around the corner onto the transom.
  for(const s of [-1,1]){
    for(let z=20;z<=23;z++){
      if(z===22)continue;
      fit(s*10,15,z,body,'gallery','peitoril-de-alheta','spruce_stairs',stair(s>0?1:0,true));
      fit(s*10,18,z,body,'gallery','verga-de-alheta','dark_oak_stairs',stair(z===20?2:3,true));
      if(z===21||z===23)fit(s*9,16,z,body,'gallery','veneziana-de-alheta','spruce_trapdoor',leaf(s>0?0:1,true));
    }
  }

  // Break the old full-width overhang into the heads of the window bays.
  // A recessed grey timber carries the drip edge. Only its ends are capped.
  for(let x=-10;x<=10;x++){
    const a=Math.abs(x),front=lip(x)-1;
    const pier=[0,5,9].includes(a);
    const oldFrieze=at(x,18,front);
    if(oldFrieze?.component==='friso-do-espelho-5'){
      if(pier){
        fit(x,18,front,oldFrieze,'carving','ábaco-da-pilastra','polished_blackstone_brick_stairs',stair(3,true));
      }else if([1,4,6,8,10].includes(a)){
        fit(x,18,front,oldFrieze,'carving','orelha-chanfrada','spruce_stairs',stair([1,6].includes(a)===(x>0)?1:0,true));
      }else remove(oldFrieze);
    }
    const edge=at(x,19,front), backing=at(x,19,front-1);
    if(backing?.component==='travessa-galeria-6')fit(x,19,front-1,backing,'gallery','testeira-cinzenta','spruce_log',axis('x'));
    if(edge?.component==='friso-do-espelho-6'){
      const cap=[0,9].includes(a);
      fit(x,19,front,edge,'carving','lábio-da-cornija',cap?'deepslate_brick_slab':'polished_blackstone_brick_slab',slab('top'));
    }
    // The narrow mullion divides the bay behind its outer reveal. The head
    // above the adjacent light is pierced and stands free of the balcony rail.
    if(a===2||a===7){
      for(const y of [16,17])fit(x,y,front-2,body,'gallery','mainel-da-janela','spruce_fence',{});
    }else if(a===3){
      fit(x,17,front-3,body,'gallery','bandeira-vazada','trapdoor',leaf(2,true));
    }
    if(pier && a<9)fit(x,16,lip(x),body,'balcony','capa-do-pilarete','dark_oak_slab',slab());
  }

  // On the deck-facing side of the existing crest, notch the timber around
  // a pair of spreading wings. The end-grain boss, sloping feathers, pierced
  // pockets and split foot have different depths and catch daylight above the door.
  for(let x=-7;x<=7;x++){
    const a=Math.abs(x),face=26-Math.floor(a*a/37);
    const front=face-1, dir=x<0?1:0;
    if(a===0){
      fit(x,20,face,body,'carving','pé-do-escudo','spruce_log',axis('y'));
      fit(x,21,front,body,'carving','selo-da-andorinha','stripped_spruce_log',axis('z'));
      fit(x,22,front,body,'carving','capuz-do-escudo','deepslate_brick_slab',slab());
    }else if(a<=2){
      fit(x,21,face,body,'carving','encaixe-da-asa','dark_oak_stairs',stair(dir,true));
      fit(x,20,front,body,'carving','pena-inferior','spruce_stairs',stair(dir,true));
    }else if(a<=4){
      fit(x,21,face,body,'carving','asa-entalhada','spruce_stairs',stair(dir));
      fit(x,20,face,body,'carving','vão-sob-a-asa','dark_oak_trapdoor',leaf(2,true));
      if(a===3)fit(x,21,front,body,'carving','capa-da-asa','deepslate_brick_slab',slab());
    }else{
      fit(x,20,face,body,'carving','remate-da-asa','spruce_stairs',stair(dir));
      if(a===5)fit(x,20,front,body,'carving','cunha-da-asa','stripped_spruce_log',axis('z'));
    }
  }
  // Cut a swallow-shaped cartouche into the face of the existing crown.
  // The crest uses the same ridge cells. A dark recessed backing is visible in the cut.
  for(let x=-7;x<=7;x++){
    const a=Math.abs(x),z=28-Math.floor(x*x/37);
    const y=a<=1?22:a<=4?21:20;
    const b=at(x,y,z);if(!b||b.module!=='carving')continue;
    fit(x,y,z,b,'carving','asa-do-cartucho',a===0?'polished_blackstone_brick_slab':'oak_stairs',a===0?slab():stair(x<0?1:0,true));
    const front=at(x,y-1,z);
    if(front?.module==='carving'&&a>=2&&a<=6)remove(front);
    if(a===3||a===5)fit(x,y-1,z-1,body,'carving','fundo-entalhado','dark_oak_trapdoor',leaf(3,true));
  }
  for(const b of cells.values()){
    if(b.id===id('spruce_fence')){
      for(const [d,dx,dz] of [['north',0,-1],['east',1,0],['south',0,1],['west',-1,0]]){
        const n=at(b.x+dx,b.y,b.z+dz);
        b.states['minecraft:connection_'+d]=!!n&&['cube','log','naval-fence','naval-barrel'].includes(sternCatalog[n.id].shape);
      }
    }
  }
}
export const fjordStern={apply:refine,modules:workModules,palette,canonicalId:'andorinha-v18-carpintaria',version:'0.3-revisao-v18',project:'andorinha-carpintaria',source:'/andorinha-carpintaria/intact.json'};
