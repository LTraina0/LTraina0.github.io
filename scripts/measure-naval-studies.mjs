import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {unpackModel} from '../architect/v2/transport.mjs';
import {kitVolume} from '../architect/v2/kit-shapes.mjs';
import {catalog} from '../architect/v2/laboratory.mjs';

const root=new URL('../',import.meta.url),cache=new Map();
const sum=a=>a.reduce((s,n)=>s+n,0),rounded=n=>Number(n.toFixed(6));
function unionArea(rects){
 const xs=[...new Set(rects.flatMap(r=>[r[0],r[2]]))].sort((a,b)=>a-b);let area=0;
 for(let i=1;i<xs.length;i++){
  const a=xs[i-1],b=xs[i],m=(a+b)/2,intervals=rects.filter(r=>r[0]<m&&r[2]>m).map(r=>[r[1],r[3]]).sort((u,v)=>u[0]-v[0]);
  let length=0,end=-Infinity;
  for(const[s,e]of intervals){if(e>end){length+=e-Math.max(s,end);end=e;}}
  area+=(b-a)*length;
 }return area;
}
function unionVolume(boxes){
 const ys=[...new Set(boxes.flatMap(b=>[b[1],b[4]]))].sort((a,b)=>a-b);let v=0;
 for(let i=1;i<ys.length;i++){const m=(ys[i]+ys[i-1])/2;v+=(ys[i]-ys[i-1])*unionArea(boxes.filter(b=>b[1]<m&&b[4]>m).map(b=>[b[0],b[2],b[3],b[5]]));}
 return v;
}
function shape(b){
 const k=b.id+JSON.stringify(b.states);
 if(!cache.has(k)){const boxes=kitVolume(catalog[b.id].shape,b.states).map(v=>v.map(n=>n/16));cache.set(k,{boxes,volume:unionVolume(boxes)});}
 return cache.get(k);
}
function bounds(blocks,solids=false){
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(const b of blocks)for(const q of solids?shape(b).boxes:[[0,0,0,1,1,1]])for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],b[['x','y','z'][i]]+q[i]);hi[i]=Math.max(hi[i],b[['x','y','z'][i]]+q[i+3]);}
 return {min:lo,maxExclusive:hi,size:hi.map((n,i)=>rounded(n-lo[i]))};
}
function stats(blocks){
 const cellBounds=bounds(blocks),solidBounds=bounds(blocks,true),xz=new Map();
 for(const b of blocks){const k=b.x+','+b.z;if(!xz.has(k))xz.set(k,[]);xz.get(k).push(...shape(b).boxes.map(v=>[v[0],v[2],v[3],v[5]]));}
 const volume=sum(blocks.map(b=>shape(b).volume)),projectedArea=sum([...xz.values()].map(unionArea)),boundingVolume=cellBounds.size.reduce((v,n)=>v*n,1);
 return {cells:blocks.length,cellBounds,solidBounds,projectedArea:rounded(projectedArea),occupiedXZCells:xz.size,boundingXZArea:cellBounds.size[0]*cellBounds.size[2],solidVolume:rounded(volume),boundingVolume,solidFillRatio:rounded(volume/boundingVolume),cellFillRatio:rounded(blocks.length/boundingVolume),materials:[...new Set(blocks.map(b=>b.id))].sort()};
}
const primaryModules=['keel','frames','hull','deck','cabin','quarterdeck','rails','masts','rigging'];
const hullModules=['keel','frames','hull'];
function worldBoxes(blocks){return blocks.flatMap(b=>shape(b).boxes.map(v=>v.map((n,i)=>n+b[['x','y','z'][i%3]])));}
function shellSections(blocks,cx,z){
 const boxes=worldBoxes(blocks),sections=[];
 for(let y=2;y<=8;y++)for(const offset of[.25,.75]){
  const intervals=boxes.filter(b=>b[1]<=y+offset&&b[4]>y+offset&&b[2]<=z+.5&&b[5]>z+.5&&b[0]>=cx+1).map(b=>[b[0],b[3]]).sort((a,b)=>a[0]-b[0]);
  let length=0,end=-Infinity;for(const[s,e]of intervals)if(e>end){length+=e-Math.max(s,end);end=e;}
  sections.push({z:z+.5,y:y+offset,starboardHorizontalMaterialLength:rounded(length),intervals});
 }return sections;
}
export function measureNavalModel(model){
 const filter=ids=>model.blocks.filter(b=>ids.includes(b.module)),naval=model.blocks.filter(b=>b.module!=='context'),primary=filter(primaryModules),hull=filter(hullModules),cabin=filter(['cabin']),cx=model.naval.origin[0];
 const ribs=[...new Set(filter(['frames']).map(b=>b.z))].sort((a,b)=>a-b),ribPitches=ribs.slice(1).map((z,i)=>z-ribs[i]);
 const sections=shellSections(hull,cx,-24),cabinInterior=model.naval.cabin.interior;
 const groups={all:stats(model.blocks),naval:stats(naval),context:stats(filter(['context'])),primary:stats(primary),hull:stats(hull),deck:stats(filter(['deck'])),cabin:stats(cabin),quarterdeck:stats(filter(['quarterdeck'])),debris:stats(filter(['side-fragment','bow-fragment','deck-fragment']))};
 const perModule=Object.fromEntries(model.modules.map(m=>[m.id,stats(filter([m.id]))]));
 return {source:{project:model.project,version:model.version,params:model.params},definitions:{primaryModules,hullModules,maxExclusive:true,volume:'union of canonical visual/contact solids inside each unique cell; includes documented contact proxies; no fluid or player collision simulation',projection:'union of occupied solids projected to XZ, excluding air and counting overlapping heights once',debrisModules:['side-fragment','bow-fragment','deck-fragment'],shellThickness:'horizontal material chord in an intact starboard section at z=-23.5; not a claimed normal-to-surface design thickness'},groups,perModule,
 measurements:{maximumPrimaryBeam:groups.primary.cellBounds.size[0],maximumHullBeam:groups.hull.cellBounds.size[0],primaryLength:groups.primary.cellBounds.size[2],survivingPrimaryHeight:groups.primary.cellBounds.size[1],primaryHeightWithoutMastsOrRigging:stats(primary.filter(b=>!['masts','rigging'].includes(b.module))).cellBounds.size[1],cabin:{outer:groups.cabin.cellBounds,interior:{...cabinInterior,size:cabinInterior.max.map((n,i)=>n-cabinInterior.min[i])},floorY:model.naval.cabin.floor,roofY:model.naval.cabin.ceiling},hull:{beam:groups.hull.cellBounds.size[0],depth:groups.hull.cellBounds.size[1],depthWithoutTransom:stats(hull.filter(b=>b.component!=='stern-transom')).cellBounds.size[1]},shellSections:sections,cabinWallThickness:{fullWood:1,shutter:3/16,door:3/16},ribs:{stations:ribs,centerPitch:ribPitches,frameCellThickness:1,clearGap:ribPitches.map(p=>p-1)},projectedDebrisArea:groups.debris.projectedArea,filledVolume:groups.naval.solidVolume},moduleCounts:Object.fromEntries(model.modules.map(m=>[m.id,filter([m.id]).length]))};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 assert.equal(unionArea([[0,0,1,1],[0,0,1,1],[.5,0,1.5,1]]),1.5);
 assert.equal(unionVolume([[0,0,0,1,1,1],[.5,0,0,1.5,1,1]]),1.5);
 assert.equal(shape({id:'minecraft:spruce_planks',states:{}}).volume,1);
 assert.equal(shape({id:'minecraft:spruce_slab',states:{'minecraft:vertical_half':'bottom'}}).volume,.5);
 assert.equal(shape({id:'minecraft:spruce_stairs',states:{weirdo_direction:1,upside_down_bit:true,'minecraft:corner':'none'}}).volume,.75);
 const file=new URL('../dist/modelos/atelier/shipwreck-haven-weathered.json',import.meta.url),bytes=await readFile(file),model=unpackModel(JSON.parse(bytes)),report=measureNavalModel(model);
 assert.equal(new Set(model.blocks.map(b=>[b.x,b.y,b.z].join(','))).size,model.blocks.length);
 const release=JSON.parse(await readFile(new URL('../dist/modelos/release.json',import.meta.url),'utf8'));
 report.source.file=fileURLToPath(file);report.source.sha256=createHash('sha256').update(bytes).digest('hex');
 assert.equal(report.source.sha256,release.models['shipwreck-haven-weathered']);report.source.release=release.release;report.source.sourceCommit=release.sourceCommit;
 if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}
