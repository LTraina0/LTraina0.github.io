import {generateGeometry,validateGeometry} from '../v2/geometry.mjs';
import {catalog,validateModel} from '../v2/laboratory.mjs';
import {placeKit,transformKitBlock,kitRegistry} from '../v2/kit.mjs';
import {key,boundsOf,inventory,transformBlock} from '../model.mjs';
import {composeComponent} from './components.mjs';
import {applyContextualPalette} from './contextual-palette.mjs';

export const editions={A:'A · Tradicional',B:'B · Ornamental',C:'C · Experimental'};
const stair=(d,up=false)=>({weirdo_direction:d,upside_down_bit:up,'minecraft:corner':'none'});
const stages=[
  ['base','Embasamento e assoalho'],['posts','Pilares'],['beams','Travessas e vergas'],['walls','Parede e janelas recuadas'],
  ['opening','Kit · Abertura ornamentada'],['capital','Kit · Capitéis compostos'],['cornice','Kit · Cornija tridimensional'],
  ['balustrade','Balaustradas'],['brackets','Consolos compostos'],['gables','Frontão tridimensional'],
  ['skin','Águas e beirais'],['ridge','Cumeeira e transição'],['finials','Remates']
];
export function generateFacade({edition='B',distribution='contextual'}={}){
  if(!Object.hasOwn(editions,edition))throw Error('Edição desconhecida');
  const rich=edition!=='A',cells=new Map(),components=[];
  const roof=generateGeometry({family:'irimoya',width:25,length:17,rise:8,profile:'swept',curve:rich?.85:.65,lift:rich?2.4:1.5,
    bracketLayers:rich?3:2,bracketDepth:3,bracketWidth:1,supports:2,overhang:3,gableFraction:.7,ornament:rich?'carved':'plain'});
  validateGeometry(roof);
  function add(b){
    const pos=key(b.x,b.y,b.z);
    if(cells.has(pos))throw Error('Conflito de composição '+pos+' '+cells.get(pos).module+'/'+b.module);
    cells.set(pos,b);
  }
  function put(module,x,y,z,id,states={},role,component){add({x,y,z,id:'minecraft:'+id,states,module,...(role?{role}:{}),...(component?{component}:{})});}
  for(const b of roof.blocks){
    // Capitals occupy the top three cells of each column, beneath existing ties.
    if(rich&&b.module==='posts'&&b.y>=1)continue;
    add({...b,y:b.y+6,...(b.module==='skin'?{role:'roof'}:b.module==='gables'?{role:'ornament'}:{})});
  }
  for(let x=-10;x<=10;x++)for(let z=-6;z<=6;z++){
    put('base',x,0,z,'polished_blackstone_bricks',{},'foundation');
    put('base',x,1,z,'mangrove_planks',{},'floor');
  }
  for(const x of [-9,9])for(const z of [-5,5]){
    for(let y=2;y<6;y++)put('posts',x,y,z,'stripped_mangrove_log',{pillar_axis:'y'},'structure');
    if(rich)attach('capital',[x,7,z],{rich:true});
  }
  // Two side lights flank a central entrance. The reveal is two cells deep.
  for(const z of [-3,-2,3,4])for(let x=-8;x<=8;x++)for(let y=2;y<=9;y++){
    const sideWindow=Math.abs(x)>=4&&Math.abs(x)<=7&&y>=4&&y<=7;
    const entry=Math.abs(x)<=3;
    if((z<0&&entry)||sideWindow)continue;
    put('walls',x,y,z,'calcite',{},'wall');
  }
  for(const x of [-8,8])for(let z=-1;z<=2;z++)for(let y=2;y<=9;y++)put('walls',x,y,z,'calcite',{},'wall');
  // A closed leaf spans a real horizontal cell; an open leaf forms the vertical lattice.
  for(const sign of [-1,1])for(const x of [-7,-6,-5,-4,4,5,6,7]){
    const z=sign<0?-2:3;
    for(let y=4;y<=7;y++)put('walls',x,y,z,'bamboo_trapdoor',{direction:sign<0?3:2,open_bit:true,upside_down_bit:false},'window');
  }
  if(rich)attach('opening',[0,2,-3],{rich:true});
  else{
    for(const x of [-3,3])for(let y=2;y<=9;y++)put('opening',x,y,-3,'stripped_mangrove_log',{pillar_axis:'y'},'structure','opening');
    for(let x=-2;x<=2;x++)put('opening',x,9,-3,'stripped_mangrove_log',{pillar_axis:'x'},'structure','opening');
  }
  for(const z of [-3,4])for(let x=-8;x<=8;x++){
    const bearing=cells.get(key(x,10,z));
    if(x===0&&bearing?.module==='beams')continue;
    put('beams',x,10,z,'stripped_mangrove_log',{pillar_axis:'x'},'structure');
  }
  if(rich)attach('cornice',[0,10,-3],{rich:true},b=>b.z!==-3&&!(b.x===0&&cells.get(key(b.x,b.y,b.z))?.module==='beams'));
  for(const side of [-1,1])for(let x=4;x<=8;x++){
    const px=side*x;
    put('balustrade',px,2,-6,'polished_blackstone_brick_wall',{wall_post_bit:true,
      wall_connection_type_east:x===8&&side>0||x===4&&side<0?'none':'short',
      wall_connection_type_west:x===4&&side>0||x===8&&side<0?'none':'short',
      wall_connection_type_north:'none',wall_connection_type_south:'none'},'balustrade');
    put('balustrade',px,3,-6,'polished_blackstone_brick_slab',{'minecraft:vertical_half':'bottom'},'balustrade');
  }
  // An extra plane on the gable carries ribs, connected to its backing.
  if(rich){
    const gables=roof.blocks.filter(b=>b.module==='gables');
    const front=Math.min(...gables.map(b=>b.z));
    for(const b of gables.filter(b=>b.z===front+1&&b.x!==0&&Math.abs(b.x)%3===0)){
      const pos=key(b.x,b.y+6,front);
      if(!cells.has(pos))put('gables',b.x,b.y+6,front,'mangrove_stairs',stair(2,true),'ornament','gable-ribs');
    }
    for(const socket of roof.kitSockets){
      const origin=[socket.x,socket.y+6,socket.z],kit=placeKit('finial',{origin,variation:'mineral'});
      for(const b of kit.blocks)add({...b,module:'finials',role:'crest',component:socket.id});
      components.push({libraryId:'finial',origin,evidence:'bedrock-in-game-pending'});
    }
  }
  function attach(name,origin,options={},filter=()=>true){
    const piece=composeComponent(name,{origin,...options});
    for(const b of piece.blocks.filter(filter))add(b);
    const {blocks:partBlocks,...metadata}=piece;
    components.push(metadata);
  }
  const modules=stages.filter(([id])=>[...cells.values()].some(b=>b.module===id)).map(([id,label],stage)=>({id,label,stage}));
  // Capitals form the bearing seat before the original transverse beams are installed.
  if(rich){const cap=modules.find(m=>m.id==='capital'),beam=modules.find(m=>m.id==='beams');[cap.stage,beam.stage]=[beam.stage,cap.stage];}
  const rank=new Map(modules.map(m=>[m.id,m.stage]));
  const facing=b=>Object.hasOwn(kitRegistry,b.id)?transformKitBlock(b,{turns:2}):transformBlock(b,{turns:2},catalog);
  const blocks=[...cells.values()].map(facing).sort((a,b)=>rank.get(a.module)-rank.get(b.module)||a.y-b.y||a.z-b.z||a.x-b.x);
  for(const c of components)c.origin=[-c.origin[0]||0,c.origin[1],-c.origin[2]||0];
  const model=applyContextualPalette({schema:1,version:'0.2.1',project:'fachada-oriental',studyId:'facade-'+edition,studyLabel:editions[edition],
    params:{edition,distribution,roof:roof.params},modules:modules.sort((a,b)=>a.stage-b.stage),blocks,bounds:boundsOf(blocks),materials:inventory(blocks),components,
    bedrockSamples:'v1.26.60.5',validation:{game:'pending',geometry:'preview-volume-contact',states:'bedrock-samples-v1.26.60.5'}},{edition,mode:distribution});
  validateModel(model);
  return model;
}
