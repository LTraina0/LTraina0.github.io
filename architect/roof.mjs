import {boundsOf, directions, inventory, key} from './model.mjs';

export const palettes={
  slate:{label:'Ardósia e cobre oxidado',tile:'deepslate_bricks',stair:'deepslate_brick_stairs',slab:'deepslate_brick_slab',ridge:'waxed_oxidized_cut_copper'},
  basalt:{label:'Pedra-negra e cobre',tile:'polished_blackstone_bricks',stair:'polished_blackstone_brick_stairs',slab:'polished_blackstone_brick_slab',ridge:'waxed_cut_copper'}
};
export const defaultParams={halfWidth:10,halfLength:14,pitch:0.75,lift:1,palette:'slate'};
export const modules=[
  {id:'posts',label:'Pilares de mangue',stage:0},
  {id:'beams',label:'Vigas de amarração',stage:1},
  {id:'brackets',label:'Conjuntos de consolos',stage:2},
  {id:'gables',label:'Frontões de bambu',stage:3},
  {id:'skin',label:'Quatro águas e beirais',stage:4},
  {id:'ridge',label:'Cumeeira e remates',stage:5}
];
const stair=(direction,inverted=false,corner='none')=>({weirdo_direction:direction,upside_down_bit:inverted,'minecraft:corner':corner});
const bottom={'minecraft:vertical_half':'bottom'};
function parameters(input) {
  const p={...defaultParams,...input};
  if(Object.keys(input).some(k=>!Object.hasOwn(defaultParams,k))) throw Error('Parâmetro desconhecido');
  for(const [v,min,max] of [[p.halfWidth,8,20],[p.halfLength,p.halfWidth,32]]) {
    if(!Number.isInteger(v)||v<min||v>max) throw Error('Dimensões fora do intervalo');
  }
  if(!Number.isFinite(p.pitch)||p.pitch<0.5||p.pitch>1 || !Number.isFinite(p.lift)||p.lift<0||p.lift>2 || !Object.hasOwn(palettes,p.palette)) throw Error('Perfil ou paleta inválidos');
  return p;
}

// Hip-and-gable roof. The hip ends three courses in from the eave.
// Height is measured in half blocks so each course can select its native shape.
function elevation(p,dx,dz) {
  const inset=dz<3?Math.min(dx,dz):dx;
  const corner=Math.max(0,1-dx/6.5)*Math.max(0,1-dz/7);
  const t=inset/p.halfWidth;
  return 8 + p.pitch * p.halfWidth * (0.38*t+0.62*t*t) + p.lift*corner**1.35;
}
export function roofColumn(p,x,z) {
  const dx=p.halfWidth-Math.abs(x), dz=p.halfLength-Math.abs(z);
  const height=elevation(p,dx,dz);
  const halves=Math.round(2*height), y=Math.floor(halves/2);
  const end=dz<3 && dz<dx;
  let direction=end?(z<0?2:3):(x<0?0:1);
  // At a swept corner the pitch reverses. Keep the raised quarter on the
  // high side of the local course instead of pointing every stair at the ridge.
  const hipCorner=dx===dz && dz<3;
  const inward=hipCorner?elevation(p,dx+.1,dz+.1):
    end?elevation(p,dx,dz+.1):elevation(p,dx+.1,dz);
  const reversed=inward<height;
  if(reversed) direction^=1;
  let cornerState='none';
  if(hipCorner){
    const [a]=directions[direction];
    const cross=(z<0?1:-1)*(reversed?-1:1);
    cornerState=cross*(-a)>0?'outer_left':'outer_right';
  }
  // A plateau uses a full tile. Repeating stairs across a quantized plateau
  // would cut a row of teeth into an otherwise continuous eave.
  const [a,b]=directions[direction];
  const lowDx=p.halfWidth-Math.abs(x-a),lowDz=p.halfLength-Math.abs(z-b);
  const lower=Math.round(2*elevation(p,lowDx,lowDz));
  const cap=halves%2===0?'slab':lower<halves?'stair':'tile';
  return {y,cap,direction,cornerState};
}

export function generateRoof(input={}) {
  const p=parameters(input), w=p.halfWidth,l=p.halfLength, finish=palettes[p.palette];
  const sx=w-3,sz=l-4, gableZ=l-3;
  const cells=new Map();
  function soffit(x,z){
    const ys=[roofColumn(p,x,z).y-1];
    for(const [a,b] of directions){
      const nx=x+a,nz=z+b;
      if(Math.abs(nx)>w || Math.abs(nz)>l) continue;
      if(b && Math.abs(x)<sx && (Math.abs(z)<=gableZ)!==(Math.abs(nz)<=gableZ)) continue;
      ys.push(roofColumn(p,nx,nz).y);
    }
    return Math.min(...ys);
  }
  function put(x,y,z,short,states,module) {
    const pos=key(x,y,z);
    if(cells.has(pos)) throw Error('Interseção em '+pos+' entre '+cells.get(pos).module+' e '+module);
    cells.set(pos,{x,y,z,id:'minecraft:'+short,states,module});
  }
  const stations=sz<5?[-sz,sz]:[-sz,0,sz];
  for(const x of [-sx,sx]) for(const z of stations) {
    for(let y=0;y<=3;y++) put(x,y,z,'stripped_mangrove_log',{pillar_axis:'y'},'posts');
  }
  // One joint belongs to the through-beam; the perpendicular beam stops at its cheek.
  for(const x of [-sx,sx]) for(let z=-sz-1;z<=sz+1;z++) put(x,4,z,'stripped_mangrove_log',{pillar_axis:'z'},'beams');
  for(const z of stations) for(let x=-sx+1;x<sx;x++) put(x,4,z,'stripped_mangrove_log',{pillar_axis:'x'},'beams');
  for(const x of [-sx,sx]) for(const z of stations) {
    for(let y=5;y<=6;y++){
      put(x,y,z,'mangrove_planks',{},'brackets');
      for(const [i,[a,b]] of directions.entries()) {
        const run=y-4;
        for(let d=1;d<=run;d++){
          put(x+a*d,y,z+b*d,d===run?'mangrove_stairs':'mangrove_planks',
            d===run?stair(i^1,true):{},'brackets');
        }
      }
    }
    // Crown seats link the bracket stack to the underside of the selected pitch.
    const seat=soffit(x,z);
    for(let y=7;y<seat;y++) put(x,y,z,'mangrove_planks',{},'brackets');
  }
  const gableBase=roofColumn(p,0,gableZ+1).y;
  for(const sign of [-1,1]) {
    const z=sign*gableZ;
    // A king post carries the gable sill back to the transverse tie. This
    // also makes both panels buildable before the roof skin is placed.
    for(let y=5;y<=gableBase;y++) put(0,y,sign*sz,'stripped_mangrove_log',{pillar_axis:'y'},'beams');
    for(let x=-sx;x<=sx;x++){
      const underside=soffit(x,z);
      for(let y=gableBase;y<underside;y++) {
        const frame=y===gableBase || x%4===0;
        put(x,y,z,frame?'stripped_mangrove_log':'bamboo_planks',
          frame?{pillar_axis:y===gableBase?'x':'y'}:{},'gables');
      }
      if (Math.abs(x)%2===0 && underside>=gableBase+2) {
        put(x,underside-1,z+sign,'bamboo_trapdoor',{open_bit:true,upside_down_bit:false,direction:sign===1?2:3},'gables');
      }
    }
  }
  for(let x=-w;x<=w;x++) for(let z=-l;z<=l;z++){
    const c=roofColumn(p,x,z);
    // Extend the soffit down to meet the lower hip course at the gable break.
    // Gable panels already close the end wall. The outer roof gets one solid backing course.
    const bargeboard=Math.abs(z)===gableZ && Math.abs(x)<sx;
    for(let y=soffit(x,z);y<c.y;y++) put(x,y,z,bargeboard?'mangrove_planks':finish.tile,{},'skin');
    const ridge=x===0 && Math.abs(z)<=gableZ;
    if(ridge) {
      put(x,c.y,z,finish.ridge,{},'ridge');
      if(Math.abs(z)===gableZ) {
        put(x,c.y+1,z,'waxed_oxidized_cut_copper_stairs',stair(z>0?2:3),'ridge');
      } else if(Math.abs(z)===gableZ-1){
        put(x,c.y+1,z,'waxed_oxidized_cut_copper_slab',bottom,'ridge');
      }
    } else {
      const states=c.cap==='stair'?stair(c.direction,false,c.cornerState):c.cap==='slab'?bottom:{};
      put(x,c.y,z,finish[c.cap],states,'skin');
    }
  }
  const stages=Object.fromEntries(modules.map(m=>[m.id,m.stage]));
  const blocks=[...cells.values()].sort((a,b)=>stages[a.module]-stages[b.module]||a.y-b.y||a.z-b.z||a.x-b.x);
  return {schema:1,project:'telhado-oriental',version:'0.1.0',bedrockSamples:'v1.26.60.5',
    design:'Composição autoral de quatro águas com frontões em duas extremidades',params:p,modules,
    joints:[['posts','beams'],['beams','brackets'],['beams','gables'],['brackets','skin'],['gables','skin'],['skin','ridge']],
    bounds:boundsOf(blocks),materials:inventory(blocks),blocks};
}
