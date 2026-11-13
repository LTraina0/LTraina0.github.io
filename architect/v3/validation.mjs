import {kitVolume} from '../v2/kit-shapes.mjs';
import {key} from '../model.mjs';
import {navalMaterialDecision} from './naval-palette.mjs';
import {coversFace} from '../architectural-validation.mjs';

export function auditNaval(model,catalog){
 const at=new Map(model.blocks.map(b=>[key(b.x,b.y,b.z),b])),issues=[],cache=new Map();
 const boxes=b=>{const k=b.id+JSON.stringify(b.states);if(!cache.has(k))cache.set(k,kitVolume(catalog[b.id].shape,b.states));return cache.get(k);};
 const intersect=(a,b)=>[0,1,2].every(i=>Math.min(a[i+3],b[i+3])-Math.max(a[i],b[i])>1e-6);
 const world=b=>boxes(b).map(v=>v.map((n,i)=>n/16+b[['x','y','z'][i%3]]));
 function near(min,max){
  const rows=[];for(let x=Math.floor(min[0]);x<=Math.floor(max[0]);x++)for(let y=Math.floor(min[1]);y<=Math.floor(max[1]);y++)for(let z=Math.floor(min[2]);z<=Math.floor(max[2]);z++){
   const b=at.get(key(x,y,z));if(b)rows.push(...world(b));
  }return rows;
 }
 for(const b of model.blocks){
  for(const box of boxes(b))if(box.some(n=>!Number.isFinite(n)||n<0||n>16))issues.push({code:'shape-outside-cell',at:[b.x,b.y,b.z]});
  const a=b.appearance;
  if(!a||a.context.role!==b.role||a.context.wet!==(b.y<=4)||a.context.finish!==model.params.finish){issues.push({code:'material-context',at:[b.x,b.y,b.z]});continue;}
  const d=navalMaterialDecision(a.inputId,catalog[a.inputId].shape,a.context);
  if(d.id!==b.id||a.selected!==b.id||d.ruleId!==a.ruleId||d.rule!==a.rule||catalog[d.id].shape!==catalog[a.inputId].shape)issues.push({code:'material-reason',at:[b.x,b.y,b.z]});
  if(b.id==='minecraft:spruce_door'){
   const other=at.get(key(b.x,b.y+(b.states.upper_block_bit?-1:1),b.z));
   if(other?.id!==b.id||['door_hinge_bit','minecraft:cardinal_direction','open_bit'].some(k=>other.states[k]!==b.states[k])||other.states.upper_block_bit===b.states.upper_block_bit)issues.push({code:'door-pair',at:[b.x,b.y,b.z]});
  }
  if(b.role==='storage'){
   const d=[[0,-1,0],[0,1,0],[0,0,-1],[0,0,1],[-1,0,0],[1,0,0]][b.states.facing_direction];
   const next=at.get(key(b.x+d[0],b.y+d[1],b.z+d[2]));
   if(next&&!['context','walkways'].includes(next.module))issues.push({code:'storage-face-blocked',at:[b.x,b.y,b.z]});
  }
 }
 for(const[name,points]of Object.entries(model.naval.routes))for(const p of points){
  const low=[p.x-.3,p.y-.6,p.z-.3],high=[p.x+.3,p.y+.6,p.z+.3],nearby=near(low,[high[0],p.y+2.4,high[2]]);
  const support=nearby.filter(b=>b[4]<=p.y+.600001&&b[4]>=p.y-.600001&&Math.min(high[0],b[3])>Math.max(low[0],b[0])&&Math.min(high[2],b[5])>Math.max(low[2],b[2]));
  if(!support.length){issues.push({code:'route-unsupported',route:name,at:[p.x,p.y,p.z]});continue;}
  const feet=Math.max(p.y,...support.map(b=>b[4])),body=[p.x-.3,feet+1e-5,p.z-.3,p.x+.3,feet+1.8,p.z+.3];
  if(nearby.some(b=>intersect(body,b)))issues.push({code:'route-obstructed',route:name,at:[p.x,p.y,p.z]});
 }
 const bed=model.naval.cabin.reservedBed;
 const cabin=model.naval.cabin;
 for(let x=cabin.interior.min[0];x<cabin.interior.max[0];x++)for(let z=cabin.interior.min[2];z<cabin.interior.max[2];z++){
  const roof=at.get(key(x,cabin.ceiling,z));
  if(!roof||!coversFace(boxes(roof),[0,-1,0]))issues.push({code:'cabin-roof-gap',at:[x,cabin.ceiling,z]});
 }
 if(near(bed.min,bed.max).some(b=>intersect([...bed.min,...bed.max],b)))issues.push({code:'reserved-bed-obstructed',at:bed.min});
 return issues;
}
export function assertNaval(model,catalog){const issues=auditNaval(model,catalog);if(issues.length)throw Error('Validação naval: '+JSON.stringify(issues.slice(0,4)));return {routes:Object.keys(model.naval.routes).length};}
export function transformNaval(naval,vector){
 const point=p=>{const a=vector([p[0]-.5,p[1],p[2]-.5]);return[a[0]+.5,a[1],a[2]+.5];};
 const box=b=>{const points=[];for(const x of[b.min[0],b.max[0]])for(const z of[b.min[2],b.max[2]])points.push(point([x,0,z]));return{min:[Math.min(...points.map(p=>p[0])),b.min[1],Math.min(...points.map(p=>p[2]))],max:[Math.max(...points.map(p=>p[0])),b.max[1],Math.max(...points.map(p=>p[2]))]};};
 return {...naval,origin:vector(naval.origin),routes:Object.fromEntries(Object.entries(naval.routes).map(([k,ps])=>[k,ps.map(p=>{const[x,y,z]=point([p.x,p.y,p.z]);return{x,y,z};})])),cabin:{...naval.cabin,interior:box(naval.cabin.interior),reservedBed:box(naval.cabin.reservedBed)}};
}
