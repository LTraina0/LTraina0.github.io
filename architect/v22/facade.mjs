import {generateFacade as baselineFacade} from '../v21/facade.mjs';
import {generateGeometry} from '../v2/geometry.mjs';
import {composeComponent} from '../v21/components.mjs';
import {applyArchitecturalPalette} from '../v21/contextual-palette.mjs';
import {placeKit,kitRegistry,transformKitBlock} from '../v2/kit.mjs';
import {catalog,validateModel} from '../v2/laboratory.mjs';
import {boundsOf,inventory,key,transformBlock} from '../model.mjs';
import {coversFace} from '../architectural-validation.mjs';
import {kitVolume} from '../v2/kit-shapes.mjs';

export function generateRefinedFacade({bracketStyle='balanced',capital='timber',palette='mineral',layers=3,thickness=1,rise=8}={}){
  if(!['balanced','fan'].includes(bracketStyle)||!['timber','anvil'].includes(capital)||
    !Number.isInteger(layers)||layers<1||layers>3||!Number.isInteger(thickness)||thickness<1||thickness>2)throw Error('Composição desconhecida');
  const baseline=baselineFacade({edition:'B'}),cells=new Map(),components=[],sections=[];
  for(const c of baseline.components.filter(c=>['opening','cornice'].includes(c.libraryId)))
    components.push({...c,origin:c.libraryId==='opening'?[c.origin[0],c.origin[1],c.origin[2]+1]:[...c.origin]});
  const datums={floor:2,wallTop:10,tieTop:11,capitalBase:7,bracketBase:11,
    roofDatum:10+layers+thickness+2,layers,thickness};
  const roof=generateGeometry({...baseline.params.roof,rise,thickness,bracketLayers:layers,bracketStyle,sealGables:true,datum:datums.roofDatum-6});
  const turn=b=>Object.hasOwn(kitRegistry,b.id)?transformKitBlock(b,{turns:2}):transformBlock(b,{turns:2},catalog);
  function add(b){
    const k=key(b.x,b.y,b.z);
    if(cells.has(k))throw Error('Sobreposição em '+k+' '+cells.get(k).module+'/'+b.module);
    cells.set(k,b);
  }
  function put(module,x,y,z,id,states={},role='structure',extra={}){add({x,y,z,id:'minecraft:'+id,states,module,role,...extra});}
  function joinBeam(x,y,z,axis){
    const prior=cells.get(key(x,y,z));
    if(prior){
      if(prior.module!=='beams'||!coversFace(kitVolume(catalog[prior.id].shape,prior.states),[0,1,0]))throw Error('Encaixe de verga incompatível');
      return;
    }
    put('beams',x,y,z,'stripped_mangrove_log',{pillar_axis:axis});
  }
  for(const b of roof.blocks)if(b.module!=='posts'){
    const moved=turn({...b,y:b.y+6});
    add({...moved,role:b.module==='skin'?'roof':b.module==='gables'?'ornament':'structure'});
  }
  for(const b of baseline.blocks)if(['base','walls','opening','balustrade','cornice'].includes(b.module)){
    // The entrance projects forward; the rear wall retreats two cells.
    const moved={...b,z:b.module==='opening'?b.z+1:b.module==='walls'&&b.z<=-3?b.z-2:b.z};
    if(moved.module==='walls'&&moved.z===-5&&Math.abs(moved.x)===8&&moved.y>=8)continue;
    const {appearance,...clean}=moved;
    add(clean);
  }
  for(const x of [-9,9])for(const z of [-5,5]){
    for(let y=datums.floor;y<datums.capitalBase;y++)put('posts',x,y,z,'stripped_mangrove_log',{pillar_axis:'y'});
    const piece=composeComponent('capital',{origin:[x,datums.capitalBase,z],capital});
    for(const b of piece.blocks)add(b);
    components.push({libraryId:'capital',origin:piece.origin,material:capital,evidence:capital==='anvil'?'experimental-java-dimensional-reference':'bedrock-states-and-canonical-shapes; in-game-pending'});
  }
  for(const x of [-8,8])for(const z of [-4,-3])for(let y=2;y<datums.wallTop;y++)
    put('walls',x,y,z,'calcite',{},'wall');
  for(const z of [3,-6])for(let x=-8;x<=8;x++)joinBeam(x,datums.wallTop,z,'x');
  for(const x of [-8,8])for(let z=-5;z<=2;z++)joinBeam(x,datums.wallTop,z,'z');
  const footprints=[];
  for(const z of [3,-6])for(let x=-8;x<=8;x++)footprints.push({x,z,normal:[0,0,z>0?1:-1]});
  for(const x of [-8,8])for(let z=-5;z<=2;z++)footprints.push({x,z,normal:[Math.sign(x),0,0]});
  for(const f of footprints){
    const ceiling=Math.min(...[...cells.values()].filter(b=>b.x===f.x&&b.z===f.z&&['skin','gables'].includes(b.module)).map(b=>b.y));
    if(!Number.isFinite(ceiling)||ceiling<datums.tieTop)throw Error('Cobertura sem encontro de parede');
    const section={...f,from:datums.wallTop,to:ceiling,kind:'upper-envelope',intent:'clerestory-with-timber-frame'};
    sections.push(section);
    for(let y=datums.tieTop;y<ceiling;y++){
      const existing=cells.get(key(f.x,y,f.z));
      if(existing){
        if(!['beams','brackets','cornice'].includes(existing.module)||!coversFace(kitVolume(catalog[existing.id].shape,existing.states),f.normal))
          throw Error('Seção ocupada por encaixe incompatível '+key(f.x,y,f.z));
        continue;
      }
      const rhythm=f.normal[0]?Math.abs(f.z)%3:Math.abs(f.x)%3;
      const corner=Math.abs(f.x)===8&&(f.z===3||f.z===-6);
      const frame=y===datums.tieTop||y===ceiling-1||rhythm===0;
      if(corner)put('upperEnvelope',f.x,y,f.z,'stripped_mangrove_log',{pillar_axis:'y'},'structure',{component:'clerestory-corner',structuralRole:'corner-post'});
      else if(frame)put('upperEnvelope',f.x,y,f.z,'mangrove_planks',{},'wall',{component:'clerestory-frame',structuralRole:'envelope'});
      else put('upperEnvelope',f.x,y,f.z,'bamboo_trapdoor',{direction:f.normal[2]===1?3:f.normal[2]===-1?2:f.normal[0]===1?1:0,open_bit:true,upside_down_bit:false},'window',
        {component:'clerestory-lattice',intentionalOpening:'transparent-window',placement:'temporary support may be required; bedrock pending'});
    }
  }
  for(const socket of roof.kitSockets){
    const origin=[-socket.x||0,socket.y+6,-socket.z||0];
    if(capital==='anvil'){
      const piece=placeKit('finial',{origin,variation:'mineral'});
      for(const b of piece.blocks)add({...b,module:'finials',role:'crest'});
    }else{
      put('finials',...origin,'waxed_oxidized_cut_copper',{},'crest');
      put('finials',origin[0],origin[1]+1,origin[2],'waxed_oxidized_cut_copper_slab',{'minecraft:vertical_half':'bottom'},'crest');
    }
    components.push({libraryId:'ridge-terminal',origin,evidence:capital==='anvil'?'experimental':'canonical-shapes; in-game-pending'});
  }
  const ids=[
    ['base','Embasamento'],['posts','Pilares'],['capital','Capitéis'],['walls','Paredes e janelas'],
    ['opening','Acesso projetado'],['beams','Travessas compartilhadas'],['cornice','Cornija'],['balustrade','Muretas ornamentais'],
    ['brackets','Consolos compostos'],['upperEnvelope','Fechamento superior e treliças'],['gables','Frontão e fiada de encontro'],
    ['skin','Cobertura'],['ridge','Cumeeira'],['finials','Remates']
  ];
  const modules=ids.map(([id,label],stage)=>({id,label,stage})).filter(m=>[...cells.values()].some(b=>b.module===m.id));
  const rank=new Map(modules.map(m=>[m.id,m.stage]));
  const blocks=[...cells.values()].sort((a,b)=>rank.get(a.module)-rank.get(b.module)||a.y-b.y||a.z-b.z||a.x-b.x);
  const model={schema:1,project:'fachada-refinada',version:'0.2.2',bedrockSamples:baseline.bedrockSamples,params:{bracketStyle,capital,palette,layers,thickness,rise,roof:roof.params},
    modules,components,blocks,bounds:boundsOf(blocks),materials:inventory(blocks),datums,
    architecture:{sections,designBasis:{x:[1,0,0],z:[0,0,1]},gableJoints:blocks.filter(b=>b.structuralRole==='gable-apron').map(b=>({
      apron:[b.x,b.y,b.z],gable:[b.x,b.y+1,b.z],roof:[b.x,b.y,b.z+Math.sign(b.z)],normal:[0,0,Math.sign(b.z)]})),
      clearance:[{id:'central-entry',min:[-2,2,-4],max:[3,5,7],intent:'entrance-and-ground-floor-interior'}],
      muretas:'ornamental-framing',envelope:'ground-floor-clerestory',intentionalOpenings:['central-entry','transparent-window']},
    validation:{game:'pending',geometry:'solid-face-sections-and-clearance',states:'bedrock-samples-v1.26.60.5'}};
  const result=applyArchitecturalPalette(model,{palette});
  validateModel(result);
  return result;
}
