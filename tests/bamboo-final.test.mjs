import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {generateBamboo,rotateBridgeBlock} from '../architect/bamboo-final.mjs';

const source=JSON.parse(await readFile(new URL('../architect/data/bamboo-final-source.json',import.meta.url)));
const materialEvidence=JSON.parse(await readFile(new URL('../docs/bamboo-final-materials.json',import.meta.url)));
const worldPosition=(model,b)=>[b.x,b.y,b.z].map((n,i)=>n+model.worldOrigin[i]);

test('approved west layout preserves source cells except the recorded roof join',async()=>{
 const model=await generateBamboo();
 assert.equal(model.blocks.length,921);
 const saved=model.blocks.filter(b=>b.source.kind==='world');
 assert.equal(saved.length,661);
 for(const original of source.blocks){
  const placed=saved.find(b=>worldPosition(model,b).every((v,i)=>v===[original.x,original.y,original.z][i]));
  if(!placed){assert.ok(model.blocks.some(b=>b.source.kind==='bridge-roof-join'&&b.source.replaced?.position?.every((v,i)=>v===[original.x,original.y,original.z][i])));continue;}
  assert.equal(placed.name,original.name);assert.equal(placed.version,original.version);assert.deepEqual(placed.states,original.states);
 }
 const vegetation=saved.filter(b=>b.module==='vegetation');
 assert.equal(vegetation.length,15);
 assert.ok(vegetation.every(b=>worldPosition(model,b)[0]===-4&&worldPosition(model,b)[2]===-16));
 assert.deepEqual(model.orientation.front,[0,0,1]);
 assert.deepEqual(model.anchors.centerWorld,[-4,-61,-10]);
 assert.deepEqual(model.anchors.bambooBaseWorld,[-4,-60,-16]);
 const center=saved.find(b=>worldPosition(model,b).every((v,i)=>v===model.anchors.centerWorld[i]));
 assert.equal(center.name,'minecraft:scaffolding');
});

test('long bridge retains 36-cell length, integer cells, floor continuity, frame rhythm and one threshold',async()=>{
 const model=await generateBamboo({longBridgeSide:'west'}),bridge=model.blocks.filter(b=>b.module==='west');
 assert.equal(new Set(model.blocks.map(b=>[b.x,b.y,b.z].join(','))).size,model.blocks.length);
 assert.ok(model.blocks.every(b=>[b.x,b.y,b.z].every(Number.isInteger)));
 assert.equal(Math.max(...bridge.map(b=>b.x))-Math.min(...bridge.map(b=>b.x))+1,36);
 for(let d=6;d<=41;d++)assert.ok(bridge.some(b=>{const [x,y,z]=worldPosition(model,b);return x===-4-d&&y===-60&&z===-10&&b.name.startsWith('minecraft:mud_brick');}));
 const lanternDistances=bridge.filter(b=>b.name==='minecraft:lantern').map(b=>b.source.longitudinalDistance);
 assert.deepEqual(lanternDistances,[40,30,20,10]);
 assert.equal(model.blocks.filter(b=>b.source.kind==='bridge-connection').length,1);
});

test('the approved layout refuses unsupported bridge sides and bamboo relocation',async()=>{
 await assert.rejects(generateBamboo({longBridgeSide:'north'}),/User-approved long bridge side is west/);
 await assert.rejects(generateBamboo({vegetationOffset:[3,0]}),/source geometry and bamboo position are fixed/);
});

test('all final source and generated state values stay in the curated official Bedrock domains',async()=>{
 const model=await generateBamboo({longBridgeSide:'west'});
 for(const b of model.blocks){
  const official=materialEvidence.entries[b.name];assert.ok(official,b.name);
  assert.deepEqual(Object.keys(b.states).sort(),Object.keys(official.officialStates).sort());
  for(const [key,value] of Object.entries(b.states))assert.ok(official.officialStates[key].some(v=>v===value||typeof v==='boolean'&&Number(v)===value),`${b.name} ${key}=${value}`);
 }
});

test('bridge rotation carries stair, trapdoor, wall and fence connection states with the cells',()=>{
 for(const original of source.blocks.filter(b=>b.module==='south')){
  let block=original;for(let i=0;i<4;i++)block=rotateBridgeBlock(block,1);
  assert.deepEqual(block,original);
 }
 const frontStair=source.blocks.find(b=>b.module==='south'&&b.states.weirdo_direction===2);
 assert.equal(rotateBridgeBlock(frontStair,1).states.weirdo_direction,1);
 assert.equal(rotateBridgeBlock(frontStair,2).states.weirdo_direction,3);
});


test('24 saved green cushion entities retain positions and rest on the two stair rings',async()=>{
 const m=await generateBamboo(),saved=JSON.parse(await readFile(new URL('../architect/data/bamboo-cushions.json',import.meta.url))).entities;
 assert.deepEqual(m.entities,saved);assert.equal(saved.length,24);
 for(const e of saved){assert.equal(e.identifier,'minecraft:cushion');assert.equal(e.variant,2);const pos=e.position.map((v,i)=>Math.floor(v)-m.worldOrigin[i]);assert.equal(m.blocks.find(b=>b.x===pos[0]&&b.y===pos[1]&&b.z===pos[2])?.name,'minecraft:bamboo_stairs');}
 assert.equal(saved.filter(e=>e.position[1]===-54.5).length,16);assert.equal(saved.filter(e=>e.position[1]===-49.5).length,8);
});


test('west roof join matches the rotated front roof including saved states',async()=>{
 const model=await generateBamboo(),join=model.blocks.filter(b=>b.source.kind==='bridge-roof-join');
 assert.equal(join.length,8);for(const b of join){const pos=b.source.templatePosition,original=source.blocks.find(v=>v.x===pos[0]&&v.y===pos[1]&&v.z===pos[2]);const expected=rotateBridgeBlock(original,1);assert.equal(b.name,expected.name);assert.deepEqual(b.states,expected.states);}
});
